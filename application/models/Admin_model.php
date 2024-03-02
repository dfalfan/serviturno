<?php


defined('BASEPATH') or exit('No direct script access allowed');
class Admin_model extends CI_Model
{
	public function __construct()
	{

		// Call the CI_Model constructor
		parent::__construct();
	}
	public function obtener_categorias()
	{
		$this->db->order_by('categoria');
		$query = $this->db->get('categorias');

		return $query->result();
	}
	public function eliminar_categoria($id)
	{
		$this->db->where('id', $id);
		$this->db->delete('categorias');
	}
	public function agregar_categoria($categoria)
	{
		$this->db->set('categoria', $categoria);
		$this->db->insert('categorias');
	}
	public function toggle_categoria($id)
	{
		$this->db->query("CALL toggle_categoria($id)");
	}
	public function reiniciar_cola($id_categoria)
	{
		$this->db->where("id_categoria", $id_categoria);
		$this->db->delete("cola");
	}

	public function reiniciar_cola_del_dia()
	{
		$this->db->where("DATE(fecha) = CURDATE()");
		$this->db->delete("cola");
	}

	public function reiniciar_todas()
	{
		// Eliminar todos los registros de la tabla cola_tipo
		$this->db->empty_table("cola_tipo");

		// Eliminar todos los registros de la tabla cola
		$this->db->empty_table("cola");
	}

}