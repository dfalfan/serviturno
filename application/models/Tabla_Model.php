<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Tabla_model extends CI_Model
{
    public function __construct()
    {
        // Call the CI_Model constructor
        parent::__construct();
    }

    public function obtener_datos_tabla()
    {
        $query = "
    SELECT 
        cola.id AS id,
        categorias.categoria AS especialidad, 
        cola.num_actual AS ticket, 
        GROUP_CONCAT(CONCAT(tipo_estudio.name, ' ', COALESCE(cola_tipo.detalle, '')) SEPARATOR ', ') as tipo,  
        GROUP_CONCAT(cola_tipo.study_instance_uid) as study_instance_uids,
        GROUP_CONCAT(cola_tipo.estudio_informado) as estudios_informados,
        GROUP_CONCAT(cola_tipo.guardado) as estudios_guardados,
        GROUP_CONCAT(cola_tipo.procesado) as estudios_procesados,
        cola.fecha AS hora_de_impresion, 
        cola.fecha_atendida AS hora_de_llamado, 
        TIMEDIFF(cola.fecha_atendida, cola.fecha) AS tiempo_para_atencion,
        cola.admision AS admision,
        cola.paciente AS paciente,
        cola.ps AS ps,
        cola.tecnico AS tecnico,
        cola.atendida AS atendida,
        cola.detalle AS detalle,
        cola.cedula AS cedula,
        IF(
            (cola.id_categoria IN (48, 49) AND cola.atendida IS NULL) 
            OR 
            (cola.num_actual = first_not_attended.min_ticket_not_attended),
            1, 
            0
          ) AS mostrar_llamar
    FROM 
        cola
    JOIN 
        categorias ON cola.id_categoria = categorias.id
    LEFT JOIN 
        cola_tipo ON cola.id = cola_tipo.cola_id  
    LEFT JOIN 
        tipo_estudio ON cola_tipo.tipo_estudio_id = tipo_estudio.id  
    LEFT JOIN (
        SELECT categorias.categoria, MIN(cola.num_actual) AS min_ticket_not_attended
        FROM cola
        JOIN categorias ON cola.id_categoria = categorias.id
        WHERE DATE(cola.fecha) = CURDATE() AND cola.atendida IS NULL
        GROUP BY categorias.categoria
    ) AS first_not_attended
    ON categorias.categoria = first_not_attended.categoria
    WHERE 
        DATE(cola.fecha) = CURDATE()   
    GROUP BY 
        cola.id 
    ORDER BY 
        categorias.categoria, cola.num_actual
    ";
        return $this->db->query($query)->result();
    }

    public function obtener_resumen_tickets()
    {
        $query = "
    SELECT 
        categorias.categoria AS especialidad,
        COUNT(cola.id) AS total_tickets,
        COUNT(DISTINCT cola.cedula) AS pacientes_unicos,
        SUM(CASE WHEN cola.atendida IS NULL THEN 1 ELSE 0 END) AS tickets_no_llamados
    FROM 
        cola
    JOIN 
        categorias ON cola.id_categoria = categorias.id
    WHERE 
        DATE(cola.fecha) = CURDATE()
    GROUP BY 
        categorias.categoria
    ";

        return $this->db->query($query)->result();
    }

    public function obtener_tickets_no_llamados()
    {
        $query = "
    SELECT 
        categorias.categoria AS especialidad,
        COUNT(cola.id) AS tickets_no_llamados
    FROM 
        cola
    JOIN 
        categorias ON cola.id_categoria = categorias.id
    WHERE 
        DATE(cola.fecha) = CURDATE() AND cola.atendida IS NULL
    GROUP BY 
        categorias.categoria
    ";

        return $this->db->query($query)->result();
    }


    public function actualizar_tecnico($id_paciente, $tecnico)
    {
        $this->db->where('id', $id_paciente);
        $this->db->update('cola', ['tecnico' => $tecnico]);
    }

    public function actualizar_detalle_paciente($id_paciente, $detalle)
    {
        $this->db->where('id', $id_paciente);
        $result = $this->db->update('cola', ['detalle' => $detalle]);

        // Puedes verificar si la actualización fue exitosa
        if (!$result) {
            // Manejar el error aquí
            log_message('error', 'Error al actualizar el detalle del paciente: ' . $this->db->error());
            return false;
        }

        // Notificar a los clientes escribiendo en el archivo temporal
        $filePath = 'C:\\app\\serviturno\\imagenologia\\websocket\\temp_message.txt';
        file_put_contents($filePath, 'Actualizar detalle');

        return true;
    }

    public function obtener_detalle_paciente($id_paciente)
    {
        $query = "
    SELECT 
        cola.id AS cola_id,
        cola.num_actual AS ticket, 
        cola.fecha AS hora_de_impresion, 
        cola.fecha_atendida AS hora_de_llamado, 
        cola.tiempo_para_atencion AS tiempo_para_atencion, 
        categorias.categoria AS especialidad, 
        cola.admision AS admision,
        cola.atendida AS atendida,
        cola.paciente AS paciente,
        cola.detalle AS detalle,
        cola.cedula AS cedula,
        cola.seguro AS seguro,
        cola.edad AS edad,   
        cola.empresa AS empresa, 
        cola.informe AS informe, 
        CASE cola.ps 
            WHEN 'p' THEN 'Particular' 
            WHEN 's' THEN 'Seguro' 
            ELSE cola.ps 
        END AS ps,
        GROUP_CONCAT(
            CONCAT(
                tipo_estudio.name, '|',
                cola_tipo.estudio_id, '|',
                COALESCE(cola_tipo.study_instance_uid, ''), '|',
                COALESCE(cola_tipo.study_description, ''), '|',
                COALESCE(cola_tipo.detalle, ''), '|',
                COALESCE(cola_tipo.estudio_informado, '0'), '|',
                COALESCE(cola_tipo.ruta_estudio, '')
            ) SEPARATOR ';;'
        ) as subestudios
    FROM 
        cola
    JOIN 
        categorias ON cola.id_categoria = categorias.id
    LEFT JOIN 
        cola_tipo ON cola.id = cola_tipo.cola_id  
    LEFT JOIN 
        tipo_estudio ON cola_tipo.tipo_estudio_id = tipo_estudio.id
    WHERE 
        cola.id = ?
    GROUP BY 
        cola.id;
    ";

        return $this->db->query($query, array($id_paciente))->row();
    }

    public function verificar_admision($admision, $id_categoria)
    {
        $this->db->where('admision', $admision);
        $this->db->where('id_categoria', $id_categoria);
        $this->db->where('DATE(fecha)', date('Y-m-d')); // Verifica solo para la fecha actual
        $query = $this->db->get('cola');

        return $query->num_rows() > 0;
    }

    public function anular_ticket($id_ticket)
    {
        $this->db->where('id', $id_ticket);
        $this->db->update('cola', ['atendida' => '2']);
    }

    public function verificar_ticket_firmado($id_ticket)
    {
        $this->db->where('id', $id_ticket);
        $this->db->where('tecnico IS NOT NULL');
        $query = $this->db->get('cola');

        return $query->num_rows() > 0;
    }

    public function enlazar_estudio($estudio_id, $study_instance_uid, $study_description)
    {
        $data = array(
            'study_instance_uid' => $study_instance_uid,
            'study_description' => $study_description
        );

        $this->db->where('estudio_id', $estudio_id);
        $result = $this->db->update('cola_tipo', $data);

        if (!$result) {
            log_message('error', 'Error al enlazar el estudio: ' . $this->db->error());
            return false;
        }

        return true;
    }

    public function obtener_tipo_estudio_id($cola_id, $nombre_estudio)
    {
        $this->db->select('cola_tipo.tipo_estudio_id');
        $this->db->from('cola_tipo');
        $this->db->join('tipo_estudio', 'cola_tipo.tipo_estudio_id = tipo_estudio.id');
        $this->db->where('cola_tipo.cola_id', $cola_id);
        $this->db->where('tipo_estudio.name', $nombre_estudio);
        $query = $this->db->get();

        if ($query->num_rows() > 0) {
            return $query->row()->tipo_estudio_id;
        }

        return null;
    }
    public function obtener_datos_por_fecha($date)
    {
        $query = "
        SELECT 
            cola.id AS id,
            categorias.categoria AS especialidad, 
            cola.num_actual AS ticket, 
            GROUP_CONCAT(CONCAT(tipo_estudio.name, ' ', COALESCE(cola_tipo.detalle, '')) SEPARATOR ', ') as tipo,
            GROUP_CONCAT(cola_tipo.study_instance_uid) as study_instance_uids,
            GROUP_CONCAT(cola_tipo.estudio_informado) as estudios_informados,
            GROUP_CONCAT(cola_tipo.guardado) as estudios_guardados,
            GROUP_CONCAT(cola_tipo.procesado) as estudios_procesados,
            cola.fecha AS hora_de_impresion, 
            cola.fecha_atendida AS hora_de_llamado, 
            TIMEDIFF(cola.fecha_atendida, cola.fecha) AS tiempo_para_atencion,
            cola.admision AS admision,
            cola.paciente AS paciente,
            cola.ps AS ps,
            cola.tecnico AS tecnico,
            cola.atendida AS atendida,
            cola.detalle AS detalle,
            IF(
            (cola.id_categoria IN (48, 49) AND cola.atendida IS NULL) 
            OR 
            (cola.num_actual = min_tickets_not_called.min_ticket_not_called),
            1, 
            0
        ) AS mostrar_llamar
        FROM 
            cola
        JOIN 
            categorias ON cola.id_categoria = categorias.id
        LEFT JOIN 
            cola_tipo ON cola.id = cola_tipo.cola_id  
        LEFT JOIN 
            tipo_estudio ON cola_tipo.tipo_estudio_id = tipo_estudio.id
       LEFT JOIN (
    SELECT categorias.categoria, MIN(cola.num_actual) AS min_ticket_not_called
            FROM cola
            JOIN categorias ON cola.id_categoria = categorias.id
            WHERE DATE(cola.fecha) = ? AND cola.atendida IS NULL
            GROUP BY categorias.categoria
        ) AS min_tickets_not_called
       ON categorias.categoria = min_tickets_not_called.categoria AND cola.num_actual = min_tickets_not_called.min_ticket_not_called
        WHERE
            DATE(cola.fecha) = ?
        GROUP BY 
            cola.id 
        ORDER BY 
            categorias.categoria, cola.num_actual;

    ";

        $data = $this->db->query($query, array($date, $date))->result();
        return $data;
    }

    public function obtener_medico_informante($admission_id) {
        $this->db->select('medico_informante');
        $this->db->from('cola_tipo');
        $this->db->join('cola', 'cola.id = cola_tipo.cola_id');
        $this->db->where('cola.admision', $admission_id);
        $this->db->limit(1);
        
        $query = $this->db->get();
        $result = $query->row();
        
        return $result ? $result->medico_informante : null;
    }

}