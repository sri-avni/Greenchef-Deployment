const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Works locally & on Render

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API: Get seasonal ingredients ---
app.get('/api/seasonal', (req, res) => {
  const pyProcess = spawn('python3', [path.join(__dirname, 'ml', 'get_seasonal.py')]);

  let data = '';
  let error = '';

  pyProcess.stdout.on('data', chunk => {
    data += chunk.toString();
  });

  pyProcess.stderr.on('data', chunk => {
    error += chunk.toString();
  });

  pyProcess.on('close', code => {
    if (code !== 0 || error) {
      console.error('Python error:', error);
      return res.status(500).json({ error: 'Failed to load ingredients' });
    }
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      console.error('JSON parse error:', e);
      res.status(500).json({ error: 'Invalid data format from Python' });
    }
  });
});

// --- API: Get recipes for an ingredient ---
app.get('/api/recipes/:ingredient', (req, res) => {
  const ingredient = req.params.ingredient;
  const pyProcess = spawn('python3', [path.join(__dirname, 'ml', 'model.py'), ingredient]);

  let data = '';
  let error = '';

  pyProcess.stdout.on('data', chunk => {
    data += chunk.toString();
  });

  pyProcess.stderr.on('data', chunk => {
    error += chunk.toString();
  });

  pyProcess.on('close', code => {
    if (code !== 0 || error) {
      console.error('Python error:', error);
      return res.status(500).json({ error: 'Failed to load recipes' });
    }
    try {
      res.json(JSON.parse(data));
    } catch (e) {
      console.error('JSON parse error:', e);
      res.status(500).json({ error: 'Invalid data format from Python' });
    }
  });
});

// --- Fallback: Always serve index.html for unknown routes ---
// --- Fallback: Always serve index.html for unknown routes ---
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

