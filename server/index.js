const express = require("express");
const app = express();
const sql = require("mssql");// 1. CAMBIO: Importamos 'mssql' en lugar de 'mysql2'
const cors = require("cors");

app.use(cors());
app.use(express.json());

// 2. CAMBIO: La configuración de conexión de SQL Server es diferente
// 2. CAMBIO: Configuración correcta para Autenticación de Windows
// 2. CAMBIO: Configuración correcta para Autenticación de Windows
const dbConfig = {
  user: 'TFI_IBD', // Usuario de SQL
  password: '12345', // La contraseña que pusiste
  server: 'localhost\\SQLEXPRESS',
  database: 'TFI-IMP-2025',
  options: {
      encrypt: false,
      trustServerCertificate: true 
  }
  // ¡Quita la línea 'trustedConnection: true'!
};

// Creamos un "pool" de conexiones para que sea eficiente
let pool;
async function connectToDb() {
    try {
        pool = await sql.connect(dbConfig);
        console.log("Conectado a SQL Server (TFI-IMP-2025) exitosamente!");
    } catch (err) {
        console.error("Error al conectar a la base de datos:", err);
    }
}
// Conectamos al iniciar el servidor
connectToDb();


// 3. CAMBIO: Adaptamos el CRUD para la tabla 'tpi.articulo'
// Usamos async/await en lugar de callbacks para un código más limpio.

// --- CREAR un Artículo (Create) ---
// Cambiamos a una ruta más RESTful: POST /api/articulos
app.post("/api/articulos", async (req, res) => {
    // Los campos deben coincidir con tu frontend y la tabla tpi.articulo
    const { articuloId, subFamiliaId, nombre, precio } = req.body;

    // Validación simple
    if (!articuloId || !subFamiliaId || !nombre || !precio) {
        return res.status(400).send({ error: 'Faltan campos obligatorios.' });
    }

    try {
        // Usamos el pool para crear una petición
        const request = pool.request();
        
        // 4. CAMBIO: SQL Server usa parámetros con @nombre
        request.input('articuloId', sql.VarChar(50), articuloId);
        request.input('subFamiliaId', sql.Int, subFamiliaId);
        request.input('nombre', sql.VarChar(200), nombre);
        request.input('precio', sql.Real, precio);
        
        // 5. CAMBIO: La consulta SQL apunta a tpi.articulo
        const query = `
            INSERT INTO tpi.articulo (ArticuloId, SubFamilia_SubFamiliaId, ArticuloNombre, ArticuloPrecio) 
            VALUES (@articuloId, @subFamiliaId, @nombre, @precio)
        `;
        
        const result = await request.query(query);
        res.status(201).send({ message: "Artículo creado exitosamente", result });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

// --- MOSTRAR todos los Artículos (Read) ---
// Cambiamos la ruta a GET /api/articulos
app.get("/api/articulos", async (req, res) => {
    try {
        const request = pool.request();
        const query = "SELECT * FROM tpi.articulo";
        const result = await request.query(query);
        
        // 6. CAMBIO: Los datos vienen en 'result.recordset'
        res.send(result.recordset);

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

// --- ACTUALIZAR un Artículo (Update) ---
// Cambiamos a una ruta RESTful: PUT /api/articulos/:id
app.put("/api/articulos/:id", async (req, res) => {
    const { id } = req.params; // Obtenemos el ID de la URL
    const { nombre, precio, subFamiliaId } = req.body; // Campos a actualizar

    if (!nombre || !precio || !subFamiliaId) {
        return res.status(400).send({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const request = pool.request();
        request.input('id', sql.VarChar(50), id);
        request.input('nombre', sql.VarChar(200), nombre);
        request.input('precio', sql.Real, precio);
        request.input('subFamiliaId', sql.Int, subFamiliaId);

        const query = `
            UPDATE tpi.articulo 
            SET ArticuloNombre = @nombre, 
                ArticuloPrecio = @precio,
                SubFamilia_SubFamiliaId = @subFamiliaId
            WHERE ArticuloId = @id
        `;
        
        const result = await request.query(query);
        res.send({ message: "Artículo actualizado", result });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

// --- BORRAR un Artículo (Delete) ---
// Cambiamos a una ruta RESTful: DELETE /api/articulos/:id
app.delete("/api/articulos/:id", async (req, res) => {
    const { id } = req.params; // Obtenemos el ID de la URL

    try {
        const request = pool.request();
        request.input('id', sql.VarChar(50), id);

        const query = "DELETE FROM tpi.articulo WHERE ArticuloId = @id";
        
        const result = await request.query(query);
        res.send({ message: "Artículo eliminado", result });

    } catch (err) {
        // Manejo de error si el artículo está en una Venta (Error de Foreign Key)
        if (err.number === 547) { // Código de error de SQL Server para FK
            return res.status(400).send({ error: "No se puede borrar el artículo, tiene ventas asociadas." });
        }
        console.log(err);
        res.status(500).send(err.message);
    }
});

app.post("/api/ventas/registrar", async (req, res) => {
  // 1. Obtenemos los datos del frontend (React)
  const { supermercadoId, articuloId, cantidad } = req.body;

  // Validación simple
  if (!supermercadoId || !articuloId || !cantidad) {
      return res.status(400).send({ error: 'Faltan datos para la venta.' });
  }

  try {
      // 2. Preparamos la llamada al Stored Procedure
      const request = pool.request();
      
      // 3. Pasamos los parámetros de entrada
      request.input('SupermercadoId', sql.Int, supermercadoId);
      request.input('ArticuloId', sql.VarChar(50), articuloId);
      request.input('CantidadVendida', sql.Int, cantidad);
      
      // 4. Ejecutamos el SP
      await request.execute('tpi.SP_RegistrarVenta');
      
      // 5. Si todo va bien, enviamos éxito
      res.status(200).send({ message: "Venta registrada exitosamente" });

  } catch (err) {
      // 6. MANEJO DE ERRORES (Punto 8b)
      // Si el error es el RAISERROR (N° 50000) de "Stock insuficiente"
      if (err.originalError && err.originalError.info.number === 50000) {
          // Enviamos el mensaje de error del SP al frontend
          res.status(400).send({ error: err.originalError.info.message });
      } else {
          // Otro error (ej: el artículo no existe, etc.)
          console.log(err);
          res.status(500).send({ error: err.message });
      }
  }
});

// --- MOSTRAR LISTA DE STOCK (PARA LA VISTA PRINCIPAL) ---
app.get("/api/stock", async (req, res) => {
  try {
      const request = pool.request();
      
      // Esta consulta es la clave: une Stock, Articulo y Supermercado
      const query = `
          SELECT 
              s.StockId,
              s.Supermercado_SupermercadoId,
              s.Articulo_ArticuloId,
              s.CantidadStock,
              a.ArticuloNombre,
              a.ArticuloPrecio,
              sup.SupermercadoNombre
          FROM 
              tpi.Stock s
          JOIN 
              tpi.articulo a ON s.Articulo_ArticuloId = a.ArticuloId
          JOIN 
              tpi.supermercado sup ON s.Supermercado_SupermercadoId = sup.SupermercadoId
          ORDER BY
              sup.SupermercadoNombre, a.ArticuloNombre
      `;
      
      const result = await request.query(query);
      
      // Enviamos la lista completa de stock
      res.send(result.recordset);

  } catch (err) {
      console.log(err);
      res.status(500).send({ error: err.message });
  }
});

// Mantenemos el puerto 5174
app.listen(5174, () => {
    console.log("Servidor backend corriendo en el puerto 5174");
});

