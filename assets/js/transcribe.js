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
      return;
    }

    var studyListHtml = '<div class="list-group">';

    subestudios.forEach(function (subestudio, index) {
      var [studyName, estudioId, , , detalle] = subestudio.split("|");
      console.log("Procesando subestudio:", studyName, "con ID:", estudioId);

      studyName = studyName.trim() || "Estudio sin nombre";
      estudioId = estudioId.trim() || "0";
      detalle = detalle.trim() || "Sin detalle";

      var displayName =
        studyName + (detalle !== "Sin detalle" ? " - " + detalle : "");

      studyListHtml += `
        <div class="list-group-item">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${estudioId}" id="study-${estudioId}">
            <label class="form-check-label" for="study-${estudioId}">
              ${displayName}
            </label>
          </div>
        </div>
      `;
    });

    studyListHtml += "</div>";

    $("#transcribe-study-list").html(studyListHtml);

    // Cargar la lista de médicos
    loadDoctorsList();
  }

  function loadDoctorsList(categoryId) {
    var doctorList = $("#transcribe-doctor-list");
    doctorList.empty();

    // Convertir categoryId a número para comparación
    categoryId = parseInt(categoryId);

    // Filtrar doctores por categoría
    const filteredDoctors = doctors.filter(doctor => 
        doctor.categories.includes(categoryId)
    );

    // Si no hay doctores para esta categoría, mostrar mensaje
    if (filteredDoctors.length === 0) {
        doctorList.html('<div class="text-muted">No hay médicos disponibles para esta categoría</div>');
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
});
