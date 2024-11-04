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
        $this->tabla_model->actualizar_detalle_paciente($id_paciente, $detalle);
        echo json_encode(['success' => true]);
    }

    public function verificar_admision()
    {
        $admision = $this->input->post('admision');
        $id_categoria = $this->input->post('id_categoria');

        $existe_admision = $this->tabla_model->verificar_admision($admision, $id_categoria);

        echo json_encode(['existe' => $existe_admision]);
    }
    public function anular_ticket()
    {
        $id_ticket = $this->input->post('id');
        $this->tabla_model->anular_ticket($id_ticket);
        echo json_encode(['success' => true]);
    }

    public function obtener_detalle_paciente()
    {
        $id_paciente = $this->input->get('id');
        $data = $this->tabla_model->obtener_detalle_paciente($id_paciente);

        // Verificar si el ticket está anulado
        $data->anulado = ($data->atendida == '2');

        echo json_encode($data);
    }

    public function enlazar_estudio()
    {
        $estudio_id = $this->input->post('estudio_id');
        $study_instance_uid = $this->input->post('study_instance_uid');
        $study_description = $this->input->post('study_description');

        if (empty($study_instance_uid) || empty($study_description)) {
            echo json_encode(['success' => false, 'message' => 'No se ha seleccionado ningún estudio']);
            return;
        }

        $result = $this->tabla_model->enlazar_estudio($estudio_id, $study_instance_uid, $study_description);

        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al enlazar el estudio']);
        }
    }

    public function verificar_medico_informante() {
        $admission_id = $this->input->get('admission_id');
        
        $this->load->model('tabla_model');
        $medico = $this->tabla_model->obtener_medico_informante($admission_id);
        
        header('Content-Type: application/json');
        echo json_encode([
            'medico_informante' => $medico
        ]);
    }

    public function ver_pdf()
    {
        $ruta = $this->input->get('ruta');
        
        // Validar que la ruta comience con la ruta base permitida
        $ruta_base = '\\\\192.168.5.12\\dicom\\_pdf\\';
        if (strpos($ruta, $ruta_base) !== 0) {
            show_error('Acceso no autorizado', 403);
            return;
        }
        
        // Convertir la ruta de red a formato local si es necesario
        $ruta_local = str_replace('\\', '/', $ruta);
        
        if (file_exists($ruta_local)) {
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="' . basename($ruta_local) . '"');
            readfile($ruta_local);
        } else {
            show_404('El archivo PDF no fue encontrado');
        }
    }
}
