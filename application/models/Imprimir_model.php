<?php

defined('BASEPATH') or exit('No direct script access allowed');
class Imprimir_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
	}

	public function obtener_ultimo_ticket($id_categoria)
	{
		$this->db->select_max('num_actual');
		$this->db->where('id_categoria', $id_categoria);
		$this->db->where('DATE(fecha)', 'CURDATE()', FALSE); // Agregar esta línea
		$query = $this->db->get('cola');
		if ($query->num_rows() > 0) {
			$row = $query->row();
			return $row->num_actual;
		} else {
			return 0;
		}
	}

	function getWebSocketWorker()
	{
		global $ws_worker;
		return $ws_worker;
	}



	public function agregar_cola($id_categoria, $admision, $nombre, $ps, $estudios, $cedula, $seguro, $empresa, $edad)
	{


	
		// Filtrar los tipos de estudio que pertenecen a la categoría seleccionada
		$estudiosFiltrados = [];
		foreach ($estudios as $estudio) {
			$this->db->select('id');
			$this->db->from('tipo_estudio');
			$this->db->where('name', $estudio['tipo']);
			$this->db->like('id_categoria', $id_categoria, 'both'); // Filtrar por categoría
			$query_tipo = $this->db->get();
			if ($query_tipo->num_rows() > 0) {
				$estudiosFiltrados[] = $estudio;
			}
		}

		// Verificar si hay tipos de estudio válidos para la categoría
		if (empty($estudiosFiltrados)) {
			log_message('error', 'No hay tipos de estudio válidos para la categoría seleccionada.');
			return false; // O manejar el error de otra forma
		}
		
		// Insertar en cola
		$data = array(
			'id_categoria' => $id_categoria,
			'admision' => $admision,
			'paciente' => $nombre,
			'ps' => $ps,
			'num_actual' => $this->obtener_ultimo_ticket($id_categoria) + 1,
			'cedula' => $cedula,
			'seguro' => $seguro,
			'empresa' => $empresa,
			'edad' => $edad
		);
	
		$this->db->insert('cola', $data);
		$cola_id = $this->db->insert_id();
	
		if (!$cola_id) {
			log_message('error', 'Fallo al insertar en cola. No se obtuvo un ID válido.');
			return false;
		}

		// Inserción en cola_tipo
		$this->db->trans_start();
		foreach ($estudiosFiltrados as $estudio) {
			$this->db->where('name', $estudio['tipo']);
			$query = $this->db->get('tipo_estudio');
			$tipo_id = 0;

			if ($query->num_rows() > 0) {
				$tipo_row = $query->row();
				$tipo_id = $tipo_row->id;

				$detalle = $estudio['detalle'];
				$this->db->insert('cola_tipo',
					['cola_id' => $cola_id, 'tipo_estudio_id' => $tipo_id, 'detalle' => $detalle]
				);

				if ($this->db->affected_rows() == 0) {
					log_message('error',
						"Fallo al insertar el tipo '{$estudio['tipo']}' con detalle '{$detalle}' en cola_tipo"
					);
				}
			}
		}
		$this->db->trans_complete();
	
		if ($this->db->trans_status() === FALSE) {
			log_message('error', 'Transacción fallida en agregar_cola');
			return false;
		}
	
		// Obtener y devolver resultado
		$this->db->select('categorias.categoria, cola.fecha, cola.num_actual, cola.paciente')
				 ->join('categorias', 'cola.id_categoria = categorias.id')
				 ->where('cola.id', $cola_id);
		$result = $this->db->get('cola')->row();
	
		// Notificación
		$filePath = 'C:\\app\\serviturno\\imagenologia\\websocket\\temp_message.txt';
		file_put_contents($filePath, 'Nuevo ticket impreso');
	
		return $result;
	}

	
	

	public function obtener_categorias()
	{
		$this->db->select('c1.num_actual, c1.fecha, c1.atendida, categorias.categoria, categorias.id')
			->where('activa', 1)
			->where('c2.id', null)
			->join('cola AS c2', 'c1.id_categoria = c2.id_categoria AND c1.id < c2.id', 'LEFT')
			->join('categorias', 'c1.id_categoria = categorias.id', 'RIGHT')
			->order_by('categorias.categoria');
		return $this->db->get('cola AS c1')->result();
	}
}

