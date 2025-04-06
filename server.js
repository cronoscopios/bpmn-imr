const express = require('express');
const cors = require('cors');
const app = express();

// Configura CORS para permitir llamadas desde cualquier dominio (útil para desarrollo)
app.use(cors());

// Simula la generación de BPMN a partir de un prompt (¡usa tu lógica real aquí!)
app.get('/generate-bpmn', (req, res) => {
  const prompt = req.query.prompt || '';

  // Ejemplo: Genera un BPMN muy básico basado en el prompt
  const bpmnXML = `
    <?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
      <bpmn:process id="Process_1" name="${prompt}">
        <bpmn:startEvent id="StartEvent_1" />
        <bpmn:task id="Task_1" name="Tarea: ${prompt}" />
        <bpmn:endEvent id="EndEvent_1" />
      </bpmn:process>
    </bpmn:definitions>
  `;

  res.json({ bpmnXML });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});