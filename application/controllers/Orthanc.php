<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Orthanc extends CI_Controller {

    public function find_studies() {
        // Obtener los datos POST
        $post_data = json_decode(file_get_contents('php://input'), true);

        // URL de la API de Orthanc
        $url = 'http://192.168.5.21:8042/tools/find';

        // Inicializar cURL
        $ch = curl_init($url);

        // Configurar opciones de cURL
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post_data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        // Ejecutar la solicitud y obtener la respuesta
        $response = curl_exec($ch);

        // Verificar si hubo errores
        if(curl_errno($ch)){
            echo 'Error:' . curl_error($ch);
        }

        // Cerrar la sesión cURL
        curl_close($ch);

        // Enviar la respuesta al cliente
        $this->output
            ->set_content_type('application/json')
            ->set_output($response);
    }
}
