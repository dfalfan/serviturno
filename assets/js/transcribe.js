$(document).ready(function () {
  $(document).on("click", ".btn-transcribe", function (e) {
    e.preventDefault();
    var transcribeModal = new bootstrap.Modal(document.getElementById('transcribeModal'), {
      backdrop: 'static',
      keyboard: false
    });
    transcribeModal.show();
  });

  $('#transcribe-accept-btn').on('click', function() {
    // Aquí puedes añadir la lógica para manejar la acción de aceptar
    console.log('Aceptar Transcripción');
    var transcribeModal = bootstrap.Modal.getInstance(document.getElementById('transcribeModal'));
    transcribeModal.hide();
  });
});
