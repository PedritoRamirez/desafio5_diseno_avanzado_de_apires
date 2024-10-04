
const cors = require("cors");
const express = require("express");
const app = express();
const { obtenerJoyas, obtenerJoyasPorFiltros, logger} = require("./consultas");
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
// Se registran todas las solicitudes
app.use(logger);

app.listen(3000, () => console.log(`SERVIDOR ENCENDIDO EN PUERTO: ${PORT}`));
// Ruta para obtener Joyas
app.get("/joyas", async (req, res) => {
  try {
    const inventario = await obtenerJoyas(req.query);
    res.json(inventario);
  } catch (error) {
    //res.status(500).send(error);
    res.status(500).send(error.message);
  }
});

app.get("/joyas/filtros", async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas = await obtenerJoyasPorFiltros(queryStrings);
    res.json(joyas);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
