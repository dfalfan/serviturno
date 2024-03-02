<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Stats_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    public function obtenerCategorias()
    {
        $query = "SELECT * FROM categorias";
        $result = $this->db->query($query)->result();
        return $result;
    }

    public function obtenerPromedioTiempoAtencion($fechaInicio, $fechaFin, $timeRange)
    {
        if ($timeRange == "yearly") {
            $query = "
            SELECT DATE_FORMAT(cola.fecha, '%Y-%m') as fecha, 
            SEC_TO_TIME(AVG(TIME_TO_SEC(TIMEDIFF(cola.fecha_atendida, cola.fecha)))) AS promedio_tiempo_atencion
            FROM cola
            WHERE DATE(cola.fecha) BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(cola.fecha, '%Y-%m')
            ";
        } else { // monthly or weekly
            $query = "
            SELECT DATE(cola.fecha) as fecha, 
            SEC_TO_TIME(AVG(TIME_TO_SEC(TIMEDIFF(cola.fecha_atendida, cola.fecha)))) AS promedio_tiempo_atencion
            FROM cola
            WHERE DATE(cola.fecha) BETWEEN ? AND ?
            GROUP BY DATE(cola.fecha)
            ";
        }

        $result = $this->db->query($query, array($fechaInicio, $fechaFin))->result();
        return $result;
    }

    public function obtenerPromedioTiempoAtencionPorCategoria($fechaInicio, $fechaFin, $categoria, $timeRange)
    {
        if ($timeRange == "yearly") {
            $query = "
            SELECT DATE_FORMAT(cola.fecha, '%Y-%m') as fecha, 
            SEC_TO_TIME(AVG(TIME_TO_SEC(TIMEDIFF(cola.fecha_atendida, cola.fecha)))) AS promedio_tiempo_atencion
            FROM cola
            WHERE DATE(cola.fecha) BETWEEN ? AND ? AND cola.id_categoria = ?
            GROUP BY DATE_FORMAT(cola.fecha, '%Y-%m')
            ";
        } else { // monthly or weekly
            $query = "
            SELECT DATE(cola.fecha) as fecha, 
            SEC_TO_TIME(AVG(TIME_TO_SEC(TIMEDIFF(cola.fecha_atendida, cola.fecha)))) AS promedio_tiempo_atencion
            FROM cola
            WHERE DATE(cola.fecha) BETWEEN ? AND ? AND cola.id_categoria = ?
            GROUP BY DATE(cola.fecha)
            ";
        }

        $result = $this->db->query($query, array($fechaInicio, $fechaFin, $categoria))->result();
        return $result;
    }


    public function obtenerCantidadPacientes($fechaInicio, $fechaFin, $timeRange)
    {
        if ($timeRange == "yearly") {
            $query = "
            SELECT DATE_FORMAT(cola.fecha, '%Y-%m') as fecha, 
            COUNT(*) as cantidad_pacientes_unicos
            FROM cola
            WHERE DATE(cola.fecha) BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(cola.fecha, '%Y-%m')
        ";
        } else { // monthly or weekly
            $query = "
            SELECT DATE(cola.fecha) as fecha, 
            COUNT(*) as cantidad_pacientes_unicos
            FROM cola
            WHERE DATE(cola.fecha) BETWEEN ? AND ?
            GROUP BY DATE(cola.fecha)
        ";
        }

        $result = $this->db->query($query, array($fechaInicio, $fechaFin))->result();
        return $result;
    }



 
    public function obtenerCantidadPacientesPorCategoria($fechaInicio, $fechaFin, $categoria, $timeRange)
    {
        if ($timeRange == "yearly") {
            $query = "
        SELECT DATE_FORMAT(cola.fecha, '%Y-%m') as fecha, 
        COUNT(*) as cantidad_pacientes
        FROM cola
        WHERE DATE(cola.fecha) BETWEEN ? AND ? AND cola.id_categoria = ?
        GROUP BY DATE_FORMAT(cola.fecha, '%Y-%m')
        ";
        } else { // monthly or weekly
            $query = "
        SELECT DATE(cola.fecha) as fecha, 
        COUNT(*) as cantidad_pacientes
        FROM cola
        WHERE DATE(cola.fecha) BETWEEN ? AND ? AND cola.id_categoria = ?
        GROUP BY DATE(cola.fecha)
        ";
        }

        $result = $this->db->query($query, array($fechaInicio, $fechaFin, $categoria))->result();
        return $result;
    }

    public function obtenerCantidadPacientesUnicos($fechaInicio, $fechaFin, $timeRange)
    {
        if ($timeRange == "yearly") {
            $query = "
        SELECT DATE_FORMAT(cola.fecha, '%Y-%m') as fecha, 
        COUNT(DISTINCT cola.cedula) as cantidad_pacientes_unicos
        FROM cola
        WHERE DATE(cola.fecha) BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(cola.fecha, '%Y-%m')
        ";
        } else { // monthly or weekly
            $query = "
        SELECT DATE(cola.fecha) as fecha, 
        COUNT(DISTINCT cola.cedula) as cantidad_pacientes_unicos
        FROM cola
        WHERE DATE(cola.fecha) BETWEEN ? AND ?
        GROUP BY DATE(cola.fecha)
        ";
        }

        $result = $this->db->query($query, array($fechaInicio, $fechaFin))->result();
        return $result;
    }

    public function obtenerCantidadPacientesUnicosPorCategoria($fechaInicio, $fechaFin, $categoria, $timeRange)
    {
        if ($timeRange == "yearly") {
            $query = "
    SELECT DATE_FORMAT(cola.fecha, '%Y-%m') as fecha, 
    COUNT(DISTINCT cola.cedula) as cantidad_pacientes_unicos
    FROM cola
    WHERE DATE(cola.fecha) BETWEEN ? AND ? AND cola.id_categoria = ?
    GROUP BY DATE_FORMAT(cola.fecha, '%Y-%m')
    ";
        } else { // monthly or weekly
            $query = "
    SELECT DATE(cola.fecha) as fecha, 
    COUNT(DISTINCT cola.cedula) as cantidad_pacientes_unicos
    FROM cola
    WHERE DATE(cola.fecha) BETWEEN ? AND ? AND cola.id_categoria = ?
    GROUP BY DATE(cola.fecha)
    ";
        }

        $result = $this->db->query($query, array($fechaInicio, $fechaFin, $categoria))->result();
        return $result;
    }





    public function obtenerTotalPacientesPorCategoria($fechaInicio, $fechaFin, $timeRange)
    {
        if ($timeRange == "yearly") {
            $query = "
        SELECT categorias.categoria, COUNT(cola.id_categoria) as cantidad_pacientes
        FROM cola
        INNER JOIN categorias ON cola.id_categoria = categorias.id
        WHERE DATE(cola.fecha) BETWEEN ? AND ?
        GROUP BY categorias.categoria
        ";
        } else { // monthly or weekly
            $query = "
        SELECT categorias.categoria, COUNT(cola.id_categoria) as cantidad_pacientes
        FROM cola
        INNER JOIN categorias ON cola.id_categoria = categorias.id
        WHERE DATE(cola.fecha) BETWEEN ? AND ?
        GROUP BY categorias.categoria
        ";
        }

        $result = $this->db->query($query, array($fechaInicio, $fechaFin))->result();
        return $result;
    }

    public function obtenerTiempoEsperaPorCategoria($fechaInicio, $fechaFin, $timeRange)
    {
        if ($timeRange == "yearly") {
            $query = "
    SELECT categorias.categoria, 
    SEC_TO_TIME(AVG(TIME_TO_SEC(TIMEDIFF(cola.fecha_atendida, cola.fecha)))) AS promedio_tiempo_espera
    FROM cola
    INNER JOIN categorias ON cola.id_categoria = categorias.id
    WHERE DATE(cola.fecha) BETWEEN ? AND ?
    GROUP BY categorias.categoria
    ";
        } else { // monthly or weekly
            $query = "
    SELECT categorias.categoria, 
    SEC_TO_TIME(AVG(TIME_TO_SEC(TIMEDIFF(cola.fecha_atendida, cola.fecha)))) AS promedio_tiempo_espera
    FROM cola
    INNER JOIN categorias ON cola.id_categoria = categorias.id
    WHERE DATE(cola.fecha) BETWEEN ? AND ?
    GROUP BY categorias.categoria
    ";
        }

        $result = $this->db->query($query, array($fechaInicio, $fechaFin))->result();
        return $result;
    }


}
