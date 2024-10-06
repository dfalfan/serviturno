$(document).ready(function () {
  $(document).on("click", ".btn-process", function (e) {
    e.preventDefault();

    // Obtener la fila actual
    var row = $(this).closest("tr");

    // Obtener los datos de la fila
    var patientName = row.find("td:eq(2)").text(); // Asumiendo que el nombre está en la tercera columna
    var patientAdmission = row.find("td:eq(7)").text(); // Asumiendo que la admisión está en la octava columna
    var patientCategory = row.find("td:eq(0)").text(); // Asumiendo que la categoría está en la primera columna

    // Llenar el modal con la información
    $("#process-patient-name").text(patientName);
    $("#process-patient-admission").text(patientAdmission);
    $("#process-patient-category").text(patientCategory);

    // Mostrar el modal
    var processModal = new bootstrap.Modal(
      document.getElementById("processModal"),
      {
        backdrop: "static",
        keyboard: false,
      }
    );
    processModal.show();
  });

  $("#process-accept-btn").on("click", function () {
    console.log("Aceptar Procesamiento");
    var processModal = bootstrap.Modal.getInstance(
      document.getElementById("processModal")
    );
    processModal.hide();
  });
});
