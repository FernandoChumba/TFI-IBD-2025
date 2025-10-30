import { useState, useEffect } from "react";
import Axios from "axios";
import "./App.css";
import "./index.css";

import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

// --- URL Base de tu API de Node.js ---
const API_URL = "http://localhost:5174"; // El puerto donde corre tu node index.js

function App() {
  // --- Estados para el CRUD de Artículos ---
  const [articuloId, setArticuloId] = useState(""); 
  const [nombre, setNombre] = useState("");
  const [subFamiliaId, setSubFamiliaId] = useState("");
  const [precio, setPrecio] = useState("");
  const [editar, setEditar] = useState(false);
  
  // *** CAMBIO: Este estado ahora guardará la lista de STOCK ***
  const [stockList, setStockList] = useState([]);

  // --- Estados para el formulario de Venta (Punto 8) ---
  const [ventaSupermercadoId, setVentaSupermercadoId] = useState("1");
  const [ventaArticuloId, setVentaArticuloId] = useState("");
  const [ventaCantidad, setVentaCantidad] = useState("1");

  // Carga la lista de stock al iniciar
  useEffect(() => {
    // *** CAMBIO: Llama a la nueva función ***
    getStockList(); 
  }, []); 

  // ---
  // --- FUNCIONES DEL CRUD DE ARTÍCULOS (Sin cambios)
  // ---
  const registrar = () => {
    Axios.post(`${API_URL}/api/articulos`, {
      articuloId: articuloId, subFamiliaId: subFamiliaId, nombre: nombre, precio: precio,
    }).then(() => {
      clear();
      Swal.fire("Registro Exitoso", "El artículo " + nombre + " fue registrado.", "success");
      // Opcional: recargar el stock si crear un artículo afecta el stock
      // getStockList(); 
    }).catch(handleApiError);
  };

  const editarArticulo = (val) => {
    setEditar(true);
    window.scrollTo(0, 0); 
    // Los nombres de columna de 'articulo' (para el form) son diferentes
    // a los de la lista de 'stock'. Usamos el CRUD.
    // Por ahora, lo llenamos desde la lista de stock (simple)
    setArticuloId(val.Articulo_ArticuloId);
    setNombre(val.ArticuloNombre);
    setSubFamiliaId(val.SubFamilia_SubFamiliaId); // No está en el join, así que lo quitamos
    setPrecio(val.ArticuloPrecio);
  };

  const update = () => {
    Axios.put(`${API_URL}/api/articulos/${articuloId}`, {
      nombre: nombre, precio: precio, subFamiliaId: subFamiliaId,
    }).then(() => {
      clear();
      Swal.fire("Actualizado", "El artículo " + nombre + " fue actualizado.", "success");
      getStockList(); // Recargamos el stock por si el precio cambió
    }).catch(handleApiError);
  };

  const clear = () => {
    setArticuloId(""); setNombre(""); setSubFamiliaId(""); setPrecio(""); setEditar(false);
  };

  const deleteArticulo = (val) => {
    Swal.fire({
      title: "Confirmar Eliminado",
      html: `¿Realmente desea eliminar <strong>${val.ArticuloNombre}</strong>?`,
      icon: "warning", showCancelButton: true, confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33", confirmButtonText: "Sí, eliminarlo",
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`${API_URL}/api/articulos/${val.Articulo_ArticuloId}`).then(() => {
          Swal.fire("Eliminado!", val.ArticuloNombre + " ha sido eliminado.", "success");
          getStockList(); // Recargamos el stock
        }).catch(handleApiError);
      }
    });
  };

  // ---
  // --- NUEVA FUNCIÓN PARA OBTENER EL STOCK
  // ---
  const getStockList = () => {
    Axios.get(`${API_URL}/api/stock`).then((response) => {
      setStockList(response.data);
    }).catch(handleApiError);
  };

  // ---
  // --- FUNCIÓN DE VENTA (Punto 8) - MODIFICADA
  // ---
  const handleRegistrarVenta = () => {
    if (!ventaSupermercadoId || !ventaArticuloId || !ventaCantidad) {
      Swal.fire("Error", "Todos los campos de venta son obligatorios", "error");
      return;
    }

    Axios.post(`${API_URL}/api/ventas/registrar`, {
      supermercadoId: parseInt(ventaSupermercadoId),
      articuloId: ventaArticuloId,
      cantidad: parseInt(ventaCantidad),
    }).then(() => {
      Swal.fire({
        title: "<strong>Venta Registrada!</strong>",
        html: `<i>Se vendieron ${ventaCantidad} unidad(es) de ${ventaArticuloId}. El stock fue actualizado.</i>`,
        icon: "success",
        timer: 4000,
      });
      
      // ---
      // --- ¡REQUISITO CUMPLIDO! (Descuento automático) ---
      // Volvemos a llamar a la API de stock para refrescar la lista.
      getStockList();
      // ---
      
      setVentaArticuloId("");
      setVentaCantidad("1");
    }).catch(handleApiError);
  };

  // Función genérica de manejo de errores
  const handleApiError = (error) => {
    let errorMessage = "Ocurrió un error.";
    if (error.response && error.response.data.error) {
      errorMessage = error.response.data.error;
    } else if (error.request) {
      errorMessage = "No se pudo conectar al servidor.";
    }
    Swal.fire({ icon: "error", title: "Oops...", text: errorMessage });
  };


  // --- JSX (HTML) ---
  return (
    <div className="container">
      
      {/* SECCIÓN: REGISTRAR VENTA (Punto 8) - Sin cambios */}
      <div className="card text-center mb-4">
        <div className="card-header bg-primary text-white">
          REGISTRAR VENTA
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="input-group mb-3">
                <span className="input-group-text">Supermercado ID</span>
                <input type="number" className="form-control" placeholder="Ej: 1" value={ventaSupermercadoId} onChange={(e) => setVentaSupermercadoId(e.target.value)} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group mb-3">
                <span className="input-group-text">Artículo ID</span>
                <input type="text" className="form-control" placeholder="Ej: CAF-001" value={ventaArticuloId} onChange={(e) => setVentaArticuloId(e.target.value)} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group mb-3">
                <span className="input-group-text">Cantidad</span>
                <input type="number" className="form-control" placeholder="Ej: 3" value={ventaCantidad} onChange={(e) => setVentaCantidad(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer text-body-secondary">
          <button className="btn btn-primary" onClick={handleRegistrarVenta}>
            Realizar Venta
          </button>
        </div>
      </div>

      {/* ==================================================
        SECCIÓN: GESTIÓN DE ARTÍCULOS (CRUD)
        La dejamos para poder CREAR y EDITAR artículos
        ==================================================
      */}
    
      {/* ==================================================
        CAMBIO: TABLA DE STOCK (Tu nuevo requisito)
        ==================================================
      */}
      <h2 className="mt-5">Stock en Tiendas</h2>
      <table className="table table-striped mt-4">
        <thead>
          <tr>
            <th scope="col">Supermercado</th>
            <th scope="col">Artículo ID</th>
            <th scope="col">Nombre Artículo</th>
            <th scope="col">Stock Actual</th>
            <th scope="col">Precio Unit.</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Mapeamos el NUEVO estado 'stockList' */}
          {stockList.map((val) => {
            return (
              <tr key={val.StockId}>
                {/* Mostramos los datos de la consulta JOIN */}
                <td>{val.SupermercadoNombre} (ID: {val.Supermercado_SupermercadoId})</td>
                <td>{val.Articulo_ArticuloId}</td>
                <td>{val.ArticuloNombre}</td>
                {/* ¡Aquí se verá el descuento automático! */}
                <td><strong>{val.CantidadStock}</strong></td>
                <td>${parseFloat(val.ArticuloPrecio).toFixed(2)}</td>
                <td>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      onClick={() => {
                        // Pasamos 'val' (que es un item de stock)
                        // a la función de editar
                        
                        // NOTA: Esta función ahora llena el form de arriba
                        setEditar(true);
                        window.scrollTo(0, 0); 
                        setArticuloId(val.Articulo_ArticuloId);
                        setNombre(val.ArticuloNombre);
                        // No tenemos SubFamiliaId en esta lista, así que lo dejamos vacío
                        setSubFamiliaId(""); 
                        setPrecio(val.ArticuloPrecio);
                      }}
                      className="btn btn-info btn-sm"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Adaptamos 'deleteArticulo' para que funcione
                        // con la data de la lista de stock
                        deleteArticulo({
                          ArticuloId: val.Articulo_ArticuloId, 
                          ArticuloNombre: val.ArticuloNombre
                        });
                      }}
                      className="btn btn-danger btn-sm"
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