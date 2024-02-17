const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/principal.db');
const express = require('express');
var bodyParser = require('body-parser')
const app = express();


app.use(express.json());
app.use(express.urlencoded());
//Funciones
function log(d) {
    console.log(d)
}

function generarID() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let idGenerado = '';

    for (let i = 0; i < 4; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        idGenerado += caracteres.charAt(indiceAleatorio);
    }

    return idGenerado;
}




//Código




app.get('/', function(req, res) {
    res.sendFile(__dirname + "/public/index.html")

})
app.get('/stats', function(req, res) {
    var id = req.query.id
    if (id) {
        db.serialize(() => {


            // Utilizando un parámetro para la cláusula WHERE
            db.get("SELECT id, url, clicks FROM nuevatabla WHERE id = ?", [id], (err, row) => {
                if (err) {
                    console.error(err.message);
                } else if (row) {
                    res.json({
                        stats: row.clicks
                    })
                } else {
                    res.send(404)
                }


            });

        })
    } else {
        res.json({
            error: 'no id specified'
        })
    }


})
app.get('/l', function(req, res) {
    var id = req.query.id
    if (id) {
        db.serialize(() => {


            // Utilizando un parámetro para la cláusula WHERE
            db.get("SELECT id, url, clicks FROM nuevatabla WHERE id = ?", [id], (err, row) => {
                if (err) {
                    console.error(err.message);
                } else if (row) {
                    res.redirect(row.url)
                    actualizar(id, row.clicks + 1)
                } else {
                     res.json({
            error: '404'
        })
                }


            });

        })
    } else {
        res.json({
            error: 'no id specified'
        })
    }

})
app.get('/link', function(req, res) {
    var id = req.query.id
    if (id) {
        db.serialize(() => {


            // Utilizando un parámetro para la cláusula WHERE
            db.get("SELECT id, url, clicks FROM nuevatabla WHERE id = ?", [id], (err, row) => {
                if (err) {
                    console.error(err.message);
                } else if (row) {
                    res.json({
                        message: "http://localhost:3000/l?id=" + row.id
                    })
                } else {
                    res.send(404)
                }


            });
        });
    } else {
        res.json({
            error: 'no id specified'
        })
    }



})
app.post('/guardar', function(req, res) {
    var url = req.body.datos
    const ID = generarID();
    añadir(ID, url, 0)
    res.redirect("/link?id=" + ID)
})


app.listen(3000)



function añadir(i, u, c) {
    db.serialize(() => {
        const insertStmt = db.prepare("INSERT INTO nuevatabla VALUES (?, ?, ?)");
        insertStmt.run(i, u, c);
        insertStmt.finalize();

        console.log("Datos iniciales:");
        db.each("SELECT id, url, clicks FROM nuevatabla", (err, row) => {
            console.log(`${row.id}: ${row.url}, Clicks: ${row.clicks}`);
        });


    });
}

function actualizar(i, c) {
    let id;
    let clicks;
    id = i;
    clicks = c;
    db.serialize(() => {
        db.run("UPDATE nuevatabla SET clicks = ? WHERE id = ?", [clicks, id], (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log(`Se actualizó el registro con id ${id}`);
            }
        });

        // Mostrar los datos después de la actualización
        console.log("\nDatos después de la actualización:");
        db.each("SELECT id, url, clicks FROM nuevatabla", (err, row) => {
            console.log(`${row.id}: ${row.url}, Clicks: ${row.clicks}`);
        });


    });
}

function eliminar(id) {
    const idToDelete = id;
    db.serialize(() => {
        db.run("DELETE FROM nuevatabla WHERE id = ?", id, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log(`Se eliminó el registro con id ${id}`);
            }
        });


    });
}

function consultar(id) {
    db.serialize(() => {
        console.log("Consulta de datos específicos:");

        // Utilizando un parámetro para la cláusula WHERE
        db.get("SELECT id, url, clicks FROM nuevatabla WHERE id = ?", [id], (err, row) => {
            if (err) {
                console.error(err.message);
            } else if (row) {
                console.log(`${row.id}: ${row.url}, Clicks: ${row.clicks}`);
            } else {
                log(`No se encontró ningún registro con el ID ${id}`);
            }


        });
    });
}
