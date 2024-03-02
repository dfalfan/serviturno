document.addEventListener("DOMContentLoaded", function () {
  const studyDate = document.getElementById("study-date");
  const studyTypeDiv = document.getElementById("study-type-div");
  const studyType = document.getElementById("study-type");
  const searchButtonDiv = document.getElementById("search-button-div");
  const searchButton = document.getElementById("search-button");
  const studyDetails = document.getElementById("study-details");
  const buttonSection = document.getElementById("button-section");
  const iframeSection = document.getElementById("iframe-section");
  const patientID = localStorage.getItem("patientID");
  console.log("El valor de patientID es:", patientID);



    $(document).ready(function () {
        var cedula = "V" + patientID;
        console.log("El valor de cedula es:", cedula);


        $.ajax({
          url: "Project2/obtener_detalle_paciente_por_cedula",
          type: "GET",
          data: { cedula: cedula },
          success: function (data) {
            var patientDetails = JSON.parse(data);
            if (patientDetails) {
              $('p:contains("Paciente:")').text(
                "Paciente: " + patientDetails.paciente
              );
              $('p:contains("Cédula:")').text(
                "Cédula: " + patientDetails.cedula
              );
            } else {
              console.log("No se encontró información del paciente");
            }
          },
        });
    });

  function formatDate(d) {
    const parts = /^(\d{4})(\d{2})(\d{2})$/.exec(d);
    return `${parts[3]}/${parts[2]}/${parts[1]}`;
  }

  let currentStudyInstanceUID = null;

  fetch("http://192.168.5.29/tools/find", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Level: "Study",
      Query: {
        PatientID: patientID,
      },
    }),
  })
    .then((response) => response.json())
    .then((studies) => {
      const studyDateSelect = document.getElementById("study-date");
      studies.forEach((study) => {
        fetch(`http://192.168.5.29/studies/${study}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((studyData) => {
            if (
              studyData &&
              studyData.MainDicomTags &&
              studyData.MainDicomTags.StudyDate
            ) {
              const studyDate = formatDate(studyData.MainDicomTags.StudyDate);
              const option = document.createElement("option");
              option.value = studyData.MainDicomTags.StudyInstanceUID; // Set the value to StudyInstanceUID
              option.textContent = studyDate;
              studyDateSelect.appendChild(option);

              if (studyData.Series) {
                const seriesPromises = studyData.Series.map((seriesId) => {
                  return fetch(`http://192.168.5.29/series/${seriesId}`, {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }).then((response) => response.json());
                });

                Promise.all(seriesPromises).then((seriesDataArray) => {
                  const studyTypeSelect = document.getElementById("study-type");
                  seriesDataArray.forEach((seriesData) => {
                    const studyName =
                      seriesData.MainDicomTags
                        .AcquisitionDeviceProcessingDescription;
                    const option = document.createElement("option");
                    option.value = studyName; // Set the value to Series Description
                    option.textContent = studyName;
                    studyTypeSelect.appendChild(option);
                  });
                });
              }
            }
          })
          .catch((error) => console.error("Error:", error));
      });
    })
    .catch((error) => console.error("Error:", error));

  studyDate.addEventListener("change", function () {
    if (studyDate.value) {
      currentStudyInstanceUID = studyDate.value; // Store StudyInstanceUID
      studyTypeDiv.style.display = "block";
    } else {
      studyTypeDiv.style.display = "none";
    }
  });

  studyType.addEventListener("change", function () {
    if (studyType.value) {
      searchButtonDiv.style.display = "block";
    } else {
      searchButtonDiv.style.display = "none";
    }
  });

  searchButton.addEventListener("click", function () {
    studyDetails.style.display = "block";
    studyDetails.style.maxHeight = studyDetails.scrollHeight + "px";

    buttonSection.innerHTML = `
                <button type="button" id="download-report">Descargar informe</button>
                <button type="button" id="view-study">Ver estudio</button>
                `;
    buttonSection.style.display = "block";

    const iframeSection = document.getElementById("iframe-section");
    const viewStudyButton = document.getElementById("view-study");
    viewStudyButton.addEventListener("click", function () {
      const stoneUrl = `http://192.168.5.29/stone-webviewer/index.html?study=${currentStudyInstanceUID}`;
      iframeSection.innerHTML = `
                     <iframe id="stone-web-viewer-demo" class="container-fluid" src="${stoneUrl}">
                    </iframe>
                    `;
      iframeSection.style.display = "block";
      iframeSection.scrollIntoView({
        behavior: "smooth",
      });
    });
  });


});
