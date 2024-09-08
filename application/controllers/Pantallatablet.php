<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Pantallatablet extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		$this->load->model('pantalla_model');
	}

	public function index()
	{
		$data['cola'] = $this->pantalla_model->obtener_categorias();
		$data['fetch_data'] = $this->pantalla_model->fetch_data();
		$data['fetch_categoria'] = $this->pantalla_model->fetch_categoria();
		$this->load->view('pantallatablet_view', $data);
	}
}
