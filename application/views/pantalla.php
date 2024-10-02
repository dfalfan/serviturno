<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="author" content="Daniel Falfán dfalfanm@gmail.com">
	<meta name="description" content="Pantalla Serviturno">
	<title>ServiTurno</title>
	<link rel="icon" href="<?= base_url() ?>assets/images/favicon.ico" type="image/gif">
	<link rel="stylesheet" href="<?php echo base_url() . 'assets/' ?>css/bootstrap.css">
	<link rel="stylesheet" href="<?php echo base_url() . 'assets/' ?>css/pantalla.css">
	<link rel="stylesheet" href="<?php echo base_url() . 'assets/' ?>css/titulo.css">
</head>

<body onload="actualizarReloj()">
	<nav class="navbar navbar-default" role=navigation style="box-shadow:0 3px 6px rgba(0,0,0,.23)">
		<div class=navbar-header>
			<img class=" navbar-logo" style="width: 300px; height: 100px;"
				src="<?php echo base_url() . 'assets/images/logo_new.png' ?>">
		</div>
		<div class=text style=margin-bottom:-300px;margin-right:300px;text-align:center>
			Imagenología
		</div>
		<div class="collapse navbar-collapse navbar-ex1-collapse">
			<a class=navbar-hora href=# style=font-size:60px;margin-top:20px;float:right;color:#0b1553>
				<div id=txt></div>
			</a>
		</div>
	</nav>
	<div class="container noselect tickets">
		<div style=float:left;width:585px;height:700px;margin-top:70px>
			<h1 style=font-weight:700;font-size:40px;text-align:left;color:#031e36>Atendiendo a:</h1>
			<?php foreach ($cola as $row): ?>
				<div class=row style=height:80px>
					<div class=col-md-6 style=width:390px;height:90px>
						<button type=button class="btn3 btn-primary" style=width:349px;height:82px>
							<?= $row->categoria ?>
						</button>
					</div>
					<div class="col-sm-2 ticket" style=width:140px;height:50px;padding-left:10px;padding-top:4px>
						<div class="panel-body ticketStyle"
							style=width:100px;height:75px;padding-top:0;border-top-width:5px;margin-top:0;background-color:#02182b;padding-bottom:0>
							<h1 style=font-weight:700;font-size:50px;margin-top:10px>
								<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
							</h1>
						</div>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
		<div style=float:left;width:555px;height:700px>
			<?php foreach ($fetch_categoria->result() as $row): ?>
				<div class="col-md-3 col-xs-3 ticket" style=display:block;left:45px;padding-left:50px;width:495px>
					<div class=panel style="background:0 0;width:552.5px;border-top-width:60px;margin-top:0px">
						<h1 style=font-weight:700;font-size:40px;text-align:center;color:#031e36>Último ticket llamado:</h1>
						<div class="panel-body ticketStyle">
							<h1 class=ticketH1 style=font-size:300px>
								<?= $row->num_actual ?>
							</h1>
							<h1 style=font-weight:700;font-size:68px;color:#fff>
								<?= $row->categoria ?>
							</h1>

						</div>
						<h2 style=font-weight:700;font-size:50px;color:#031e36;text-align:center;>
							<?= $row->paciente ?>
						</h2>
					</div>
				</div>
				<script>
					console.log('Inicializando función hablar');

					function hablar(texto) {
						console.log('Función hablar llamada con texto:', texto);
						try {
							console.log('Iniciando síntesis de voz');
							const utterance = new SpeechSynthesisUtterance(texto);
							utterance.lang = 'es-VE'; // Configurar el idioma a español de Venezuela
							utterance.rate = 0.92; // Reducir ligeramente la velocidad de habla
							utterance.pitch = 1; // Tono normal
							utterance.volume = 1; // Volumen máximo

							// Configurar la voz específica
							const voces = speechSynthesis.getVoices();
							const vozDeseada = voces.find(voz => voz.name === "Microsoft Paola Online (Natural) - Spanish (Venezuela)");
							if (vozDeseada) {
								utterance.voice = vozDeseada;
							} else {
								console.warn('La voz deseada no está disponible. Se usará la voz predeterminada.');
							}

							speechSynthesis.speak(utterance);

							console.log('Síntesis de voz iniciada con éxito');
						} catch (error) {
							console.error('Error al generar o reproducir el audio:', error);
						}
					}

					// Asegurarse de que las voces estén cargadas antes de llamar a la función hablar
					speechSynthesis.onvoiceschanged = function () {
						// Llamar a esta función cuando se necesite hablar
						hablar("Atención: <?= $row->paciente ?>. Ticket número <?= $row->num_actual ?>, <?= $row->categoria ?>.");
					};

					console.log('Script de síntesis de voz cargado');
				</script>
			<?php endforeach; ?>
		</div>
	</div>
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.min.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/bootstrap.min.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.fittext.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/pantalla.js"></script>
	<script>
		function actualizarReloj() {
			const ahora = new Date();
			const horas = ahora.getHours();
			const minutos = ahora.getMinutes();
			const segundos = ahora.getSeconds();

			const horasFormateadas = horas % 12 || 12; // Convierte 0 a 12 para medianoche
			const ampm = horas >= 12 ? 'PM' : 'AM';

			const tiempoFormateado =
				padZero(horasFormateadas) + ':' +
				padZero(minutos) + ':' +
				padZero(segundos) + ' ' +
				ampm;

			document.getElementById("txt").textContent = tiempoFormateado;
			setTimeout(actualizarReloj, 1000);
		}

		function padZero(num) {
			return num < 10 ? '0' + num : num;
		}
	</script>
</body>

</html>