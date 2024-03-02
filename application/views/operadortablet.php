<!DOCTYPE html>
<html lang="">

<head>
	<meta name="author" content="Daniel Falfán dfalfanm@gmail.com">

	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta http-equiv="X-UA-Compatible" content="IE=9;IE=10;IE=Edge,chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>ServiTurno | Operador</title>
	<link rel="icon" href="<?= base_url() ?>/favicon.ico" type="image/gif">
	<!--<meta http-equiv="refresh" content="5" >-->
	<!-- Bootstrap CSS -->
	<link type="text/css" rel="stylesheet" href='<?php echo base_url() . 'assets/' ?>css/bootstrap.css' />
	<link type="text/css" rel="stylesheet" href='<?php echo base_url() . 'assets/' ?>css/serviticket.css' />

	<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
	<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
	<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
			<script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
		<![endif]-->
</head>

<body>

	<div class="container noselect topMarginContainer" style=" width: 1270px; margin-top: 140px;  padding-left: 60px;">
		<div style=" float: left;width: 585px;height: 700px;">
			<?php $i = 0;
			foreach ($categorias as $row): {
					if (++$i > 4)
						break;
				} ?>
				<div class="row" style="width: 625px;height: 100px;">
					<div class=" col-md-6" style="width: 390px;height: 123px;">
						<div onclick=" location.href='<?= base_url('operador/toggle_atendida/' . $row->id . '') ?>'"
							style=" background: none;" class="panel">
							<button type="button " class="btn2 btn-info"
								style="width: 380px; height: 100px; background-color: #02182B ;">
								<?= $row->categoria ?>
							</button>
						</div>
					</div>

					<div class="col-sm-2 ticket"
						style="width: 115px;height: 94px;padding-left: 10px;padding-top: 4px;padding-right: 0px;">
						<?php if ($row->restantes > 0): ?>
							<div class=" panel-body ticketStyle"
								style="width: 90px; height: 90px; padding-top: 0px; border-top-width: 5px; margin-top: 2px;background-color: #F75C03;">
								<h1 style="font-weight: bold; font-size: 50px;">
									<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
								</h1>
							</div>
						<?php endif; ?>

						<?php if ($row->restantes <= 0): ?>
							<div class=" panel-body ticketStyle"
								style="width:90px; height: 90px; padding-top: 0px; border-top-width: 5px; margin-top: 2px;background-color: #02182B; ">
								<h1 style="font-weight: bold; font-size: 50px;">
									<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
								</h1>
							</div>
						<?php endif; ?>
					</div>

					<div class="col-sm-2 ticket"
						style="width: 90px;height: 50px; padding-left: 10px;padding-top: 4px;padding-left: 0px;bottom: 8px; ">

						<div class="ticketStyle-3">
							<?php if ($row->restantes > 0): ?>
								<h1 class=glow style="font-weight: bold; font-size: 70px; color: #F75C03; ">
									<?= $row->restantes ?>
								</h1>
							<?php endif; ?>
						</div>

					</div>

				</div>


			<?php endforeach; ?>
		</div>


		<div style="float: left;width: 605px;height: 700px;">
			<?php $i = 0;
			foreach ($categorias as $row): {
					if (++$i < 5)
						continue;
				} ?>
				<div class="row" style="width: 605px;height: 100px;">
					<div class=" col-md-6" style="width: 390px;height: 123px;">
						<div onclick=" location.href='<?= base_url('operador/toggle_atendida/' . $row->id . '') ?>'"
							style=" background: none;" class="panel">
							<button type="button " class="btn2 btn-info"
								style="width: 380px; height: 100px; background-color: #02182B ;">
								<?= $row->categoria ?>
							</button>
						</div>
					</div>

					<div class="col-sm-2 ticket"
						style="width: 115px;height: 94px;padding-left: 10px;padding-top: 4px;padding-right: 0px;">
						<?php if ($row->restantes > 0): ?>
							<div class=" panel-body ticketStyle"
								style="width: 90px; height: 90px; padding-top: 0px; border-top-width: 5px; margin-top: 2px;background-color: #F75C03;">
								<h1 style="font-weight: bold; font-size: 50px;">
									<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
								</h1>
							</div>
						<?php endif; ?>

						<?php if ($row->restantes <= 0): ?>
							<div class=" panel-body ticketStyle"
								style="width: 90px; height: 90px; padding-top: 0px; border-top-width: 5px; margin-top: 2px;background-color: #02182B;">
								<h1 style="font-weight: bold; font-size: 50px;">
									<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
								</h1>
							</div>
						<?php endif; ?>
					</div>
					<div class="col-sm-2 ticket"
						style="width: 90px;height: 50px; padding-left: 10px;padding-top: 4px;padding-left: 0px;bottom: 8px;">

						<div class="ticketStyle-3">
							<?php if ($row->restantes > 0): ?>
								<h1 class=glow style="font-weight: bold; font-size: 70px; color: #F75C03;">
									<?= $row->restantes ?>
								</h1>
							<?php endif; ?>
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

	<script src="<?php echo base_url() . 'assets/' ?>js/serviticketOperador.js" type="text/javascript"></script>


</body>

</html>