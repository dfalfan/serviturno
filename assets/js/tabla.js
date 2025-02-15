var conn = new WebSocket("ws://192.168.5.25:8080");
conn.onopen = function (e) {
  console.log("Conexión establecida!");
};

$(document).ready(function () {
  var ticketsByCategory = {};
  var ticketToCancel = null;

  fetchAndDisplayNotifications();

  var a = $("#myTable").DataTable({
    dom: "frtpB",
    autoWidth: false,
    // scrollY: "500px", // Altura del área de desplazamiento (ajústala según tus necesidades)
    // scrollCollapse: true,
    // paging: false, // Deshabilita la paginación si deseas desplazarte por todas las filas
    buttons: [
      "copy",
      {
        extend: "excel",
        filename: function () {
          return "reporte_serviturno_" + new Date().toISOString();
        },
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 7, 8, 9], // Define las columnas que quieres exportar (excluye 6, 10 y 11)
        },
        customize: function (xlsx) {},
      },
    ],
    language: {
      url: "assets/js/Spanish.json",
      buttons: {
        copyTitle: "Copiado al portapapeles",
        copySuccess: "Se copiaron %d filas al portapapeles",
      },
    },

    createdRow: function (row, data) {
      var technicianCell = $(row).find("td").eq(9);
      var technicianOption = $(technicianCell).find("option:selected");
      var technician = $(technicianOption).text();

      // Encuentra los botones que quieres manipular
      var btnMoreInfo = $(row).find(".btn-more-info");
      var btnVStudies = $(row).find(".btn-vstudies");
      var btnCinfint = $(row).find(".btn-cinfint");

      //Ocultar el botón "Llamar" si el ticket está anulado:
      var atendida = data.atendida;
      var btnCall = $(row).find(".btn-call");

      if (atendida === "2") {
        btnCall.hide();
        $(row).addClass("ticket-anulado");
      } else {
        btnCall.show();
        $(row).removeClass("ticket-anulado");
      }

      // btn-more-info siempre visible
      btnMoreInfo.css("opacity", "1");

      if (technician !== "Técnico" && technician !== "") {
        $(row).addClass("row-with-technician");

        // Añadir la clase para hacer los otros botones visibles
        btnVStudies.addClass("btn-technician-visible");
        btnCinfint.addClass("btn-technician-visible");
      } else {
        $(row).removeClass("row-with-technician");

        // Quitar la clase para hacer los otros botones menos visibles
        btnVStudies.removeClass("btn-technician-visible");
        btnCinfint.removeClass("btn-technician-visible");
      }
    },

    columnDefs: [
      {
        targets: [3], // Índice de la columna "Tipo"
        autoWidth: true,
      },
      {
        targets: [9], // El índice de la columna que contiene los botones
        autoWidth: false,
      },
      {
        targets: [6], // "tiempo esspera"
        visible: true,
        searchable: false,
      },
      {
        targets: [12], //  columna "Acción"
        orderable: false,
        searchable: false,
      },
    ],
    pageLength: 50,
    drawCallback: function () {
      updateTotalStudies();
    },
  });

  var id;

  $("#selected-category-id").val("undefined");
  handleVisibility();

  function handleVisibility() {
    var categoryID = $("#selected-category-id").val();

    if (categoryID === "undefined" || categoryID === undefined) {
      $("#print-ticket-btn").hide();
      $(".vertical-line").hide();
      a.column(11).visible(false); // Ocultar la columna "Llamar"
      a.column(12).visible(false); // Ocultar la columna "Acción"
    } else {
      $("#print-ticket-btn").show();
      $(".vertical-line").show();
      a.column(11).visible(true); // Mostrar la columna "Llamar"
      a.column(12).visible(true); // Mostrar la columna "Acción"
    }
  }

  $(".filter-btn").click(function () {
    // Actualizar la categoría seleccionada
    $(".filter-btn").removeClass("selected");
    $(this).addClass("selected");

    var categoryID = $(this).data("id"); // Capturar el ID de la categoría
    $("#selected-category-id").val(categoryID); // Almacenar el ID en un campo oculto

    handleVisibility(); // Llamar a la función para manejar la visibilidad del botón

    // Llama a updateTotalStudies después de que se haya actualizado la categoría seleccionada
    updateTotalStudies();
  });

  $("#print-ticket-btn").click(function () {
    id = $("#selected-category-id").val(); // Obtener el ID de la categoría seleccionada
    $("#admissionModal").modal("show");
  });

  // Validar el número de admisión
  // Validar el número de admisión
  $("#admission-number").keydown(function (e) {
    // Permitir Ctrl+C (copiar)
    if (e.ctrlKey && e.keyCode === 67) {
      return;
    }

    // Permitir Ctrl+V (pegar)
    if (e.ctrlKey && e.keyCode === 86) {
      return;
    }

    // Permitir teclas de números, backspace y delete
    if (
      (e.keyCode >= 48 && e.keyCode <= 57) || // Números del teclado principal
      (e.keyCode >= 96 && e.keyCode <= 105) || // Números del teclado numérico
      e.keyCode === 8 || // Backspace
      e.keyCode === 46 // Delete
    ) {
      return;
    }

    e.preventDefault();
  });

  $("#print-ticket-button").click(function () {
    var admissionNumber = $("#admission-number").val();
    var selectedCategoryId = $("#selected-category-id").val();

    if (!/^\d{7,}$/.test(admissionNumber)) {
      alert("Por favor, ingresa un número de admisión de al menos 7 cifras.");
      return;
    }

    $(this).prop("disabled", true); // Deshabilita el botón para evitar múltiples clics

    $.ajax({
      type: "POST",
      url: "Tabla/verificar_admision",
      data: {
        admision: admissionNumber,
        id_categoria: selectedCategoryId,
      },
      success: function (response) {
        var data = JSON.parse(response);
        if (data.existe) {
          alert(
            "Ya existe un ticket con esta admisión en la categoría seleccionada."
          );
          $("#print-ticket-button").prop("disabled", false); // Habilita el botón nuevamente
        } else {
          $.ajax({
            type: "POST",
            url: "imprimir/agregar_cola",
            data: {
              id_categoria: selectedCategoryId,
              admision: admissionNumber,
            },
            success: function (response) {
              console.log("Respuesta de agregar_cola:", response);
              $("#admission-number").val(""); // Borra el campo de texto de la admisión
              $("#admissionModal").modal("hide"); // Cierra el modal de admisión
              console.log("Tipos:", response.tipos);
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.log("Error en agregar_cola:", textStatus, errorThrown);
              $("#print-ticket-button").prop("disabled", false); // Habilita el botón en caso de error
            },
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("Error en verificar_admision:", textStatus, errorThrown);
        $("#print-ticket-button").prop("disabled", false); // Habilita el botón en caso de error
      },
    });
  });

  // Habilita el botón cuando se cierre el modal
  $("#admissionModal").on("hidden.bs.modal", function () {
    $("#print-ticket-button").prop("disabled", false);
  });

  function capitalizeName(name) {
    return name
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  var selectedDateGlobal = new Date();

  var fpInstance = flatpickr("#datepicker", {
    dateFormat: "D, d M Y",
    locale: "es",
    defaultDate: selectedDateGlobal,
    onChange: function (selectedDates, dateStr, instance) {
      selectedDateGlobal = selectedDates[0];
      updateTableAndDateLabel(selectedDateGlobal);
    },
    onReady: function (selectedDates, dateStr, instance) {
      updateTableAndDateLabel(selectedDateGlobal);
    },
  });

  $("#prev-date").click(function () {
    var newDate = new Date(selectedDateGlobal);
    newDate.setDate(newDate.getDate() - 1);
    fpInstance.setDate(newDate);
  });

  $("#next-date").click(function () {
    var newDate = new Date(selectedDateGlobal);
    newDate.setDate(newDate.getDate() + 1);
    fpInstance.setDate(newDate);
  });

  function updateTableAndDateLabel(date) {
    var formattedDate = flatpickr.formatDate(date, "Y-m-d");

    // Actualizar la tabla con la nueva fecha
    fetchDataForDate(formattedDate);
  }

  function fetchDataForDate(formattedDate) {
    $.ajax({
      url: "Tabla/obtener_datos_por_fecha",
      type: "GET",
      data: { date: formattedDate },
      success: function (response) {
        var data = JSON.parse(response);
        a.clear();

        if (data.length > 0) {
          // Aquí va el código para actualizar la tabla con los nuevos datos
          // ...
        }

        a.draw();
        updateTotalStudies();
      },
    });
  }

  function generateActionButtons(tecnico, study_instance_uids, estudios_informados, estudios_guardados, estudios_procesados) {
    if (tecnico) {
        // Verificar si hay algún study_instance_uid no nulo
        const hasStudy = study_instance_uids && study_instance_uids.split(',').some(uid => uid !== '' && uid !== null);
        
        // Verificar si hay algún estudio informado
        const isInformed = estudios_informados && estudios_informados.split(',').some(informed => informed === '1');
        
        // Verificar si hay algún estudio guardado
        const isSaved = estudios_guardados && estudios_guardados.split(',').some(saved => saved === '1');
        
        // Verificar si hay algún estudio procesado
        const isProcessed = estudios_procesados && estudios_procesados.split(',').some(processed => processed === '1');
        
        return '<div class="action-buttons">' +
            '<button class="btn-action btn-view-study ' + (hasStudy ? 'has-study' : '') + '" title="Ver estudio"><i class="fas fa-eye"></i></button>' +
            '<button class="btn-action btn-transcribe ' + (isInformed ? 'is-informed' : (isSaved ? 'is-saved' : '')) + '" title="Transcribir"><i class="fas fa-microphone"></i></button>' +
            '<button class="btn-action btn-process ' + (isProcessed ? 'is-processed' : '') + '" title="Procesar"><i class="fas fa-play"></i></button>' +
            '</div>';
    }
    return '';
  }

  $("#refresh-btn").on("click", function () {
    var formattedDate = $.datepicker.formatDate("yy-mm-dd", selectedDateGlobal);
    fetchAndDisplayNotifications();
    setTimeout(function () {
      $.ajax({
        url: "Tabla/obtener_datos_por_fecha",
        type: "GET",
        data: { date: formattedDate },
        success: function (response) {
          var data = JSON.parse(response);
          a.clear();

          if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
              var tiposHtml = "";
              var btnMoreInfoClass = data[i].detalle ? "has-details" : "";
              var mostrarLlamar = data[i].mostrar_llamar === "1";
              var tipos = data[i].tipo ? data[i].tipo.split(",") : [];
              var url = tuBaseURL + "operador/toggle_random/" + data[i].id;

              for (var j = 0; j < tipos.length; j++) {
                var tipo = tipos[j].trim();
                if (tipo) {
                  tiposHtml += '<span class="tag">' + tipo + "</span>";
                }
              }

              var paciente = data[i].paciente
                ? capitalizeName(data[i].paciente)
                : "";
              var tecnicoSelect = '<select class="tecnico-select"';

              if (data[i].atendida != "1" || data[i].tecnico) {
                tecnicoSelect += " disabled";
              }

              tecnicoSelect +=
                '><option value="">' +
                (data[i].tecnico ? data[i].tecnico : "Técnico") +
                "</option>" +
                '<option value="N/A">N/A</option>' +
                '<option value="YL">YL</option>' +
                '<option value="MC">MC</option>' +
                '<option value="RS">RS</option>' +
                '<option value="YP">YP</option>' +
                '<option value="AL">AL</option>' +
                '<option value="BA">BA</option>' +
                '<option value="AR">AR</option>' +
                '<option value="LN">LN</option>' +
                '<option value="SR">SR</option>' +
                '<option value="MH">MH</option>' +
                "</select>";

              var tiempoParaAtencionCell = "";
              if (data[i].hora_de_llamado) {
                // Si el ticket ha sido llamado, muestra el tiempo formateado con la clase 'tiempo-llamado'
                tiempoParaAtencionCell =
                  '<span class="tiempo-llamado">' +
                  formatTime(data[i].tiempo_para_atencion) +
                  "</span>";
              } else {
                // Si el ticket no ha sido llamado, agrega la clase 'tiempo-espera' al elemento <span>
                tiempoParaAtencionCell =
                  '<span class="tiempo-espera" data-hora-impresion="' +
                  data[i].hora_de_impresion +
                  '">00:00</span>';
              }

              if (
                data[i].tiempo_para_atencion &&
                "00:00:00" !== data[i].tiempo_para_atencion
              ) {
                tiempoParaAtencionCell = formatTime(
                  data[i].tiempo_para_atencion
                );
              } else if (!data[i].hora_de_llamado) {
                // Si el ticket no ha sido llamado, agrega una clase especial a la celda
                tiempoParaAtencionCell =
                  '<span class="tiempo-espera" data-hora-impresion="' +
                  data[i].hora_de_impresion +
                  '">00:00</span>';
              }

              var row = a.row
                .add([
                  data[i].especialidad,
                  '<span style="font-weight: bold; color: #f47628; font-size: 30px;">' +
                    data[i].ticket +
                    "</span>",
                  paciente,
                  tiposHtml,
                  data[i].hora_de_impresion
                    ? moment(
                        data[i].hora_de_impresion,
                        "YYYY-MM-DD HH:mm:ss"
                      ).format("hh:mm:ss A")
                    : "",
                  data[i].hora_de_llamado
                    ? moment(
                        data[i].hora_de_llamado,
                        "YYYY-MM-DD HH:mm:ss"
                      ).format("hh:mm:ss A")
                    : "",
                  tiempoParaAtencionCell,
                  data[i].admision,
                  data[i].ps,
                  tecnicoSelect,
                  '<button class="btn btn-more-info ' +
                    btnMoreInfoClass +
                    '"><i class="fas fa-plus"></i></button>',
                  mostrarLlamar
                    ? '<button class="btn btn-call" data-ticket="' +
                      data[i].ticket +
                      '" data-url="' +
                      url +
                      '">Llamar</button>'
                    : "",
                  generateActionButtons(
                    data[i].tecnico, 
                    data[i].study_instance_uids, 
                    data[i].estudios_informados, 
                    data[i].estudios_guardados,
                    data[i].estudios_procesados
                  ),
                ])
                .draw(false)
                .node();

              $(row).attr("data-id", data[i].id);

              // Agregar la clase "ticket-anulado" si el ticket está anulado
              if (data[i].atendida === "2") {
                $(row).addClass("ticket-anulado");
              }
            }
          }

          a.draw();
        },
      });
    }, 0);
  });

  // Esta función verifica si la fecha seleccionada es hoy y muestra u oculta el label correspondiente
  function checkIfTodayIsSelected(date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (today.getTime() === date.getTime()) {
      $("#go-to-today").hide();
    } else {
      $("#go-to-today").show();
    }
  }

  // Esto lleva al usuario a la fecha actual
  $("#go-to-today").click(function () {
    var today = new Date();
    selectedDateGlobal = today;
    datepickerElement.datepicker("setDate", today); // Esto también disparará el evento 'onSelect'
    updateTableAndDateLabel(today);
  });

  $("#myTable").on("init.dt", function () {
    $("#date-label-wrapper").insertBefore(".dataTables_filter");
    $("#total-studies-label").insertBefore(".dataTables_filter");
    $("#selected-date-label").insertBefore(".dataTables_filter");
  });

  $(".filter-btn").on("click", function () {
    var e = $(this).data("filter");
    a.column(0).search(e).draw(),
      $(".filter-btn").removeClass("selected"),
      $(this).addClass("selected");
    updateTotalStudies();
  });

  var currentDate = new Date();
  fpInstance.setDate(currentDate);
  selectedDateGlobal = currentDate;

  $("#datepicker-btn").on("click", function () {
    datepickerElement.datepicker("widget").is(":visible")
      ? datepickerElement.datepicker("hide")
      : datepickerElement.datepicker("show");
  });

  function updateTableAndDateLabel(date) {
    var r = $.datepicker.formatDate("yy-mm-dd", date);
    // Aquí va todo el código AJAX y la actualización de la tabla que estaba en el onSelect original
    $.ajax({
      url: "Tabla/obtener_datos_por_fecha",
      type: "GET",
      data: { date: r },
      success: function (response) {
        var data = JSON.parse(response);
        a.clear();

        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            var tiposHtml = "";
            var btnMoreInfoClass = data[i].detalle ? "has-details" : "";
            var mostrarLlamar = data[i].mostrar_llamar === "1";
            var tipos = data[i].tipo ? data[i].tipo.split(",") : [];
            var url = tuBaseURL + "operador/toggle_random/" + data[i].id;

            for (var j = 0; j < tipos.length; j++) {
              var tipo = tipos[j].trim(); // Eliminar espacios en blanco
              if (tipo) {
                tiposHtml += '<span class="tag">' + tipo + "</span>";
              }
            }

            var paciente = data[i].paciente
              ? capitalizeName(data[i].paciente)
              : "";
            var tecnicoSelect = '<select class="tecnico-select"';

            if (data[i].atendida != "1" || data[i].tecnico) {
              tecnicoSelect += " disabled";
            }

            tecnicoSelect +=
              '><option value="">' +
              (data[i].tecnico ? data[i].tecnico : "Técnico") +
              "</option>" +
              '<option value="N/A">N/A</option>' +
              '<option value="YL">YL</option>' +
              '<option value="MC">MC</option>' +
              '<option value="RS">RS</option>' +
              '<option value="YP">YP</option>' +
              '<option value="AL">AL</option>' +
              '<option value="BA">BA</option>' +
              '<option value="AR">AR</option>' +
              '<option value="LN">LN</option>' +
              '<option value="SR">SR</option>' +
              '<option value="MH">MH</option>' +
              "</select>";

            var tiempoParaAtencionCell = "";
            if (data[i].hora_de_llamado) {
              // Si el ticket ha sido llamado, muestra el tiempo formateado con la clase 'tiempo-llamado'
              tiempoParaAtencionCell =
                '<span class="tiempo-llamado">' +
                formatTime(data[i].tiempo_para_atencion) +
                "</span>";
            } else {
              // Si el ticket no ha sido llamado, agrega la clase 'tiempo-espera' al elemento <span>
              tiempoParaAtencionCell =
                '<span class="tiempo-espera" data-hora-impresion="' +
                data[i].hora_de_impresion +
                '">00:00</span>';
            }

            if (
              data[i].tiempo_para_atencion &&
              "00:00:00" !== data[i].tiempo_para_atencion
            ) {
              tiempoParaAtencionCell = formatTime(data[i].tiempo_para_atencion);
            } else if (!data[i].hora_de_llamado) {
              // Si el ticket no ha sido llamado, agrega una clase especial a la celda
              tiempoParaAtencionCell =
                '<span class="tiempo-espera" data-hora-impresion="' +
                data[i].hora_de_impresion +
                '">00:00</span>';
            }

            var row = a.row
              .add([
                data[i].especialidad,
                '<span style="font-weight: bold; color: #f47628; font-size: 30px;">' +
                  data[i].ticket +
                  "</span>",
                paciente,
                tiposHtml,
                data[i].hora_de_impresion
                  ? moment(
                      data[i].hora_de_impresion,
                      "YYYY-MM-DD HH:mm:ss"
                    ).format("hh:mm:ss A")
                  : "",
                data[i].hora_de_llamado
                  ? moment(
                      data[i].hora_de_llamado,
                      "YYYY-MM-DD HH:mm:ss"
                    ).format("hh:mm:ss A")
                  : "",
                tiempoParaAtencionCell,

                data[i].admision,
                data[i].ps,
                tecnicoSelect,
                '<button class="btn btn-more-info ' +
                  btnMoreInfoClass +
                  '"><i class="fas fa-plus"></i></button>',
                mostrarLlamar
                  ? '<button class="btn btn-call" data-ticket="' +
                    data[i].ticket +
                    '" data-url="' +
                    url +
                    '">Llamar</button>'
                  : "",
                generateActionButtons(
                  data[i].tecnico, 
                  data[i].study_instance_uids, 
                  data[i].estudios_informados, 
                  data[i].estudios_guardados,
                  data[i].estudios_procesados
                ),
              ])
              .draw(false)
              .node();

            $(row).attr("data-id", data[i].id);

            // Agregar la clase "ticket-anulado" si el ticket está anulado
            if (data[i].atendida === "2") {
              $(row).addClass("ticket-anulado");
            }
          }
        }

        a.draw();
        checkIfTodayIsSelected(date);
      },
    });

    var formattedDate = $.datepicker.formatDate("DD, dd/mm/yy", date);
    $("#selected-date-label").text(formattedDate);
  }

  $("#prev-date").click(function () {
    selectedDateGlobal.setDate(selectedDateGlobal.getDate() - 1);
    updateTableAndDateLabel(selectedDateGlobal);
    checkIfTodayIsSelected(selectedDateGlobal);
  });

  $("#next-date").click(function () {
    selectedDateGlobal.setDate(selectedDateGlobal.getDate() + 1);
    updateTableAndDateLabel(selectedDateGlobal);
    checkIfTodayIsSelected(selectedDateGlobal);
  });

  $("#myTable").on("init.dt", function () {
    $("#date-label-wrapper").insertBefore(".dataTables_filter");
    $("#total-studies-label").insertBefore(".dataTables_filter");
    $("#selected-date-label").insertBefore(".dataTables_filter");
  });

  $(".filter-btn").on("click", function () {
    var e = $(this).data("filter");
    a.column(0).search(e).draw(),
      $(".filter-btn").removeClass("selected"),
      $(this).addClass("selected");
    updateTotalStudies();
  });

  var currentDate = new Date();
  fpInstance.setDate(currentDate);
  selectedDateGlobal = currentDate;

  $("#datepicker-btn").on("click", function () {
    datepickerElement.datepicker("widget").is(":visible")
      ? datepickerElement.datepicker("hide")
      : datepickerElement.datepicker("show");
  });

  // Modal de paciente

  $(document).on("click", ".btn-more-info", function () {
    var row = $(this).closest("tr");
    var patientId = row.data("id");
    console.log("ID del paciente:", patientId);
    $("#patientDetailsModal").data("row", row);
    $("#patientDetailsModal").data("patient-id", patientId); // Guardamos el ID del paciente

    $.ajax({
      url: "Tabla/obtener_detalle_paciente",
      type: "GET",
      data: { id: patientId },
      success: function (data) {
        var patientDetails = JSON.parse(data);

        var anulado = patientDetails.anulado;
        var anularTicketButton = anulado
          ? ""
          : "<button id='anularTicketBtn' class='btn btn-danger' data-id='" +
            patientDetails.id +
            "'>Anular Ticket</button>";
        var detalleStyle = anulado ? "text-decoration: line-through;" : "";

        var horaDeImpresion = patientDetails.hora_de_impresion
          ? moment(patientDetails.hora_de_impresion).format("hh:mm A")
          : "";

        var horaDeLlamado = patientDetails.hora_de_llamado
          ? moment(patientDetails.hora_de_llamado).format("hh:mm A")
          : "";

        var tiempoParaAtencion = patientDetails.tiempo_para_atencion
          ? moment
              .utc(patientDetails.tiempo_para_atencion, "HH:mm:ss")
              .format("HH:mm:ss")
          : "";

        var informes = patientDetails.informe
          ? patientDetails.informe.split(", ")
          : [];
        var informeLinks = informes.length
          ? informes
              .map(function (informe, index) {
                var parts = informe.split("_");
                var studyType = parts.slice(4, -2).join(" "); // Toma todas las partes desde la cuarta hasta la penúltima
                studyType = studyType.split("/").pop(); // Toma la última parte después de la última barra
                return (
                  "<a href='serve_pdf.php?id_paciente=" +
                  patientDetails.id +
                  "&index=" +
                  index +
                  "' target='_blank'>" +
                  studyType +
                  ".pdf" +
                  "</a>"
                );
              })
              .join("<br>") // Separar los enlaces con saltos de línea
          : "No disponible";

        var modalContent =
          "<table style='width: 100%; border-collapse: separate; border-spacing: 10px;'>" +
          "<tr><td style='width: 50%;'><b>Especialidad:</b> " +
          patientDetails.especialidad +
          "</td><td style='width: 50%;'><b>P/S:</b> " +
          patientDetails.ps +
          "</td></tr>" +
          "<tr><td><b>Ticket:</b> " +
          patientDetails.ticket +
          "</td><td><b>Seguro:</b> " +
          patientDetails.seguro +
          "</td></tr>" +
          "<tr><td><b>Paciente:</b> " +
          patientDetails.paciente +
          "</td><td><b>Empresa:</b> " +
          patientDetails.empresa +
          "</td></tr>" +
          "<tr><td><b>Edad:</b> " +
          patientDetails.edad +
          "</td><td><b>Hora de Impresión:</b> " +
          horaDeImpresion +
          "</td></tr>" +
          "<tr><td><b>Tipo de estudio:</b> " +
          patientDetails.tipo +
          "</td><td><b>Hora de Llamado:</b> " +
          horaDeLlamado +
          "</td></tr>" +
          "<tr><td><b>Admision:</b> " +
          patientDetails.admision +
          "</td><td><b>Tiempo para Atención:</b> " +
          tiempoParaAtencion +
          "</td></tr>" +
          "<tr><td><b>Cedula:</b> " +
          patientDetails.cedula +
          "</td><td>" +
          anularTicketButton +
          "</td></tr>" +
          "<tr><td colspan='2'>" +
          "<p style='text-align: center; margin-top: 50px;'><b>Detalle:</b></p>" +
          "<textarea id='detalle' class='form-control' rows='4' placeholder='Escribe aquí el detalle...' style='width: 100%; margin: 0 auto 10px; padding: 5px; " +
          detalleStyle +
          "'>" +
          (patientDetails.detalle ? patientDetails.detalle : "") +
          "</textarea>" +
          "</td></tr>" +
          "</table>";

        if ($("body").hasClass("dark-mode")) {
          $("#patientDetailsModal .modal-content").addClass("dark-mode");
        } else {
          $("#patientDetailsModal .modal-content").removeClass("dark-mode");
        }

        $("#patientDetailsModal .modal-body").html(modalContent);

        $("#patientDetailsModal").modal("show");
      },
    });
  });

  $("#patientDetailsModal").modal({
    backdrop: "static",
    keyboard: false,
  });

  $(document).on("click", "#anularTicketBtn", function () {
    var patientId = $(this).data("id");
    var row = $("#patientDetailsModal").data("row");

    console.log("ID del paciente:", patientId);

    if ($(row).hasClass("row-with-technician")) {
      alert(
        "El ticket no se puede anular porque ya ha sido firmado por un técnico."
      );
      return;
    }

    var confirmation = confirm(
      "¿Estás seguro de que deseas anular este ticket? Esta acción NO se puede deshacer"
    );

    if (confirmation) {
      $("#detalle").addClass("required");
      ticketToCancel = patientId;

      // No anulamos el ticket aquí, solo marcamos que se debe anular
      console.log("Ticket marcado para anulación:", ticketToCancel);
    } else {
      console.log("Anulación de ticket cancelada por el usuario");
    }
  });

  $(document).on("click", "#save-btn", function () {
    console.log("Botón de guardar clickeado");

    var detalle = $("#detalle").val();
    var patientId = $("#patientDetailsModal").data("patient-id");

    console.log("ID del paciente:", patientId);

    if ($("#detalle").hasClass("required") && detalle.trim() === "") {
      alert("Por favor, ingrese un detalle para anular el ticket.");
      return;
    }

    if (ticketToCancel !== null) {
      $.ajax({
        url: "Tabla/anular_ticket",
        type: "POST",
        data: { id: ticketToCancel },
        success: function (response) {
          console.log("Respuesta del servidor al anular el ticket:", response);
          actualizarDetallePaciente(patientId, detalle);
        },
        error: function (error) {
          console.error("Error al anular el ticket:", error);
          alert("Error al anular el ticket. Por favor, inténtelo de nuevo.");
        },
      });
    } else {
      actualizarDetallePaciente(patientId, detalle);
    }
  });

  function actualizarDetallePaciente(patientId, detalle) {
    $.ajax({
      url: "Tabla/actualizar_detalle_paciente",
      type: "POST",
      data: { id: patientId, detalle: detalle },
      success: function (data) {
        $("#patientDetailsModal").modal("hide");
        $("#refresh-btn").click();
        conn.send("Dato editado");
        console.log("Mensaje de edición enviado");
        ticketToCancel = null; // Reseteamos la variable
      },
      error: function (error) {
        console.error("Error en la solicitud de actualización:", error);
        alert("Error al actualizar el detalle. Por favor, inténtelo de nuevo.");
      },
    });
  }

  $("#btn-closer").click(function () {
    $("#patientDetailsModal").modal("hide");
  });

  $("#btn-closer2").click(function () {
    $("#admissionModal").modal("hide");
  });

  $(document).on("change", ".tecnico-select", function () {
    var selectElement = $(this);
    var row = $(this).closest("tr");
    var patientId = row.data("id");
    var selectedTechnician = $(this).val();

    $.ajax({
      url: "Tabla/actualizar_tecnico", // Asegúrate de reemplazar esto con la URL de tu controlador
      type: "POST",
      data: { id: patientId, tecnico: selectedTechnician },
      success: function (data) {
        // Bloquea el cuadro de selección una vez que se haya actualizado la base de datos
        selectElement.prop("disabled", true);
        $("#refresh-btn").click();
      },
      error: function (error) {
        console.log("Ocurrió un error al actualizar el técnico:", error);
      },
    });
  });

  //Operador

  $(document).on("click", ".btn-call", function () {
    // No muestra el modal inmediatamente
    // $("#myModal").modal("show"); // <-- Comentado

    var categorias = {
      42: "Rayos X",
      48: "Tomografía ",
      49: "Resonancia",
      50: "Ecografía 1",
      51: "Ecografía",
      52: "Mamografía",
      53: "Densitometría",
      55: "Resultados",
    };

    var ticket = $(this).data("ticket");
    var url = $(this).data("url");
    var categoriaID = $("#selected-category-id").val();
    var categoriaNombre = categorias[categoriaID];

    console.log("Datos recogidos:", ticket, url, categoriaID, categoriaNombre);

    // Actualizar los valores en el modal
    $("#ticketNumber").text(ticket);
    $("#categoryName").text(categoriaNombre);

    // Mostrar el modal y bloquear el cliente por 10 segundos
    $("#myModal").modal({ backdrop: "static", keyboard: false });
    $("#overlay").show();

    // Desactivar el botón .btn-call para evitar llamadas recursivas
    $(".btn-call").prop("disabled", true);

    // Ocultar el modal y reactivar el botón .btn-call después de 10 segundos
    setTimeout(function () {
      $("#myModal").modal("hide");
      $("#overlay").hide();
      $(".btn-call").prop("disabled", false); // Reactivar el botón
    }, 10000); // 10000 milisegundos son 10 segundos

    // Llamar a la función toggleAtendida con los datos recopilados
    toggleAtendida(ticket, categoriaID, url);
  });

  function toggleAtendida(ticket, id_categoria, url) {
    $.ajax({
      type: "POST",
      url: url, //toggle_atendida o toggle_random
      data: { ticket: ticket, id_categoria: id_categoria },
      success: function (response) {
        console.log("Éxito");
      },
      error: function (error) {
        console.error("Ocurrió un error:", error);
      },
    });
  }

  conn.onmessage = function (e) {
    console.log(e.data);
    var parts = e.data.split("|");

    if (
      parts[0] === "Actualizar pantalla" ||
      e.data === "Nuevo ticket impreso" ||
      e.data === "Actualizar detalle"
    ) {
      // Llamar al botón de refresh
      $("#refresh-btn").click();
    }
    if (parts[0] === "Actualizar pantalla") {
      var ticket = parts[1]; // Número de ticket
      var categoryName = parts[2]; // Nombre de la categoría

      // Actualizar los valores en el modal
      $("#ticketNumber").text(ticket);
      $("#categoryName").text(categoryName);

      // Mostrar el modal y bloquear el cliente por 10 segundos
      $("#myModal").modal("show"); // Corrección aquí

      // Ocultar el modal después de 10 segundos
      setTimeout(function () {
        $("#myModal").modal("hide");
        $("#overlay").hide();
        $("#refresh-btn").click(); // Recargar los datos después de cerrar el modal
      }, 10000); // 10000 milisegundos son 10 segundos
    }
  };

  function triggerServerAction(url) {
    $.ajax({
      url: url,
      type: "GET",
      success: function () {
        console.log("Acción en el servidor realizada");
      },
    });
  }

  //Operador

  // Función para actualizar el label con la cantidad total de estudios
  function updateTotalStudies() {
    var totalStudies = a.page.info().recordsDisplay; // 'a' es tu instancia de DataTable
    var selectedCategory = $(".filter-btn.selected").data("filter"); // Obtener la categoría seleccionada

    var totalPending = ticketsByCategory[selectedCategory] || 0; // Obtener el número de estudios pendientes para la categoría seleccionada

    var text = "Hay un total de " + totalStudies + " tickets";

    // Obtener la fecha actual y ponerla en el mismo formato que selectedDateGlobal
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Comparar la fecha seleccionada con la fecha actual
    if (
      selectedDateGlobal.setHours(0, 0, 0, 0) === currentDate.getTime() &&
      totalPending > 0
    ) {
      text += ", " + totalPending + " pendientes.";
    }

    $("#total-studies-label").text(text);
  }

  function initializeTicketsByCategory() {
    $(".filter-btn").each(function () {
      var category = $(this).data("filter");
      ticketsByCategory[category] = 0;
    });
  }

  // Si hay tickets por llamar para una categoría específica
  function updateNotifications(ticketsByCategory) {
    // Iterar sobre los botones de filtro
    $(".filter-btn").each(function () {
      var category = $(this).data("filter"); // Obtener la categoría del botón actual
      var numberOfTickets = ticketsByCategory[category]; // Obtener el número de tickets para esa categoría

      if (numberOfTickets > 0) {
        $(this).find(".notification").text(numberOfTickets).show();
      } else {
        $(this).find(".notification").hide();
      }
    });
  }

  function fetchAndDisplayNotifications() {
    // Inicializar todos los tickets por categoría con cero
    initializeTicketsByCategory();

    $.get(
      "Tabla/obtener_tickets_no_llamados",
      function (data) {
        // Actualiza ticketsByCategory con los nuevos datos
        data.forEach(function (item) {
          ticketsByCategory[item.especialidad] = item.tickets_no_llamados;
        });

        // Actualiza las notificaciones en la UI
        updateNotifications(ticketsByCategory);

        // Llamar a updateTotalStudies aquí para que se actualice con los nuevos datos
        updateTotalStudies();
      },
      "json"
    );
  }

  function formatTime(timeString, hora_de_llamado) {
    var duration = moment.duration(timeString);
    var hours = duration.hours();
    var minutes = duration.minutes();

    var formattedTime = "";
    var tiempoLlamadoClass = "";

    if (hora_de_llamado) {
      tiempoLlamadoClass = "tiempo-llamado";
    }

    if (hours > 0) {
      formattedTime += hours + " hora" + (hours > 1 ? "s" : "") + "<br>";
    }
    if (minutes > 0) {
      formattedTime += minutes + " min";
    }
    if (minutes === 0 && hours === 0) {
      formattedTime += "0 min";
    }

    return (
      '<span class="' + tiempoLlamadoClass + '">' + formattedTime + "</span>"
    );
  }

  function actualizarContadoresEspera() {
    $(".tiempo-espera").each(function () {
      var row = $(this).closest("tr");
      var horaImpresion = $(this).data("hora-impresion");

      // Verificar si el ticket está anulado
      if (row.hasClass("ticket-anulado")) {
        // Si el ticket está anulado, mostrar un valor nulo o vacío en lugar del contador
        $(this).html("");
      } else {
        // Si el ticket no está anulado, actualizar el contador normalmente
        var tiempoTranscurrido = moment().diff(
          moment(horaImpresion, "YYYY-MM-DD HH:mm:ss")
        );
        var tiempoFormateado = formatTime(
          moment.utc(tiempoTranscurrido).format("HH:mm:ss")
        );
        $(this).html(tiempoFormateado);
      }
    });
  }

  setInterval(actualizarContadoresEspera, 1000);

  //????
  var o = new Date();
  function i(e) {
    var t = $.datepicker.formatDate("yy-mm-dd", e);
    $.ajax({
      url: "Tabla/obtener_datos_por_fecha",
      type: "GET",
      data: { date: t },
      success: function (response) {
        var data = JSON.parse(response);
        a.clear();

        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            var tiposHtml = "";
            var btnMoreInfoClass = data[i].detalle ? "has-details" : "";
            var tipos = data[i].tipo ? data[i].tipo.split(",") : [];
            var mostrarLlamar = data[i].mostrar_llamar === "1";
            var url = tuBaseURL + "operador/toggle_random/" + data[i].id;

            for (var j = 0; j < tipos.length; j++) {
              var tipo = tipos[j].trim(); // Eliminar espacios en blanco
              if (tipo) {
                tiposHtml += '<span class="tag">' + tipo + "</span>";
              }
            }

            var admision = data[i].admision ? data[i].admision : ""; // if admision is null, use an empty string
            var paciente = data[i].paciente
              ? capitalizeName(data[i].paciente)
              : ""; // Aplica la función al paciente

            var tecnicoSelect = '<select class="tecnico-select"';
            if (data[i].atendida != "1" || data[i].tecnico) {
              tecnicoSelect += " disabled";
            }
            tecnicoSelect +=
              '><option value="">' +
              (data[i].tecnico ? data[i].tecnico : "Técnico") +
              "</option>" +
              '<option value="N/A">N/A</option>' +
              '<option value="YL">YL</option>' +
              '<option value="MC">MC</option>' +
              '<option value="RS">RS</option>' +
              '<option value="YP">YP</option>' +
              '<option value="AL">AL</option>' +
              '<option value="BA">BA</option>' +
              '<option value="AR">AR</option>' +
              '<option value="LN">LN</option>' +
              '<option value="SR">SR</option>' +
              '<option value="MH">MH</option>' +
              "</select>";

            var tiempoParaAtencionCell = "";
            if (data[i].hora_de_llamado) {
              // Si el ticket ha sido llamado, muestra el tiempo formateado con la clase 'tiempo-llamado'
              tiempoParaAtencionCell =
                '<span class="tiempo-llamado">' +
                formatTime(data[i].tiempo_para_atencion) +
                "</span>";
            } else {
              // Si el ticket no ha sido llamado, agrega la clase 'tiempo-espera' al elemento <span>
              tiempoParaAtencionCell =
                '<span class="tiempo-espera" data-hora-impresion="' +
                data[i].hora_de_impresion +
                '">00:00</span>';
            }

            if (
              data[i].tiempo_para_atencion &&
              "00:00:00" !== data[i].tiempo_para_atencion
            ) {
              tiempoParaAtencionCell = formatTime(data[i].tiempo_para_atencion);
            } else if (!data[i].hora_de_llamado) {
              // Si el ticket no ha sido llamado, agrega una clase especial a la celda
              tiempoParaAtencionCell =
                '<span class="tiempo-espera" data-hora-impresion="' +
                data[i].hora_de_impresion +
                '">00:00</span>';
            }

            var row = a.row
              .add([
                data[i].especialidad,
                '<span style="font-weight: bold; color: #f47628; font-size: 30px;">' +
                  data[i].ticket +
                  "</span>",
                paciente,
                tiposHtml,
                data[i].hora_de_impresion
                  ? moment(
                      data[i].hora_de_impresion,
                      "YYYY-MM-DD HH:mm:ss"
                    ).format("hh:mm:ss A")
                  : "",
                data[i].hora_de_llamado
                  ? moment(
                      data[i].hora_de_llamado,
                      "YYYY-MM-DD HH:mm:ss"
                    ).format("hh:mm:ss A")
                  : "",
                tiempoParaAtencionCell,
                admision,
                data[i].ps,
                tecnicoSelect,
                '<button class="btn btn-more-info ' +
                  btnMoreInfoClass +
                  '"><i class="fas fa-plus"></i></button>',
                mostrarLlamar
                  ? '<button class="btn btn-call" data-ticket="' +
                    data[i].ticket +
                    '" data-url="' +
                    url +
                    '">Llamar</button>'
                  : "",
                generateActionButtons(
                  data[i].tecnico, 
                  data[i].study_instance_uids, 
                  data[i].estudios_informados, 
                  data[i].estudios_guardados,
                  data[i].estudios_procesados
                ),
              ])
              .draw(false)
              .node();

            $(row).attr("data-id", data[i].id);

            // Agregar la clase "ticket-anulado" si el ticket está anulado
            if (data[i].atendida === "2") {
              $(row).addClass("ticket-anulado");
            }
          }
        }

        a.draw();
      },
    });
  }
});
