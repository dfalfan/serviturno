<!DOCTYPE html>
<html>

<head>
    <title>Estadísticas | Imagenología</title>
    <link rel=icon href="<?= base_url() ?>/favicon.ico" type=image/gif>

    <!-- Incluye Bootstrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/choices.js/10.2.0/choices.min.css" integrity="sha512-oW+fEHZatXKwZQ5Lx5td2J93WJnSFLbnALFOFqy/pTuQyffi9gsUylGGZkD3DTSv8zkoOdU7MT7I6LTDcV8GBQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Incluye la biblioteca Chart.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/choices.js/10.2.0/choices.min.js" integrity="sha512-OrRY3yVhfDckdPBIjU2/VXGGDjq3GPcnILWTT39iYiuV6O3cEcAxkgCBVR49viQ99vBFeu+a6/AoFAkNHgFteg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <!-- Estilos personalizados para limitar el tamaño de los gráficos -->
    <style>
        #averageAttentionTimeChart {}

        .navbar {
            display: flex;
            justify-content: space-between;
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 100;
            height: 74px;
            background: white;
            left: 0;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
        }

        body {
            background-color: #f5f5f5;
            font-size: 1.6rem;
            font-family: 'Roboto', sans-serif;

        }

        body.dark-mode {
            background-color: #121212;
            color: #ffffff;
        }


        .container {
            max-width: 1600px;
        }

        .row {
            margin-top: 100px;
        }

        .card {
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }


        .card-body {
            padding: 1.5rem;
        }

        .big-select {
            font-size: 2rem;
            /* Aumenta el tamaño de la fuente */
            height: 20px;
            /* Aumenta la altura */
            width: 50%;
            /* Asegura que el select box ocupa todo el ancho disponible */
        }

        .category-select {
            font-size: 2rem;
            /* Aumenta el tamaño de la fuente */
            height: 20px;
            /* Aumenta la altura */
            width: 60%;
            /* Asegura que el select box ocupa todo el ancho disponible */
        }

        .select2-container .select2-selection--single {
            height: 70px;
            /* Asegura que el contenedor del select box tiene la misma altura */
        }

        .select2-container--default .select2-selection--single .select2-selection__rendered {
            line-height: 70px;
            /* Alinea verticalmente el texto en el centro */
        }

        .select2-container--default .select2-selection--single .select2-selection__arrow {
            height: 70px;
            /* Asegura que la flecha desplegable tiene la misma altura */
        }

        .button-primary {
            background-color: #6200ea;
            color: #ffffff;
        }

        .button-primary {
            transition: background-color 0.3s ease;
        }

        .button-primary:hover {
            background-color: #3700b3;
        }
    </style>
</head>

<body>
    <nav class="navbar">
        <div>
            <embed style="width: 200px; height: 38px; margin-top: 2px;margin-left: -6px;" class="navbar-logo" src="<?php echo base_url() . 'assets/images/logo_new.png' ?>">
        </div>
    </nav>

    <h1 class="text-center mb-4">Estadísticas</h1>

    <div class="container">
        <div class="row">
            <div class="col-md-5">
                <!-- Select boxes -->

                <div class="mb-3">
                    <label for="graph" class="form-label">Tipo:</label>
                    <select id="graph" class="form-select category-select">
                        <option selected disabled>Seleccione</option>
                        <option value="averageAttentionTime">Tiempo promedio de atención</option>
                        <option value="patientCount">Cantidad de tickets</option>
                        <option value="uniquePatientCount">Cantidad de pacientes unicos</option>
                        <option value="patientDistribution">Pacientes Por Especialidad</option>
                        <option value="waitingTimeByCategory">Tiempo de Espera por Categoría</option>

                    </select>
                </div>

                <div class="mb-3">
                    <label for="category" class="form-label">Categoría:</label>
                    <select id="category" class="form-select big-select">
                        <option selected disabled>Seleccione</option>
                        <option value="all">Todas</option>
                    </select>
                </div>

                <div class="mb-3">
                    <label for="timeRange" class="form-label">Rango de tiempo:</label>
                    <select id="timeRange" class="form-select big-select">
                        <option selected disabled>Seleccione</option>
                        <option value="yearly">Último Año</option>
                        <option value="monthly">Último Mes</option>
                        <option value="weekly">Última Semana</option>
                        <option value="year">Principios de Año</option>
                        <option value="month">Principios de Mes</option>
                        <option value="custom">Personalizado</option>
                    </select>
                </div>
            </div>

            <div class="col-md-7">
                <!-- Gráfico -->
                <div class="card">
                    <div class="card-body">
                        <canvas id="dynamicChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="assets/js/stats.js"></script>

</body>

</html>