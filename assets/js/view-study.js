$(document).ready(function () {
  $(document).on("click", ".btn-view-study", function (e) {
    e.preventDefault();

    var row = $(this).closest("tr");
    var patientId = row.data("id"); // Obtenemos el ID del paciente de la fila
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
            processOrthancStudies(orthancStudies, studyTypes);
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


  function processOrthancStudies(orthancStudies, studyTypes) {
    console.log("Procesando estudios de Orthanc:");
    console.log("Número de estudios de Orthanc:", orthancStudies.length);
    console.log("Tipos de estudio en la tabla:", studyTypes.length);

    var studyPromises = orthancStudies.map(studyId => 
      $.ajax({
        url: baseUrl + "orthanc/get_study_details/" + studyId,
        method: "GET"
      })
    );

    Promise.all(studyPromises).then(studyDetails => {
      studyTypes.each(function (index) {
        var studyName = $(this).text();
        console.log("Procesando estudio de la tabla:", studyName);

        var studyHtml = `
          <div class="row study-item">
            <div class="col-md-4">${studyName}</div>
            <div class="col-md-6">
              <select class="form-control orthanc-studies" data-index="${index}">
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
          </div>
        `;
        $("#study-list").append(studyHtml);
      });

      // Habilitar/deshabilitar botón "Ver" cuando se selecciona un estudio
      $(".orthanc-studies").on("change", function() {
        var index = $(this).data("index");
        var viewButton = $(`.view-study-btn[data-index="${index}"]`);
        viewButton.prop("disabled", !$(this).val());
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
