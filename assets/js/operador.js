var id;

function imprimirTicket(i) {
  id = $(i).data("id");
  $("#admissionModal").modal("show");
}

$("#admission-number").keydown(function (e) {
  if (
    (e.keyCode < 48 || e.keyCode > 57) &&
    (e.keyCode < 96 || e.keyCode > 105) &&
    e.keyCode != 8 &&
    e.keyCode != 46
  ) {
    e.preventDefault();
  }
});

var conn = new WebSocket("ws://192.168.6.205:8080");
conn.onopen = function (e) {
  console.log("Conexión establecida!");
};

$("#print-ticket-button").click(function () {
  var admissionNumber = $("#admission-number").val();

  if (!/^\d{7,}$/.test(admissionNumber)) {
    alert("Por favor, ingresa un número de admisión de al menos 6 cifras.");
    e.preventDefault();
    return;
  }

  $.ajax({
    type: "POST",
    url: "imprimir/agregar_cola",
    data: {
      id_categoria: id,
      admision: admissionNumber,
    },
    success: function () {
      location.reload(!0);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
});

function handleUpdate(e, t) {
  // Mostrar el modal y bloquear el cliente por 10 segundos
  $("#ticketNumber").text(e);
  $("#categoryName").text(t);
  $("#myModal").modal({ backdrop: "static", keyboard: !1 });
  $("#overlay").show();

  // Ocultar el modal y recargar la página después de 10 segundos
  setTimeout(function () {
    $("#myModal").modal("hide");
    $("#overlay").hide();
    if (shouldReload) {
      console.log("Actualizando pantalla");
      location.reload();
    }
  }, 1e4);
}

function handleClick(context, numActual, categoria, url) {
  // Encuentra el div con la clase 'pendientes' que es hermano del div en el que se hizo clic
  // y luego encuentra el h2 dentro de ese div
  var ticketsRestantes = $(context)
    .closest(".ticket-card")
    .find(".pendientes h2")
    .text()
    .trim();
  if (ticketsRestantes === "0" || ticketsRestantes === "") {
    console.log("No hay más tickets pendientes");
    return; // No hace nada si no hay más tickets pendientes
  }
  handleUpdate(numActual, categoria);
  triggerServerAction(url);
}

function triggerServerAction(url) {
  // Tu lógica para interactuar con el servidor
  // Por ejemplo, podrías hacer una petición AJAX a la URL proporcionada
  $.ajax({
    url: url,
    type: "GET",
    success: function () {
      console.log("Acción en el servidor realizada");
    },
  });
}

var shouldReload = false;

conn.onmessage = function (e) {
  shouldReload = true;
  console.log(e.data);
  var parts = e.data.split("|");
  if (parts[0] === "Actualizar pantalla") {
    console.log("Programando actualización de pantalla");
    var ticketNumber = parts[1]; // Número de ticket
    var categoryName = parts[2]; // Nombre de la categoría
    handleUpdate(ticketNumber, categoryName);
  } else if (e.data === "Nuevo ticket impreso") {
    console.log("Nuevo ticket");
    location.reload(!0);
  }
};

$(".confirm").confirm({
  text: "\xbfEst\xe1s seguro de que quieres forzar a reiniciar la cola de hoy?",
  title: "Confirmaci\xf3n requerida",
  confirmButton: "Si",
  cancelButton: "No",
  confirmButtonClass: "btn-danger",
  cancelButtonClass: "btn-default",
  dialogClass: "modal-dialog modal-md",
});
