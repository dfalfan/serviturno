$(document).ready(function () {
  $(document).on("click", ".btn-view-study", function (e) {
    e.preventDefault();

    // Obtener la fila actual
    var row = $(this).closest("tr");

    // Obtener los datos de la fila
    var patientName = row.find("td:eq(2)").text(); // Asumiendo que el nombre está en la tercera columna
    var patientAdmission = row.find("td:eq(7)").text(); // Asumiendo que la admisión está en la octava columna
    var patientCategory = row.find("td:eq(0)").text(); // Asumiendo que la categoría está en la primera columna

    // Llenar el modal con la información
    $("#patient-name").text(patientName);
    $("#patient-admission").text(patientAdmission);
    $("#patient-category").text(patientCategory);

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

  $("#view-study-accept-btn").on("click", function () {
    console.log("Aceptar Ver Estudio");
    var viewStudyModal = bootstrap.Modal.getInstance(
      document.getElementById("viewStudyModal")
    );
    viewStudyModal.hide();
  });
});
