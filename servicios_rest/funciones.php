<?php
require 'config_bd.php';

function seguridad()
{
    $respuesta = -3;
    if (isset($_SESSION["usuario"]) && isset($_SESSION["clave"])  && isset($_SESSION["ultimo_acceso"])) {
        if (time() - $_SESSION["ultimo_acceso"] > 60 * $_SESSION["tiempo_inact"]) {
            $respuesta = -1;
        } else {
            $conexion = conectar();
            if (!$conexion)
                $respuesta = array("error" => "Imposible conectar. Error número: " . mysqli_connect_errno() . ":" . mysqli_connect_error());
            else {
                mysqli_set_charset($conexion, 'utf8');
                $consulta = "SELECT * FROM usuarios WHERE usuario='" . $_SESSION["usuario"] . "' AND clave='" . $_SESSION["clave"] . "'";
                $resultado = mysqli_query($conexion, $consulta);
                if (!$resultado) {
                    $respuesta = array("error" => "Imposible realizar la consulta. Error n&uacute;mero " . mysqli_errno($conexion) . ": " . mysqli_error($conexion));
                } else {

                    if (mysqli_num_rows($resultado) > 0) {
                        $_SESSION["ultimo_acceso"] = time();
                        $respuesta = array("usuario" => mysqli_fetch_assoc($resultado));
                    } else {
                        $respuesta = -2;
                    }
                    mysqli_free_result($resultado);
                    mysqli_close($conexion);
                }
            }
        }
    }
    return $respuesta;
}

function conectar()
{
    @$con = mysqli_connect(SERVIDOR_BD, USUARIO_BD, CLAVE_BD, NOMBRE_BD);
    return $con;
}


function login_usuario($datos)
{
    $conexion = conectar();
    if (!$conexion) {
        $respuesta = array('error' => 'Imposible conectar. Error número: ' . mysqli_connect_errno() . ':' . mysqli_connect_error());
    } else {
        mysqli_set_charset($conexion, "utf8");
        $consulta = 'select * from usuarios where usuario=? and clave=?';
        $sentencia = mysqli_stmt_init($conexion);
        if ($sentencia = mysqli_prepare($conexion, $consulta)) {
            mysqli_stmt_bind_param($sentencia, 'ss', $datos['usuario'], $datos['clave']);
            mysqli_stmt_execute($sentencia);
            $resultado = mysqli_stmt_get_result($sentencia);
            mysqli_stmt_close($sentencia);
            if ($resultado) {
                if (mysqli_num_rows($resultado) > 0) {
                    $respuesta = array('usuario' => mysqli_fetch_assoc($resultado));
                    $_SESSION["usuario"] = $datos["usuario"];
                    $_SESSION["clave"] = $datos["clave"];
                    $_SESSION["ultimo_acceso"] = time();
                    $_SESSION["tiempo_inact"] = $datos["tiempo"];
                } else
                    $respuesta = array('mensaje' => 'El usuario no se encuentra registrado en la BD');
                mysqli_free_result($resultado);
            } else
                $respuesta = array('error' => 'Imposible realizar la consulta. Error n&uacute;mero ' . mysqli_errno($conexion) . ': ' . mysqli_error($conexion));
        } else
            $respuesta = array('error' => 'Imposible preparar la consulta. Error n&uacute;mero ' . mysqli_errno($conexion) . ': ' . mysqli_error($conexion));
        mysqli_close($conexion);
    }
    return $respuesta;
}

function horario_usuario($id_usuario)
{
    $conexion = conectar();
    if (!$conexion) {
        $respuesta = array("error" => "Imposible conectar. Error número: " . mysqli_connect_errno() . ":" . mysqli_connect_error());
    } else {
        mysqli_set_charset($conexion, "utf8");
        $consulta = 'select * from horario where usuario=' . $id_usuario;
        $resultado = mysqli_query($conexion, $consulta);
        if (!$resultado) {
            $respuesta = array("error" => "Imposible realizar la consulta. Error n&uacute;mero " . mysqli_errno($conexion) . ": " . mysqli_error($conexion));
        } else {
            $i = 0;
            while ($fila = mysqli_fetch_assoc($resultado)) {
                $datos[$i] = $fila;
                $i++;
            }
            mysqli_free_result($resultado);
            $respuesta["horario"] = $datos;
            $respuesta["n_horario"] = $i;
        }
        mysqli_close($conexion);
    }
    return $respuesta;
}

function obtener_profesorado($fecha, $dia)
{
    $conexion = conectar();
    if (!$conexion) {
        $respuesta = array("error" => "Imposible conectar. Error número: " . mysqli_connect_errno() . ":" . mysqli_connect_error());
    } else {
        mysqli_set_charset($conexion, "utf8");
        $consulta = "select usuarios.id_usuario, usuarios.nombre, horario.dia from usuarios join horario on usuarios.id_usuario = horario.usuario where not exists (select * from ausencias where ausencias.usuario = usuarios.id_usuario and fecha ='" . $fecha . "') and dia=" . $dia;
        $resultado = mysqli_query($conexion, $consulta);
        if (!$resultado) {
            $respuesta = array("error" => "Imposible realizar la consulta. Error n&uacute;mero " . mysqli_errno($conexion) . ": " . mysqli_error($conexion));
        } else {
            $i = 0;
            while ($fila = mysqli_fetch_assoc($resultado)) {
                $productos[$i] = $fila;
                $i++;
            }
            mysqli_free_result($resultado);
            $respuesta["profesorado"] = $productos;
        }
        mysqli_close($conexion);
    }
    return $respuesta;
}

function obtener_profesorado_ausente($fecha)
{
    $conexion = conectar();
    if (!$conexion) {
        $respuesta = array("error" => "Imposible conectar. Error número: " . mysqli_connect_errno() . ":" . mysqli_connect_error());
    } else {
        mysqli_set_charset($conexion, "utf8");
        $consulta = 'SELECT usuarios.nombre, ausencias.usuario, ausencias.id_ausencia from usuarios join ausencias on ausencias.usuario = usuarios.id_usuario and fecha="' . $fecha . '"';
        $resultado = mysqli_query($conexion, $consulta);
        if (!$resultado) {
            $respuesta = array("error" => "Imposible realizar la consulta. Error n&uacute;mero " . mysqli_errno($conexion) . ": " . mysqli_error($conexion));
        } else {
            $i = 0;
            while ($fila = mysqli_fetch_assoc($resultado)) {
                $productos[$i] = $fila;
                $i++;
            }
            mysqli_free_result($resultado);
            $respuesta["profesorado"] = $productos;
        }
        mysqli_close($conexion);
    }
    return $respuesta;
}

function insertar_ausente($usuario, $fecha)
{
    $conexion = conectar();
    if (!$conexion) {
        $respuesta = array("error" => "Imposible conectar. Error número: " . mysqli_connect_errno() . ":" . mysqli_connect_error());
    } else {
        mysqli_set_charset($conexion, "utf8");
        $consulta = "insert into ausencias (usuario, fecha) values (" .  $usuario . ",'" . $fecha . "')";
        $resultado = mysqli_query($conexion, $consulta);
        if (!$resultado) {
            $error = "Imposible realizar la consulta. Error número " . mysqli_errno($conexion) . ": " . mysqli_error($conexion);
            mysqli_close($conexion);
            $respuesta = array("error" => $error);
        } else {
            $respuesta = array("mensaje" => "El usuario " . $usuario . " se ha movido correctamente");
        }
    }
    return $respuesta;
}

function borrar_profesor_ausente($id_usuario)
{
    $conexion = conectar();
    if (!$conexion) {
        $respuesta = array("error" => "Imposible conectar. Error número: " . mysqli_connect_errno() . ":" . mysqli_connect_error());
    } else {
        mysqli_set_charset($conexion, "utf8");
        $consulta = "delete from ausencias where id_ausencia='" . $id_usuario . "'";
        $resultado = mysqli_query($conexion, $consulta);
        if (!$resultado) {
            $respuesta = array("error" => "Imposible realizar la consulta. Error n&uacute;mero " . mysqli_errno($conexion) . ": " . mysqli_error($conexion));
        } else {
            $respuesta = array("mensaje" => "El producto " . $id_usuario . " se ha borrado correctamente");
        }
        mysqli_close($conexion);
    }
    return $respuesta;
}

function obtener_profesor_dia($dia)
{
    $conexion = conectar();
    if (!$conexion) {
        $respuesta = array("error" => "Imposible conectar. Error número: " . mysqli_connect_errno() . ":" . mysqli_connect_error());
    } else {
        mysqli_set_charset($conexion, "utf8");
        $consulta = 'SELECT usuarios.nombre, usuarios.id_usuario, horario.dia, horario.hora, horario.grupo, horario.aula from usuarios join horario on horario.usuario = usuarios.id_usuario and horario.dia="' . $dia . '"';
        $resultado = mysqli_query($conexion, $consulta);
        if (!$resultado) {
            $respuesta = array("error" => "Imposible realizar la consulta. Error n&uacute;mero " . mysqli_errno($conexion) . ": " . mysqli_error($conexion));
        } else {
            $i = 0;
            while ($fila = mysqli_fetch_assoc($resultado)) {
                $productos[$i] = $fila;
                $i++;
            }
            mysqli_free_result($resultado);
            $respuesta["profesorado"] = $productos;
        }
        mysqli_close($conexion);
    }
    return $respuesta;
}