// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://bpmn-irm.infy.uk' }));

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; //variables de entorno

app.post('/generate-bpmn', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) throw new Error('Prompt no proporcionado');

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Devuelve SOLO un JSON con: {start: string, tasks: string[], end: string}'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos máximo
      }
    );

    // Validación robusta
    const content = response.data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Respuesta vacía de DeepSeek');

    const bpmnStructure = JSON.parse(content);
    if (!bpmnStructure.tasks) throw new Error('Estructura BPMN inválida');

    const bpmnXML = generateBpmnXML(bpmnStructure);
    res.json({ bpmnXML });

  } catch (error) {
    console.error('[ERROR]', error.message);
    res.status(500).json({ 
      error: 'Error interno',
      details: error.message 
    });
  }
});