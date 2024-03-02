<?php

class Project2 extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Project2_model');
    }

    public function index()
    {
        $this->load->view('project2');
    }

    public function obtener_detalle_paciente_por_cedula()
    {
        $cedula = $this->input->get('cedula');
        $data = $this->Project2_model->obtener_detalle_paciente_por_cedula($cedula);
        echo json_encode($data);
    }
}
