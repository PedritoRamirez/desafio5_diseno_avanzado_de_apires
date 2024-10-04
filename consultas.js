const { Pool } = require("pg");
const format = require("pg-format");
const fs = require('fs'); // Para escribir los reportes en un archivo
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "1234",
  database: "joyas",
  allowExitOnIdle: true,
});

// Función obtenerJoyas
const obtenerJoyas = async ({ limits = 10, order_by = "id_ASC", page = 0 }) => {
  const offset = Math.abs((page - 1) * limits);
  const [campo, direccion] = order_by.split("_");
  let consulta = format(
    "SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
    campo,
    direccion,
    limits,
    offset
  );
  console.log(order_by),
    console.log("Campo: ", campo),
    console.log("Direccion: ", direccion),
    console.log("Limite: ", limits),
    console.log("Offset: ", offset),
    console.log("Consulta SQL:", consulta);

  const { rows: inventario } = await pool.query(consulta);
  const totalStock = inventario.reduce((acu, prop) => acu + prop.stock, 0);
  console.log("Stock Total: ", totalStock);
  return {
    TotalJoyas: inventario.length,
    StockTotal: totalStock,
    result: inventario,
  };
};

const obtenerJoyasPorFiltros = async ({
  precio_max,
  precio_min,
  categoria,
  metal,
}) => {
  let filtros = [];
  const values = [];

  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };

  if (precio_min) agregarFiltro("precio", ">=", precio_min);
  if (precio_max) agregarFiltro("precio", "<=", precio_max);
  if (categoria) agregarFiltro("categoria", "ILIKE", `%${categoria}%`);
  if (metal) agregarFiltro("metal", "ILIKE", `%${metal}%`);

  let consulta = "SELECT * FROM inventario";

  if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
  } else {
    throw {
      status: 404,
      code: "404",
      message: "No hay registros con este tipo de filtro",
    };
  }

  const { rows: inventario } = await pool.query(consulta, values);
  return inventario;
};

// Middleware para registrar la información de las rutas
const logger = (req, res, next) => {
  const log = `Ruta consultada: ${req.url} | Método: ${req.method} | Fecha y hora: ${new Date().toLocaleString()}\n`;
  
  // Escribir el registro en un archivo
  fs.appendFile('reporte_consultas.log', log, (err) => {
    if (err) {
      console.error('Error al escribir en el archivo de log:', err);
    }
  });

  console.log(log); // También se puede mostrar en la consola
  next(); // Continuar con la siguiente función o ruta
};

module.exports = { obtenerJoyas, obtenerJoyasPorFiltros, logger };
