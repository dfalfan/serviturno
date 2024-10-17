$(document).ready(function () {
  $(document).on("click", ".btn-transcribe", function (e) {
    e.preventDefault();

    var row = $(this).closest("tr");
    var patientId = row.data("id");
    var patientName = row.find("td:eq(2)").text();
    var patientAdmission = row.find("td:eq(7)").text();
    var patientCategory = row.find("td:eq(0)").text();

    // Llenar el modal con la información básica del paciente
    $("#transcribe-patient-name").text(patientName);
    $("#transcribe-patient-admission").text(patientAdmission);
    $("#transcribe-patient-category").text(patientCategory);

    // Limpiar la lista de estudios existente
    $("#transcribe-study-list").empty();

    // Hacer la llamada a tu propio backend para obtener los detalles del paciente
    $.ajax({
      url: baseUrl + "Tabla/obtener_detalle_paciente",
      type: "GET",
      data: { id: patientId },
      success: function (data) {
        var patientDetails = JSON.parse(data);
        console.log("Detalles del paciente:", patientDetails);

        // Procesar y mostrar los estudios
        processTranscribeStudies(patientDetails);
      },
      error: function (xhr, status, error) {
        console.error("Error al obtener detalles del paciente:", error);
        $("#transcribe-study-list").html(
          '<div class="alert alert-danger">Error al cargar los detalles del paciente. Por favor, intente de nuevo más tarde.</div>'
        );
      },
    });

    // Mostrar el modal
    var transcribeModal = new bootstrap.Modal(
      document.getElementById("transcribeModal"),
      {
        backdrop: "static",
        keyboard: false,
      }
    );
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

  function loadDoctorsList() {
    var doctorSelect = $("#transcribe-doctor-select");
    doctorSelect
      .empty()
      .append('<option value="">Seleccione un médico</option>');

    doctors.forEach(function (doctor) {
      doctorSelect.append(`<option value="${doctor.id}">${doctor.name}</option>`);
    });
  }

  $("#transcribe-btn").on("click", function () {
    var doctorId = $("#transcribe-doctor-select").val();
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
        
        // Aquí puedes enviar el audioBlob al servidor para procesamiento
        // o usar una API de reconocimiento de voz en el cliente
        
        $("#transcription-result").text("Transcripción en proceso...");
      });
    });
  }
});
