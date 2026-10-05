import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "_data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

function normalizarDni(valor) {
  return String(valor || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      encontrado: false,
      error: "Método no permitido"
    });
  }

  const dni = normalizarDni(req.query.dni);

  if (!dni || dni.length < 7) {
    return res.status(400).json({
      encontrado: false,
      error: "Ingresá un DNI válido"
    });
  }

  const registro = data[dni];

  if (!registro) {
    return res.status(404).json({
      encontrado: false,
      mensaje: "No se encontró el DNI en el padrón."
    });
  }

  return res.status(200).json({
    encontrado: true,
    resultado: {
      carrera: registro.carrera,
      categoria: registro.categoria,
      estadoPadron: registro.estadoPadron,
      mesa: registro.mesa
    }
  });
}
