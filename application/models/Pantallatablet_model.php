<?php


defined('BASEPATH') or exit('No direct script access allowed');
class Pantalla_model extends CI_Model
{
	public function __construct()
	{

		// $this->output->enable_profiler(TRUE);
		// Call the CI_Model constructor
		parent::__construct();
	}

	public function obtener_categorias()
	{
		$this->db->select('MAX(c1.num_actual) as num_actual, c1.fecha, c1.atendida, categorias.categoria, categorias.id');
		$this->db->select('(SELECT Count(c3.id) FROM cola AS c3 WHERE c3.id_categoria = categorias.id AND DATE(c3.fecha) = CURDATE() AND c3.atendida = 1) as restantes', false)
			->where('activa', 1)
			->join('cola AS c1', 'c1.id_categoria = categorias.id and DATE(c1.fecha) = CURDATE() and c1.atendida = 1 ', 'LEFT', FALSE)
			->having('restantes >=', 1)
			->group_by('categorias.categoria')
			->order_by('categorias.categoria');
		return $this->db->get('categorias')->result();


	}


	public function fetch_data()
	{
		//$query = $this->db->get("cola");
		$query = $this->db->query("SELECT * FROM cola ORDER BY fecha_atendida DESC LIMIT 1");

		return $query;
	}



	public function fetch_categoria()
	{
		$query = $this->db->query("SELECT cola.*, categorias.categoria FROM cola INNER JOIN categorias ON cola.id_categoria = categorias.id ORDER BY fecha_atendida DESC LIMIT 1");

		return $query;
	}

}