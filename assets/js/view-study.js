$(document).ready(function () {
  $(document).on("click", ".btn-view-study", function (e) {
    e.preventDefault();
    var viewStudyModal = new bootstrap.Modal(document.getElementById('viewStudyModal'), {
      backdrop: 'static',
      keyboard: false
    });
    viewStudyModal.show();
  });

  $('#view-study-accept-btn').on('click', function() {
    console.log('Aceptar Ver Estudio');
    var viewStudyModal = bootstrap.Modal.getInstance(document.getElementById('viewStudyModal'));
    viewStudyModal.hide();
  });
});
