<!DOCTYPE html>
<html>


<head>
    <title>ServiTurno | Imagenología</title>
    <meta name="author" content="Daniel Falfán dfalfanm@gmail.com">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="<?= base_url() ?>/favicon.ico" type="image/gif">

    <!-- CSS de Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="<?= base_url() ?>/assets/js/datepicker-es.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/es.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/excite-bike/jquery-ui.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.5/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.1.0/css/buttons.bootstrap4.min.css" />
    <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.13.5/js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/buttons/2.1.0/js/dataTables.buttons.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/buttons/2.1.0/js/buttons.html5.min.js"></script>

    <!-- JS de Bootstrap -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js"></script>

    <link rel="stylesheet" href="assets/css/tabla.css">
    <script src="assets/js/tabla.js"></script>
</head>

<script>
    $(document).ready(function() {
        // Simular el clic en el botón "refresh-btn" al cargar la página
        $("#refresh-btn").click();
    });
</script>

<body>
    <div id="fondo">
        <nav class="navbar">
            <embed style="width: 200px; height: 38px; margin-top: -10px;margin-left: 15px;" class="navbar-logo" src="<?php echo base_url() . 'assets/images/logo_new.png' ?>">

            <div class=" button-container" ">
            <!-- Botones para filtrar por categoría -->
            <button class=" filter-btn selected" data-filter="" data-id="undefined">Todos</button>
                <button class="filter-btn" data-filter="Densitometría" data-id="53">Densitometría<span class="notification"></span></button>
                <button class="filter-btn" data-filter="Ecografía 1" data-id="50">Ecografía 1<span class="notification"></span></button>
                <button class="filter-btn" data-filter="Ecografía 2" data-id="51">Ecografía 2<span class="notification"></span></button>
                <!-- <button class="filter-btn" data-filter="Resultados" data-id="55">Resultados<span class="notification"></span></button> -->
                <button class="filter-btn" data-filter="Mamografía" data-id="52">Mamografía<span class="notification"></span></button>
                <button class="filter-btn" data-filter="Rayos X" data-id="42">Rayos X<span class="notification"></span></button>
                <button class="filter-btn" data-filter="Resonancia" data-id="49">Resonancia<span class="notification"></span></button>
                <button class="filter-btn" data-filter="Tomografía" data-id="48">Tomografía <span class="notification"></span></button>
                <!-- Agrega más botones según las categorías que tengas -->
            </div>

            <div class="aux-container">
                <button id="datepicker-btn">
                    <i class="far fa-calendar-alt"></i>
                </button>
                <input type="text" id="datepicker" style="display:none;">
                <button id="refresh-btn" style="display:none;"><i class="fas fa-sync-alt"></i></button>
                <button id="stats-btn">
                    <i class="fas fa-chart-bar"></i>
                </button>
            </div>

        </nav>




        <input type="hidden" id="selected-category-id" value="">
        <div id="date-label-wrapper">
            <span id="prev-date" class="date-arrow" style="font-weight: bold; color: #12375b;"><i class=" fas fa-arrow-left"></i></span>
            <label id="selected-date-label" class="selected-date-label-style"></label>
            <span id="next-date" class="date-arrow" style="font-weight: bold; color: #12375b;"><i class=" fas fa-arrow-right"></i></span>
            <label id="go-to-today" style="display: none;">Ir a Hoy</label>

        </div>
        <label id="total-studies-label" class="total-studies-label-style"></label>

        <div class="center-div" style="margin-top: 25px; margin-bottom: 80px; ">
            <table id="myTable" class="display">
                <thead>
                    <tr>
                        <th>Especialidad</th>
                        <th>Ticket</th>
                        <th>Paciente</th>
                        <th>Tipo</th>
                        <th>Impresión</th>
                        <th>Llamado</th>
                        <th>Espera</th>
                        <th>Admisión</th>
                        <th>P/S</th>
                        <th>Técnico</th>
                        <th>Más</th>
                        <th>Llamar</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($datos as $dato) : ?>
                        <tr data-id="<?php echo $dato->id; ?>">
                            <td><?php echo $dato->especialidad; ?></td>
                            <td style="font-weight: bold; color: #12375b; font-size: 25px;"><?php echo $dato->ticket; ?></td>
                            <td><?php echo ucwords(strtolower($dato->paciente)); ?></td>
                            <td>
                                <?php
                                $tipoDetalles = isset($dato->tipo) ? $dato->tipo : '';
                                $tipoDetallesArray = explode(',', $tipoDetalles);
                                foreach ($tipoDetallesArray as $tipoDetalle) {
                                    $tipoDetalle = trim($tipoDetalle);
                                    if (!empty($tipoDetalle)) {
                                        echo "<span class='tag'>{$tipoDetalle}</span>";
                                    }
                                }
                                ?>
                            </td>
                            <td><?php echo $dato->hora_de_impresion != null ? date('h:i:s A', strtotime($dato->hora_de_impresion)) : ''; ?></td>
                            <td><?php echo $dato->hora_de_llamado != null ? date('h:i:s A', strtotime($dato->hora_de_llamado)) : ''; ?></td>
                            <td><?php echo ($dato->tiempo_para_atencion != '00:00:00') ? $dato->tiempo_para_atencion : ''; ?> </td>
                            <td><?php echo $dato->admision; ?></td>
                            <td><?php echo $dato->ps; ?></td>
                            <td>
                                <select class="tecnico-select" <?php echo ($dato->atendida != '1' || $dato->tecnico) ? 'disabled' : ''; ?>>
                                    <option value=""><?php echo $dato->tecnico ? $dato->tecnico : 'Técnico'; ?></option>
                                    <option value="N/A">N/A</option>
                                    <option value="YL">YL</option>
                                    <option value="MC">MC</option>
                                    <option value="RS">RS</option>
                                    <option value="YP">YP</option>
                                    <option value="AL">AL</option>
                                    <option value="BA">BA</option>
                                    <option value="AR">AR</option>
                                    <option value="LN">MH</option>
                                    <option value="SR">SR</option>
                                    <option value="MH">MH</option>

                                </select>
                            </td>
                            <td>
                                <button class="btn-more-info<?php echo $dato->detalle ? ' has-details' : ''; ?>"><i class="fas fa-plus"></i></button>
                            </td>
                            </td>
                            <td>
                                <?php if ($dato->mostrar_llamar) : ?>
                                    <button class="btn-call" data-ticket="<?php echo $dato->ticket; ?>" data-categoria="<?php echo $dato->especialidad; ?>" data-url="<?php echo base_url('operador/toggle_random/' . $dato->id); ?>">Llamar</button>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <!-- Botón "Imprimir ticket" centrado -->
        <div class="text-center mt-3">
            <div class="vertical-line-container">
                <div class="vertical-line"></div>
            </div>
            <button id="print-ticket-btn" class="circular-button">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    </div>

    <div class="modal fade wide-modal" id="patientDetailsModal" tabindex="-1" role="dialog" aria-labelledby="patientDetailsModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="patientDetailsModalLabel">Detalles del Estudio</h5>
                </div>
                <div class="modal-body">

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="save-btn">Guardar</button>
                    <button id="btn-closer" type="button" class="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Llamando a paciente</h5>
                </div>
                <div class="modal-body">
                    Llamando a ticket <span id="ticketNumber"></span> de <span id="categoryName"></span>
                </div>
            </div>
        </div>
    </div>


    <div class="modal fade" id="admissionModal" tabindex="-1" role="dialog" aria-labelledby="admissionModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="admissionModalLabel">Ingresar número de admisión</h5>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="admission-number" class="col-form-label">Número de admisión:</label>
                            <input type="text" class="form-control" id="admission-number">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="print-ticket-button">Imprimir</button>
                    <button id="btn-closer2" type="button" class="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    </div>



</body>
<script>
    var tuBaseURL = "<?php echo base_url(); ?>";
    $("#stats-btn").click(function() {
        window.open("http://app.prevaler.com/serviturno/imagenologia/stats", '_blank');
    });
</script>

</html>