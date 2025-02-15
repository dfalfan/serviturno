<!DOCTYPE html>
<html>
<head>
    <title>ServiTurno | Imagenología</title>
    <meta name="author" content="Daniel Falfán dfalfanm@gmail.com">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="<?= base_url() ?>assets/images/favicon.ico" type="image/gif">

    <!-- CSS de Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="<?= base_url() ?>/assets/js/datepicker-es.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/es.min.js"></script>
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/excite-bike/jquery-ui.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.5/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css"
        href="https://cdn.datatables.net/buttons/2.1.0/css/buttons.bootstrap4.min.css" />
    <script type="text/javascript" charset="utf8"
        src="https://cdn.datatables.net/1.13.5/js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/buttons/2.1.0/js/dataTables.buttons.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/buttons/2.1.0/js/buttons.html5.min.js"></script>

    <!-- JS de Bootstrap -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="assets/css/tabla.css">
    <script src="assets/js/tabla.js"></script>

    <!-- Añade estos enlaces para Flatpickr -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://npmcdn.com/flatpickr/dist/l10n/es.js"></script>
    <script src="<?php echo base_url('assets/js/options.js'); ?>"></script>
    <script src="<?php echo base_url('assets/js/view-study.js'); ?>"></script>
    <script src="<?php echo base_url('assets/js/transcribe.js'); ?>"></script>
    <script src="<?php echo base_url('assets/js/process.js'); ?>"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>

<script>
    $(document).ready(function () {
        // Simular el clic en el botón "refresh-btn" al cargar la página
        $("#refresh-btn").click();
    });
</script>

<body>
    <div id="fondo">
        <nav class="navbar">
            <img style="width: 200px; height: 38px; margin-top: -10px;margin-left: 15px;" class="navbar-logo"
                src="<?php echo base_url() . 'assets/images/logo_new.png' ?>" alt="Logo">

            <div class="button-container">
                <!-- Botones para filtrar por categoría -->
                <button class="filter-btn selected" data-filter="" data-id="undefined">Todos</button>
                <button class="filter-btn" data-filter="Densitometría" data-id="53">Densitometría<span
                        class="notification"></span></button>
                <button class="filter-btn" data-filter="Ecografía" data-id="51">Ecografía<span
                        class="notification"></span></button>
                <!-- <button class="filter-btn" data-filter="Resultados" data-id="55">Resultados<span class="notification"></span></button> -->
                <button class="filter-btn" data-filter="Mamografía" data-id="52">Mamografía<span
                        class="notification"></span></button>
                <button class="filter-btn" data-filter="Rayos X" data-id="42">Rayos X<span
                        class="notification"></span></button>
                <button class="filter-btn" data-filter="Resonancia" data-id="49">Resonancia<span
                        class="notification"></span></button>
                <button class="filter-btn" data-filter="Tomografía" data-id="48">Tomografía <span
                        class="notification"></span></button>
                <!-- Agrega más botones según las categorías que tengas -->
            </div>

            <div class="header-buttons-container">
                <button id="refresh-btn" style="display:none;"><i class="fas fa-sync-alt"></i></button>
                <button id="stats-btn" class="header-button">
                    <i class="fas fa-chart-bar"></i>
                </button>
                <button class="mode-toggle header-button">
                    <i class="fas fa-moon"></i>
                    <i class="fas fa-sun"></i>
                </button>
            </div>
        </nav>




        <input type="hidden" id="selected-category-id" value="">
        <div id="date-picker-wrapper">
            <button id="prev-date" class="date-arrow"><i class="fas fa-chevron-left"></i></button>
            <input type="text" id="datepicker" class="form-control" placeholder="Seleccionar fecha">
            <button id="next-date" class="date-arrow"><i class="fas fa-chevron-right"></i></button>
            <label id="total-studies-label" class="total-studies-label-style"></label>
        </div>

        <div class="center-div">
            <table id="myTable" class="display" style="width: 100%;">
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
                        <th>Acción</th> <!-- Nueva columna -->
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($datos as $dato): ?>
                        <tr data-id="<?php echo $dato->id; ?>">
                            <td><?php echo $dato->especialidad; ?></td>
                            <td style="font-weight: bold; color: #12375b; font-size: 25px;"><?php echo $dato->ticket; ?>
                            </td>
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
                            <td><?php echo $dato->hora_de_impresion != null ? date('h:i:s A', strtotime($dato->hora_de_impresion)) : ''; ?>
                            </td>
                            <td><?php echo $dato->hora_de_llamado != null ? date('h:i:s A', strtotime($dato->hora_de_llamado)) : ''; ?>
                            </td>
                            <td><?php echo ($dato->tiempo_para_atencion != '00:00:00') ? $dato->tiempo_para_atencion : ''; ?>
                            </td>
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
                                    <option value="LN">LN</option>
                                    <option value="SR">SR</option>
                                    <option value="MH">MH</option>
                                </select>
                            </td>
                            <td>
                                <button class="btn-more-info<?php echo $dato->detalle ? ' has-details' : ''; ?>"><i
                                        class="fas fa-plus"></i></button>
                            </td>
                            <td>
                                <?php if ($dato->mostrar_llamar): ?>
                                    <button class="btn-call" data-ticket="<?php echo $dato->ticket; ?>"
                                        data-categoria="<?php echo $dato->especialidad; ?>"
                                        data-url="<?php echo base_url('operador/toggle_random/' . $dato->id); ?>">Llamar</button>
                                <?php endif; ?>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <?php if ($dato->tecnico): ?>
                                        <button class="btn-action btn-view-study <?php echo !empty($dato->study_instance_uids) ? 'has-study' : ''; ?>" title="Ver estudio">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <?php
                                        $transcribeClass = '';
                                        if (!empty($dato->estudios_informados) && in_array('1', explode(',', $dato->estudios_informados))) {
                                            $transcribeClass = 'is-informed';
                                        } elseif (!empty($dato->estudios_guardados) && in_array('1', explode(',', $dato->estudios_guardados))) {
                                            $transcribeClass = 'is-saved';
                                        }
                                        ?>
                                        <button class="btn-action btn-transcribe <?php echo $transcribeClass; ?>" title="Transcribir">
                                            <i class="fas fa-microphone"></i>
                                        </button>
                                        <button class="btn-action btn-qr" title="Código QR para transcripción móvil">
                                            <i class="fas fa-qrcode"></i>
                                        </button>
                                        <button class="btn-action btn-process <?php echo !empty($dato->estudios_procesados) && in_array('1', explode(',', $dato->estudios_procesados)) ? 'is-processed' : ''; ?>" title="Procesar">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    <?php endif; ?>
                                </div>
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

    <div class="modal fade" id="patientDetailsModal" tabindex="-1" role="dialog"
        aria-labelledby="patientDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="patientDetailsModalLabel">Detalles del Estudio</h5>
                </div>
                <div class="modal-body">
                    <!-- El contenido se llenará dinámicamente -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="save-btn">Guardar</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
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


    <div class="modal fade" id="admissionModal" tabindex="-1" role="dialog" aria-labelledby="admissionModalLabel"
        aria-hidden="true">
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

    <!-- Modal para Ver Estudio -->
    <div class="modal fade" id="viewStudyModal" tabindex="-1" role="dialog" aria-labelledby="viewStudyModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viewStudyModalLabel">Ver Estudio</h5>
                </div>
                <div class="modal-body">
                    <div class="patient-info">
                        <p><strong>Nombre:</strong> <span id="patient-name"></span></p>
                        <p><strong>Admisión:</strong> <span id="patient-admission"></span></p>
                        <p><strong>Categoría:</strong> <span id="patient-category"></span></p>
                    </div>
                    <hr>
                    <div class="study-details">
                        <div class="row header">
                            <div class="col-md-4">Estudio</div>
                            <div class="col-md-6">Opciones</div>
                            <div class="col-md-2">Ver</div>
                        </div>
                        <div id="study-list">
                            <!-- Los estudios se agregarán aquí dinámicamente -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para Transcribir -->
    <div class="modal fade" id="transcribeModal" tabindex="-1" role="dialog" aria-labelledby="transcribeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="transcribeModalLabel">Transcribir</h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="patient-info">
                        <p><strong>Nombre:</strong> <span id="transcribe-patient-name"></span></p>
                        <p><strong>Admisión:</strong> <span id="transcribe-patient-admission"></span></p>
                        <p><strong>Categoría:</strong> <span id="transcribe-patient-category"></span></p>
                        <input type="hidden" id="category-id">
                    </div>
                    <hr>
                    <div class="form-group">
                        <h6 id="doctor-list-title">Seleccione médico:</h6>
                        <div id="transcribe-doctor-list" class="doctor-tags">
                            <!-- Los doctores se agregarán aquí dinámicamente como tags -->
                        </div>
                        <input type="hidden" id="selected-doctor-id">
                    </div>
                    <hr>
                    <h6>Estudios disponibles:</h6>
                    <div id="transcribe-study-list">
                        <!-- Los estudios se agregarán aquí dinámicamente -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="transcribe-btn">Transcribir</button>
                    <button type="button" class="btn btn-info" id="qr-btn">
                        <i class="fas fa-qrcode"></i> QR
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
    
  <!-- Modal para mostrar la transcripción -->
    <div class="modal fade" id="transcriptionModal" tabindex="-1" role="dialog" aria-labelledby="transcriptionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document" style="max-width: 95%; height: 95vh;">
            <div class="modal-content" style="height: 100%; position: relative;">
                <button type="button" class="close-btn" data-bs-dismiss="modal" aria-label="Close" style="
                    position: absolute;
                    right: -15px;
                    top: -15px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: #dc3545;
                    border: 2px solid #fff;
                    color: white;
                    font-size: 60px;
                    line-height: 0.8;
                    padding-bottom: 8px;
                    z-index: 1051;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">&times;</button>
                <div class="modal-body p-0" style="height: 100%;">
                    <iframe id="transcriptionFrame" src="" style="width: 100%; height: 100%; border: none;" allow="microphone"></iframe>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal para Procesar -->
    <div class="modal fade" id="processModal" tabindex="-1" role="dialog" aria-labelledby="processModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="processModalLabel">Procesar</h5>
                </div>
                <div class="modal-body">
                    <div class="patient-info">
                        <p><strong>Nombre:</strong> <span id="process-patient-name"></span></p>
                        <p><strong>Admisión:</strong> <span id="process-patient-admission"></span></p>
                        <p><strong>Categoría:</strong> <span id="process-patient-category"></span></p>
                    </div>
                    <hr>
                    <!-- Aquí puedes añadir más contenido para el procesamiento si es necesario -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="process-accept-btn">Aceptar</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>



    <script>
        var baseUrl = '<?php echo base_url(); ?>';
    </script>
</body>
<script>
    var tuBaseURL = "<?php echo base_url(); ?>";
    $("#stats-btn").click(function () {
        window.open("http://192.168.5.25:8086/serviturno/stats", '_blank');
    });
</script>

<script>
    function actualizarModales() {
        const modales = ['#admissionModal', '#patientDetailsModal', '#myModal'];
        const esModoOscuro = document.body.classList.contains('dark-mode');

        modales.forEach(modal => {
            if (esModoOscuro) {
                $(modal).addClass('dark-mode');
            } else {
                $(modal).removeClass('dark-mode');
            }
        });
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const moonIcon = document.querySelector('.mode-toggle .fa-moon');
        const sunIcon = document.querySelector('.mode-toggle .fa-sun');
        if (document.body.classList.contains('dark-mode')) {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'inline-block';
        } else {
            moonIcon.style.display = 'inline-block';
            sunIcon.style.display = 'none';
        }
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        $('body').trigger('darkModeChanged');
        actualizarModales();
    }

    document.querySelector('.mode-toggle').addEventListener('click', toggleDarkMode);

    // Verificar la preferencia guardada al cargar la página
    if (localStorage.getItem('darkMode') === 'true') {
        toggleDarkMode();
    }

    // Asegurarse de que los modales se actualicen cuando se abren
    $('.modal').on('show.bs.modal', function () {
        actualizarModales();
    });
</script>

<!-- Modal para escanear QR -->
<div class="modal fade" id="qrModal" tabindex="-1" role="dialog" aria-labelledby="qrModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="qrModalLabel">Escanear para transcribir</h5>
                <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body text-center">
                <div id="qrcode"></div>
                <p class="mt-3">Escanee el código QR para abrir el transcriptor en su dispositivo móvil</p>
            </div>
        </div>
    </div>
</div>

</html>
