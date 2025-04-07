const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); // Importación cambiada

const app = express();

// Configura CORS para permitir solo tu dominio frontend
const allowedOrigins = [
  'https://bpmn-irm.infy.uk',
  'https://bpmn-imr.onrender.com', 
  'http://localhost:3000', //URL local para pruebas
]; 

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Dominio no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST'], // Métodos permitidos
  credentials: false // cookies o autenticación
}));

// Configuración OpenAI (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // variable en Render
});

// 3. Middlewares y rutas
app.use(express.json());

//Aquí van las rutas de health check 
app.get('/', (req, res) => res.send('OK'));  // Ruta raíz
app.get('/health', (req, res) => res.send('OK'));  // Ruta alternativa

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
