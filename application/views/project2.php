<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Paciente</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="assets/css/project2.css">
    <script src="assets/js/project2.js"></script>

</head>

<body>
    <div class="page-section" id="page-section">

        <header>
            <h1>Bienvenido</h1>
            <p>Paciente: </p>
            <p>Cédula: </p>
        </header>

        <div class="main-content">
            <div class="form-section">
                <form id="study-form">
                    <label for="study-date">Fecha del estudio:</label>
                    <select id="study-date">
                        <option value="">--Seleccione una fecha--</option>
                    </select>

                    <div id="study-type-div" style="display: none;">
                        <label for="study-type">Estudio:</label>
                        <select id="study-type">
                            <option value="">--Seleccione un estudio--</option>
                        </select>


                    </div>
                    <div id="search-button-div" style="display: none;">
                        <button type="button" id="search-button">Buscar</button>
                    </div>
                </form>
            </div>
            <div class="result-section" id="study-details" style="display: none;">
                <h2>Detalles del Estudio</h2>
                <p><strong>Especialidad:</strong> </p>
                <p><strong>Tipo de estudio:</strong> </p>
                <p><strong>Seguro:</strong> </p>
                <p><strong>Empresa:</strong> </p>
                <p><strong>Hora de Impresión:</strong> </p>
                <p><strong>Hora de Llamado:</strong> </p>
                <p><strong>Tiempo para Atención:</strong> </p>
                <p><strong>Admisión:</strong> </p>
            </div>
        </div>
        <div class="button-section" id="button-section" style="display: none;">
            <button type="button" id="download-report">Descargar informe</button>
            <button type="button" id="view-study">Ver estudio</button>
        </div>


    </div>


    <div class="iframe-section" id="iframe-section" style="display: none;">
        <iframe id="stone-web-viewer-demo" class="container-fluid"></iframe>
    </div>

</body>

</html>