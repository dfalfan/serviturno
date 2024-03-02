<?php

defined('BASEPATH') or exit('No direct script access allowed');
class Admin extends CI_Controller
{
	public function __construct()
	{

		// Call the CI_Model constructor
		parent::__construct();
		$this->load->model('admin_model');
	}
	public function index()
	{
		$data['categorias'] = $this->admin_model->obtener_categorias();

		$this->load->view('admin', $data);
	}
	public function eliminar_categoria($id)
	{

		// $id = $this->input->post('id_categoria');
		$this->admin_model->eliminar_categoria($id);
		redirect('/admin');
	}
	public function agregar_categoria()
	{
		$this->admin_model->agregar_categoria($this->input->post('categoria'));
		redirect('/admin');
	}
	public function reiniciar_cola($id_categoria)
	{
		$this->admin_model->reiniciar_cola($id_categoria);
		redirect('/admin');
	}
	public function reiniciar_todas()
	{
		$this->admin_model->reiniciar_todas();
		redirect('/tabla');
	}


	public function reiniciar_cola_del_dia()
	{
		$this->admin_model->reiniciar_cola_del_dia();
		redirect('/tabla');
	}

	
	public function toggle_categoria($id)
	{
		$this->admin_model->toggle_categoria($id);
		redirect('/admin');
	}
}