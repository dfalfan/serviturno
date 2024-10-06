$(document).ready(function () {
  $(document).on("click", ".btn-process", function (e) {
    e.preventDefault();
    var processModal = new bootstrap.Modal(document.getElementById('processModal'), {
      backdrop: 'static',
      keyboard: false
    });
    processModal.show();
  });

  $('#process-accept-btn').on('click', function() {
    console.log('Aceptar Procesamiento');
    var processModal = bootstrap.Modal.getInstance(document.getElementById('processModal'));
    processModal.hide();
  });
});
