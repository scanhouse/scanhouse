// netlify/functions/analyze.js
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// BD ITEC (mismo que en el frontend)
const ITEC_DB = [
  {
    id: 1,
    categoria: "1. Estructura",
    patologia: "Grieta estructural diagonal",
    patron:
      "Fisura en forma de escalera en muro de carga o diagonal a 45º de más de 3mm",
    gravedad: "🔴",
    coste_min: 2500,
    coste_max: 6000,
    argumento:
      "Posible patrón de asentamiento diferencial. Requiere valoración estructural.",
    color: "red",
  },
  {
    id: 2,
    categoria: "1. Estructura",
    patologia: "Flecha en forjado",
    patron: "Desnivel visible del suelo o curvatura evidente del techo",
    gravedad: "🔴",
    coste_min: 4000,
    coste_max: 10000,
    argumento:
      "Deformación activa en forjado. Riesgo de fatiga que exige intervención pericial.",
    color: "red",
  },
  {
    id: 3,
    categoria: "2. Agua / Humedad",
    patologia: "Humedad por capilaridad",
    patron:
      "Manchas oscuras o salitre blanco en la parte baja de muros (0-1m altura)",
    gravedad: "🟡",
    coste_min: 1000,
    coste_max: 3000,
    argumento:
      "Remonte capilar por fallo de impermeabilización. Requiere saneado e inyección.",
    color: "amber",
  },
  {
    id: 4,
    categoria: "2. Agua / Humedad",
    patologia: "Filtración de cubierta",
    patron: "Cerco marrón o amarillento en techo, a veces con gotitas",
    gravedad: "🔴",
    coste_min: 500,
    coste_max: 2500,
    argumento: "Entrada de agua activa desde exterior. Exige reparación de origen.",
    color: "red",
  },
  {
    id: 5,
    categoria: "2. Agua / Humedad",
    patologia: "Moho / Condensación",
    patron: "Puntos negros en esquinas, alrededor de ventanas o tras muebles",
    gravedad: "🟢",
    coste_min: 300,
    coste_max: 800,
    argumento:
      "Mala ventilación o puente térmico. Se mitiga con mejora de aislamiento.",
    color: "green",
  },
  {
    id: 6,
    categoria: "3. Instalaciones",
    patologia: "Cuadro eléctrico obsoleto",
    patron: "Cuadro antiguo con fusibles de porcelana o sin diferencial",
    gravedad: "🔴",
    coste_min: 1500,
    coste_max: 3500,
    argumento:
      "Instalación no normativa. Riesgo eléctrico que exige recableado.",
    color: "red",
  },
  {
    id: 7,
    categoria: "3. Instalaciones",
    patologia: "Tuberías de plomo/hierro",
    patron:
      "Tuberías vistas de color gris mate o hierro oxidado bajo fregaderos",
    gravedad: "🟡",
    coste_min: 2000,
    coste_max: 4500,
    argumento: "Fontanería al final de vida útil. Riesgo inminente de fugas.",
    color: "amber",
  },
  {
    id: 8,
    categoria: "4. Cerramientos",
    patologia: "Ventanas sin RPT / Cristal simple",
    patron: "Marcos de aluminio fino o madera antigua con cristal único",
    gravedad: "🟡",
    coste_min: 3000,
    coste_max: 8000,
    argumento:
      "Cerramientos altamente ineficientes. Penalización en gasto de climatización.",
    color: "amber",
  },
  {
    id: 9,
    categoria: "4. Cerramientos",
    patologia: "Podredumbre en carpintería",
    patron: "Marcos de madera exterior oscurecidos o deshaciéndose en base",
    gravedad: "🟡",
    coste_min: 800,
    coste_max: 2000,
    argumento:
      "Carpintería exterior degradada por humedad. Pérdida de aislamiento.",
    color: "amber",
  },
  {
    id: 10,
    categoria: "4. Cerramientos",
    patologia: "Sellado sanitario degradado",
    patron: "Juntas de silicona negras con moho o desprendidas",
    gravedad: "🟢",
    coste_min: 100,
    coste_max: 300,
    argumento:
      "Fallo de mantenimiento menor. Puede causar filtraciones si no se renueva.",
    color: "green",
  },
  {
    id: 11,
    categoria: "5. Interiores",
    patologia: "Parquet abombado",
    patron:
      "Lamas de madera levantadas chocando entre sí (efecto tienda)",
    gravedad: "🟡",
    coste_min: 800,
    coste_max: 2500,
    argumento:
      "Daño por agua bajo pavimento. Exige sustitución del revestimiento.",
    color: "amber",
  },
  {
    id: 12,
    categoria: "5. Interiores",
    patologia: "Alicatado desprendido",
    patron: "Azulejos abombados o con llagas vacías y oscuras",
    gravedad: "🟡",
    coste_min: 600,
    coste_max: 1500,
    argumento:
      "Fallo de adherencia del revestimiento. Posible humedad retenida.",
    color: "amber",
  },
  {
    id: 13,
    categoria: "6. Exteriores",
    patologia: "Fisura en vaso de piscina",
    patron: "Línea oscura en gresite del vaso o grieta cerca de skimmers",
    gravedad: "🔴",
    coste_min: 1500,
    coste_max: 4000,
    argumento:
      "Sospecha de pérdida de estanqueidad estructural. Requiere prueba.",
    color: "red",
  },
  {
    id: 14,
    categoria: "6. Exteriores",
    patologia: "Raíces levantando pavimento",
    patron: "Grietas radiales y levantamiento de soleras cerca de árboles",
    gravedad: "🟡",
    coste_min: 800,
    coste_max: 2000,
    argumento:
      "Daños por sistema radicular. Implica demolición y nuevo pavimento.",
    color: "amber",
  },
  {
    id: 15,
    categoria: "6. Exteriores",
    patologia: "Desplome de muro contención",
    patron:
      "Inclinación visible hacia adelante o grietas horizontales gruesas",
    gravedad: "🔴",
    coste_min: 3000,
    coste_max: 8000,
    argumento:
      "Empuje excesivo de tierras o fallo de drenaje. Riesgo de colapso.",
    color: "red",
  },
  {
    id: 16,
    categoria: "6. Exteriores",
    patologia: "Desprendimiento de fachada",
    patron: "Grietas verticales muy largas o desconchones grandes",
    gravedad: "🔴",
    coste_min: 2500,
    coste_max: 10000,
    argumento: "Patología de revestimiento. Riesgo de filtraciones masivas.",
    color: "red",
  },
  {
    id: 17,
    categoria: "7. Cubiertas",
    patologia: "Tejas rotas / Canalones obstruidos",
    patron: "Tejas fuera de sitio o canalones llenos de tierra y hojas",
    gravedad: "🟡",
    coste_min: 300,
    coste_max: 1500,
    argumento: "Punto ciego de mantenimiento. Alto riesgo de entrada de agua.",
    color: "amber",
  },
  {
    id: 18,
    categoria: "1. Estructura",
    patologia: "Fisura de retracción (Estética)",
    patron: "Grieta fina, recta y superficial en yeso o pladur",
    gravedad: "🟢",
    coste_min: 150,
    coste_max: 300,
    argumento:
      "Fisura estética por cambios de temperatura. Solo requiere masilla.",
    color: "green",
  },
  {
    id: 19,
    categoria: "4. Cerramientos",
    patologia: "Corrosión en radiadores",
    patron: "Manchas de óxido en llaves del radiador o marcas de agua",
    gravedad: "🟡",
    coste_min: 300,
    coste_max: 1200,
    argumento: "Pérdida de estanqueidad en circuito. Posible sustitución.",
    color: "amber",
  },
  {
    id: 20,
    categoria: "3. Instalaciones",
    patologia: "Aluminosis / Carbonatación",
    patron:
      "Viguetas descubiertas mostrando óxido naranja o desprendimiento",
    gravedad: "🔴",
    coste_min: 5000,
    coste_max: 15000,
    argumento:
      "Corrosión avanzada en armaduras. Requiere intervención inmediata.",
    color: "red",
  },
];

// Construir prompt de sistema
const SYSTEM_PROMPT = `Eres un aparejador experto con 20+ años analizando patología de edificios. 
Analizas fotos de viviendas e identificas daños estructurales, humedades, desgaste e instalaciones.

Tu respuesta DEBE ser JSON válido con esta estructura exacta:
{
  "hallazgos": [
    {
      "patologia": "Nombre exacto del hallazgo",
      "descripcion": "Descripción técnica breve",
      "gravedad": "🔴 / 🟡 / 🟢",
      "coste_min": número,
      "coste_max": número,
      "confianza": 0.0 a 1.0
    }
  ],
  "score_general": 0.0 a 10.0
}

REGLAS CRÍTICAS:
- NUNCA inventes hallazgos no visibles en la imagen
- Si algo es ambiguo, baja confianza (<0.7) o no lo incluyas
- Usa lenguaje técnico preciso
- Máximo 4 hallazgos por análisis
- Si la foto no es de interior/vivienda, devuelve JSON vacío
- Responde SOLO en JSON, sin markdown ni texto extra`;

export const handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  // POST request
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { photos, address } = JSON.parse(event.body);

    if (!photos || !photos.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No photos provided" }),
      };
    }

    if (!address) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No address provided" }),
      };
    }

    // Construir mensaje para Claude Vision
    const imageContent = photos.map((photoBase64) => ({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: photoBase64.split(",")[1] || photoBase64, // Remover data URL prefix si existe
      },
    }));

    // Añadir texto del usuario
    imageContent.push({
      type: "text",
      text: `Analiza estas fotos de vivienda en: ${address}. 
      
Busca activamente los siguientes patrones de patología (según BD ITEC):
${ITEC_DB.map((item) => `- ${item.patologia}: ${item.patron}`).join("\n")}

Responde en JSON válido.`,
    });

    // Llamar a Claude Vision API
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: imageContent,
        },
      ],
    });

    // Extraer respuesta
    let analysisText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    // Limpiar respuesta si contiene markdown
    analysisText = analysisText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const analysis = JSON.parse(analysisText);

    // Enriquecer con datos de ITEC_DB
    const enrichedFindings = (analysis.hallazgos || []).map((hallazgo) => {
      const itecMatch = ITEC_DB.find(
        (item) =>
          item.patologia.toLowerCase() ===
          hallazgo.patologia.toLowerCase()
      );

      return {
        ...hallazgo,
        coste_min:
          hallazgo.coste_min || (itecMatch ? itecMatch.coste_min : 300),
        coste_max:
          hallazgo.coste_max || (itecMatch ? itecMatch.coste_max : 1500),
        gravedad: hallazgo.gravedad || (itecMatch ? itecMatch.gravedad : "🟢"),
        color: itecMatch ? itecMatch.color : "green",
      };
    });

    // Calcular score final
    const score = analysis.score_general || calculateScore(enrichedFindings);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        address,
        score: parseFloat(score).toFixed(1),
        findings: enrichedFindings,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || "Internal server error",
      }),
    };
  }
};

// Helper: calcular score basado en hallazgos
function calculateScore(findings) {
  let score = 10;

  findings.forEach((f) => {
    if (f.gravedad === "🔴") score -= 2;
    if (f.gravedad === "🟡") score -= 1;
    // Reducir más si hay baja confianza
    if (f.confianza && f.confianza < 0.6) score -= 0.5;
  });

  return Math.max(1, Math.min(10, score));
}
