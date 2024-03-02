<!doctype html>
<html>

<head>
	<meta name=author content="Daniel Falfán dfalfanm@gmail.com">
	<meta charset=utf-8>
	<meta http-equiv=X-UA-Compatible content="IE=edge">
	<meta http-equiv=X-UA-Compatible content="IE=9;IE=10;IE=Edge,chrome=1">
	<meta name=viewport content="width=device-width,initial-scale=1">
	<title>Serviturno | Imagenología</title>
	<link rel=icon href="<?= base_url() ?>/favicon.ico" type=image/gif>
	<link rel=stylesheet href="<?php echo base_url() . 'assets/' ?>css/bootstrap.css">
	<link rel=stylesheet href="<?php echo base_url() . 'assets/' ?>css/operador.css">
</head>

<body>
	<nav>
		<div style="display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 3px 6px rgba(0,0,0,.16);">
			<embed class="navbar-logo" src="<?php echo base_url() . 'assets/images/logo_new.png' ?>">
			<div style="display: flex; gap: 15px; margin-right: 30px;">
				<a href="<?= base_url('tabla') ?>" target="_blank" class="btn btn-primary btn-md">Panel de Control</a>
				<a href="<?= base_url('admin/reiniciar_cola_del_dia') ?>" target="_blank" class="btn btn-primary btn-md confirm">Reiniciar Cola</a>
			</div>
		</div>
	</nav>

	<div id=overlay style=display:none;position:fixed;width:100%;height:100%;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,.5);z-index:2;cursor:pointer></div>
	<div class="container noselect topMarginContainer" style=width:1270px;margin-top:70px;padding-left:60px>
		<div class=row>
			<?php foreach ($categorias as $index => $row) : ?>
				<div class=col-md-6 style=margin-bottom:10px;height:100px>
					<div class="row ticket-card">
						<div class=col-md-6 style=left:0>
							<div data-id="<?= $row->id ?>" onclick=imprimirTicket(this) style="background:0 0" class=panel>
								<button type=button class="btn2 btn-info" style="color:#fff;background:linear-gradient(270deg,#02182b,#0b4b83);background-size:auto;background-size:400% 400%;-webkit-animation:AnimationName 30s ease infinite;-moz-animation:AnimationName 30s ease infinite;width:380px;height:100px;">
									<?= $row->categoria ?>
								</button>
							</div>
						</div>
						<div class="col-md-2 ticket" id=impresos style=padding-left:0;padding-top:4px;padding-right:0;left:55px>
							<div class="panel-body ticketStyle" style="color:#fff;background:linear-gradient(270deg,#02182b,#0b4b83);background-size:auto;background-size:400% 400%;-webkit-animation:AnimationName 30s ease infinite;-moz-animation:AnimationName 30s ease infinite;display:flex;justify-content:center;align-items:center;width:90px;height:99.8px;margin-top:-3px;margin-left:0;background-color: <?= ($row->restantes > 0) ? '#F75C03' : '#02182B'; ?>">
								<h1 style=font-weight:700;font-size:65px;margin-top:10px>
									<?= $row->restantes + $row->num_actual ?>
								</h1>
							</div>
						</div>
						<div class="col-md-2 ticket" id=atendidos style=padding-left:10px;padding-top:10px;padding-left:0;bottom:8px;margin-left:60px;top:-5px;left:0>
							<div class="panel-body ticketStyle" style="color:#fff;cursor:pointer;background:linear-gradient(270deg,#f75c03,orange);background-size:auto;background-size:400% 400%;-webkit-animation:AnimationName 30s ease infinite;-moz-animation:AnimationName 30s ease infinite;display:flex;justify-content:center;align-items:center;width:85px;height:85px;padding-top:0;border-top-width:5px;margin-top:2px">
								<h1 style="font-weight:700;font-size:65px;margin-top:30px" onclick="handleClick(this, '<?= isset($row->num_actual) ? $row->num_actual : '0' ?>', '<?= $row->categoria ?>', '<?= base_url('operador/toggle_atendida/' . $row->id) ?>');">
									<?= isset($row->num_actual) ? $row->num_actual : '0' ?>
								</h1>
							</div>
						</div>
						<!-- He cambiado id=pendientes a class=pendientes -->
						<div class="col-md-2 ticket pendientes" style="padding-top:0;padding-left:0;bottom:8px;margin-left:0;top:-100px;left:150px;">
							<h2 class="h2-gradient" style="padding-left:0;margin-left:0;margin-top:-15px;">
								<?= isset($row->restantes) && $row->restantes > 0 ? $row->restantes : '' ?>
							</h2>
						</div>

					</div>
					<?php if (($index + 1) % 2 == 0) : ?>
						<div class=w-100></div>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>
		</div>
	</div>

	<div class="modal fade" id=myModal tabindex=-1 role=dialog aria-labelledby=exampleModalLabel aria-hidden=true>
		<div class=modal-dialog role=document>
			<div class=modal-content>
				<div class=modal-header>
					<h5 class=modal-title id=exampleModalLabel>Llamando a paciente</h5>
				</div>
				<div class=modal-body>
					Llamando a ticket <span id=ticketNumber></span> de <span id=categoryName></span>
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
					<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
					<button type="button" class="btn btn-primary" id="print-ticket-button">Imprimir</button>
				</div>
			</div>
		</div>
	</div>


	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.min.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/bootstrap.min.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.fittext.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.confirm.min.js"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/operador.js"></script>

</body>


</html>