$(document).ready(function () {
  $(document).on("click", ".btn-transcribe", function (e) {
    e.preventDefault();

    var row = $(this).closest("tr");
    var patientId = row.data("id");
    var patientName = row.find("td:eq(2)").text();
    var patientAdmission = row.find("td:eq(7)").text();
    var categoryName = row.find("td:eq(0)").text();

    // Mapeo de nombres de categoría a IDs
    const categoryMap = {
      'Rayos X': 42,
      'Mamografía': 52,
      'Ecografía': 51,
      'Tomografía': 48,
      'Resonancia': 49
    };

    const categoryId = categoryMap[categoryName];

    // Actualizar la información del paciente en el modal
    $("#transcribe-patient-name").text(patientName);
    $("#transcribe-patient-admission").text(patientAdmission);
    $("#transcribe-patient-category").text(categoryName);
    $("#category-id").val(categoryId);

    // Obtener los detalles del paciente
    $.ajax({
      url: "Tabla/obtener_detalle_paciente",
      type: "GET",
      data: { id: patientId },
      success: function (data) {
        var patientDetails = JSON.parse(data);
        processTranscribeStudies(patientDetails);
        loadDoctorsList(categoryId);
      }
    });

    var transcribeModal = new bootstrap.Modal(document.getElementById("transcribeModal"), {
      backdrop: "static",
      keyboard: false,
    });
    transcribeModal.show();
  });

  function processTranscribeStudies(patientDetails) {
    var subestudios = patientDetails.subestudios
        ? patientDetails.subestudios.split(";;")
        : [];

    if (subestudios.length === 0) {
        $("#transcribe-study-list").html(
            '<div class="alert alert-info">No hay estudios disponibles para este paciente.</div>'
        );
        $("#transcribe-btn").hide();
        return;
    }

    var studyListHtml = '<div class="list-group">';
    var hasStudiesToTranscribe = false;

    subestudios.forEach(function (subestudio, index) {
        var parts = subestudio.split("|");
        var nombreEstudio = parts[0];
        var estudioId = parts[1];
        var studyInstanceUid = parts[2];
        var studyDescription = parts[3];
        var detalle = parts[4];
        var estudioInformado = parts[5] === '1';
        var rutaPdf = parts[6];

        // Si hay al menos un estudio no informado, marcamos que hay estudios para transcribir
        if (!estudioInformado) {
            hasStudiesToTranscribe = true;
        }

        studyListHtml += `
            <div class="list-group-item">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        ${!estudioInformado ? `
                            <div class="form-check me-2">
                                <input class="form-check-input" type="checkbox" 
                                       value="${estudioId}" 
                                       id="study-${estudioId}">
                            </div>
                        ` : ''}
                        <label class="form-check-label" ${!estudioInformado ? `for="study-${estudioId}"` : ''}>
                            ${nombreEstudio}
                            ${detalle ? `<small class="text-muted">(${detalle})</small>` : ''}
                            ${estudioInformado ? '<span class="badge bg-success ms-2">Informado</span>' : ''}
                        </label>
                    </div>
                    ${estudioInformado && rutaPdf ? `
                        <button class="btn btn-sm btn-info view-pdf-btn" 
                                data-pdf-path="${rutaPdf}"
                                title="Ver PDF">
                            <i class="fas fa-file-pdf"></i> Ver PDF
                        </button>
                    ` : ''}
                </div>
            </div>`;
    });

    studyListHtml += '</div>';
    $("#transcribe-study-list").html(studyListHtml);

    // Mostrar u ocultar el botón de transcribir según si hay estudios disponibles
    if (hasStudiesToTranscribe) {
        $("#transcribe-btn").show();
    } else {
        $("#transcribe-btn").hide();
    }

    // Agregar el evento click para los botones de PDF
    $(".view-pdf-btn").on("click", function(e) {
        e.preventDefault();
        var pdfPath = $(this).data('pdf-path');
        var url = `Tabla/ver_pdf?ruta=${encodeURIComponent(pdfPath)}`;
        window.open(url, '_blank');
    });
  }

  function loadDoctorsList(categoryId) {
    var doctorList = $("#transcribe-doctor-list");
    doctorList.empty();

    // Convertir categoryId a número para comparación
    categoryId = parseInt(categoryId);

    // Obtener el número de admisión
    var admisionId = $("#transcribe-patient-admission").text().trim();

    // Verificar si ya existe un médico asignado
    $.ajax({
        url: "Tabla/verificar_medico_informante",
        type: "GET",
        data: { admission_id: admisionId },
        success: function(response) {
            const data = JSON.parse(response);
            
            // Cambiar el título según si hay médico asignado o no
            $("#doctor-list-title").text(data.medico_informante ? "Médico informante:" : "Seleccione médico:");
            
            // Si hay un médico informante asignado, solo mostrar ese
            if (data.medico_informante) {
                doctorList.html(`
                    <div class="doctor-tag selected" style="cursor: not-allowed; opacity: 0.8;">
                        ${data.medico_informante}
                    </div>
                `);
                $('#selected-doctor-id').val(data.medico_informante);
                return;
            }

            // Si no hay médico asignado, mostrar la lista de doctores
            const filteredDoctors = doctors.filter(doctor => 
                doctor.categories.includes(categoryId)
            );

            // Si no hay doctores, simplemente retornar sin mostrar mensaje
            if (filteredDoctors.length === 0) {
                return;
            }

            // Agregar los doctores filtrados como tags
            filteredDoctors.forEach(function(doctor) {
                doctorList.append(`
                    <div class="doctor-tag" data-doctor-id="${doctor.id}">
                        ${doctor.name}
                    </div>
                `);
            });

            // Manejar la selección de doctores
            $('.doctor-tag').click(function() {
                $('.doctor-tag').removeClass('selected');
                $(this).addClass('selected');
                $('#selected-doctor-id').val($(this).data('doctor-id'));
            });

            // Seleccionar automáticamente el primer doctor
            const firstDoctor = $('.doctor-tag').first();
            firstDoctor.addClass('selected');
            $('#selected-doctor-id').val(firstDoctor.data('doctor-id'));
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
  }

  $("#transcribe-btn").on("click", function () {
    var doctorId = $("#selected-doctor-id").val();
    var selectedStudies = [];
    $("input[type=checkbox]:checked").each(function () {
      selectedStudies.push($(this).val());
    });

    if (selectedStudies.length === 0) {
      alert("Por favor, seleccione al menos un estudio.");
      return;
    }

    if (!doctorId) {
      alert("Por favor, seleccione un médico.");
      return;
    }

    // Construir la URL para la interfaz de transcripción
    var transcriptionUrl = `https://192.168.5.21/transcription?doctorId=${doctorId}&studyId=${selectedStudies.join('&studyId=')}`;

    // Establecer la URL del iframe
    $("#transcriptionFrame").attr("src", transcriptionUrl);

    // Mostrar el modal de transcripción
    var transcriptionModal = new bootstrap.Modal(document.getElementById("transcriptionModal"), {
      backdrop: "static",
      keyboard: false
    });
    transcriptionModal.show();

    // Cerrar el modal de selección
    var transcribeModal = bootstrap.Modal.getInstance(document.getElementById("transcribeModal"));
    transcribeModal.hide();
  });

  function initializeTranscription(doctorId, studyIds) {
    let mediaRecorder;
    let audioChunks = [];

    $("#start-recording").on("click", function() {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();

          mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
          });

          $(this).hide();
          $("#stop-recording").show();
        });
    });

    $("#stop-recording").on("click", function() {
      mediaRecorder.stop();
      $(this).hide();
      $("#start-recording").show();

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
    
        
        $("#transcription-result").text("Transcripción en proceso...");
      });
    });
  }

  // Evento para el botón QR
  $(document).on("click", ".btn-qr", function (e) {
    e.preventDefault();

    // Obtener los estudios seleccionados y el doctor del modal de transcripción
    var doctorId = $("#selected-doctor-id").val();
    var selectedStudies = [];
    $("input[type=checkbox]:checked").each(function () {
      selectedStudies.push($(this).val());
    });

    if (selectedStudies.length === 0) {
      alert("Por favor, seleccione al menos un estudio.");
      return;
    }

    if (!doctorId) {
      alert("Por favor, seleccione un médico.");
      return;
    }

    // Construir la misma URL que usamos para transcribir
    var transcriptionUrl = `https://192.168.5.21/transcription?doctorId=${doctorId}&studyId=${selectedStudies.join('&studyId=')}`;

    // Limpiar el contenedor del QR
    $("#qrcode").empty();

    // Generar nuevo QR
    new QRCode(document.getElementById("qrcode"), {
      text: transcriptionUrl,
      width: 256,
      height: 256
    });

    // Mostrar el modal
    $("#qrModal").modal("show");
  });

  // Modificar el evento del botón QR
  $("#qr-btn").on("click", function (e) {
    e.preventDefault();

    var doctorId = $("#selected-doctor-id").val();
    var selectedStudies = [];
    $("input[type=checkbox]:checked").each(function () {
      selectedStudies.push($(this).val());
    });

    if (selectedStudies.length === 0) {
      alert("Por favor, seleccione al menos un estudio.");
      return;
    }

    if (!doctorId) {
      alert("Por favor, seleccione un médico.");
      return;
    }

    // Construir la misma URL que usamos para transcribir
    var transcriptionUrl = `https://192.168.5.21/transcription?doctorId=${doctorId}&studyId=${selectedStudies.join('&studyId=')}`;

    // Limpiar el contenedor del QR
    $("#qrcode").empty();

    // Generar nuevo QR
    new QRCode(document.getElementById("qrcode"), {
      text: transcriptionUrl,
      width: 256,
      height: 256
    });

    // Mostrar el modal QR
    $("#qrModal").modal("show");
  });
});
