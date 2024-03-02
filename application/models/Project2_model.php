<?php

defined('BASEPATH') or exit('No direct script access allowed');

class Project2_model extends CI_Model
{

    public function obtener_detalle_paciente_por_cedula($cedula)
    {
        $query = "
    SELECT 
        cola.id AS id,
        cola.num_actual AS ticket, 
        cola.fecha AS hora_de_impresion, 
        cola.fecha_atendida AS hora_de_llamado, 
        cola.tiempo_para_atencion AS tiempo_para_atencion, 
        categorias.categoria AS especialidad, 
        cola.admision AS admision,
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
        GROUP_CONCAT(tipo_estudio.name SEPARATOR ', ') as tipo
    FROM 
        cola
    JOIN 
        categorias ON cola.id_categoria = categorias.id
    LEFT JOIN 
        cola_tipo ON cola.id = cola_tipo.cola_id  
    LEFT JOIN 
        tipo_estudio ON cola_tipo.tipo_estudio_id = tipo_estudio.id
    WHERE 
        cola.cedula = ?
    GROUP BY 
        cola.id;
    ";

        return $this->db->query($query, array($cedula))->row();
    }




}