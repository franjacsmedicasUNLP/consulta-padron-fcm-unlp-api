export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  const dni = String(req.query.dni || "")
    .replace(/\D/g, "");

  if (!dni) {
    return res.status(400).json({
      encontrado: false,
      error: "Ingresá un DNI"
    });
  }

  return res.status(200).json({
    encontrado: false,
    mensaje: "Backend configurado correctamente. El padrón todavía no fue cargado."
  });
}
