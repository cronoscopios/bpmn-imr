const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); // Importación cambiada

const app = express();
app.use(cors());

// Configuración OpenAI (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Asegúrate de tener esta variable en Render
});

// Ruta para generar BPMN
app.get('/generate-bpmn', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({ error: 'Se requiere el parámetro "prompt"' });
  }

  try {
    const completion = await openai.chat.completions.create({ // Sintaxis nueva
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Eres un generador de XML BPMN. Devuelve solo código XML válido." 
        },
        { 
          role: "user", 
          content: `Genera un diagrama BPMN para: ${prompt}` 
        }
      ],
      temperature: 0.7
    });

    const bpmnXML = completion.choices[0].message.content;
    res.json({ bpmnXML });

  } catch (error) {
    console.error("Error con OpenAI:", error);
    res.status(500).json({ error: "Fallo al generar BPMN" });
  }
});

// Health check para Render
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));