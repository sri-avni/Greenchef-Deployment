const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// /api/seasonal -> returns only ingredients that actually yield recipes
app.get('/api/seasonal', (req, res) => {
  const py = spawn('python3', ['ml/get_seasonal.py']);
  let out = '', errOut = '';

  py.stdout.on('data', (d) => out += d.toString());
  py.stderr.on('data', (d) => errOut += d.toString());

  py.on('close', () => {
    if (errOut) console.error('get_seasonal stderr:', errOut);
    try {
      const data = JSON.parse(out);
      res.json(data);
    } catch (e) {
      console.error('Failed to parse /api/seasonal:', e, out);
      res.status(500).json({ error: 'Failed to load seasonal ingredients' });
    }
  });
});

// /api/recipes -> expects { seasonal }
app.post('/api/recipes', (req, res) => {
  const { seasonal = '' } = req.body;

  // Be flexible: try with both-arg and single-arg modes so model.py can parse either.
  const py = spawn('python', ['ml/model.py', '[]', seasonal]);

  let out = '', errOut = '';
  py.stdout.on('data', (d) => out += d.toString());
  py.stderr.on('data', (d) => errOut += d.toString());

  py.on('close', () => {
    if (errOut) console.error('model stderr:', errOut);
    try {
      const data = JSON.parse(out);
      res.json(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to parse /api/recipes:', e, out);
      res.status(500).json({ error: 'Failed to load recipes' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`GreenChef server running at http://localhost:${PORT}`);

});
