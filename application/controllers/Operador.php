<?php

defined('BASEPATH') or exit('No direct script access allowed');
class Operador extends CI_Controller
{
	public $load; 
	public $operador_model;


	public function __construct()
	{

		// Call the CI_Model constructor
		parent::__construct();
		$this->load->model('operador_model');

		// $this->output->enable_profiler(TRUE);
	}
	public function index()
	{
		$data['categorias'] = $this->operador_model->obtener_categorias();

		$this->load->view('operador', $data);
	}
	public function toggle_atendida()
	{
		$id_categoria = $this->input->post('id_categoria');
		$this->operador_model->toggle_atendida($id_categoria);
		redirect('/operador');
	}


	public function toggle_random()
	{
		$id_categoria = $this->input->post('id_categoria');
		$ticket_number = $this->input->post('ticket'); // Obtener el número de ticket
		if (empty($id_categoria) || empty($ticket_number)) {
		}
		$this->operador_model->toggle_random($id_categoria, $ticket_number); 
		redirect('/operador');
	}

}