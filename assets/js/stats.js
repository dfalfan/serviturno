$(document).ready(function () {

  var categorySelect;
  var timeRangeSelect;
  var graphSelect;
  var selectedGraphType = "averageAttentionTime";

  // Carga las categorías cuando la página se carga
  $.ajax({
    url: "Stats/obtenerCategorias",
    type: "GET",
    success: function (data) {
      var categorias = JSON.parse(data);
      for (var i = 0; i < categorias.length; i++) {
        $("#category").append(
          '<option value="' +
            categorias[i].id +
            '">' +
            categorias[i].categoria +
            "</option>"
        );
      }

    categorySelect = new Choices("#category", {
      removeItemButton: true,
      searchEnabled: false,
      shouldSort: false, 
    });

    timeRangeSelect = new Choices("#timeRange", {
      removeItemButton: true,
      searchEnabled: false,
      shouldSort: false, 
    });

    graphSelect = new Choices("#graph", {
      removeItemButton: true,
      searchEnabled: false,
      shouldSort: false, 
    });

      categorySelect.setChoiceByValue("Seleccione");
      timeRangeSelect.setChoiceByValue("Seleccione");
      graphSelect.setChoiceByValue("Seleccione");

      var selectedGraphType = "averageAttentionTime";
    },
  });



$("#graph").change(function () {
  var graphType = graphSelect.getValue(true);
  var category = categorySelect.getValue(true);
  var timeRange = timeRangeSelect.getValue(true);

  // Actualiza la variable selectedGraphType
  selectedGraphType = graphType;

  // Habilitar o deshabilitar los select de categoría y rango de tiempo
  if (
    graphType === "waitingTimeByCategory" ||
    graphType === "patientDistribution"
  ) {
    categorySelect.disable();
    timeRangeSelect.enable();
  } else {
    categorySelect.enable();
    timeRangeSelect.enable();
  }

  // Borra cualquier gráfico existente
  $(".card-body").html('<canvas id="dynamicChart"></canvas>');
  

  switch (graphType) {
    case "averageAttentionTime":
      createAverageAttentionTimeChart(category, timeRange);
      break;
    case "patientCount":
      createPatientCountChart(category, timeRange);
      break;
    case "uniquePatientCount":
      createUniquePatientCountChart(category, timeRange);
      break;
    case "patientDistribution":
      createPatientDistributionChart(timeRange);
      break;
    case "waitingTimeByCategory":
      createWaitingTimeByCategoryChart(timeRange);
      break;
  }
}); 


  // Actualiza el gráfico cuando cambian los controles
  $("#category, #timeRange").change(function () {
    var category = categorySelect.getValue(true);
    var timeRange = timeRangeSelect.getValue(true);

    // Borra cualquier gráfico existente
    $(".card-body").html('<canvas id="dynamicChart"></canvas>');

    // Decide qué gráfico crear basado en la variable selectedGraphType
    if (selectedGraphType === "averageAttentionTime") {
      createAverageAttentionTimeChart(category, timeRange);
    } else if (selectedGraphType === "patientCount") {
      createPatientCountChart(category, timeRange);
       } else if (selectedGraphType === "uniquePatientCount") {
         createUniquePatientCountChart(category, timeRange);
       } else if (selectedGraphType === "patientDistribution") {
         createPatientDistributionChart(timeRange);
       } else if (selectedGraphType === "waitingTimeByCategory") {
         createWaitingTimeByCategoryChart(timeRange);
       }
    
  });
});

function timeStringToSeconds(timeString) {
  var parts = timeString.split(":");
  return +parts[0] * 60 * 60 + +parts[1] * 60; // Ignorando los segundos fraccionales
}

function createAverageAttentionTimeChart(
  category = "all",
  timeRange = "yearly"
) {
  // Establece el rango de fechas de acuerdo al rango de tiempo seleccionado
  var endDate = moment().endOf("day");
  var startDate;
  var format;

  if (timeRange == "yearly") {
    startDate = moment().subtract(1, "years").startOf("month");
    format = "MMM-YYYY";
  } else if (timeRange == "monthly") {
    startDate = moment().subtract(1, "months").startOf("day");
    format = "DD-MMM"; // Cambiado para mostrar el día y el mes
  } else if (timeRange == "weekly") {
    startDate = moment().subtract(1, "weeks").startOf("day");
    format = "DD-MMM"; // Cambiado para mostrar el día y el mes
  }

  $.ajax({
    url: "Stats/obtenerPromedioTiempoAtencion",
    type: "GET",
    data: {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      categoria: category,
      timeRange: timeRange, // Añadido este parámetro
    },
    success: function (data) {
      var resultados = JSON.parse(data);

      var labels = resultados.map(function (resultado) {
        // Convierte la fecha a la cadena de texto con el formato correcto
        return moment(resultado.fecha).format(format);
      });

      var datos = resultados.map(function (resultado) {
        if (resultado.promedio_tiempo_atencion === null) {
          return 0;
        } else {
          return Math.round(
            timeStringToSeconds(resultado.promedio_tiempo_atencion) / 60
          ); // Convertir a minutos y redondear
        }
      });

      var ctx = document.getElementById("dynamicChart");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Tiempo promedio de atención (minutos)", // Actualizado para reflejar que los datos están en minutos
              data: datos,
              fill: true,
              borderColor: "rgb(6, 13, 54)",
              backgroundColor: "#0b4b83",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              ticks: {
                // Incluye un signo ' min' después del valor del tick
                callback: function (value, index, values) {
                  return value + " min";
                },
              },
            },
          },
        },
      });
    },
  });
}

function createPatientCountChart(category = "all", timeRange = "yearly") {
  // Establece el rango de fechas de acuerdo al rango de tiempo seleccionado
  var endDate = moment().endOf("day");
  var startDate;
  var format;

  if (timeRange == "yearly") {
    startDate = moment().subtract(1, "years").startOf("month");
    format = "MMM-YYYY";
  } else if (timeRange == "monthly") {
    startDate = moment().subtract(1, "months").startOf("day");
    format = "DD-MMM"; // Cambiado para mostrar el día y el mes
  } else if (timeRange == "weekly") {
    startDate = moment().subtract(1, "weeks").startOf("day");
    format = "DD-MMM"; // Cambiado para mostrar el día y el mes
  }

   console.log("Fecha de inicio:", startDate.format("YYYY-MM-DD"));
  console.log("Fecha de fin:", endDate.format("YYYY-MM-DD"));
  console.log("Categoría:", category);
  console.log("Rango de tiempo:", timeRange);

  $.ajax({
    url: "Stats/obtenerCantidadPacientes", // Actualizado a obtenerCantidadPacientes
    type: "GET",
    data: {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      categoria: category,
      timeRange: timeRange,
    },
    success: function (data) {
    console.log("Datos recibidos del backend:", data);

      var resultados = JSON.parse(data);

      var labels = resultados.map(function (resultado) {
        // Convierte la fecha a la cadena de texto con el formato correcto
        return moment(resultado.fecha).format(format);
      });

      var datos = resultados.map(function (resultado) {
        return resultado.cantidad_pacientes; // Actualizado para usar cantidad_pacientes
      });

      var ctx = document.getElementById("dynamicChart"); // Podrías considerar cambiar el id de este canvas a algo más genérico
      new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Cantidad de pacientes", // Actualizado para reflejar que los datos están en minutos
              data: datos,
              fill: false,
              borderColor: "#f47628",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: (ctx) =>
                "Point Style: " + ctx.chart.data.datasets[0].pointStyle,
            },
          },
        },
      });

    },
  });
}



function createUniquePatientCountChart(category = "all", timeRange = "yearly") {
  // Establece el rango de fechas de acuerdo al rango de tiempo seleccionado
  var endDate = moment().endOf("day");
  var startDate;
  var format;

  if (timeRange == "yearly") {
    startDate = moment().subtract(1, "years").startOf("month");
    format = "MMM-YYYY";
  } else if (timeRange == "monthly") {
    startDate = moment().subtract(1, "months").startOf("day");
    format = "DD-MMM"; // Cambiado para mostrar el día y el mes
  } else if (timeRange == "weekly") {
    startDate = moment().subtract(1, "weeks").startOf("day");
    format = "DD-MMM"; // Cambiado para mostrar el día y el mes
  }

  console.log("Fecha de inicio:", startDate.format("YYYY-MM-DD"));
  console.log("Fecha de fin:", endDate.format("YYYY-MM-DD"));
  console.log("Categoría:", category);
  console.log("Rango de tiempo:", timeRange);

  $.ajax({
    url: "Stats/obtenerCantidadPacientesUnicos", // Actualizado a obtenerCantidadPacientes
    type: "GET",
    data: {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      categoria: category,
      timeRange: timeRange,
    },
    success: function (data) {
      console.log("Datos recibidos del backend:", data);

      var resultados = JSON.parse(data);

      var labels = resultados.map(function (resultado) {
        // Convierte la fecha a la cadena de texto con el formato correcto
        return moment(resultado.fecha).format(format);
      });

      var datos = resultados.map(function (resultado) {
        return resultado.cantidad_pacientes_unicos; // Actualizado para usar cantidad_pacientes_unicos
      });

      var ctx = document.getElementById("dynamicChart"); // Podrías considerar cambiar el id de este canvas a algo más genérico
      new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Cantidad de pacientes",
              data: datos,
              fill: false,
              borderColor: "rgb(6, 13, 54)",
              tension: 0.1,
              pointStyle: "circle",
              pointBorderColor: "rgb(6, 13, 54)", // Color de borde del punto
              pointBackgroundColor: "#fff", // Color de fondo del punto
              pointBorderWidth: 2, // Ancho del borde del punto
              pointRadius: 10,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: (ctx) =>
                "Point Style: " + ctx.chart.data.datasets[0].pointStyle,
            },
          },
        },
      });
    },
  });
}



function createPatientDistributionChart(timeRange = "yearly") {
  var endDate = moment().endOf("day");
  var startDate;
  var format;

  if (timeRange == "yearly") {
    startDate = moment().subtract(1, "years").startOf("month");
  } else if (timeRange == "monthly") {
    startDate = moment().subtract(1, "months").startOf("day");
  } else if (timeRange == "weekly") {
    startDate = moment().subtract(1, "weeks").startOf("day");
  }

  $.ajax({
    url: "Stats/obtenerTotalPacientesPorCategoria",
    type: "GET",
    data: {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      timeRange: timeRange,
    },
    success: function (data) {
      var resultados = JSON.parse(data);

      var labels = resultados.map(function (resultado) {
        return resultado.categoria;
      });

      var datos = resultados.map(function (resultado) {
        return resultado.cantidad_pacientes;
      });

      var ctx = document.getElementById("dynamicChart");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Cantidad de pacientes",
              data: datos,
              fill: false,
              backgroundColor: "rgb(6, 13, 54)",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },
  });
}

function createWaitingTimeByCategoryChart(timeRange = "yearly") {
  var endDate = moment().endOf("day");
  var startDate = moment().subtract(1, "months").startOf("day");


  if (timeRange == "yearly") {
    startDate = moment().subtract(1, "years").startOf("month");
  } else if (timeRange == "monthly") {
    startDate = moment().subtract(1, "months").startOf("day");
  } else if (timeRange == "weekly") {
    startDate = moment().subtract(1, "weeks").startOf("day");
  }



  $.ajax({
    url: "Stats/obtenerTiempoEsperaPorCategoria",
    type: "GET",
    data: {
      fechaInicio: startDate.format("YYYY-MM-DD"),
      fechaFin: endDate.format("YYYY-MM-DD"),
      timeRange: timeRange,
    },
    success: function (data) {
      var resultados = JSON.parse(data);

      var labels = resultados.map(function (resultado) {
        return resultado.categoria;
      });

      var datos = resultados.map(function (resultado) {
        return Math.round(
          timeStringToSeconds(resultado.promedio_tiempo_espera) / 60
        );
      });

      var ctx = document.getElementById("dynamicChart");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Tiempo promedio de espera (minutos)",
              data: datos,
              fill: false,
              backgroundColor: "rgb(6, 13, 54)",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },
  });
}

