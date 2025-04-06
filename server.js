// server.js - Backend para generación de BPMN con OpenAI
//require('dotenv').config(); // Solo necesario para desarrollo local
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

// Configuración de Express
const app = express();

// Configuración detallada de CORS
app.use(cors({
  origin: [
    'http://bpmn-irm.infy.uk', // Reemplaza con tu dominio en InfinityFree
    'http://localhost:3000'       // Para desarrollo local
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Middleware para parsear JSON
app.use(express.json());

// Configuración de OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || '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' // Usa variable de entorno o clave local para pruebas
});
const openai = new OpenAIApi(configuration);

// Ruta para generar BPMN
app.get('/generate-bpmn', async (req, res) => {
  const prompt = req.query.prompt;
  
  if (!prompt) {
    return res.status(400).json({ error: 'El parámetro "prompt" es requerido' });
  }

  try {
    // Instrucción detallada para OpenAI
    const instruction = `
      Genera un diagrama BPMN en formato XML para el siguiente proceso: ${prompt}.
      Incluye al menos:
      1. Un startEvent
      2. Tres tareas principales
      3. Un gateway de decisión
      4. Un endEvent
      Usa el estándar BPMN 2.0.
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Eres un experto en BPMN que genera XML válido para bpmn-js." 
        },
        { 
          role: "user", 
          content: instruction 
        }
      ],
      temperature: 0.7
    });

    const bpmnXML = completion.data.choices[0].message.content;
    
    // Limpieza del XML (por si OpenAI agrega texto adicional)
    const cleanXML = bpmnXML.replace(/```xml/g, '').replace(/```/g, '').trim();
    
    res.json({ bpmnXML: cleanXML });
  } catch (error) {
    console.error("Error con OpenAI:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Error al generar el BPMN",
      details: error.response?.data || error.message
    });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Generación BPMN - Usa /generate-bpmn?prompt=TU_TEXTO');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error interno del servidor');
});

// Puerto (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});