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
            processOrthancStudies(orthancStudies, patientDetails);
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


  function processOrthancStudies(orthancStudies, patientDetails) {
    console.log("Procesando estudios de Orthanc:");
    console.log("Número de estudios de Orthanc:", orthancStudies.length);

    var studyPromises = orthancStudies.map(studyId => 
      $.ajax({
        url: baseUrl + "orthanc/get_study_details/" + studyId,
        method: "GET"
      })
    );

    Promise.all(studyPromises).then(studyDetails => {
      var subestudios = patientDetails.subestudios ? patientDetails.subestudios.split(';;') : [];
      
      if (subestudios.length === 0) {
        $("#study-list").html('<div class="alert alert-info">No hay estudios disponibles para este paciente.</div>');
        return;
      }

      subestudios.forEach(function (subestudio, index) {
        var [studyName, estudioId, linkedStudyInstanceUID, linkedStudyDescription, detalle] = subestudio.split('|');
        console.log("Procesando subestudio:", studyName, "con ID:", estudioId);

        // Usar valores predeterminados si los campos están vacíos
        studyName = studyName.trim() || "Estudio sin nombre";
        estudioId = estudioId.trim() || "0";
        detalle = detalle.trim() || "Sin detalle";

        var displayName = studyName + (detalle !== "Sin detalle" ? " - " + detalle : "");

        var studyHtml = `
          <div class="row study-item align-items-center">
            <div class="col-md-3">${displayName}</div>
            <div class="col-md-5">
              <select class="form-control orthanc-studies" data-index="${index}" data-estudio-id="${estudioId}" data-linked-uid="${linkedStudyInstanceUID}">
                ${studyDetails
                  .map(
                    (study, i) => `
                      <option value="${study.ID}" 
                              data-study-instance-uid="${study.MainDicomTags.StudyInstanceUID}"
                              ${study.MainDicomTags.StudyInstanceUID === linkedStudyInstanceUID ? 'selected' : 
                                (!linkedStudyInstanceUID && i === 0 ? 'selected' : '')}>
                        ${study.MainDicomTags.StudyDescription || 'Sin descripción'} - ${study.MainDicomTags.StudyInstanceUID}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            </div>
            <div class="col-md-2 text-center">
              <button class="btn btn-success btn-sm link-study-btn" data-index="${index}" data-estudio-id="${estudioId}">
                <i class="fas fa-link"></i> ${linkedStudyInstanceUID ? 'Enlazado' : 'Enlazar'}
              </button>
            </div>
            <div class="col-md-2 text-center">
              <button class="btn btn-primary btn-sm view-study-btn" data-index="${index}">
                <i class="fas fa-eye"></i> Ver
              </button>
            </div>
          </div>
        `;
        $("#study-list").append(studyHtml);

        // Actualizar el estado de los botones
        updateButtonStates(index);
      });

      // Manejar cambios en la selección de estudios
      $(".orthanc-studies").on("change", function() {
        var index = $(this).data("index");
        updateButtonStates(index);
      });

      // Manejar clic en el botón "Enlazar"
      $(document).on("click", ".link-study-btn", function() {
        var $button = $(this);
        var index = $button.data("index");
        var estudioId = $button.data("estudio-id");
        var $select = $(`.orthanc-studies[data-index="${index}"]`);
        var selectedOption = $select.find('option:selected');
        var studyInstanceUID = selectedOption.data("study-instance-uid");
        var studyDescription = selectedOption.text();

        // Cambiar el botón inmediatamente
        $button.html('<i class="fas fa-spinner fa-spin"></i> Enlazando...');
        $button.prop('disabled', true);

        $.ajax({
          url: baseUrl + "tabla/enlazar_estudio",
          method: "POST",
          data: {
            estudio_id: estudioId,
            study_instance_uid: studyInstanceUID,
            study_description: studyDescription
          },
          success: function(response) {
            var result = JSON.parse(response);
            if (result.success) {
              // Actualizar el atributo data-linked-uid con el nuevo StudyInstanceUID
              $select.attr('data-linked-uid', studyInstanceUID);
              
              // Actualizar visualmente el botón
              $button.html('<i class="fas fa-link"></i> Enlazado');
              $button.removeClass('btn-success btn-warning btn-link-highlight').addClass('btn-linked');
              $button.prop('disabled', true);
              
              // Mostrar una notificación sutil
              showNotificationLink("Estudio enlazado correctamente", "success");
            } else {
              // Revertir el botón si hay un error
              $button.html('<i class="fas fa-link"></i> Enlazar');
              $button.prop('disabled', false);
              showNotificationLink("Error al enlazar el estudio: " + result.message, "error");
            }
          },
          error: function() {
            // Revertir el botón si hay un error
            $button.html('<i class="fas fa-link"></i> Enlazar');
            $button.prop('disabled', false);
            showNotificationLink("Error de conexión al enlazar el estudio", "error");
          },
          complete: function() {
            // Actualizar el estado de los botones
            updateButtonStates(index);
          }
        });
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
          alert("No se ha seleccionado ningún estudio para ver");
        }
      });

    }).catch(error => {
      console.error("Error al obtener detalles de los estudios:", error);
      $("#study-list").html('<div class="alert alert-danger">Error al cargar los detalles de los estudios. Por favor, intente de nuevo más tarde.</div>');
    });
  }

  function updateButtonStates(index) {
    var select = $(`.orthanc-studies[data-index="${index}"]`);
    var viewButton = $(`.view-study-btn[data-index="${index}"]`);
    var linkButton = $(`.link-study-btn[data-index="${index}"]`);
    var isStudySelected = select.val() !== "";
    var linkedStudyUID = select.data('linked-uid');
    var selectedStudyUID = select.find('option:selected').data('study-instance-uid');

    viewButton.prop('disabled', !isStudySelected);
    
    if (isStudySelected && !linkButton.hasClass('btn-linked')) {
      if (linkedStudyUID) {
        if (linkedStudyUID === selectedStudyUID) {
          linkButton.html('<i class="fas fa-link"></i> Enlazado');
          linkButton.removeClass('btn-success btn-warning btn-link-highlight').addClass('btn-linked');
          linkButton.prop('disabled', true);
        } else {
          linkButton.html('<i class="fas fa-edit"></i> Corregir enlace');
          linkButton.removeClass('btn-success btn-linked btn-link-highlight').addClass('btn-correct-link');
          linkButton.prop('disabled', false);
        }
      } else {
        linkButton.html('<i class="fas fa-link"></i> Enlazar');
        linkButton.removeClass('btn-linked btn-correct-link').addClass('btn-success btn-link-highlight');
        linkButton.prop('disabled', false);
      }
    } else if (!isStudySelected) {
      linkButton.html('<i class="fas fa-link"></i> Enlazar');
      linkButton.removeClass('btn-success btn-linked btn-correct-link btn-link-highlight').addClass('btn-secondary');
      linkButton.prop('disabled', true);
    }
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

  // Función para mostrar notificaciones sutiles
  function showNotificationLink(message, type) {
    var notificationClass = type === "success" ? "alert-success" : "alert-danger";
    var $notification = $(`<div class="alert ${notificationClass} notificationlink" role="alert">${message}</div>`);
    $("body").append($notification);
    $notification.fadeIn().delay(3000).fadeOut(function() {
      $(this).remove();
    });
  }
});