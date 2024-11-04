<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Stats_model extends CI_Model
{
    private $table_cola = 'cola';
    private $table_categorias = 'categorias';

    public function __construct()
    {
        parent::__construct();
    }

    public function getDatos($params) {
        $this->db->trans_start();
        
        try {
            $query = $this->buildQuery($params);
            $result = $this->db->query($query, $params)->result();
            
            $this->db->trans_complete();
            
            if ($this->db->trans_status() === FALSE) {
                throw new Exception('Error en la transacción de base de datos');
            }
            
            return $this->processResults($result, $params['timeRange']);
            
        } catch (Exception $e) {
            $this->db->trans_rollback();
            log_message('error', 'Error en Stats_model: ' . $e->getMessage());
            throw $e;
        }
    }

    private function buildQuery($params) {
        // Usar Query Builder para consultas más seguras y mantenibles
        $this->db->select([
            $this->getDateFormat($params['timeRange']) . ' as fecha',
            'COUNT(*) as cantidad'
        ])
        ->from($this->table_cola)
        ->where('DATE(fecha) BETWEEN', $params['fechaInicio'])
        ->where('DATE(fecha) <=', $params['fechaFin']);

        if ($params['categoria'] !== 'all') {
            $this->db->where('id_categoria', $params['categoria']);
        }

        $this->db->group_by('fecha');
        
        return $this->db->get_compiled_select();
    }

    private function getDateFormat($timeRange) {
        switch ($timeRange) {
            case 'yearly':
                return 'DATE_FORMAT(fecha, "%Y-%m")';
            case 'monthly':
                return 'DATE(fecha)';
            case 'weekly':
                return 'DATE(fecha)';
            default:
                throw new Exception('Formato de fecha no válido');
        }
    }

    private function processResults($result, $timeRange) {
        switch ($timeRange) {
            case 'yearly':
                return $this->processYearlyResults($result);
            case 'monthly':
                return $this->processMonthlyResults($result);
            case 'weekly':
                return $this->processWeeklyResults($result);
            default:
                throw new Exception('Formato de tiempo no válido');
        }
    }

    private function processYearlyResults($result) {
        $data = [];
        foreach ($result as $row) {
            $data[] = [
                'fecha' => $row->fecha,
                'cantidad' => $row->cantidad
            ];
        }
        return $data;
    }

    private function processMonthlyResults($result) {
        $data = [];
        foreach ($result as $row) {
            $data[] = [
                'fecha' => $row->fecha,
                'cantidad' => $row->cantidad
            ];
        }
        return $data;
    }

    private function processWeeklyResults($result) {
        $data = [];
        foreach ($result as $row) {
            $data[] = [
                'fecha' => $row->fecha,
                'cantidad' => $row->cantidad
            ];
        }
        return $data;
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
