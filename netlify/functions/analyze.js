const Anthropic = require("@anthropic-ai/sdk");

exports.handler = async (event) => {
  try {
    const { image, address } = JSON.parse(event.body);

    const client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: `Eres un aparejador experto. Analiza esta foto de vivienda. 
Dirección: ${address}
Detecta máximo 4 hallazgos de patología (grietas, humedad, instalaciones, etc).
Responde SOLO en JSON:
{
  "hallazgos": [{"patologia":"...", "descripcion":"...", "gravedad":"rojo/naranja/verde", "coste_min":0, "coste_max":0}],
  "score": 0
}`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { hallazgos: [], score: 5 };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};