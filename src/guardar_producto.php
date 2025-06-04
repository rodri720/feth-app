<?php
// Guardar en una carpeta "uploads"
$targetDir = "uploads/";
$imagePaths = [];

// Subir cada imagen
foreach ($_FILES["productImages"]["tmp_name"] as $key => $tmpName) {
    $fileName = basename($_FILES["productImages"]["name"][$key]);
    $targetFile = $targetDir . uniqid() . "_" . $fileName;
    move_uploaded_file($tmpName, $targetFile);
    $imagePaths[] = $targetFile;
}

// Guardar datos en JSON (simulación de BD)
$producto = [
    "title" => $_POST["productTitle"],
    "description" => $_POST["productDescription"],
    "price" => $_POST["productPrice"],
    "category" => $_POST["productCategory"],
    "images" => $imagePaths,
    "timestamp" => date("Y-m-d H:i:s")
];

$jsonData = json_encode($producto, JSON_PRETTY_PRINT);
file_put_contents("productos.json", $jsonData, FILE_APPEND);

// Redirigir de vuelta al panel
header("Location: admin-panel.html?success=1");
?>