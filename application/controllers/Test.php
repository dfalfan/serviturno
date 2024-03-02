<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Test extends CI_Controller
{
    public function index()
    {
        // Cargamos la base de datos PostgreSQL
        $pg_db = $this->load->database('pg_database', TRUE);

        if ($pg_db->conn_id) {
            echo "¡Conexión exitosa a la base de datos PostgreSQL!";
        } else {
            echo "Error al conectar a la base de datos PostgreSQL.";
        }
    }
}
