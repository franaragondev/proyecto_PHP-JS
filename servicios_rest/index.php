<?php
session_name("servicios_login");
session_start();


require 'funciones.php';
require 'Slim/autoload.php';

$app = new \Slim\App;


$app->post('/login', function ($request) {
    $datos["usuario"] = $request->getParam("usuario");
    $datos["clave"] = $request->getParam("clave");
    $datos["tiempo"] = $request->getParam("tiempo");
    echo json_encode(login_usuario($datos), JSON_FORCE_OBJECT);
});

$app->get('/salir', function () {
    //Este servicio no se puede proteger por diseño de nuestra aplicación (salir_sin_salto)	
    session_destroy();
    echo json_encode(array("nada" => "nada"), JSON_FORCE_OBJECT);
});


$app->get('/logueado', function () {
    $seguridad = seguridad();
    if (is_array($seguridad))
        echo json_encode($seguridad, JSON_FORCE_OBJECT);
    else {
        if ($seguridad < -2)
            $devolver = array("no_logueado" => "No has hecho login");
        elseif ($seguridad < -1)
            $devolver = array("zona_rest" => "Zona Restringida");
        else
            $devolver = array("time" => "Su tiempo de sesión ha expirado");

        echo json_encode($devolver, JSON_FORCE_OBJECT);
    }
});

$app->get('/obtener_dia_hora/{id_usuario}', function ($request) {
    $seguridad = seguridad();
    if (is_array($seguridad) && isset($seguridad["usuario"]))
        echo json_encode(horario_usuario($request->getAttribute('id_usuario')), JSON_FORCE_OBJECT);
    else
        echo json_encode(array("no_login" => "No"), JSON_FORCE_OBJECT);
});

$app->get('/profesorado_no_ausente/{fecha}/{dia}', function ($request) {
    $seguridad = seguridad();
    if (is_array($seguridad) && isset($seguridad["usuario"]))
        echo json_encode(obtener_profesorado($request->getAttribute('fecha'), $request->getAttribute('dia')), JSON_FORCE_OBJECT);
    else
        echo json_encode(array("no_login" => "No"), JSON_FORCE_OBJECT);
});

$app->get('/profesorado_ausente/{fecha}', function ($request) {
    $seguridad = seguridad();
    if (is_array($seguridad) && isset($seguridad["usuario"]))
        echo json_encode(obtener_profesorado_ausente($request->getAttribute('fecha')), JSON_FORCE_OBJECT);
    else
        echo json_encode(array("no_login" => "No"), JSON_FORCE_OBJECT);
});


$app->get('/mover_a_ausente/{usuario}/{fecha}', function ($request) {
    $seguridad = seguridad();
    if (is_array($seguridad) && isset($seguridad["usuario"]))
        echo json_encode(insertar_ausente($request->getAttribute('usuario'), $request->getAttribute('fecha')), JSON_FORCE_OBJECT);
    else
        echo json_encode(array("no_login" => "No"), JSON_FORCE_OBJECT);
});

$app->delete('/profesor_ausente/borrar/{id_usuario}', function ($request) {
    $seguridad = seguridad();
    if (is_array($seguridad) && isset($seguridad["usuario"]))
        echo json_encode(borrar_profesor_ausente($request->getAttribute('id_usuario')), JSON_FORCE_OBJECT);
    else
        echo json_encode(array("no_login" => "No"), JSON_FORCE_OBJECT);
});

$app->get('/obtener_profesores_dia/{dia}', function ($request) {
    $seguridad = seguridad();
    if (is_array($seguridad) && isset($seguridad["usuario"]))
        echo json_encode(obtener_profesor_dia($request->getAttribute('dia')), JSON_FORCE_OBJECT);
    else
        echo json_encode(array("no_login" => "No"), JSON_FORCE_OBJECT);
});

// Una vez creado servicios los pongo a disposición

$app->run();