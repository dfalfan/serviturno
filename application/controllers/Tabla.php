<?php
defined('BASEPATH') or exit('No direct script access allowed');
class Tabla extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('tabla_model');
    }
    public function index()
    {
        $data['datos'] = $this->tabla_model->obtener_datos_tabla();
        $this->load->view('tabla', $data);
    }
    public function obtener_datos_por_fecha()
    {
        $date = $this->input->get('date');
        $data = $this->tabla_model->obtener_datos_por_fecha($date);
        echo json_encode($data);
    }
    public function obtener_datos_tabla_json()
    {
        $data = $this->tabla_model->obtener_datos_tabla();
        echo json_encode($data);
    }
    public function actualizar_tecnico()
    {
        $id_paciente = $this->input->post('id');
        $tecnico = $this->input->post('tecnico');
        $this->tabla_model->actualizar_tecnico($id_paciente, $tecnico);
        echo json_encode(['success' => true]);
    }
    public function obtener_tickets_no_llamados()
    {
        $data = $this->tabla_model->obtener_tickets_no_llamados();
        echo json_encode($data);
    }
    public function actualizar_detalle_paciente()
    {
        $id_paciente = $this->input->post('id');
        $detalle = $this->input->post('detalle');
        echo json_encode(['id_paciente' => $id_paciente, 'detalle' => $detalle]);
        $this->load->model('Tabla_model');
        $this->Tabla_model->actualizar_detalle_paciente($id_paciente, $detalle);
        echo json_encode(['success' => true]);
    }

    public function verificar_admision()
    {
        $admision = $this->input->post('admision');
        $id_categoria = $this->input->post('id_categoria');

        $existe_admision = $this->tabla_model->verificar_admision($admision, $id_categoria);

        echo json_encode(['existe' => $existe_admision]);
    }

    public function obtener_detalle_paciente()
    {
        $id_paciente = $this->input->get('id');
        $data = $this->tabla_model->obtener_detalle_paciente($id_paciente);
        echo json_encode($data);
    }
}
