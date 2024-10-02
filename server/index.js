const express = require("express");
const app = express();
const mysql = require ("mysql");

const cors = require("cors");

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database : "empleados_crud"
})

//consulta y respuesta
app.post("/create", (req,res) => {
    const nombre = req.body.nombre;
    const edad = req.body.edad;
    const pais = req.body.pais;
    const cargo = req.body.cargo;
    const anio = req.body.anio;

    db.query('INSERT INTO empleados(nombre,edad,pais,cargo,anios) VALUES(?,?,?,?,?', [nombre,edad,pais,cargo,anio], (err,result) =>{
        if(err){
            console.log(err);
        }else{
            res.send("registrado");
        }
    });

});

app.listen(5174, ()=>{
    console.log("corriendo en 5174")
})


//npm install cors