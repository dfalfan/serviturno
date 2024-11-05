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

    public function obtenerRendimientoTecnicos($fechaInicio, $fechaFin, $timeRange)
    {
        $query = "
        SELECT 
            COALESCE(c.tecnico, 'Sin asignar') as tecnico,
            cat.categoria,
            COUNT(*) as estudios_realizados,
            DATE_FORMAT(c.fecha, '%Y-%m') as periodo
        FROM cola c
        JOIN categorias cat ON c.id_categoria = cat.id
        WHERE DATE(c.fecha) BETWEEN ? AND ?
        AND c.tecnico IS NOT NULL
        AND c.atendida = 1
        GROUP BY c.tecnico, cat.categoria, DATE_FORMAT(c.fecha, '%Y-%m')
        ORDER BY 
            c.tecnico ASC,
            cat.categoria ASC,
            periodo DESC
        ";

        $result = $this->db->query($query, array($fechaInicio, $fechaFin))->result();
        return $result;
    }

    public function obtenerDistribucionEdad($fechaInicio, $fechaFin, $timeRange)
    {
        $query = "
        SELECT 
            CASE 
                WHEN edad < 18 THEN 'Menor de 18'
                WHEN edad BETWEEN 18 AND 30 THEN '18-30'
                WHEN edad BETWEEN 31 AND 50 THEN '31-50'
                WHEN edad BETWEEN 51 AND 70 THEN '51-70'
                ELSE 'Mayor de 70'
            END as rango_edad,
            COUNT(*) as cantidad,
            cat.categoria
        FROM cola c
        JOIN categorias cat ON c.id_categoria = cat.id
        WHERE DATE(c.fecha) BETWEEN ? AND ?
        AND c.edad IS NOT NULL
        GROUP BY 
            CASE 
                WHEN edad < 18 THEN 'Menor de 18'
                WHEN edad BETWEEN 18 AND 30 THEN '18-30'
                WHEN edad BETWEEN 31 AND 50 THEN '31-50'
                WHEN edad BETWEEN 51 AND 70 THEN '51-70'
                ELSE 'Mayor de 70'
            END,
            cat.categoria
        ORDER BY rango_edad";

        return $this->db->query($query, array($fechaInicio, $fechaFin))->result();
    }

    public function obtenerDistribucionSeguro($fechaInicio, $fechaFin, $timeRange)
    {
        $query = "
        SELECT 
            COALESCE(c.seguro, 'Sin especificar') as seguro,
            COUNT(*) as cantidad,
            cat.categoria
        FROM cola c
        JOIN categorias cat ON c.id_categoria = cat.id
        WHERE DATE(c.fecha) BETWEEN ? AND ?
        GROUP BY c.seguro, cat.categoria
        ORDER BY cantidad DESC";

        return $this->db->query($query, array($fechaInicio, $fechaFin))->result();
    }

    public function obtenerPatronesUso($fechaInicio, $fechaFin, $timeRange)
    {
        $query = "
        SELECT 
            HOUR(c.fecha) as hora_dia,
            DAYNAME(c.fecha) as dia_semana,
            COUNT(*) as cantidad,
            cat.categoria
        FROM cola c
        JOIN categorias cat ON c.id_categoria = cat.id
        WHERE DATE(c.fecha) BETWEEN ? AND ?
        GROUP BY HOUR(c.fecha), DAYNAME(c.fecha), cat.categoria
        ORDER BY DAYOFWEEK(c.fecha), HOUR(c.fecha)";

        return $this->db->query($query, array($fechaInicio, $fechaFin))->result();
    }

}
