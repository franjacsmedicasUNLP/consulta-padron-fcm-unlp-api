import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizarLegajo(valor) {
  return String(valor || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "/");
}

function normalizarDni(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function cargarDatos() {
  const dataPath = path.join(__dirname, "_data.json");
  const contenido = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(contenido);
}

export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Solo GET
  if (req.method !== "GET") {
    return res.status(405).json({
      encontrado: false,
      error: "Método no permitido"
    });
  }

  try {
    const legajo = normalizarLegajo(req.query.legajo);
    const dni = normalizarDni(req.query.dni);

    /*
     * ==========================================================
     * CONSULTA POR LEGAJO
     * ==========================================================
     *
     * El archivo _data.json actualmente disponible en el
     * repositorio está indexado por DNI y no contiene el campo
     * "legajo".
     *
     * Por eso NO hacemos un recorrido de todo el JSON buscando
     * un legajo inexistente.
     */

    if (legajo) {
      return res.status(409).json({
        encontrado: false,
        codigo: "FUENTE_SIN_LEGAJO",
        mensaje:
          "El padrón actualmente cargado no contiene información de legajo.",
        detalle:
          "La API necesita una fuente de datos que incluya el número de legajo para realizar esta consulta.",
        fuenteOficial:
          "https://www.med.unlp.edu.ar/index.php/elecciones-estudiantiles-2027-exhibicion-de-padron-electoral"
      });
    }

    /*
     * ==========================================================
     * CONSULTA POR DNI
     * ==========================================================
     *
     * Se mantiene como respaldo mientras se incorpora la fuente
     * definitiva indexada por legajo.
     */

    if (dni) {
      if (dni.length < 7) {
        return res.status(400).json({
          encontrado: false,
          error: "Ingresá un DNI válido."
        });
      }

      const data = cargarDatos();
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
          carrera: registro.carrera || null,
          categoria: registro.categoria || null,
          estadoPadron: registro.estadoPadron || null,
          mesa: registro.mesa || null
        }
      });
    }

    /*
     * ==========================================================
     * SIN PARÁMETRO
     * ==========================================================
     */

    return res.status(400).json({
      encontrado: false,
      error: "Ingresá tu número de legajo."
    });

  } catch (error) {

    console.error("ERROR CONSULTA PADRON:", error);

    return res.status(500).json({
      encontrado: false,
      error: "No se pudo procesar la consulta.",
      codigo: "PADRON_API_ERROR"
    });
  }
    }
