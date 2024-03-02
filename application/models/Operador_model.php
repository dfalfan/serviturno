<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

defined('BASEPATH') or exit('No direct script access allowed');
class Operador_model extends CI_Model
{
	public function __construct()
	{

		// $this->output->enable_profiler(TRUE);
		// Call the CI_Model constructor
		parent::__construct();
	}

	function getWebSocketWorker()
	{
		global $ws_worker;
		return $ws_worker;
	}

	public function toggle_atendida($id_categoria)
	{

		// Llama al procedimiento almacenado como antes
		$this->db->query("CALL toggle_atendida($id_categoria, CURDATE())");

		// Actualiza la columna tiempo_para_atencion con la diferencia de tiempo
		$this->db->set('tiempo_para_atencion', 'SEC_TO_TIME(TIMESTAMPDIFF(SECOND, fecha, fecha_atendida))', FALSE);
		$this->db->where('id_categoria', $id_categoria);
		$this->db->update('cola');

		// Obtener el último ticket atendido y la categoría correspondiente
		$this->db->select('num_actual, categoria')
			->from('cola')
			->join('categorias', 'cola.id_categoria = categorias.id')
			->where('id_categoria', $id_categoria)
			->order_by('fecha_atendida', 'DESC')
			->limit(1);
		$result = $this->db->get()->row();

		$ticketNumber = $result->num_actual;
		$categoryName = $result->categoria;

		// Escribir en el archivo temporal
		$message = "Actualizar pantalla|$ticketNumber|$categoryName";
		$filePath = 'C:\\app\\serviturno\\imagenologia\\websocket\\temp_message.txt';
		file_put_contents($filePath, $message);
	}


	public function toggle_random($id_categoria, $ticket_number)
	{
		// Llama al procedimiento almacenado con el número de ticket específico
		$this->db->query("CALL toggle_random($id_categoria, $ticket_number, CURDATE())");
		// Actualiza la columna tiempo_para_atencion con la diferencia de tiempo
		$this->db->set('tiempo_para_atencion', 'SEC_TO_TIME(TIMESTAMPDIFF(SECOND, fecha, fecha_atendida))', FALSE);
		$this->db->where('id_categoria', $id_categoria);
		$this->db->update('cola');

		// Obtener el último ticket atendido y la categoría correspondiente
		$this->db->select('num_actual, categoria')
		->from('cola')
		->join('categorias', 'cola.id_categoria = categorias.id')
		->where('id_categoria', $id_categoria)
		->order_by('fecha_atendida', 'DESC')
		->limit(1);
		$result = $this->db->get()->row();

		$ticketNumber = $result->num_actual;
		$categoryName = $result->categoria;

		// Escribir en el archivo temporal
		$message = "Actualizar pantalla|$ticketNumber|$categoryName";
		$filePath = 'C:\\app\\serviturno\\imagenologia\\websocket\\temp_message.txt';
		file_put_contents($filePath, $message);
	}




	// Obtenemos el numero de ticket maximo de cada categoria activas
	public function obtener_categorias()
	{
		$this->db->select('c1.num_actual, c1.fecha, c1.atendida, categorias.categoria, categorias.id');
		$this->db->select('(SELECT Count(c3.id) FROM cola AS c3 WHERE c3.id_categoria = categorias.id AND DATE(c3.fecha) = CURDATE() AND (c3.atendida IS null or (c3.num_actual = 1 and c3.atendida IS null))) as restantes', false)
			->where('activa', 1)
			->join('(SELECT * FROM cola WHERE id IN (SELECT MAX(id) FROM cola WHERE DATE(fecha) = CURDATE() AND atendida = 1 GROUP BY id_categoria)) AS c1', 'c1.id_categoria = categorias.id', 'LEFT', FALSE)
			->order_by('categorias.categoria');
		return $this->db->get('categorias')->result();
	}
}
