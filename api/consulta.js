import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "_data.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

function normalizarLegajo(valor) {
  return String(valor || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "/");
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

  const legajo = normalizarLegajo(req.query.legajo);

  if (!legajo || legajo.length < 3) {
    return res.status(400).json({
      encontrado: false,
      error: "Ingresá un número de legajo válido"
    });
  }

  let registro = null;

for (const clave of Object.keys(data)) {
  const persona = data[clave];

  if (
    persona &&
    normalizarLegajo(persona.legajo) === legajo
  ) {
    registro = persona;
    break;
  }
}

  if (!registro) {
    return res.status(404).json({
      encontrado: false,
      mensaje: "No se encontró el legajo en el padrón."
    });
  }

  return res.status(200).json({
    encontrado: true,
    resultado: {
      legajo: registro.legajo,
      carrera: registro.carrera,
      categoria: registro.categoria,
      estadoPadron: registro.estadoPadron,
      mesa: registro.mesa
    }
  });
    }
