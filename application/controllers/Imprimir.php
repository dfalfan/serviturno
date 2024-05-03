<?php

defined('BASEPATH') or exit('No direct script access allowed');
class Imprimir extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		$this->load->model('imprimir_model');
		require_once('assets/escpos/escpos.php');
	}

	public function index()
	{
		$data['categorias'] = $this->imprimir_model->obtener_categorias();
		$this->load->view('imprimir', $data);
	}

	public function agregar_cola()
	{
		$id_categoria = $this->input->post('id_categoria');
		$numero_admision = $this->input->post('admision');

		// Conectar a la base de datos PostgreSQL
		$pgdb = $this->load->database('pg_database', TRUE);

		// Consulta principal
		$pgdb->select('c_order.c_doctype_id');
		$pgdb->from('adempiere.c_order');
		$pgdb->join('adempiere.c_bpartner', 'adempiere.c_bpartner.c_bpartner_id = adempiere.c_order.xx_insurance_id');
		$pgdb->where('issotrx', 'Y');
		$pgdb->where('c_order.xx_admission', $numero_admision);
		$pgdb->where('c_order.c_doctypetarget_id !=', 1000027);
		$pgdb->where('c_order.docstatus !=', 'VO');
		$query = $pgdb->get();

		$ps = 's';
		$c_doctype_id = '';

		if ($query->num_rows() > 0) {
			$row = $query->row();
			$c_doctype_id = $row->c_doctype_id;
			if ($c_doctype_id == 1000246) {
				$ps = 'p';
			}
		}

		// Consulta para obtener todos los estudios
		$pgdb->select('c.name as tipo, dp.name as detalleproducto');
		$pgdb->from('adempiere.c_order as a');
		$pgdb->join('adempiere.c_orderline as b', 'b.c_order_id = a.c_order_id AND b.isactive = \'Y\'', 'INNER');
		$pgdb->join('adempiere.m_product as c', 'c.m_product_id = b.m_product_id AND c.m_product_category_id = 1000160', 'INNER');
		$pgdb->join('adempiere.xx_m_detalleproducto as dp', 'dp.xx_m_detalleproducto_id = b.xx_m_detalleproducto_id', 'LEFT');
		$pgdb->where('a.xx_admission', $numero_admision);
		$pgdb->where('a.issotrx', 'Y');
		$pgdb->where('a.c_doctypetarget_id !=', 1000027);
		$pgdb->where('a.docstatus !=', 'VO');
		$query_tipos_pg = $pgdb->get();

		$estudios = [];
		foreach ($query_tipos_pg->result() as $row) {
			$estudios[] = ['tipo' => $row->tipo, 'detalle' => $row->detalleproducto];
		}


		log_message('debug', 'Estudios recuperados: ' . json_encode($estudios));
		echo json_encode(array('estudios' => $estudios));

		// Consulta para obtener los datos adicionales
		$pgdb->select('d.value AS cedula, seg.name AS seguro, emp.name AS empresa, d.birthday AS birthday');
		$pgdb->from('adempiere.c_order a');
		$pgdb->join('adempiere.c_orderline b', 'b.c_order_id = a.c_order_id');
		$pgdb->join('adempiere.m_product c', 'c.m_product_id = b.m_product_id');
		$pgdb->join('adempiere.c_bpartner d', 'd.c_bpartner_id = a.c_bpartner_id');
		$pgdb->join('adempiere.c_bpartner seg', 'seg.c_bpartner_id = a.xx_insurance_id');
		$pgdb->join('adempiere.c_bpartner emp', 'emp.c_bpartner_id = a.xx_company_id');
		$pgdb->where('c.m_product_category_id', 1000160);
		$pgdb->where('a.issotrx', 'Y');
		$pgdb->where('a.c_doctypetarget_id !=', 1000027);
		$pgdb->where('a.docstatus !=', 'VO');
		$pgdb->where('b.isactive', 'Y');
		$pgdb->where('a.xx_admission', $numero_admision);
		$query_additional = $pgdb->get();
		$row_additional = $query_additional->row();
		$cedula = $row_additional->cedula;
		$seguro = $row_additional->seguro;
		$empresa = $row_additional->empresa;
		$birthday = $row_additional->birthday;

		// Calcular la edad basada en la fecha de nacimiento
		$fecha_nacimiento = new DateTime($birthday);
		$fecha_actual = new DateTime();
		$edad = $fecha_nacimiento->diff($fecha_actual)->y; // Edad en años


		// Obtener el nombre del paciente 
		$pgdb->select('c_bpartner.name');
		$pgdb->from('adempiere.c_order');
		$pgdb->join('adempiere.c_bpartner', 'adempiere.c_order.c_bpartner_id = adempiere.c_bpartner.c_bpartner_id');
		$pgdb->where('adempiere.c_order.xx_admission', $numero_admision);
		$query = $pgdb->get();
		$row = $query->row();
		$nombre = $row->name;


		try {
			$ultimo_ticket = $this->imprimir_model->agregar_cola($id_categoria, $numero_admision, $nombre, $ps, $estudios, $cedula, $seguro, $empresa, $edad);

			$connector = new WindowsPrintConnector("smb://WSVLN01IM0X/receipt printer");
			$printer = new Escpos($connector);

			$logo = new EscposImage("assets/images/logo_ticket.png");
			$printer->setJustification(Escpos::JUSTIFY_CENTER);
			$printer->graphics($logo);
			$printer->selectPrintMode(Escpos::MODE_DOUBLE_WIDTH | Escpos::MODE_DOUBLE_HEIGHT | Escpos::MODE_EMPHASIZED);
			$printer->setEmphasis(true);

			if (isset($ultimo_ticket->num_actual)) {
				$printer->text("$ultimo_ticket->num_actual \n\n");
			}

			$printer->selectPrintMode();
			$printer->setReverseColors(false);
			$printer->selectPrintMode(Escpos::MODE_DOUBLE_WIDTH);

			if (isset($ultimo_ticket->categoria)) {
				$printer->text("$ultimo_ticket->categoria \n\n");
			}

			$printer->selectPrintMode();

			if (isset($ultimo_ticket->paciente)) {
				$printer->text("$ultimo_ticket->paciente \n\n");  // Imprimir el nombre del paciente
			}

			// Imprimir cada tipo de estudio
			foreach ($estudios as $estudio) {
				$printer->selectPrintMode();
				if (isset($estudio['tipo']) && isset($estudio['detalle'])) {
					$printer->text($estudio['tipo'] . ": " . $estudio['detalle'] . "\n");
				}
			}

			$printer->feed(1);

			if (isset($ultimo_ticket->fecha)) {
				$fecha_formateada = date("d-m-Y H:i:s", strtotime($ultimo_ticket->fecha));
				$printer->text("$fecha_formateada \n\n");
			}

			$printer->feed(1); // Añade un poco de espacio extra al final
			$printer->cut();
			$printer->close();
		} catch (Exception $e) {
			echo "La impresora no se encuentra o está desconectada. Error: " . $e->getMessage();
			return;
		}
	}

	function generar_imagen($numero)
	{
		$im = imagecreatetruecolor(60, 50);
		$black = imagecolorallocate($im, 0, 0, 0);
		$white = imagecolorallocate($im, 255, 255, 255);
		imagefilledrectangle($im, 0, 0, 220, 50, $white);
		$font_file = base_url() . 'assets/fonts/consola.ttf';
		imagefttext($im, 40, 0, 0, 45, $black, $font_file, $numero);
		header('Content-Type: image/png');
		return imagepng($im);
		imagedestroy($im);
	}
}
