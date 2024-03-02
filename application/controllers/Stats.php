<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Stats extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('stats_model');
    }

    public function index()
    {
        // Aquí puedes cargar tu vista 'stats'
        $this->load->view('stats');
    }

    public function obtenerCategorias()
    {
        $categorias = $this->stats_model->obtenerCategorias();
        echo json_encode($categorias);
    }



    // Esta función podría devolver el tiempo de atención promedio para un rango de fechas dado
    public function obtenerPromedioTiempoAtencion()
    {
        $fechaInicio = $this->input->get('fechaInicio');
        $fechaFin = $this->input->get('fechaFin');
        $categoria = $this->input->get('categoria');
        $timeRange = $this->input->get('timeRange'); // Agrega esta línea para obtener el rango de tiempo

        // Si la categoría es "all", obtén el promedio de tiempo de atención para todas las categorías
        if ($categoria == "all") {
            $promedioTiempoAtencion = $this->stats_model->obtenerPromedioTiempoAtencion($fechaInicio, $fechaFin, $timeRange); // Agrega $timeRange aquí
        } else {
            // De lo contrario, obtén el promedio de tiempo de atención solo para la categoría seleccionada
            $promedioTiempoAtencion = $this->stats_model->obtenerPromedioTiempoAtencionPorCategoria($fechaInicio, $fechaFin, $categoria, $timeRange); // Y aquí
        }

        echo json_encode($promedioTiempoAtencion);
    }

    public function obtenerCantidadPacientes()
    {
        $fechaInicio = $this->input->get('fechaInicio');
        $fechaFin = $this->input->get('fechaFin');
        $categoria = $this->input->get('categoria');
        $timeRange = $this->input->get('timeRange');

        // Si la categoría es "all", obtén la cantidad de pacientes para todas las categorías
        if ($categoria == "all") {
            $cantidadPacientes = $this->stats_model->obtenerCantidadPacientes($fechaInicio, $fechaFin, $timeRange);
        } else {
            // De lo contrario, obtén la cantidad de pacientes solo para la categoría seleccionada
            $cantidadPacientes = $this->stats_model->obtenerCantidadPacientesPorCategoria($fechaInicio, $fechaFin, $categoria, $timeRange);
        }

        echo json_encode($cantidadPacientes);
    }



    public function obtenerCantidadPacientesUnicos()
    {
        $fechaInicio = $this->input->get('fechaInicio');
        $fechaFin = $this->input->get('fechaFin');
        $categoria = $this->input->get('categoria');
        $timeRange = $this->input->get('timeRange');

         if ($categoria == "all") {
            $cantidadPacientesUnicos = $this->stats_model->obtenerCantidadPacientesUnicos($fechaInicio, $fechaFin, $timeRange);
        } else {
            // De lo contrario, obtén la cantidad de pacientes solo para la categoría seleccionada
            $cantidadPacientesUnicos = $this->stats_model->obtenerCantidadPacientesUnicosPorCategoria($fechaInicio, $fechaFin, $categoria, $timeRange);
        }
        echo json_encode($cantidadPacientesUnicos);
    }



    public function obtenerTotalPacientesPorCategoria()
    {
        $fechaInicio = $this->input->get('fechaInicio');
        $fechaFin = $this->input->get('fechaFin');
        $timeRange = $this->input->get('timeRange');

        $totalPacientesPorCategoria = $this->stats_model->obtenerTotalPacientesPorCategoria($fechaInicio, $fechaFin, $timeRange);

        echo json_encode($totalPacientesPorCategoria);
    }

    public function obtenerTiempoEsperaPorCategoria()
    {
        $fechaInicio = $this->input->get('fechaInicio');
        $fechaFin = $this->input->get('fechaFin');
        $timeRange = $this->input->get('timeRange'); 

        $tiempoEsperaPorCategoria = $this->stats_model->obtenerTiempoEsperaPorCategoria($fechaInicio, $fechaFin, $timeRange);
        echo json_encode($tiempoEsperaPorCategoria);
    }


}