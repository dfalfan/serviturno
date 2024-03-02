<!DOCTYPE html>
<html lang="">

<head>
	<meta name="author" content="Daniel Falfán dfalfanm@gmail.com">
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Serviturno | Admin</title>
	<link rel="icon" href="<?= base_url() ?>/favicon.ico" type="image/gif">
	<!-- Bootstrap CSS -->
	<link type="text/css" rel="stylesheet" href='<?php echo base_url() . 'assets/' ?>css/bootstrap.css' />
	<link type="text/css" rel="stylesheet" href='<?php echo base_url() . 'assets/' ?>css/serviticket.css' />
</head>

<body>
	<nav class="navbar navbar-default" role="navigation">
		<!-- Brand and toggle get grouped for better mobile display -->
		<div class="navbar-header">
			<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			<img class="navbar-logo" src="<?php echo base_url() . 'assets/images/logo2.svg' ?>">
		</div>
		<div class="collapse navbar-collapse navbar-ex1-collapse">
			<button type="button" class="btn btn-primary" style="font-size : 30px; margin-top: 20px; float: right;">
				<a href="<?= base_url('imprimir') ?>" style="color:white;">Volver</a>
			</button>
		</div>
	</nav>

	<div class="container noselect">
		<div class="col-md-6 topMargin">
			<form action="<?= base_url('admin/agregar_categoria') ?>" method="POST" role="form">
				<div class="form-group">
					<label for="">Agregar una categoria</label>
					<input type="text" class="form-control" id="categoria" name="categoria" placeholder="Nombre de categoría">
				</div>
				<button type="submit" class="btn btn-primary">Agregar</button>
			</form>
			</br>
		</div>
		<div class="col-md-6">
			<div class="table-responsive">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Categorias</th>
							<th>Activar</th>
							<th>Reiniciar</th>
							<th>Eliminar</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><strong>Todas</strong></td>
							<td></td>
							<td>
								<a href="<?= base_url("admin/reiniciar_todas") ?>" class="confirm btn btn-info" role="button">
									<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>
								</a>
							</td>
							<td></td>
						</tr>
						<?php foreach ($categorias as $row) : ?>
							<tr>
								<td>
									<?= $row->categoria ?>
								</td>
								<td>
									<a href="<?= base_url("admin/toggle_categoria") . "/$row->id" ?>" class="<?= ($row->activa == 1) ? "btn btn-success" : "btn btn-default" ?> glyphicon glyphicon-ok" role="button"></a>
								</td>
								<td>
									<a href="<?= base_url("admin/reiniciar_cola") . "/$row->id" ?>" class="confirm btn btn-info" role="button">
										<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>
									</a>
								</td>
								<td>
									<a href="<?= base_url("admin/eliminar_categoria") . "/$row->id" ?>" class="confirm btn btn-danger" role="button">
										<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
									</a>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>
		</div>
	</div>
	<div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="loginModalLabel" aria-hidden="true">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="loginModalLabel">Iniciar sesión</h5>
				</div>
				<div class="modal-body">
					<form>
						<div class="form-group">
							<label for="username" class="col-form-label">Usuario:</label>
							<input type="text" class="form-control" id="username">
						</div>
						<div class="form-group">
							<label for="password" class="col-form-label">Contraseña:</label>
							<input type="password" class="form-control" id="password">
						</div>
						<div class="form-group" id="error-message" style="display: none;">
							<small class="form-text text-danger">Usuario o contraseña incorrecta.</small>
						</div>
					</form>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" id="login-button">Aceptar</button>
					<button type="button" class="btn btn-secondary" id="cancel-button">Cancelar</button>
				</div>
			</div>
		</div>
	</div>

	<!-- jQuery -->
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.min.js" type="text/javascript"></script>
	<!-- Bootstrap JavaScript -->
	<script src="<?php echo base_url() . 'assets/' ?>js/bootstrap.min.js" type="text/javascript"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/jquery.confirm.min.js" type="text/javascript"></script>
	<script src="<?php echo base_url() . 'assets/' ?>js/admin.js" type="text/javascript"></script>
</body>

</html>