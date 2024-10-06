$(document).ready(function () {
  $(document).on("click", ".btn-view-study", function (e) {
    e.preventDefault();

    // Obtener la fila actual
    var row = $(this).closest("tr");

    // Obtener los datos de la fila
    var patientName = row.find("td:eq(2)").text();
    var patientAdmission = row.find("td:eq(7)").text();
    var patientCategory = row.find("td:eq(0)").text();
    var studyTypes = row.find("td:eq(3)").find(".tag"); // Asumiendo que los tipos de estudio están en la cuarta columna como tags

    // Llenar el modal con la información del paciente
    $("#patient-name").text(patientName);
    $("#patient-admission").text(patientAdmission);
    $("#patient-category").text(patientCategory);

    // Limpiar la lista de estudios existente
    $("#study-list").empty();

    // Agregar cada estudio a la lista
    studyTypes.each(function (index) {
      var studyName = $(this).text();
      var studyHtml = `
                <div class="row study-item">
                    <div class="col-md-4">${studyName}</div>
                    <div class="col-md-4">
                        <select class="form-control">
                            <option value="">Seleccione una opción</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <input type="radio" name="selected-study" value="${index}">
                    </div>
                </div>
            `;
      $("#study-list").append(studyHtml);
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

  $("#view-study-accept-btn").on("click", function () {
    console.log("Aceptar Ver Estudio");
    var viewStudyModal = bootstrap.Modal.getInstance(
      document.getElementById("viewStudyModal")
    );
    viewStudyModal.hide();
  });
});
