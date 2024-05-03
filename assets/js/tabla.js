var conn = new WebSocket("ws://192.168.5.25:8080");
conn.onopen = function (e) {
  console.log("Conexión establecida!");
};

$(document).ready(function () {
  var ticketsByCategory = {};

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
        customize: function (xlsx) {
          // Aquí puedes acceder a las celdas y personalizar su contenido
          // Por ejemplo, si necesitas ajustar los nombres de los técnicos o los tipos de estudio
        },
      },
    ],
    language: {
      url: "//cdn.datatables.net/plug-ins/1.10.22/i18n/Spanish.json",
      buttons: {
        copyTitle: "Copiado al portapapeles",
        copySuccess: "Se copiaron %d filas al portapapeles",
      },
    },

    createdRow: function (row, data) {
      // Cambia el índice 9 al índice de la columna que contiene el técnico
      var technicianCell = $(row).find("td").eq(8);
      var technicianOption = $(technicianCell).find("option").eq(0);
      var technician = $(technicianOption).text();

      // Encuentra los botones que quieres manipular
      var btnMoreInfo = $(row).find(".btn-more-info");
      var btnVStudies = $(row).find(".btn-vstudies");
      var btnCinfint = $(row).find(".btn-cinfint");

      // btn-more-info siempre visible
      btnMoreInfo.css("opacity", "1");

      if (technician && technician.trim() !== "Técnico") {
        $(row).addClass("row-with-technician");

        // Añadir la clase para hacer los otros botones visibles
        btnVStudies.addClass("btn-technician-visible");
        btnCinfint.addClass("btn-technician-visible");
      } else {
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
        targets: [6], // La septima columna (índice 6) "ocultar columna de tiempo promedio"
        visible: false,
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
    var categoryID = $("#selected-category-id").val(); // Obtener el ID de la categoría seleccionada

    if (categoryID === "undefined" || categoryID === undefined) {
      $("#print-ticket-btn").hide();
      $(".vertical-line").hide();
      a.column(11).visible(false); // Ocultar la columna "Llamar" (índice base 0)
    } else {
      $("#print-ticket-btn").show();
      $(".vertical-line").show();
      a.column(11).visible(true); // Mostrar la columna "Llamar" (índice base 0)
    }
  }

  $(".filter-btn").click(function () {
    // Actualizar la categoría seleccionada
    $(".filter-btn").removeClass("selected");
    $(this).addClass("selected");

    var categoryID = $(this).data("id"); // Capturar el ID de la categoría
    console.log("ID de categoría seleccionada:", categoryID); // Registro en consola
    $("#selected-category-id").val(categoryID); // Almacenar el ID en un campo oculto

    handleVisibility(); // Llamar a la función para manejar la visibilidad del botón

    // Llama a updateTotalStudies después de que se haya actualizado la categoría seleccionada
    updateTotalStudies();
  });

  $("#print-ticket-btn").click(function () {
    id = $("#selected-category-id").val(); // Obtener el ID de la categoría seleccionada
    console.log("ID de categoría que se enviará en la solicitud:", id); // Registro en consola
    $("#admissionModal").modal("show");
  });

  // Validar el número de admisión
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

  $("#print-ticket-button").click(function () {
    var admissionNumber = $("#admission-number").val();
    var selectedCategoryId = $("#selected-category-id").val();

    console.log("Número de admisión:", admissionNumber);
    console.log("ID de categoría seleccionada:", selectedCategoryId);

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
        console.log("Respuesta de verificar_admision:", response);
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
  console.log("selectedDateGlobal after update:", selectedDateGlobal);

  var datepickerElement = $("#datepicker").datepicker(
      $.extend(
        {
          dateFormat: "DD, dd/mm/yy",
          onSelect: function () {
            var t = datepickerElement.datepicker("getDate"); // Get the selected date
            selectedDateGlobal = t; // Actualiza la variable global
            var r = $.datepicker.formatDate("yy-mm-dd", t);
            console.log("Fecha seleccionada en datepicker: ", t);
            console.log("Fecha formateada en datepicker: ", r);
            datepickerElement.val($.datepicker.formatDate("DD, dd/mm/yy", t)),
              // ...
              $.ajax({
                url: "Tabla/obtener_datos_por_fecha",
                type: "GET",
                data: { date: r },
                success: function (e) {
                  var t = JSON.parse(e);
                  if ((a.clear(), t.length > 0))
                    for (var r = 0; r < t.length; r++) {
                      var tiposHtml = "";
                      var btnMoreInfoClass = t[r].detalle ? "has-details" : "";
                      var mostrarLlamar = t[r].mostrar_llamar === "1";
                      var tipos = t[r].tipo ? t[r].tipo.split(",") : [];
                      var url = tuBaseURL + "operador/toggle_random/" + t[r].id;
                      for (var i = 0; i < tipos.length; i++) {
                        var tipo = tipos[i].trim(); // Eliminar espacios en blanco
                        if (tipo) {
                          tiposHtml += '<span class="tag">' + tipo + "</span>";
                        }
                      }
                      var admision = t[r].admision ? t[r].admision : "";
                      var paciente = t[r].paciente ? t[r].paciente : "";
                      paciente = capitalizeName(paciente);
                      var tecnicoSelect = '<select class="tecnico-select"';
                      if (t[r].atendida != "1" || t[r].tecnico) {
                        tecnicoSelect += " disabled";
                      }
                      tecnicoSelect +=
                        '><option value="">' +
                        (t[r].tecnico ? t[r].tecnico : "Técnico") +
                        "</option>" +
                        '<option value="N/A">N/A</option>' +
                        '<option value="YL">YL</option>' +
                        '<option value="MC">MC</option>' +
                        '<option value="RS">RS</option>' +
                        '<option value="YP">YP</option>' +
                        '<option value="AL">AL</option>' +
                        '<option value="BA">BA</option>' +
                        '<option value="AR">AR</option>' +
                        '<option value="SR">SR</option>' +
                        '<option value="MH">MH</option>' +
                        "</select>";

                      a.row
                        .add([
                          t[r].especialidad,
                          '<span style="font-weight: bold; color: #12375b; font-size: 25px;">' +
                            t[r].ticket +
                            "</span>",
                          paciente,
                          tiposHtml, // use the variable
                          t[r].hora_de_impresion
                            ? moment(
                                t[r].hora_de_impresion,
                                "YYYY-MM-DD HH:mm:ss"
                              ).format("hh:mm:ss A")
                            : "",
                          t[r].hora_de_llamado
                            ? moment(
                                t[r].hora_de_llamado,
                                "YYYY-MM-DD HH:mm:ss"
                              ).format("hh:mm:ss A")
                            : "",
                          t[r].tiempo_para_atencion &&
                          "00:00:00" !== t[r].tiempo_para_atencion
                            ? moment
                                .utc(t[r].tiempo_para_atencion, "HH:mm:ss")
                                .format("HH:mm:ss")
                            : "",
                          admision,
                          t[r].ps,
                          tecnicoSelect, // Utiliza la variable
                          '<button class="btn btn-more-info ' +
                            btnMoreInfoClass +
                            '"><i class="fas fa-plus"></i></button>',
                          mostrarLlamar
                            ? '<button class="btn btn-call" data-ticket="' +
                              t[r].ticket +
                              '" data-url="' +
                              url +
                              '">Llamar</button>'
                            : "",
                        ])
                        .draw(false)
                        .nodes()
                        .to$()
                        .attr("data-id", t[r].id);
                    }
                  a.draw();
                },
              });

            // Actualiza el contenido del label con la fecha seleccionada
            var formattedDate = $.datepicker.formatDate("DD, dd/mm/yy", t); // Use 't' instead of 'selectedDate'
            $("#selected-date-label").text(formattedDate);
          },
        },
        $.datepicker.regional.es
      )
    ),
    t = new Date();
  datepickerElement.datepicker("setDate", selectedDateGlobal);

  $("#refresh-btn").on("click", function () {
    var formattedDate = $.datepicker.formatDate("yy-mm-dd", selectedDateGlobal);
    console.log("Fecha seleccionada: ", selectedDateGlobal);
    console.log("Fecha formateada: ", formattedDate);
    fetchAndDisplayNotifications();
    setTimeout(function () {
      console.log("Fecha formateada justo antes de AJAX: ", formattedDate);

      $.ajax({
        url: "Tabla/obtener_datos_por_fecha",
        type: "GET",
        data: { date: formattedDate },
        success: function (e) {
          var t = JSON.parse(e);
          if ((a.clear(), t.length > 0))
            for (var r = 0; r < t.length; r++) {
              var tiposHtml = "";
              var btnMoreInfoClass = t[r].detalle ? "has-details" : "";
              var mostrarLlamar = t[r].mostrar_llamar === "1";
              var tipos = t[r].tipo ? t[r].tipo.split(",") : [];
              var url = tuBaseURL + "operador/toggle_random/" + t[r].id;
              for (var i = 0; i < tipos.length; i++) {
                var tipo = tipos[i].trim(); // Eliminar espacios en blanco
                if (tipo) {
                  tiposHtml += '<span class="tag">' + tipo + "</span>";
                }
              }
              var paciente = t[r].paciente ? capitalizeName(t[r].paciente) : "";
              var tecnicoSelect = '<select class="tecnico-select"';
              if (t[r].atendida != "1" || t[r].tecnico) {
                tecnicoSelect += " disabled";
              }
              tecnicoSelect +=
                '><option value="">' +
                (t[r].tecnico ? t[r].tecnico : "Técnico") +
                "</option>" +
                '<option value="N/A">N/A</option>' +
                '<option value="YL">YL</option>' +
                '<option value="MC">MC</option>' +
                '<option value="RS">RS</option>' +
                '<option value="YP">YP</option>' +
                '<option value="AL">AL</option>' +
                '<option value="BA">BA</option>' +
                '<option value="AR">AR</option>' +
                '<option value="SR">SR</option>' +
                '<option value="MH">MH</option>' +
                "</select>";
              a.row
                .add([
                  t[r].especialidad,
                  '<span style="font-weight: bold; color: #12375b; font-size: 25px;">' +
                    t[r].ticket +
                    "</span>",
                  paciente,
                  tiposHtml,
                  t[r].hora_de_impresion
                    ? moment(
                        t[r].hora_de_impresion,
                        "YYYY-MM-DD HH:mm:ss"
                      ).format("hh:mm:ss A")
                    : "",
                  t[r].hora_de_llamado
                    ? moment(
                        t[r].hora_de_llamado,
                        "YYYY-MM-DD HH:mm:ss"
                      ).format("hh:mm:ss A")
                    : "",
                  t[r].tiempo_para_atencion &&
                  "00:00:00" !== t[r].tiempo_para_atencion
                    ? moment
                        .utc(t[r].tiempo_para_atencion, "HH:mm:ss")
                        .format("HH:mm:ss")
                    : "",
                  t[r].admision,
                  t[r].ps,
                  tecnicoSelect, // Use the variable
                  '<button class="btn btn-more-info ' +
                    btnMoreInfoClass +
                    '"><i class="fas fa-plus"></i></button>',
                  mostrarLlamar
                    ? '<button class="btn btn-call" data-ticket="' +
                      t[r].ticket +
                      '" data-url="' +
                      url +
                      '">Llamar</button>'
                    : "",
                ])
                .draw(false)
                .nodes()
                .to$()
                .attr("data-id", t[r].id);
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

  // Botones de flechas

  function updateTableAndDateLabel(date) {
    var r = $.datepicker.formatDate("yy-mm-dd", date);
    // Aquí va todo el código AJAX y la actualización de la tabla que estaba en el onSelect original
    $.ajax({
      url: "Tabla/obtener_datos_por_fecha",
      type: "GET",
      data: { date: r },
      success: function (e) {
        var t = JSON.parse(e);
        if ((a.clear(), t.length > 0))
          for (var r = 0; r < t.length; r++) {
            var tiposHtml = "";
            var btnMoreInfoClass = t[r].detalle ? "has-details" : "";
            var mostrarLlamar = t[r].mostrar_llamar === "1";
            var tipos = t[r].tipo ? t[r].tipo.split(",") : [];
            var url = tuBaseURL + "operador/toggle_random/" + t[r].id;
            for (var i = 0; i < tipos.length; i++) {
              var tipo = tipos[i].trim(); // Eliminar espacios en blanco
              if (tipo) {
                tiposHtml += '<span class="tag">' + tipo + "</span>";
              }
            }
            var paciente = t[r].paciente ? capitalizeName(t[r].paciente) : "";
            var tecnicoSelect = '<select class="tecnico-select"';
            if (t[r].atendida != "1" || t[r].tecnico) {
              tecnicoSelect += " disabled";
            }
            tecnicoSelect +=
              '><option value="">' +
              (t[r].tecnico ? t[r].tecnico : "Técnico") +
              "</option>" +
              '<option value="N/A">N/A</option>' +
              '<option value="YL">YL</option>' +
              '<option value="MC">MC</option>' +
              '<option value="RS">RS</option>' +
              '<option value="YP">YP</option>' +
              '<option value="AL">AL</option>' +
              '<option value="BA">BA</option>' +
              '<option value="AR">AR</option>' +
              '<option value="SR">SR</option>' +
              '<option value="MH">MH</option>' +
              "</select>";
            a.row
              .add([
                t[r].especialidad,
                '<span style="font-weight: bold; color: #12375b; font-size: 25px;">' +
                  t[r].ticket +
                  "</span>",
                paciente,
                tiposHtml,
                t[r].hora_de_impresion
                  ? moment(
                      t[r].hora_de_impresion,
                      "YYYY-MM-DD HH:mm:ss"
                    ).format("hh:mm:ss A")
                  : "",
                t[r].hora_de_llamado
                  ? moment(t[r].hora_de_llamado, "YYYY-MM-DD HH:mm:ss").format(
                      "hh:mm:ss A"
                    )
                  : "",
                t[r].tiempo_para_atencion &&
                "00:00:00" !== t[r].tiempo_para_atencion
                  ? moment
                      .utc(t[r].tiempo_para_atencion, "HH:mm:ss")
                      .format("HH:mm:ss")
                  : "",
                t[r].admision,
                t[r].ps,
                tecnicoSelect, // Use the variable
                '<button class="btn btn-more-info ' +
                  btnMoreInfoClass +
                  '"><i class="fas fa-plus"></i></button>',
                mostrarLlamar
                  ? '<button class="btn btn-call" data-ticket="' +
                    t[r].ticket +
                    '" data-url="' +
                    url +
                    '">Llamar</button>'
                  : "",
              ])
              .draw(false)
              .nodes()
              .to$()
              .attr("data-id", t[r].id);
          }
        a.draw();
        checkIfTodayIsSelected(date);
      },
    });

    var formattedDate = $.datepicker.formatDate("DD, dd/mm/yy", date);
    $("#selected-date-label").text(formattedDate);
  }

  var datepickerElement = $("#datepicker").datepicker(
    $.extend(
      {
        dateFormat: "DD, dd/mm/yy",
        onSelect: function () {
          var t = datepickerElement.datepicker("getDate");
          selectedDateGlobal = t;
          updateTableAndDateLabel(t);
          checkIfTodayIsSelected(t);
        },
      },
      $.datepicker.regional.es
    )
  );

  $("#prev-date").click(function () {
    selectedDateGlobal.setDate(selectedDateGlobal.getDate() - 1);
    updateTableAndDateLabel(selectedDateGlobal);
    checkIfTodayIsSelected(t);
  });

  $("#next-date").click(function () {
    selectedDateGlobal.setDate(selectedDateGlobal.getDate() + 1);
    updateTableAndDateLabel(selectedDateGlobal);
    checkIfTodayIsSelected(t);
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

  var currentDate = new Date(); // Establecer la fecha actual en el datepicker y actualizar el label
  datepickerElement.datepicker("setDate", currentDate);
  selectedDateGlobal = currentDate; // Actualiza la variable global con la fecha actual
  var formattedDate = $.datepicker.formatDate("DD, dd/mm/yy", currentDate);
  $("#selected-date-label").text(formattedDate);

  $("#datepicker-btn").on("click", function () {
    datepickerElement.datepicker("widget").is(":visible")
      ? datepickerElement.datepicker("hide")
      : datepickerElement.datepicker("show");
  });

  // Modal de paciente

  $(document).on("click", ".btn-more-info", function () {
    var row = $(this).closest("tr");
    var patientId = row.data("id");
    $("#patientDetailsModal").data("patient-id", patientId);

    $.ajax({
      url: "Tabla/obtener_detalle_paciente",
      type: "GET",
      data: { id: patientId },
      success: function (data) {
        var patientDetails = JSON.parse(data);

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

        $("#patientDetailsModal .modal-body").html(
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
            "</td><td style='text-align: right;'>" +
            "<button id='anularTicketBtn' class='btn btn-danger' style='margin-right: 230px;' data-id='" +
            patientDetails.id +
            "'>Anular Ticket</button>" +
            "</td></tr>" +
            "<tr><td colspan='2'>" +
            "<p style='text-align: center; margin-top: 50px;'><b>Detalle:</b></p>" +
            "<textarea id='detalle' class='form-control' rows='4' placeholder='Escribe aquí el detalle...' style='width: 100%; margin: 0 auto 10px; padding: 5px;'>" +
            (patientDetails.detalle ? patientDetails.detalle : "") +
            "</textarea>" +
            "</td></tr>" +
            "</table>"
        );

        $("#patientDetailsModal").modal("show");
      },
    });
  });

  $("#patientDetailsModal").modal({
    backdrop: "static",
    keyboard: false,
  });

  $("#admissionModal").modal({
    backdrop: "static",
    keyboard: false,
  });

  $(document).on("click", "#anularTicketBtn", function () {
    var patientId = $(this).data("id");
    var confirmation = confirm(
      "¿Estás seguro de que deseas anular este ticket?"
    );

    if (confirmation) {
      // Aquí puedes realizar la lógica para anular el ticket
      console.log("Anulando ticket para el paciente con ID:", patientId);

      // Ejemplo de llamada AJAX para anular el ticket
      $.ajax({
        url: "Tabla/anular_ticket",
        type: "POST",
        data: { id: patientId },
        success: function (response) {
          console.log("Respuesta del servidor:", response);
          // Realizar acciones adicionales después de anular el ticket
          $("#patientDetailsModal").modal("hide");
          $("#refresh-btn").click();
        },
        error: function (error) {
          console.error("Error al anular el ticket:", error);
        },
      });
    }
  });

  $("#save-btn").on("click", function () {
    console.log("Botón de guardar clickeado"); // Log al hacer clic en el botón de guardar

    var detalle = $("#detalle").val(); // Obtén el valor del textarea
    var patientId = $("#patientDetailsModal").data("patient-id"); // Obtén el ID del paciente desde el modal

    $.ajax({
      url: "Tabla/actualizar_detalle_paciente",
      type: "POST",
      data: { id: patientId, detalle: detalle },
      success: function (data) {
        console.log("Respuesta del servidor recibida:", data); // Log de la respuesta del servidor
        $("#patientDetailsModal").modal("hide");
        $("#refresh-btn").click();
        // Si la actualización fue exitosa, envía un mensaje a través del WebSocket
        console.log("Enviando mensaje de edición a través del WebSocket"); // Log antes de enviar el mensaje
        conn.send("Dato editado");
        console.log("Mensaje de edición enviado"); // Log después de enviar el mensaje
      },
      error: function (error) {
        console.error("Error en la solicitud de actualización:", error); // Log en caso de error en la solicitud AJAX
      },
    });
  });

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

    // Agrega registros de depuración
    console.log("Botón clickado");

    var categorias = {
      42: "Rayos X",
      48: "Tomografía ",
      49: "Resonancia",
      50: "Ecografía 1",
      51: "Ecografía 2",
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
      console.log("Modal cerrado");
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
      console.log("Actualización de datos requerida");

      // Llamar al botón de refresh
      $("#refresh-btn").click();
    }
    if (parts[0] === "Actualizar pantalla") {
      console.log("Programando actualización de pantalla");
      var ticket = parts[1]; // Número de ticket
      var categoryName = parts[2]; // Nombre de la categoría

      // Actualizar los valores en el modal
      $("#ticketNumber").text(ticket);
      $("#categoryName").text(categoryName);

      // Mostrar el modal y bloquear el cliente por 10 segundos
      $("#myModal").modal("show"); // Corrección aquí
      console.log("Modal abierto");

      // Ocultar el modal después de 10 segundos
      setTimeout(function () {
        $("#myModal").modal("hide");
        $("#overlay").hide();
        console.log("Modal cerrado");
        $("#refresh-btn").click(); // Recargar los datos después de cerrar el modal
      }, 10000); // 10000 milisegundos son 10 segundos
    }
  };

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

  //????
  var o = new Date();
  function i(e) {
    var t = $.datepicker.formatDate("yy-mm-dd", e);
    $.ajax({
      url: "Tabla/obtener_datos_por_fecha",
      type: "GET",
      data: { date: t },
      success: function (e) {
        var t = JSON.parse(e);
        if ((a.clear(), t.length > 0))
          for (var r = 0; r < t.length; r++) {
            var tiposHtml = "";
            var btnMoreInfoClass = t[r].detalle ? "has-details" : "";
            var tipos = t[r].tipo ? t[r].tipo.split(",") : [];
            var mostrarLlamar = t[r].mostrar_llamar === "1";
            var url = tuBaseURL + "operador/toggle_random/" + t[r].id;
            for (var i = 0; i < tipos.length; i++) {
              var tipo = tipos[i].trim(); // Eliminar espacios en blanco
              if (tipo) {
                tiposHtml += '<span class="tag">' + tipo + "</span>";
              }
            }
            var admision = t[r].admision ? t[r].admision : ""; // if admision is null, use an empty string
            var paciente = t[r].paciente ? t[r].paciente : ""; // if paciente is null, use an empty string
            var paciente = t[r].paciente ? capitalizeName(t[r].paciente) : ""; // Aplica la función al paciente

            a.row
              .add([
                t[r].especialidad,
                '<span style="font-weight: bold; color: #12375b; font-size: 25px;">' +
                  t[r].ticket +
                  "</span>",
                paciente,
                tiposHtml,
                t[r].hora_de_impresion
                  ? moment(
                      t[r].hora_de_impresion,
                      "YYYY-MM-DD HH:mm:ss"
                    ).format("hh:mm:ss A")
                  : "",
                t[r].hora_de_llamado
                  ? moment(t[r].hora_de_llamado, "YYYY-MM-DD HH:mm:ss").format(
                      "hh:mm:ss A"
                    )
                  : "",
                t[r].tiempo_para_atencion &&
                "00:00:00" !== t[r].tiempo_para_atencion
                  ? moment
                      .utc(t[r].tiempo_para_atencion, "HH:mm:ss")
                      .format("HH:mm:ss")
                  : "",
                admision,
                t[r].ps,
                tecnicoSelect,
                '<button class="btn btn-more-info ' +
                  btnMoreInfoClass +
                  '"><i class="fas fa-plus"></i></button>',
                mostrarLlamar
                  ? '<button class="btn btn-call" data-ticket="' +
                    t[r].ticket +
                    '" data-url="' +
                    url +
                    '">Llamar</button>'
                  : "",
              ])
              .draw(false)
              .nodes()
              .to$()
              .attr("data-id", t[r].id);
          }
        a.draw();
      },
    });
  }
});
