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

    studyTypes.each(function (index) {
      var studyName = $(this).text();
      console.log("Procesando estudio de la tabla:", studyName);

      var studyHtml = `
                <div class="row study-item">
                    <div class="col-md-4">${studyName}</div>
                    <div class="col-md-4">
                        <select class="form-control orthanc-studies">
                            <option value="">Seleccione un estudio de Orthanc</option>
                            ${orthancStudies
                              .map(
                                (study) =>
                                  `<option value="${study.ID}">${
                                    study.MainDicomTags.StudyDescription ||
                                    study.MainDicomTags.StudyInstanceUID
                                  }</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="col-md-4">
                        <input type="radio" name="selected-study" value="${index}">
                    </div>
                </div>
            `;
      $("#study-list").append(studyHtml);
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
