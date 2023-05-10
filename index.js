const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');

const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3050;

const app = express();

const jwt = require('jsonwebtoken');

const cors = require("cors");
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

app.use(morgan('dev'));

app.use(bodyParser.json());

// app.use((req, res) =>{
//     res.header('Access-Control-Allow-Origin', '*');
// })

//mysql
const connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: '',
});

// Route
app.get('/', (req, res) => {
    res.send("Welcome to API")
})

//EQUIPOS// 
//MOSTRAR,AGREGAR, ACTUALIZAR 
app.route('/equipos')
    .get((req, res) => {

        const sql = 'SELECT * FROM equipo';

        connection.query(sql, (error, resultado) => {
            if (error) throw error;
            if (resultado.length > 0) {
                res.json(resultado);
            } else {
                res.send("no hay resultados")
            }
        })

    })
    .post((req, res) => {

        var username = req.body.username;

        const validation = 'SELECT * FROM usuario WHERE usuario.username = ? '

        const sql = 'INSERT INTO equipo SET ?'

        connection.query(validation, [username], (error, result) => {
            if (error) throw error;

            if (result.length > 0) {

                let responsable = result[0].username

                const sedeObj = {
                    id_sede: req.body.id_sede,
                    marca: req.body.marca,
                    serial: req.body.serial,
                    modelo: req.body.modelo,
                    color: req.body.color,
                    almacenamiento: req.body.almacenamiento,
                    Tipo_almacenamiento: req.body.Tipo_almacenamiento,
                    ram: req.body.ram,
                    tipo_ram: req.body.tipo_ram,
                    procesador: req.body.procesador,
                    cargo: req.body.cargo,
                    estado: req.body.estado,
                    observacion: req.body.observacion,
                    nombre: req.body.nombre,
                    grupo_trabajo: req.body.grupo_trabajo,
                    admin: req.body.admin,
                    responsable: responsable,
                };

                //console.log(await connection.query(sql,sedeObj))

                connection.query(sql, sedeObj, error => {
                    if (error) throw error;
                    res.send({ message: "Equipo guardado" })
                })

            } else {
                res.send({
                    validation: "a1",
                    message: "ese usuario no existe en la base de dato"
                })
            }
        });

    })
    .put((req, res) => {
        const id = req.body.id;
        const equipoObj = {
            id_sede: req.body.id_sede,
            marca: req.body.marca,
            serial: req.body.serial,
            modelo: req.body.modelo,
            color: req.body.color,
            almacenamiento: req.body.almacenamiento,
            Tipo_almacenamiento: req.body.Tipo_almacenamiento,
            ram: req.body.ram,
            tipo_ram: req.body.tipo_ram,
            procesador: req.body.procesador,
            cargo: req.body.cargo,
            estado: req.body.estado,
            grupo_trabajo: req.body.grupo_trabajo,
            nombre: req.body.nombre,
            responsable: req.body.responsable,
            observacion: req.body.observacion,
        };
        const sql = ` UPDATE equipo SET ? WHERE id = ? `

        connection.query(sql, [equipoObj, id], error => {
            if (error) throw error;

            res.send({
                message: "Equipo actualizado Actualizada"
            });

        });
    })

//USUARIOS
app.route('/users')
    .post((req, res) => {

        const username = req.body.username;

        const sql = 'SELECT * FROM `usuario` WHERE username = ?'

        connection.query(sql, [username], (error, result) => {
            if (error) throw error;

            if (result.length > 0) {
                res.json(result)
            } else {
                res.send({
                    message: "Usuario no encontrado"
                })
            }
        })
    })
    .put((req, res) => {

        const username = req.body.username;

        const equipo = 'SELECT * FROM equipo WHERE username = ?'
        const sql = 'INSERT INTO bodega SET ?'

        connection.query(equipo, username, error => {
            if (error) throw error;

            if (result > 0) {

                const hojaObj = {
                    id_sede: req.body.id_sede,
                    nombre: req.body.nombre,
                    marca: req.body.marca,
                    cantidad: req.body.cantidad
                };

                connection.query(sql, hojaObj, error => {
                    if (error) throw error;
                    res.send({ message: "Informacion guardada correctamente" })
                })

            } else {
                res.send({
                    message: "Equipo no encontrado"
                })
            }
        })

    })
    .patch((req, res) => {

        const id = req.body.id

        const empleadoObj = {
            tipo_documento: req.body.tipo_documento,
            cedula: req.body.cedula,
            username: req.body.username,
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            telefono: req.body.telefono,
            direccion: req.body.direccion,
            correo: req.body.correo,
            password: req.body.password,
            cargo: req.body.cargo,
            tipo_user: req.body.tipo_user,
        }

        const sql = 'UPDATE usuario SET ? WHERE id= ? '

        connection.query(sql, [empleadoObj, id], error => {
            if (error) throw error

            res.send({
                message: "Empleado actualizado"
            });
        })
    })

//LOGIN
app.post('/login', (req, res) => {

    var correo = req.body.correo;
    var password = req.body.password;

    const sql = `SELECT * FROM usuario WHERE correo = ? and password = BINARY  ? `;

    connection.query(sql, [correo, password], (error, result) => {
        if (error) throw error
        if (result.length > 0) {

            jwt.sign(correo, 'secret_key', (error, token) => {
                if (error) {
                    res.status(400).send({ message: 'Error' })
                } else {
                    res.send({
                        status: 200,
                        message: "Bienvenido",
                        token: token,
                        resultado: result,
                    })
                }
            })

        } else {
            res.send({
                message: "Contraseña/usuario incorrecto"
            })
        }
    })
    // console.log(query)
    //res.send({message: "usuario encontrado"})
});

//MOSTRAR PROGRAMA DEL EQUIPO
app.route('/programe')
    .post((req, res) => {

        const nombre = req.body.nombre;

        const sql = ' SELECT  programas.id , id_equipo, sistema_operativo ,so_licencia ,office, office_serial ,quiter ,acrobat ,winrar ,google_chrome ,piramide ,thunderbirt ,siprock ,socase ,anydesk ,vpn FROM programas INNER JOIN equipo WHERE equipo.id = programas.id_equipo and equipo.nombre = ? ';

        connection.query(sql, [nombre], (error, result) => {
            if (error) throw error
            if (result.length > 0) {
                res.json(result)
            } else {
                res.send({
                    message: "Ese equipo no existe"
                })
            }
        })

    })
    .put((req, res) => {
        const id = req.body.id;
        const programaObj = {
            sistema_operativo: req.body.sistema_operativo,
            so_licencia: req.body.so_licencia,
            office: req.body.office,
            office_serial: req.body.office_serial,
            quiter: req.body.quiter,
            acrobat: req.body.acrobat,
            winrar: req.body.winrar,
            google_chrome: req.body.google_chrome,
            piramide: req.body.piramide,
            thunderbirt: req.body.thunderbirt,
            siprock: req.body.siprok,
            socase: req.body.socase,
            anydesk: req.body.anydesk,
            vpn: req.body.vpn,
        };
        const sql = `UPDATE programas SET ? WHERE id = ?`

        connection.query(sql, [programaObj, id], error => {
            if (error) throw error;

            res.send({
                message: "Programa del equipo actualizado"
            });

        });
    })

//MOSTRAR IMPRESORA/CELULAR
app.route('/equiposimp')
    .get((req, res) => {
        const sql = 'SELECT * FROM impre_cel';

        connection.query(sql, (error, resultado) => {
            if (error) throw error;
            if (resultado.length > 0) {
                res.json(resultado);
            } else {
                res.send({ message: "no hay resultados" })
            }
        })

    })
    .post((req, res) => {

        const sql = 'INSERT INTO impre_cel SET ?'

        const sedeObj = {
            id_sede: req.body.id_sede,
            Tipo_equipo: req.body.Tipo_equipo,
            marca: req.body.marca,
            modelo: req.body.modelo,
            serial: req.body.serial,
            observacion: req.body.observacion,
            lugar: req.body.lugar,
            estado: req.body.estado,
            eliminado: req.body.eliminado
        };

        //console.log(await connection.query(sql,sedeObj))

        if (sedeObj.Tipo_equipo == "Memoria") {

            const memoriaObj = {
                id_sede: req.body.id_sede,
                Tipo_equipo: req.body.Tipo_equipo,
                marca: req.body.marca,
                observacion: req.body.observacion,
                estado: req.body.estado,
                eliminado: req.body.eliminado
            };
            connection.query(sql, memoriaObj, error => {
                if (error) throw error;
                res.send({ message: "Impresora/Celular/Otro guardado" })
            })

        } else {
            connection.query(sql, sedeObj, error => {
                if (error) throw error;
                res.send({ message: "Impresora/Celular guardado" })
            })
        }

    })

//BUSCAR 1 EQUIPO
app.get('/equipos/:id', (req, res) => {

    const { id } = req.params
    const sql = `SELECT * FROM equipo WHERE id= ${id}`;

    connection.query(sql, (error, resultado) => {
        if (error) throw error;
        if (resultado.length > 0) {
            res.json(resultado);
        } else {
            res.send("no hay resultados")
        }
    })

    //res.send("Get equipos by id")
});

//AGREGAR PROGRAMAS AL EQUIPO
app.post('/addProgram', async (req, res) => {

    var nombre = req.body.nombre;

    const validacion = 'SELECT * FROM equipo WHERE equipo.nombre = ?'

    const validacionp = 'SELECT * FROM programas WHERE programas.id_equipo = ?'

    const sql = 'INSERT INTO programas SET ?'

    //console.log(await connection.query(sql,sedeObj))

    connection.query(validacion, [nombre], (error, resultado) => {
        if (error) throw error;

        if (resultado.length > 0) {
            var id = resultado[0].id

            const programObj = {
                id_equipo: id,
                sistema_operativo: req.body.sistema_operativo,
                so_licencia: req.body.so_licencia,
                office: req.body.office,
                office_serial: req.body.office_serial,
                quiter: req.body.quiter,
                acrobat: req.body.acrobat,
                winrar: req.body.winrar,
                google_chrome: req.body.google_chrome,
                piramide: req.body.piramide,
                thunderbirt: req.body.thunderbirt,
                siprock: req.body.siprock,
                socase: req.body.socase,
                anydesk: req.body.anydesk,
                vpn: req.body.vpn,
            };

            connection.query(validacionp, [id], (error, resulta) => {
                if (error) throw error;

                if (resulta.length == 0) {
                    connection.query(sql, programObj, error => {
                        if (error) throw error;
                        res.send({ message: "Programa guardado" })
                    })
                } else {
                    res.send({
                        validation: "a2",
                        message: "ese equipo ya tiene programa"
                    });
                }
            })
        } else {
            res.send({
                validation: "a1",
                message: "ese equipo no existe en la base de dato"
            });
        }
    });

    //res.send("add equipo")
});

//AGREGAR AL INVENTARIO
app.post('/inventario', async (req, res) => {

    var username = req.body.username;

    const sql = 'INSERT INTO inventario SET ?'

    const validacion = 'SELECT * FROM usuario WHERE usuario.username = ? '

    connection.query(validacion, [username], (error, resultado) => {
        if (error) throw error;

        if (resultado.length > 0) {

            let id_usuario = resultado[0].id

            const programObj = {
                id_equipo: req.body.id_equipo,
                id_sede: req.body.id_sede,
                id_usuario: id_usuario,
                observacion: req.body.observacion,
                fecha: req.body.fecha
            };

            connection.query(sql, programObj, error => {
                if (error) throw error;
                res.send({ message: "Inventario guardado" })
            })

        } else {
            res.send({
                validation: "a1",
                message: "ese usuario no existe en la base de dato"
            });
        }
    });

});

//AGREGAR AL USUARIO
app.route('/adduser')
    .post((req, res) =>{
        
        const sql = 'SELECT * FROM usuario';

        connection.query(sql ,(error, resultado) => {
            if (error) throw error;
            if (resultado.length > 0) {
                res.json(resultado);
            } else {
                res.send("no hay resultados")
            }
        })

    })
    .put((req, res) => {
        var username = req.body.username;

        const sql = 'INSERT INTO usuario SET ?'

        const validacion = 'SELECT * FROM usuario WHERE usuario.username = ? '

        //console.log(await connection.query(sql,sedeObj))

        connection.query(validacion, [username], (error, resultado) => {
            if (error) throw error;

            if (resultado.length == 0) {

                const userObj = {
                    cedula: req.body.cedula,
                    tipo_documento: req.body.tipo_documento,
                    username: username,
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    telefono: req.body.telefono,
                    direccion: req.body.direccion,
                    correo: req.body.correo,
                    password: req.body.password,
                    cargo: req.body.cargo,
                    tipo_user: req.body.tipo_user,
                };

                connection.query(sql, userObj, error => {
                    if (error) throw error;
                    res.send({ message: "Usuario  guardado" })
                })

            } else {
                res.send({
                    message: "ese usuario ya existe en la base de dato"
                });
            }
        });
    })

// ELIMINAR EQUIPO
app.put('/delete/:id', (req, res) => {
    const { id } = req.params;

    const eliminar = {
        eliminado: req.body.eliminado,
        equipo: req.body.equipo
    }

    if (eliminar.equipo == "comp1") {

        const sql = ` UPDATE equipo SET eliminado = ? WHERE id = ${id}`;
        const validation = `SELECT * FROM equipo WHERE equipo.id = ${id}`;

        connection.query(validation, (error, result) => {
            if (error) throw error;
            if (result.length > 0) {
                connection.query(sql, eliminar.eliminado, error => {
                    if (error) throw error;
                    res.send({ message: "Equipo Eliminado/restaurado" });
                });
            } else {
                res.send({
                    error: "e1",
                    message: "equipo no existe en la base de dato"
                })
            }
        })

    } else if (eliminar.equipo == "imp1") {

        const query = ` UPDATE impre_cel SET eliminado = ? WHERE id = ${id} and impre_cel.Tipo_equipo = "Impresora" `;

        connection.query(query, eliminar.eliminado, error => {
            if (error) throw error;
            res.send({ message: "Impresora Eliminado/restaurado" })
        });

    } else if (eliminar.equipo == "cel1") {

        const query = ` UPDATE impre_cel SET eliminado = ? WHERE id = ${id} and impre_cel.Tipo_equipo = "Celulares" `;

        connection.query(query, eliminar.eliminado, error => {
            if (error) throw error;
            res.send({ message: "Celular Eliminado/restaurado" })
        });

    } else if (eliminar.equipo == "mem1") {

        const query = ` UPDATE impre_cel SET eliminado = ? WHERE id = ${id} and impre_cel.Tipo_equipo = "Memoria" `;

        connection.query(query, eliminar.eliminado, error => {
            if (error) throw error;
            res.send({ message: "Celular Eliminado/restaurado" })
        });

    } else {
        res.send({ message: "Error con la eliminacion del equipo" })
    }

})

//BODEGA
app.route('/bodega')
    .get((req, res) => {
        const sql = 'SELECT * FROM bodega';

        connection.query(sql, (error, resultado) => {
            if (error) throw error;
            if (resultado.length > 0) {
                res.json(resultado);
            } else {
                res.send("no hay resultados")
            }
        })
    })
    .post((req, res) => {

        const sql = 'INSERT INTO bodega SET ?'
        const bodegaObj = {

            id_sede: req.body.id_sede,
            nombre: req.body.nombre,
            marca: req.body.marca,
            cantidad: req.body.cantidad
        };

        connection.query(sql, bodegaObj, error => {
            if (error) throw error;
            res.send({ message: "Complemento de bodega guardado" })
        })
    })
    .put((req, res) => {

        const id = req.body.id;
        const bodega = {
            cantidad: req.body.cantidad,
            nombre: req.body.nombre,
            marca: req.body.marca,
            id_sede: req.body.id_sede,
        }

        const sql = ' UPDATE bodega SET ? WHERE id = ? '

        connection.query(sql, [bodega, id], error => {
            if (error) throw error;

            res.send({
                message: "Cantidad actualizado"
            });

        })
    })
    .delete((req, res) => {

        const id = req.body.id;

        const sql = 'DELETE FROM bodega WHERE id = ? '

        connection.query(sql, [id], error => {
            if (error) throw error;

            res.send({
                message: "Eliminado de la DB"
            });
        })
    })

app.route("/HojaVida")
    .put((req, res) => {

        const id_equipo = req.body.id_equipo

        const sql = 'SELECT * FROM hoja_de_vida WHERE id_equipo = ?'

        connection.query(sql, [id_equipo], (error, result) => {
            if (error) throw error;

            if (result.length > 0) {
                res.json(result)
            } else {
                res.send({
                    message: "Usuario no encontrado"
                })
            }
        })

    })
    .post((req, res) => {

        const sql = 'INSERT INTO hoja_de_vida SET ?'
        const hv = {
            id_equipo: req.body.id_equipo,
            observaciones: req.body.observaciones,
            fecha: req.body.fecha,
            tecnico: req.body.tecnico,
            estado: req.body.estado
        };

        connection.query(sql, hv, error => {
            if (error) throw error;
            res.send({ message: `Hoja de vida del computador guardado` })
        })
    })
    .patch((req, res) => {

        const id = req.body.id
        const estado = req.body.estado

        const slq = 'UPDATE hoja_de_vida SET estado = ? WHERE id = ?'

        connection.query(slq, [estado, id], error => {
            if (error) throw error

            res.send({
                message: "Estado actualizado"
            });

        })

    })


//check connect
connection.connect(error => {
    if (error) throw error;
    console.log("Connection correct");
});

app.listen(PORT, () => console.log(`Server running in port ${PORT}`));

