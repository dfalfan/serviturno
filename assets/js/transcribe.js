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
    var studyList = $("#transcribe-study-list");
    studyList.empty();
    
    // Limpiar cualquier selección previa
    $("#selected-doctor-id").val('');
    
    var subestudios = patientDetails.subestudios
        ? patientDetails.subestudios.split(";;")
        : [];

    if (subestudios.length === 0) {
        studyList.html('<div class="alert alert-info">No hay estudios disponibles para este paciente.</div>');
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

        if (!estudioInformado) {
            hasStudiesToTranscribe = true;
        }

        studyListHtml += `
            <div class="list-group-item">
                <div class="d-flex align-items-center">
                    ${!estudioInformado ? `
                        <input class="form-check-input me-3" type="checkbox" 
                               value="${estudioId}" 
                               id="study-${estudioId}">
                    ` : ''}
                    <label class="form-check-label" ${!estudioInformado ? `for="study-${estudioId}"` : ''}>
                        ${nombreEstudio}
                        ${detalle ? `<small class="text-muted">(${detalle})</small>` : ''}
                        ${estudioInformado ? '<span class="badge bg-success ms-2">Informado</span>' : ''}
                    </label>
                    ${estudioInformado && rutaPdf ? `
                        <button class="btn btn-sm btn-info view-pdf-btn ms-auto" 
                                data-pdf-path="${rutaPdf}"
                                title="Ver PDF">
                            <i class="fas fa-file-pdf"></i> Ver PDF
                        </button>
                    ` : ''}
                </div>
            </div>`;
    });

    studyListHtml += '</div>';
    studyList.html(studyListHtml);

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
    
    // Limpiar el doctor seleccionado al cargar la lista
    $("#selected-doctor-id").val('');
    
    // Mostrar indicador de carga
    doctorList.html('<div class="loading-spinner">Cargando médico...</div>');
    
    // Obtener el número de admisión
    var admisionId = $("#transcribe-patient-admission").text().trim();
    
    $.ajax({
        url: "Tabla/verificar_medico_informante",
        type: "GET",
        data: { admission_id: admisionId },
        success: function(response) {
            if (response && response.medico_informante) {
                // Si hay médico informante, buscar su ID en el array de doctors
                const doctorInfo = doctors.find(d => d.name === response.medico_informante);
                var doctorTag = $('<div class="doctor-tag selected"></div>')
                    .text(response.medico_informante)
                    .attr('data-doctor-id', doctorInfo ? doctorInfo.id : '');
                
                doctorList.empty().append(doctorTag);
                $("#selected-doctor-id").val(doctorInfo ? doctorInfo.id : '');
            } else {
                // Si no hay médico informante, mostrar médicos de la categoría desde options.js
                doctorList.empty();
                const medicosCategoria = doctors.filter(doctor => 
                    doctor.categories.includes(parseInt(categoryId))
                );
                
                if (medicosCategoria.length > 0) {
                    medicosCategoria.forEach(function(medico) {
                        var doctorTag = $('<div class="doctor-tag"></div>')
                            .text(medico.name)
                            .attr('data-doctor-id', medico.id)
                            .click(function() {
                                $('.doctor-tag').removeClass('selected');
                                $(this).addClass('selected');
                                $("#selected-doctor-id").val(medico.id);
                            });
                        doctorList.append(doctorTag);
                    });
                } else {
                    doctorList.html('<div class="error-message">No hay médicos disponibles para esta categoría</div>');
                }
            }
        },
        error: function() {
            doctorList.html('<div class="error-message">Error al cargar médico informante</div>');
        }
    });
  }

  $("#transcribe-btn").on("click", function () {
    var doctorId = $("#selected-doctor-id").val();
    var selectedStudies = [];
    
    if (!doctorId) {
        alert("Por favor, seleccione un médico.");
        return;
    }

    $("input[type=checkbox]:checked").each(function () {
        selectedStudies.push($(this).val());
    });

    if (selectedStudies.length === 0) {
        alert("Por favor, seleccione al menos un estudio.");
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
    
    if (!doctorId) {
        alert("Por favor, seleccione un médico.");
        return;
    }

    $("input[type=checkbox]:checked").each(function () {
        selectedStudies.push($(this).val());
    });

    if (selectedStudies.length === 0) {
        alert("Por favor, seleccione al menos un estudio.");
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

  // Añadir evento para limpiar la selección cuando se cierra el modal
  $(document).on('hidden.bs.modal', '#transcribeModal', function () {
    $("#selected-doctor-id").val('');
    $('.doctor-tag').removeClass('selected');
  });
});
