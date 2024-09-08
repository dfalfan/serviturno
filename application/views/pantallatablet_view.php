<!doctype html>
<html>

<head>
	<meta name=author content="Daniel Falfán dfalfanm@gmail.com">
	<meta name="description" content="Pantalla Serviturno">
	<meta charset=utf-8>
	<meta http-equiv=X-UA-Compatible content="IE=edge">
	<meta name=viewport content="width=device-width,initial-scale=1">
	<title>ServiTurno</title>
	<link rel=icon href="<?= base_url() ?>/favicon.ico" type=image/gif>
	<link rel=stylesheet href="<?php echo base_url() . 'assets/' ?>css/bootstrap.css">
	<link rel=stylesheet href="<?php echo base_url() . 'assets/' ?>css/pantalla.css">
	<link rel=stylesheet href="<?php echo base_url() . 'assets/' ?>css/titulo.css">
</head>
<!--
<video class=video-js autoplay muted loop>
	<source src=assets/video/304.m4v type=video/mp4>
</video>
-->

<body onload=startTime()>
	<source src=beep.mp3 type=audio/mpeg>

	<div class="container noselect tickets">

		<div style=float:left;width:585px;height:700px;margin-top:70px>
			<h1 style=font-weight:700;font-size:40px;text-align:left;color:#031e36>Atendiendo a:</h1>
			<?php foreach ($cola as $row) : ?>
				<div class=row style=height:80px>
					<div class=col-md-6 style=width:390px;height:90px>
						<button type=button class="btn3 btn-primary" style=width:349px;height:82px>
							<?= $row->categoria ?>
						</button>
					</div>
					<div class="col-sm-2 ticket" style=width:140px;height:50px;padding-left:10px;padding-top:4px>
						<div class="panel-body ticketStyle" style=width:100px;height:75px;padding-top:0;border-top-width:5px;margin-top:0;background-color:#02182b;padding-bottom:0>
							<h1 style=font-weight:700;font-size:50px;margin-top:10px>
								<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
							</h1>
						</div>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
		<div style=float:left;width:555px;height:700px>
			<?php foreach ($fetch_categoria->result() as $row) : ?>
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
						<h2 style=font-weight:700;font-size:50px;color:#031e36;text-align:center;> <!-- Agregar esta línea -->
							<?= $row->paciente ?>
						</h2>
					</div>
				</div>
				<script>
					var msg = new SpeechSynthesisUtterance();
					msg.rate = .85;
					msg.pitch = 1;
					msg.text = "Atención: <?= $row->paciente ?>.... Ticket número <?= $row->num_actual ?>, <?= $row->categoria ?> ... Ticket número <?= $row->num_actual ?> , <?= $row->categoria ?>";

					function setVoice() {
						var voices = window.speechSynthesis.getVoices();
						if (voices.length > 264) { // Asegurarse de que el índice 264 existe
							msg.voice = voices[264]; // Selecciona la voz con índice 264
						}
						window.speechSynthesis.speak(msg);
					}

					// Llamar a setVoice después de que las voces estén cargadas
					if (speechSynthesis.onvoiceschanged !== undefined) {
						speechSynthesis.onvoiceschanged = setVoice;
					}
				</script>
			<?php endforeach; ?>
		</div>
	</div>
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.min.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/bootstrap.min.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.fittext.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/pantalla.js"></script>
	<script>
		function startTime() {
			var e = new Date,
				t = e.getHours(),
				n = e.getMinutes(),
				c = e.getSeconds();
			n = checkTime(n), c = checkTime(c);
			var i = "AM";
			0 == t && (t = 12), t > 12 && (t -= 12, i = "PM"), document.getElementById("txt").innerHTML = t + ":" + n + ":" + c + " " + i;
			setTimeout(startTime, 500)
		}

		function checkTime(e) {
			return e < 10 && (e = "0" + e), e
		}
	</script>
</body>

</html>