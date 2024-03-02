  $(".confirm").confirm({
      text: "Se perderá la cola asociada a esta categoría. ¿Está seguro?",
      title: "Confirmación requerida",
      confirmButton: "Si",
      cancelButton: "No",
      confirmButtonClass: "btn-danger",
      cancelButtonClass: "btn-default",
      dialogClass: "modal-dialog modal-md" // Bootstrap classes for large modal
  });

  $(document).ready(function () {
    // Mostrar el modal de inicio de sesión cuando se carga la página
    $("#loginModal").modal({ backdrop: "static", keyboard: false });

    // Manejar el clic en el botón de inicio de sesión
    $("#login-button").click(function () {
      var username = $("#username").val();
      var password = $("#password").val();

      // Comprobar si el nombre de usuario y la contraseña son correctos
      if (username == "admin" && password == "prevaler29") {
        // Cerrar el modal de inicio de sesión
        $("#loginModal").modal("hide");
      } else {
        // Mostrar mensaje de error
        $("#error-message").show();
      }
    });

    // Manejar el clic en el botón de cancelar
    $("#cancel-button").click(function () {
      // Recargar la página
      location.reload();
    });
  });
