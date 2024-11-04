<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serviturno | Dashboard Imagenología</title>
    <link rel="icon" href="<?= base_url() ?>assets/images/favicon.ico" type="image/gif">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/choices.js@10.2.0/public/assets/styles/choices.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/choices.js@10.2.0/public/assets/scripts/choices.min.js"></script>
    <style>
        :root {
            --primary: #2563eb;
            --secondary: #64748b;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --background: #f8fafc;
            --surface: #ffffff;
            --text: #1e293b;
        }

        body {
            background-color: var(--background);
            color: var(--text);
            font-family: 'Inter', sans-serif;
            padding: 2rem;
            min-height: 100vh;
        }

        .stats-card {
            background: var(--surface);
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            padding: 1.5rem;
            transition: all 0.3s ease;
            height: 100%;
        }

        .stats-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }

        .control-panel {
            background: var(--surface);
            border-radius: 1rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            height: 100%;
        }

        .chart-container {
            background: var(--surface);
            border-radius: 1rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            height: 500px;
            position: relative;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--primary);
            margin: 0.5rem 0;
        }

        .stat-label {
            color: var(--secondary);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .icon-box {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
        }

        .icon-box.primary {
            background: rgba(37, 99, 235, 0.1);
            color: var(--primary);
        }

        .icon-box.warning {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }

        .icon-box.success {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .form-select, .form-control {
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
            padding: 0.75rem 1rem;
            font-size: 1rem;
            width: 100%;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
        }

        .form-select:focus, .form-control:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }

        .form-label {
            font-weight: 500;
            color: var(--text);
            margin-bottom: 0.5rem;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="row g-4 mb-4">
            <div class="col-md-4">
                <div class="stats-card">
                    <div class="icon-box primary">
                        <i class="mdi mdi-clock-outline mdi-24px"></i>
                    </div>
                    <div class="stat-value">25 min</div>
                    <div class="stat-label">Tiempo promedio de espera</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card">
                    <div class="icon-box warning">
                        <i class="mdi mdi-account-multiple mdi-24px"></i>
                    </div>
                    <div class="stat-value">127</div>
                    <div class="stat-label">Pacientes atendidos hoy</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stats-card">
                    <div class="icon-box success">
                        <i class="mdi mdi-chart-line mdi-24px"></i>
                    </div>
                    <div class="stat-value">94%</div>
                    <div class="stat-label">Eficiencia de atención</div>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-md-4">
                <div class="control-panel">
                    <h5 class="mb-4">Filtros de Visualización</h5>
                    
                    <div class="mb-3">
                        <label class="form-label">Tipo de Estadística</label>
                        <select id="graph" class="form-select">
                            <option selected disabled>Seleccione tipo</option>
                            <option value="averageAttentionTime">Tiempo promedio de atención</option>
                            <option value="patientCount">Cantidad de tickets</option>
                            <option value="uniquePatientCount">Pacientes únicos</option>
                            <option value="patientDistribution">Distribución por especialidad</option>
                            <option value="waitingTimeByCategory">Tiempo de espera por categoría</option>
                            <option value="technicianPerformance">Rendimiento de técnicos</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Categoría</label>
                        <select id="category" class="form-select">
                            <option selected disabled>Seleccione categoría</option>
                            <option value="all">Todas</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Período</label>
                        <select id="timeRange" class="form-select">
                            <option selected disabled>Seleccione período</option>
                            <option value="yearly">Último año</option>
                            <option value="monthly">Último mes</option>
                            <option value="weekly">Última semana</option>
                            <option value="year">Año actual</option>
                            <option value="month">Mes actual</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="col-md-8">
                <div class="chart-container">
                    <canvas id="dynamicChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/choices.js@10.2.0/public/assets/scripts/choices.min.js"></script>
    <script src="assets/js/stats.js"></script>

</body>

</html>