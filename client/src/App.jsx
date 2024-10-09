import { useState, useEffect } from "react";
import Axios from "axios";
import "./App.css";
import "./index.css";

import "bootstrap/dist/css/bootstrap.min.css";

import Swal from "sweetalert2";

function App() {
  const [id, setId] = useState();
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [anio, setAnio] = useState();

  const [editar, setEditar] = useState(false);

  const [empleadosList, setEmpleados] = useState([]);

  //mantiene datos en interfaz

  useEffect(() => {
    getEmpleados();
  });

  //solicitud de agregar un nuevo empleado a la db
  const resgistrar = () => {
    Axios.post("http://localhost:5174/create", {
      nombre: nombre,
      edad: edad,
      pais: pais,
      cargo: cargo,
      anio: anio,
    }).then(() => {
      getEmpleados();
      clear();
      Swal.fire({
        title: "<strong>Registro Exitoso</strong>",
        html:
          "<i>El empleado <strong> " +
          nombre +
          " </strong>fue registrado con exito !!</i>",
        icon: "success",
        timer: 3000,
      });
    }).catch(function(error){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente mas tarde": JSON.parse(JSON.stringify(error)).message,
        timmer: 3000
      });
    })
  };

  //obtener datos

  const getEmpleados = () => {
    Axios.get("http://localhost:5174/empleados").then((response) => {
      setEmpleados(response.data);
    });
  };

  const editarEmpleado = (val) => {
    setEditar(true);
    setId(val.id);
    setNombre(val.nombre);
    setEdad(val.edad);
    setPais(val.pais);
    setCargo(val.cargo);
    setAnio(val.anios);
  };

  const update = () => {
    Axios.put("http://localhost:5174/update", {
      id: id,
      nombre: nombre,
      edad: edad,
      pais: pais,
      cargo: cargo,
      anio: anio,
    }).then(() => {
      getEmpleados();
      Swal.fire({
        title: "<strong>Datos Actualizados</strong>",
        html:
          "<i>El empleado <strong> " +
          nombre +
          " </strong>fue registrado con exito !!</i>",
        icon: "success",
        timer: 3000,
      });
    }).catch(function(error){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente mas tarde": JSON.parse(JSON.stringify(error)).message,
        timmer: 3000
      });
    })
  };

  const clear = () => {
    setNombre("");
    setEdad("");
    setPais("");
    setCargo("");
    setAnio("");
    setEditar(false);
  };

  const deleteEmple = (val) => {
    Swal.fire({
      title: "Confirmar Eliminado?",
      html:
        "<i>El empleado <strong> " +
        val.nombre +
        " </strong>fue eliminado con exito !!</i>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminarlo!",
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`http://localhost:5174/delete/${val.id}`).then(() => {
          getEmpleados();
          clear();
          Swal.fire({
            title: "Eliminado!",
            text: val.nombre + "Eliminado.",
            icon: "success",
            showConfirmButton: false,
            timer: 3000
          });
        }).catch(function(error){
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: JSON.parse(JSON.stringify(error)).message === "Network Error" ? "Intente mas tarde": JSON.parse(JSON.stringify(error)).message,
            timmer: 3000
          });
        })
       
      }
    });
  };

  return (
    <div className="container">
      <div className="card text-center">
        <div className="card-header">GESTION DE EMPLEADOS</div>
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              Nombre
            </span>
            <input
              type="text"
              value={nombre}
              className="form-control"
              placeholder="Ingrese su nombre"
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={(event) => {
                setNombre(event.target.value);
              }}
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              Edad
            </span>
            <input
              type="number"
              value={edad}
              className="form-control"
              placeholder="Ingrese su edad"
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={(event) => {
                setEdad(event.target.value);
              }}
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              Pais
            </span>
            <input
              type="text"
              value={pais}
              className="form-control"
              placeholder="Ingrese su pais"
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={(event) => setPais(event.target.value)}
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              Cargo
            </span>
            <input
              type="text"
              value={cargo}
              className="form-control"
              placeholder="Ingrese su cargo"
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={(event) => setCargo(event.target.value)}
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text" id="basic-addon1">
              Años
            </span>
            <input
              type="number"
              value={anio}
              className="form-control"
              placeholder="Ingrese años de esperiencia"
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={(event) => {
                setAnio(event.target.value);
              }}
            />
          </div>
        </div>
        <div className="card-footer text-body-secondary">
          {editar ? (
            <div>
              <button className="btn btn-warning mr-5" onClick={update}>
                Actualizar
              </button>
              <button className="btn btn-info" onClick={clear}>
                cancelar
              </button>
            </div>
          ) : (
            <button className="btn btn-success" onClick={resgistrar}>
              Registrar
            </button>
          )}
        </div>
      </div>
      <table className="table table-success table-striped">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th scope="col">Nombre</th>
            <th scope="col">Edad</th>
            <th scope="col">Pais</th>
            <th scope="col">Cargo</th>
            <th scope="col">Experiencia</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleadosList.map((val, key) => {
            //valores de la columnas de la db
            return (
              <tr key={val.id}>
                <th scope="row">{val.id}</th>
                <td>{val.nombre}</td>
                <td>{val.edad}</td>
                <td>{val.pais}</td>
                <td>{val.cargo}</td>
                <td>{val.anios}</td>
                <td>
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="Basic mixed styles example"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        editarEmpleado(val);
                      }}
                      className="btn btn-info"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteEmple(val);
                      }}
                      className="btn btn-danger"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
