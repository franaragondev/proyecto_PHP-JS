function crear_horas(hora) {
    var resultado = '';
    switch (hora) {
        case 1:
            resultado = '8:15 - 9:15';
            break;
        case 2:
            resultado = '9:15 - 10:15';
            break;
        case 3:
            resultado = '10:15 - 11:15';
            break;
        case 4:
            resultado = '11:15 - 11:45';
            break;
        case 5:
            resultado = '11:15 - 12:15';
            break;
        case 6:
            resultado = '11:45 - 12:45';
            break;
        case 7:
            resultado = '12:15 - 12:45';
            break;
        case 8:
            resultado = '12:45 - 13:45';
            break;
        case 9:
            resultado = '13:45 - 14:45';
            break;
        case 10: //CASO ESPECIAL ADMINISTRADOR
            resultado = '11:45 - 12:15';
            break;
    }
    return resultado;
}


function cargar_horario_normal(id_usuario) {

    $.ajax({
            url: DIR_SERV + '/obtener_dia_hora/' + id_usuario,
            type: "GET",
            // Formato de datos que se espera en la respuesta
            dataType: "json",
        })
        .done(function (data) {
            //done() es ejecutada cuándo se recibe la respuesta del servidor. response es el objeto JSON recibido
            if (data.no_login) {
                saltar_a("index.html");
            } else {
                var output = "";
                if (data.horario) {
                    output += "<table>";
                    output += "<tr><th></th><th>Lunes</th><th>Martes</th><th>Miércoles</th><th>Jueves</th><th>Viernes</th></tr>";
                    for (var i = 1; i <= 9; i++) {
                        if (i == 4 || i == 7) {
                            output += "<tr style='background-color: #F6ED69;'><td>" + crear_horas(i) + "</td><td colspan='5'>RECREO</td></tr>";
                            i++;
                        }
                        output += '<tr  style="background-color: lightyellow;">';
                        for (var j = 0; j <= 5; j++) {
                            if (j == 0) {
                                output += "<td>" + crear_horas(i) + "</td>";
                            } else {
                                var vacio = 0;
                                $.each(data.horario, function (key, value) {
                                    if (value['dia'] == j && value['hora'] == i) {
                                        output += "<td>" + value['grupo'] + '<br/>' + '(' + value['aula'] + ')' + "</td>";
                                        vacio++;
                                    }
                                });
                                if (vacio == 0) {
                                    output += "<td></td>";
                                }
                            }
                        }
                    }
                    output += '</tr>';

                    output += '</table>';
                } else {
                    output = data.error;
                }
                $("#horario").html(output);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            vista_error("<p>Problemas en la conexión con los Servicios Remotos. Disculpen las molestias</p>");
        });
}

var array_almacenamiento_profesores = [];

function cargar_horario_admin(fecha, day) {


    $.ajax({
            url: DIR_SERV + '/profesorado_no_ausente/' + fecha + '/' + day,
            type: "GET",
            // Formato de datos que se espera en la respuesta
            dataType: "json",
        })
        .done(function (data) {
            //done() es ejecutada cuándo se recibe la respuesta del servidor. response es el objeto JSON recibido
            if (data.no_login) {
                saltar_a("index.html");
            } else {
                var output = "";
                if (data.profesorado) {
                    output += "<table class='profesorado_no_ausente'>";
                    output += "<tr><th style='width=5rem;'>Profesorado No Ausente (" + localStorage.getItem('fecha_dia') + ")</th>";
                    output += "</tr>";
                    output += '<tr>';
                    //recorremos los valores de cada usuario
                    output += '<td><input placeholder="Buscar"/></td>';
                    output += '</tr>';
                    //recorremos cada usuario
                    array_almacenamiento_profesores = []
                    $.each(data.profesorado, function (key, value) {
                        if (!array_almacenamiento_profesores.includes(value['id_usuario'])) {
                            output += '<tr>';
                            //recorremos los valores de cada usuario
                            output += '<td id="' + value['id_usuario'] + '" value="' + value['id_usuario'] + '" onclick="seleccionar_no_ausente(' + value['id_usuario'] + ')">' + value['nombre'] + '</td>';
                            output += '</tr>';
                            array_almacenamiento_profesores.push(value['id_usuario'])
                        }

                    });
                    output += '</table>';
                } else {
                    output += "<table class='profesorado_no_ausente'>";
                    output += "<tr><th>Profesorado No Ausente (" + localStorage.getItem('fecha_dia') + ")</th>";
                    output += "</tr>";
                    output += '<tr>';
                    //recorremos los valores de cada usuario
                    output += '<td><input placeholder="Buscar"/></td>';
                    output += '</tr>';
                }
                $("#horario_admin").html(output);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            vista_error("<p>Problemas en la conexión con los Servicios Remotos. Disculpen las molestias</p>");
        });
}

var profesores_ausentes = []

function cargar_horario_admin2(fecha) {

    $.ajax({
            url: DIR_SERV + '/profesorado_ausente/' + fecha,
            type: "GET",
            // Formato de datos que se espera en la respuesta
            dataType: "json",
        })

        .done(function (data) {

            //done() es ejecutada cuándo se recibe la respuesta del servidor. response es el objeto JSON recibido
            if (data.no_login) {
                saltar_a("index.html");

            } else {
                var output = "";
                if (data.profesorado) {
                    console.log(data.profesorado)
                    output += "<table class='tabla_admin'>";
                    output += "<tr><th>Profesorado Ausente (" + localStorage.getItem('fecha_dia') + ")</th>";
                    output += "</tr>";
                    output += '<tr>';
                    output += '<td><input placeholder="Buscar"/></td>';
                    output += '</tr>';
                    //recorremos cada usuario
                    profesores_ausentes = []
                    $.each(data.profesorado, function (key, value) {
                        output += '<tr>';
                        //recorremos los valores de cada usuario
                        output += '<td id="' + value['id_ausencia'] + '" value="' + value['id_ausencia'] + '" onclick="seleccionar_ausente(' + value['id_ausencia'] + ')">' + value['nombre'] + '</td>';
                        profesores_ausentes.push(value['usuario'])
                        output += '</tr>';
                    });
                    output += '</table>';
                } else {
                    output += "<table class='tabla_admin'>";
                    output += "<tr><th>Profesorado Ausente (" + localStorage.getItem('fecha_dia') + ")</th>";
                    output += "</tr>";
                    output += '<tr>';
                    //recorremos los valores de cada usuario
                    output += '<td><input placeholder="Buscar"/></td>';
                    output += '</tr>';
                }

                $("#horario_admin2").html(output);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            var output = "";
            output += "<table class='tabla_admin'>";
            output += "<tr><th>Profesorado Ausente (" + localStorage.getItem('fecha_dia') + ")</th>";
            output += "</tr>";
            output += '<tr>';
            //recorremos los valores de cada usuario
            output += '<td><input placeholder="Buscar"/></td>';
            output += '</tr>';
            $("#horario_admin2").html(output);
            // vista_error("<p>Problemas en la conexión con los Servicios Remotos. Disculpen las molestias</p>");
        });
}

var array_profesores_unir = []
var duplicados = []
var duplicados_grupos = []
var prohibido = 0
var no_entrar = 0

function cargar_horario_admin3(dia) {

    $.ajax({
            url: DIR_SERV + '/obtener_profesores_dia/' + dia,
            type: "GET",
            // Formato de datos que se espera en la respuesta
            dataType: "json",
        })

        .done(function (data) {
            //done() es ejecutada cuándo se recibe la respuesta del servidor. response es el objeto JSON recibido
            if (data.no_login) {
                saltar_a("index.html");

            } else {
                var output = "";
                if (data.profesorado) {
                    output += "<table style='margin-bottom: 5rem' class='tabla_admin'>";
                    output += "<tr><th class='ocultar_border'></th><th>PROFESORADO DE GUARDIA</th><th>PROFESORADO AUSENTE</th>";
                    output += "</tr>";
                    for (var i = 1; i <= 9; i++) {
                        if (i == 4 || i == 7) {
                            i++; //SUMA UNO YA QUE SERÍA EL RECREO
                        }
                        if (i == 6) {
                            output += "<table>";
                            output += "<tr><th class='ocultar_border'></th><th>PROFESORADO DE GUARDIA</th><th>PROFESORADO AUSENTE</th>";
                            output += "</tr>";
                            output += '<tr style="background-color: #F6ED69;">';
                            output += "<td>" + crear_horas(10) + "</td>";
                            output += '<td>';
                            output += '<ol>';
                            $.each(data.profesorado, function (key, value) {
                                if ((value['hora'] == 5 || value['hora'] == 6) && value['grupo'] == 'GUARDIA') {
                                    output += "<li>" + value['nombre'] + "</li>";
                                }
                            });
                            output += '</ol>';
                            //AUSENTES
                            output += '<td>'
                            
                            $.each(data.profesorado, function (key, value) {
                                if ((value['hora'] == 5 || value['hora'] == 6) && profesores_ausentes.includes(value['id_usuario'])) {
                                    if (value['grupo'] == 'GUARDIA DE EXPULSADOS' || value['grupo'] == 'GUARDIA') {
                                        output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + " (" + value['grupo'] + ")</p>";
                                    } else if (duplicados.length > 0) {
                                        //Solo entrara una vez el nombre con campo duplicado
                                        if (value['hora'] == duplicados[0]['hora'] && value['nombre'] == duplicados[0]['nombre'] && no_entrar == 0) {
                                            output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + value['grupo'] + " (" + value['aula'] + ")</p>";
                                            no_entrar++
                                            //Evita la entrada al mismo nombre duplicado
                                        } else if (value['nombre'] != duplicados[0]['nombre']) {
                                            output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + value['grupo'] + " (" + value['aula'] + ")</p>";
                                        }
                                    } else {
                                        output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + value['grupo'] + " (" + value['aula'] + ")</p>";
                                    }
                                }
                            });
                            output += '</td>'
                            output += '</tr>';
                        }
                        output += '<tr style="background-color: lightyellow;">';
                        for (var j = 0; j <= 2; j++) {
                            if (j == 0) {
                                output += "<td>" + crear_horas(i) + "</td>";
                            } else if (j == 1) {
                                output += '<td>';
                                output += '<ol>';
                                $.each(data.profesorado, function (key, value) {
                                    if (j == 1 && value['hora'] == i && value['grupo'] == 'GUARDIA') {
                                        output += "<li>" + value['nombre'] + "</li>";
                                    }
                                });
                            } else {
                                //AUSENTES
                                output += '<td>'
                                $.each(data.profesorado, function (key, value) {
                                    if (profesores_ausentes.includes(value['id_usuario']) && !array_profesores_unir.includes(value['id_usuario'])) {
                                        array_profesores_unir.push(data.profesorado[key])
                                        //Ordena el array por horas ascendente
                                        array_profesores_unir.sort((a, b) => {
                                            if (a.hora < b.hora) {
                                                return -1
                                            } else if (a.hora > b.hora) {
                                                return 1
                                            } else {
                                                return 0
                                            }
                                        })
                                    }

                                    for (let i = 0; i < array_profesores_unir.length; i++) {
                                        try {
                                            if (array_profesores_unir[i + 1]['hora'] === array_profesores_unir[i]['hora'] && array_profesores_unir[i + 1]['grupo'] != array_profesores_unir[i]['grupo'] && array_profesores_unir[i + 1]['nombre'] === array_profesores_unir[i]['nombre']) {
                                                if (!duplicados.includes(array_profesores_unir[i]) && !duplicados.includes(array_profesores_unir[i])) {
                                                    duplicados.push(array_profesores_unir[i])
                                                    duplicados.push(array_profesores_unir[i + 1])
                                                }
                                            }
                                        } catch (error) {
                                            //console.log('eror')
                                        }
                                    }

                                    if (duplicados.length > 0) {
                                        //AÑADE LOS GRUPOS DE LOS DUPLICADOS A UN ARRAY
                                        for (let i = 0; i < duplicados.length; i++) {
                                            duplicados_grupos.push(duplicados[i]['grupo'])
                                        }

                                        if (prohibido == 0) {
                                            //VACIA EL GRUPO DEL PRIMER NOMBRE
                                            duplicados[0]['grupo'] = ''
                                            //AÑADE LOS GRUPOS DUPLICADOS AL PRIMER ELEMENTO DEL ARRAY
                                            for (let i = 0; i < duplicados_grupos.length; i++) {
                                                duplicados[0]['grupo'] += (duplicados_grupos[i] + ' / ')
                                            }
                                            prohibido++
                                        }
                                        if (value['hora'] == i && profesores_ausentes.includes(value['id_usuario'])) {
                                            if (value['grupo'] == 'GUARDIA DE EXPULSADOS' || value['grupo'] == 'GUARDIA') {
                                                output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + " (" + value['grupo'] + ")</p>";
                                            } else {
                                                //Solo entrara una vez el nombre con campo duplicado
                                                if (value['hora'] == duplicados[0]['hora'] && value['nombre'] == duplicados[0]['nombre'] && no_entrar == 0) {
                                                    output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + value['grupo'] + " (" + value['aula'] + ")</p>";
                                                    no_entrar++
                                                    //Evita la entrada al mismo nombre duplicado
                                                } else if (!duplicados[0]['grupo'].includes(value['grupo'])) {
                                                    output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + value['grupo'] + " (" + value['aula'] + ")</p>";
                                                }
                                            }
                                        }
                                    } else {
                                        if (value['hora'] == i && profesores_ausentes.includes(value['id_usuario'])) {
                                            if (value['grupo'] == 'GUARDIA DE EXPULSADOS' || value['grupo'] == 'GUARDIA') {
                                                output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + " (" + value['grupo'] + ")</p>";
                                            } else {
                                                output += "<p style='text-align: left;'>" + value['nombre'] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + value['grupo'] + " (" + value['aula'] + ")</p>";
                                            }
                                        }
                                    }
                                });
                                output += '</td>'
                            }
                        }
                    }
                    output += '</ol>';
                    output += '</td>';
                    output += '</tr>';
                    output += '</table>';
                } else {
                    output += "<table class='tabla_admin'>";
                    output += "<tr><th>PROFESORADO DE GUARDIA</th><th>PROFESORADO AUSENTE</th>";
                    output += "</tr>";
                }
                $("#horario_admin3").html(output);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            vista_error("<p>Problemas en la conexión con los Servicios Remotos. Disculpen las molestias</p>");
        });
}
var lista_profesores_no_ausente = [];

function seleccionar_no_ausente(id) {
    var index = lista_profesores_no_ausente.indexOf(id)
    lista_profesores_ausente = []
    if (document.getElementById(id).style.backgroundColor == 'blue') {
        document.getElementById(id).style.backgroundColor = 'white';
        lista_profesores_no_ausente.splice(index, 1)
    } else {
        document.getElementById(id).style.backgroundColor = 'blue';
        lista_profesores_no_ausente.push(id)
    }
}

var lista_profesores_ausente = [];

function seleccionar_ausente(id) {
    var index = lista_profesores_ausente.indexOf(id)
    lista_profesores_no_ausente = []
    if (document.getElementById(id).style.backgroundColor == 'blue') {
        document.getElementById(id).style.backgroundColor = 'white';
        lista_profesores_ausente.splice(index, 1)
    } else {
        document.getElementById(id).style.backgroundColor = 'blue';
        lista_profesores_ausente.push(id)
    }
}

function marcar_todos_noAusente() {
    if (lista_TODOS_profesores_Noausente.length != 0) {
        for (var i = 0; i < lista_TODOS_profesores_Noausente.length; i++) {
            document.getElementById(lista_TODOS_profesores_Noausente[i]).style.backgroundColor = 'blue';
            if (!lista_profesores_no_ausente.includes(lista_TODOS_profesores_Noausente[i])) {
                lista_profesores_no_ausente.push(lista_TODOS_profesores_Noausente[i])
            }
        }
    } else {
        for (var i = 0; i < lista_profesores_no_ausente.length; i++) {
            document.getElementById(lista_profesores_no_ausente[i]).style.backgroundColor = 'white';
        }
        lista_profesores_no_ausente = []
    }
}

var lista_TODOS_profesores_Noausente = [];

function seleccionar_todos_noAusente(fecha, dia) {
    $.ajax({
            url: DIR_SERV + '/profesorado_no_ausente/' + fecha + '/' + dia,
            type: "GET",
            // Formato de datos que se espera en la respuesta
            dataType: "json",
        })
        .done(function (data) {
            //done() es ejecutada cuándo se recibe la respuesta del servidor. response es el objeto JSON recibido
            if (data.no_login) {
                saltar_a("index.html");
            } else {
                if (data.profesorado) {
                    //recorremos cada usuario
                    if (lista_TODOS_profesores_Noausente.length == 0) {
                        $.each(data.profesorado, function (key, value) {
                            lista_TODOS_profesores_Noausente.push(value['id_usuario'])
                        });
                    } else {
                        lista_TODOS_profesores_Noausente = []
                    }
                    marcar_todos_noAusente()
                } else {
                    data.error
                }
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            vista_error("<p>Problemas en la conexión con los Servicios Remotos. Disculpen las molestias</p>");
        });
}

function marcar_todos_ausente() {
    if (lista_TODOS_profesores_ausente.length != 0) {
        for (var i = 0; i < lista_TODOS_profesores_ausente.length; i++) {
            document.getElementById(lista_TODOS_profesores_ausente[i]).style.backgroundColor = 'blue';
            if (!lista_profesores_ausente.includes(lista_TODOS_profesores_ausente[i])) {
                lista_profesores_ausente.push(lista_TODOS_profesores_ausente[i])
            }
        }
    } else {
        for (var i = 0; i < lista_profesores_ausente.length; i++) {
            document.getElementById(lista_profesores_ausente[i]).style.backgroundColor = 'white';
        }
        lista_profesores_ausente = []
    }
}

var lista_TODOS_profesores_ausente = [];

function seleccionar_todos_ausente(fecha) {
    $.ajax({
            url: DIR_SERV + '/profesorado_ausente/' + fecha,
            type: "GET",
            // Formato de datos que se espera en la respuesta
            dataType: "json",
        })
        .done(function (data) {
            //done() es ejecutada cuándo se recibe la respuesta del servidor. response es el objeto JSON recibido
            if (data.no_login) {
                saltar_a("index.html");
            } else {
                if (data.profesorado) {
                    //recorremos cada usuario
                    if (lista_TODOS_profesores_ausente.length == 0) {
                        $.each(data.profesorado, function (key, value) {
                            lista_TODOS_profesores_ausente.push(value['id_ausencia'])
                        });
                    } else {
                        lista_TODOS_profesores_ausente = []
                    }
                    marcar_todos_ausente()
                } else {
                    data.error
                }
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            vista_error("<p>Problemas en la conexión con los Servicios Remotos. Disculpen las molestias</p>");
        });
}

function obtener_dia_semana(dia) {
    var resultado = '';
    switch (dia) {
        case 1:
            resultado = 'Lunes: ';
            break;
        case 2:
            resultado = 'Martes: ';
            break;
        case 3:
            resultado = 'Miércoles: ';
            break;
        case 4:
            resultado = 'Jueves: ';
            break;
        case 5:
            resultado = 'Viernes: ';
            break;
        case 6:
            resultado = 'Sábado: ';
            break;
        case 7:
            resultado = 'Domingo: ';
            break;
    }
    return resultado;
}

function dia_calendario() {
    localStorage.setItem('fecha_dia', $("#date").val())

    var dia = new Date(localStorage.getItem('fecha_dia'))
    var numero_dia = dia.getDay();

    localStorage.setItem('numero_dia', numero_dia)

    //Formato español
    var options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    localStorage.setItem('mostrar_fecha_dia', obtener_dia_semana(numero_dia) + dia.toLocaleDateString("es-ES", options))
}

var contadorAusente = 0
function mover_a_noAusente(id_usuario) {
    $.ajax({
            url: encodeURI(DIR_SERV + '/profesor_ausente/borrar/' + id_usuario),
            type: "DELETE",
            // Formato de datos que se espera en la respuesta
            dataType: "json",
        })
        .done(function (data) {
            //done() es ejecutada cuándo se recibe la respuesta del servidor. response es el objeto JSON recibido
            if (data.mensaje) {
                console.log('Contador ' + contadorAusente)
                contadorAusente++
                if (contadorAusente >= lista_profesores_no_ausente.length) {
                    console.log('Final')
                    var dia = new Date(localStorage.getItem('fecha_dia'))
                    var numero_dia = dia.getDay();
                    cargar_horario_admin(localStorage.getItem('fecha_dia'), numero_dia);
                    cargar_horario_admin2(localStorage.getItem('fecha_dia'), profesores_ausentes = []);
                    cargar_horario_admin3(numero_dia);
                }
                //saltar_a("index.html");
                respuesta = data.mensaje;
            } else {
                respuesta = data.error;
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (console && console.log) {
                console.log("La solicitud ha fallado: " + textStatus);
            }
        });
}

function pasar_a_ausente(usuario, fecha) {
    for (var i = 0; i < lista_profesores_no_ausente.length; i++) {
        usuario = lista_profesores_no_ausente[i]
        fecha = $("#date").val()
        mover_a_ausente(usuario, fecha);
    }
}

function pasar_a_noAusente(usuario) {
    for (var i = 0; i < lista_profesores_ausente.length; i++) {
        usuario = lista_profesores_ausente[i]
        mover_a_noAusente(usuario);
    }
}

var contadorNoAusente = 0

function mover_a_ausente(usuario, fecha) {

    var parametros = {
        "usuario": usuario,
        "fecha": fecha,
    };

    $.ajax({
            url: DIR_SERV + '/mover_a_ausente/' + usuario + '/' + fecha,
            data: parametros,
            dataType: "json",
            type: "GET"
        })
        .done(function (data) {
            var mensaje = "";
            if (data.mensaje) {
                console.log('Contador ' + contadorNoAusente)
                contadorNoAusente++
                if (contadorNoAusente >= lista_profesores_no_ausente.length) {
                    console.log('Final')
                    var dia = new Date(localStorage.getItem('fecha_dia'))
                    var numero_dia = dia.getDay();
                    cargar_horario_admin(localStorage.getItem('fecha_dia'), numero_dia);
                    cargar_horario_admin2(localStorage.getItem('fecha_dia'), profesores_ausentes = []);
                    cargar_horario_admin3(numero_dia);
                }
                //saltar_a("index.html");
                mensaje = data.mensaje;
            } else if (data.error) {
                mensaje = data.error;
            }

        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (console && console.log) {
                console.log("La solicitud ha fallado: " + textStatus);
            }
        });

    return false;
}