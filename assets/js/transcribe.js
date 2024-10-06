$(document).ready(function () {
  $(document).on("click", ".btn-transcribe", function (e) {
    e.preventDefault();

    // Obtener la fila actual
    var row = $(this).closest("tr");

    // Obtener los datos de la fila
    var patientName = row.find("td:eq(2)").text(); // Asumiendo que el nombre está en la tercera columna
    var patientAdmission = row.find("td:eq(7)").text(); // Asumiendo que la admisión está en la octava columna
    var patientCategory = row.find("td:eq(0)").text(); // Asumiendo que la categoría está en la primera columna

    // Llenar el modal con la información
    $("#transcribe-patient-name").text(patientName);
    $("#transcribe-patient-admission").text(patientAdmission);
    $("#transcribe-patient-category").text(patientCategory);

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

  $("#transcribe-accept-btn").on("click", function () {
    console.log("Aceptar Transcripción");
    var transcribeModal = bootstrap.Modal.getInstance(
      document.getElementById("transcribeModal")
    );
    transcribeModal.hide();
  });
});
