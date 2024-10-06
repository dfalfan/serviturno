$(document).ready(function () {
  $(document).on("click", ".btn-view-study", function (e) {
    e.preventDefault();

    var row = $(this).closest("tr");
    var patientId = row.data("id");
    var patientName = row.find("td:eq(2)").text();
    var patientAdmission = row.find("td:eq(7)").text();
    var patientCategory = row.find("td:eq(0)").text();
    var studyTypes = row.find("td:eq(3)").find(".tag");

    console.log("Datos del paciente:");
    console.log("ID del paciente:", patientId);
    console.log("Nombre:", patientName);
    console.log("Admisión:", patientAdmission);
    console.log("Categoría:", patientCategory);

    $("#patient-name").text(patientName);
    $("#patient-admission").text(patientAdmission);
    $("#patient-category").text(patientCategory);

    // Limpiar la lista de estudios existente
    $("#study-list").empty();

    // Hacer la llamada a tu propio backend para obtener los detalles del paciente
    $.ajax({
      url: baseUrl + "Tabla/obtener_detalle_paciente",
      type: "GET",
      data: { id: patientId },
      success: function (data) {
        var patientDetails = JSON.parse(data);
        console.log("Detalles del paciente:", patientDetails);

        var cedula = patientDetails.cedula;
        cedula = cedula.replace(/^V/, "");
        var fechaEstudio = moment(patientDetails.hora_de_impresion).format("YYYYMMDD");

        console.log("Cédula:", cedula);
        console.log("Fecha del estudio (formato Orthanc):", fechaEstudio);

        // Ahora hacemos la llamada a Orthanc con los datos correctos
        $.ajax({
          url: baseUrl + "orthanc/find_studies",
          method: "POST",
          data: JSON.stringify({
            Level: "Study",
            Query: {
              PatientID: cedula,
              StudyDate: fechaEstudio,
            },
          }),
          contentType: "application/json",
          success: function (orthancStudies) {
            console.log("Respuesta de Orthanc:", orthancStudies);
            // Procesar los estudios de Orthanc
            processOrthancStudies(orthancStudies, patientDetails.tipo_con_id.split(', '), patientId);
          },
          error: function (xhr, status, error) {
            console.error("Error al obtener datos de Orthanc:", error);
            console.log("Respuesta completa:", xhr.responseText);
          },
        });
      },
      error: function (xhr, status, error) {
        console.error("Error al obtener detalles del paciente:", error);
      }
    });

    // Mostrar el modal
    var viewStudyModal = new bootstrap.Modal(
      document.getElementById("viewStudyModal"),
      {
        backdrop: "static",
        keyboard: false,
      }
    );
    viewStudyModal.show();
  });


  function processOrthancStudies(orthancStudies, studyTypesWithId, patientId) {
    console.log("Procesando estudios de Orthanc:");
    console.log("Número de estudios de Orthanc:", orthancStudies.length);
    console.log("Tipos de estudio en la tabla:", studyTypesWithId.length);

    var studyPromises = orthancStudies.map(studyId => 
      $.ajax({
        url: baseUrl + "orthanc/get_study_details/" + studyId,
        method: "GET"
      })
    );

    Promise.all(studyPromises).then(studyDetails => {
      studyTypesWithId.forEach(function (studyTypeWithId, index) {
        var [studyName, colaId] = studyTypeWithId.split('|');
        console.log("Procesando estudio de la tabla:", studyName, "con ID:", colaId);

        var studyHtml = `
          <div class="row study-item align-items-center">
            <div class="col-md-3">${studyName}</div>
            <div class="col-md-5">
              <select class="form-control orthanc-studies" data-index="${index}" data-cola-id="${colaId}">
                <option value="">Seleccione un estudio de Orthanc</option>
                ${studyDetails
                  .map(
                    (study) => `
                      <option value="${study.ID}" data-study-instance-uid="${study.MainDicomTags.StudyInstanceUID}">
                        ${study.MainDicomTags.StudyDescription || 'Sin descripción'} - ${study.MainDicomTags.StudyInstanceUID}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>
            <div class="col-md-2 text-center">
              <button class="btn btn-primary btn-sm view-study-btn" data-index="${index}" disabled>
                <i class="fas fa-eye"></i> Ver
              </button>
            </div>
            <div class="col-md-2 text-center">
              <button class="btn btn-success btn-sm link-study-btn" data-index="${index}" data-cola-id="${colaId}" disabled>
                <i class="fas fa-link"></i> Enlazar
              </button>
            </div>
          </div>
        `;
        $("#study-list").append(studyHtml);
      });

      // Habilitar/deshabilitar botones cuando se selecciona un estudio
      $(".orthanc-studies").on("change", function() {
        var index = $(this).data("index");
        var viewButton = $(`.view-study-btn[data-index="${index}"]`);
        var linkButton = $(`.link-study-btn[data-index="${index}"]`);
        var isStudySelected = $(this).val() !== "";
        viewButton.prop("disabled", !isStudySelected);
        linkButton.prop("disabled", !isStudySelected);
      });

      // Manejar clic en el botón "Ver"
      $(".view-study-btn").on("click", function() {
        var index = $(this).data("index");
        var selectedOption = $(`.orthanc-studies[data-index="${index}"] option:selected`);
        var studyInstanceUID = selectedOption.data("study-instance-uid");
        
        if (studyInstanceUID) {
          var viewerUrl = `http://192.168.5.21:3001/viewer?StudyInstanceUIDs=${studyInstanceUID}`;
          window.open(viewerUrl, '_blank');
        } else {
          console.error("No se pudo obtener el StudyInstanceUID");
        }
      });

      // Manejar clic en el botón "Enlazar"
      $(document).on("click", ".link-study-btn", function() {
        var colaId = $(this).data("cola-id");
        var selectedOption = $(`.orthanc-studies[data-cola-id="${colaId}"] option:selected`);
        var studyInstanceUID = selectedOption.data("study-instance-uid");
        var studyDescription = selectedOption.text().split(' - ')[0];

        $.ajax({
          url: baseUrl + "tabla/enlazar_estudio",
          method: "POST",
          data: {
            cola_id: colaId,
            study_instance_uid: studyInstanceUID,
            study_description: studyDescription
          },
          success: function(response) {
            var result = JSON.parse(response);
            if (result.success) {
              alert("Estudio enlazado correctamente");
            } else {
              alert("Error al enlazar el estudio: " + result.message);
            }
          },
          error: function() {
            alert("Error de conexión al enlazar el estudio");
          }
        });
      });
    }).catch(error => {
      console.error("Error al obtener detalles de los estudios:", error);
    });
  }

  $("#view-study-accept-btn").on("click", function () {
    var selectedStudy = $('input[name="selected-study"]:checked').val();
    var selectedOrthancStudy = $(".orthanc-studies").eq(selectedStudy).val();
    console.log("Estudio seleccionado:", selectedStudy);
    console.log("Estudio de Orthanc seleccionado:", selectedOrthancStudy);

    var viewStudyModal = bootstrap.Modal.getInstance(
      document.getElementById("viewStudyModal")
    );
    viewStudyModal.hide();
  });
});