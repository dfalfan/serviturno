<?php

use Workerman\Worker;

require_once __DIR__ . '/../vendor/autoload.php';

use Workerman\Lib\Timer;

$ws_worker = new Worker("websocket://0.0.0.0:8080");
$ws_worker->count = 4;

$filePath = 'C:\\app\\serviturno\\imagenologia\\websocket\\temp_message.txt';

$message = file_get_contents($filePath);

echo "Ruta del archivo: $filePath\n";



$ws_worker->onConnect = function ($connection) {
    $remoteAddress = $connection->getRemoteIp() . ':' . $connection->getRemotePort();
    echo "Nuevo cliente conectado: $remoteAddress. Total de conexiones: " . count($connection->worker->connections) . "\n";
};

$ws_worker->onClose = function ($connection) {
    $remoteAddress = $connection->getRemoteIp() . ':' . $connection->getRemotePort();
    echo "Cliente desconectado: $remoteAddress. Total de conexiones: " . count($connection->worker->connections) . "\n";
};


$ws_worker->onWorkerStart = function ($worker) use ($filePath) {
    // Timer para leer el archivo cada segundo
    Timer::add(1, function () use ($worker, $filePath) {
        if (file_exists($filePath)) {
            $message = file_get_contents($filePath);
            echo "Archivo leído con éxito: $filePath. Mensaje: $message\n"; // Loguear la lectura del archivo

            unlink($filePath); // Elimina el archivo después de leerlo
            echo "Archivo eliminado: $filePath\n"; // Loguear la eliminación del archivo

            if ($message) {
                foreach ($worker->connections as $connection) {
                    $connection->send($message);
                    echo "Mensaje enviado al cliente: $message\n"; // Loguear el envío del mensaje
                }
            }
        }
    });
};


Worker::runAll();
