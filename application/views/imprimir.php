<!DOCTYPE html>
<html lang="">

<head>
	<meta name="author" content="Daniel Falfán dfalfanm@gmail.com">
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>ServiTurno | Imprimir </title>
	<link rel="icon" href="<?= base_url() ?>/favicon.ico" type="image/gif">
	<!-- Bootstrap CSS -->
	<link type="text/css" rel="stylesheet" href='<?php echo base_url() . 'assets/' ?>css/bootstrap.css' />
	<link type="text/css" rel="stylesheet" href='<?php echo base_url() . 'assets/' ?>css/pantalla.css' />
</head>

<body>

	<nav class="navbar navbar-default" role="navigation">
		<!-- Brand and toggle get grouped for better mobile display -->
		<div class="navbar-header">

			<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
				<span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span
					class="icon-bar"></span> <span class="icon-bar"></span>
			</button>

			<embed class="navbar-logo" src="<?php echo base_url() . 'assets/images/logo2.svg' ?>">
		</div>
		<div class="collapse navbar-collapse navbar-ex1-collapse">
			<button type="button " class="btn btn-primary"
				style="font-size : 30px; margin-top: 20px; float: right; color: white;" ;><a
					href=" <?= base_url('admin') ?>" style="color:white;">Administrar</a></button>

		</div>
	</nav>

	<div class=" container noselect topMarginContainer">
		<div style="float: left;width: 585px;height: 700px;">
			<?php $i = 0;
			foreach ($categorias as $row): {
					if (++$i > 4)
						break;
				} ?>
				<div class="row" style="width: 585px;height: 100px;">
					<div class=" col-md-6" style="width: 390px;height: 123px;">
						<div data-id="<?= $row->id ?>" onclick="imprimirTicket(this)" style="background: none;"
							class="panel">
							<button type="button " class="btn2 btn-primary" style="width: 380px; height: 100px;">
								<?= $row->categoria ?>
							</button>

						</div>
					</div>
					<div class="col-sm-2 ticket" style="width: 140px;height: 50px; padding-left: 10px;padding-top: 4px;">

						<div class=" panel-body ticketStyle"
							style="width: 130px; height: 90px; padding-top: 0px; border-top-width: 5px; margin-top: 2px;background-color: #02182B;">
							<h1 style=" font-weight: bold; font-size: 50px;">
								<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
							</h1>
						</div>

					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<div style="float: left;width: 555px;height: 700px;">
			<?php $i = 0;
			foreach ($categorias as $row): {
					if (++$i < 5)
						continue;
				} ?>
				<div class="row" style="width: 555px;height: 100px;">
					<div class=" col-md-6" style="width: 390px;height: 123px; padding-right: 3px;">
						<div data-id="<?= $row->id ?>" onclick="imprimirTicket(this)" style="background: none;"
							class="panel">

							<button type="button " class="btn2 btn-primary" style="width: 370px; height: 100px; ">
								<?= $row->categoria ?>
							</button>

						</div>
					</div>
					<div class="col-sm-2 ticket" style="width: 140px;height: 50px; padding-left: 0px; ">
						<div class=" panel-body ticketStyle"
							style="width: 130px; height: 90px; padding-top: 0px; border-top-width: 5px; margin-top: 2px;background-color: #02182B; ">
							<h1 style=" font-weight: bold; font-size: 50px; ">
								<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
							</h1>
						</div>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

	</div>









	<!-- jQuery -->
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.min.js" type="text/javascript"></script>
	<!-- Bootstrap JavaScript -->
	<script src="<?php echo base_url() . 'assets/' ?>js/bootstrap.min.js" type="text/javascript"></script>
	<!-- jQuery fitText -->

	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.fittext.js" type="text/javascript"></script>

	<script src="<?php echo base_url() . 'assets/' ?>js/serviticketImprimir.js" type="text/javascript"></script>



</body>

</html>