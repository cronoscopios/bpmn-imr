const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Para llamar a la API de DeepSeek
const app = express();

app.use(cors());
app.use(express.json());

// API Key de DeepSeek (gratuita)
const DEEPSEEK_API_KEY = 'sk-9040e92446804571a2dc9b557a487da7'; 

// Genera BPMN a partir de un prompt usando IA
app.post('/generate-bpmn', async (req, res) => {
  const { prompt } = req.body;
  
  try {
    // Paso 1: Obtener texto estructurado de DeepSeek
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Genera un flujo BPMN en formato JSON con: startEvent, tasks, gateways y endEvent. Ejemplo: {start: "Start", tasks: ["Aprobar pedido"], end: "End"}'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const bpmnStructure = JSON.parse(response.data.choices[0].message.content);
    
    // Paso 2: Convertir JSON a XML BPMN
    const bpmnXML = generateBpmnXML(bpmnStructure);
    res.json({ bpmnXML });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al generar BPMN' });
  }
});

// Función para generar XML BPMN
function generateBpmnXML({ start, tasks = [], end }) {
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
      <bpmn:process id="Process_1">
        <bpmn:startEvent id="StartEvent_1" name="${start}"/>
        ${tasks.map((task, i) => `
          <bpmn:task id="Task_${i}" name="${task}"/>
          <bpmn:sequenceFlow id="Flow_${i}" sourceRef="${i === 0 ? 'StartEvent_1' : `Task_${i-1}`}" targetRef="Task_${i}"/>
        `).join('')}
        <bpmn:sequenceFlow id="Flow_end" sourceRef="Task_${tasks.length-1}" targetRef="EndEvent_1"/>
        <bpmn:endEvent id="EndEvent_1" name="${end}"/>
      </bpmn:process>
    </bpmn:definitions>
  `;
}

// Health check para Render
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));