<?php
$id_paciente = $_GET['id_paciente'];

// Conexión a la base de datos
$mysqli = new mysqli("localhost", "root", "prevaler", "serviturno_im");

// Verificar conexión
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$index = isset($_GET['index']) ? intval($_GET['index']) : 0;

// Preparar y ejecutar la consulta
$stmt = $mysqli->prepare("
    SELECT 
        cola.informe AS informe
    FROM 
        cola
    WHERE 
        cola.id = ?
    LIMIT 1
");
$stmt->bind_param('i', $id_paciente);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$path = $row['informe'];

// Reemplaza las barras invertidas con barras normales para evitar problemas en algunos servidores
$path = str_replace('\\', '/', $path);

$paths = explode(', ', $row['informe']);
$path = isset($paths[$index]) ? $paths[$index] : '';
$path = str_replace('\\', '/', $path);


if (file_exists($path)) {
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . basename($path) . '"');
    header('Content-Length: ' . filesize($path));
    readfile($path);
} else {
    echo 'Archivo no encontrado.';
}

// Cerrar la conexión
$mysqli->close();
