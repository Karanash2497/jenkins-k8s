const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.APP_ENV || 'production';

const colors = {
  dev: '#3B82F6',
  production: '#10B981'
};

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial; text-align:center; padding:50px;
        background:${colors[ENV] || '#6B7280'}">
        <h1 style="color:white">☸️ Kubernetes App</h1>
        <p style="color:white">Deployed via Jenkins + Docker + Minikube</p>
        <p style="color:white">Environment: <b>${ENV}</b></p>
        <p style="color:white">Build: <b>#${process.env.BUILD_NUMBER || 'local'}</b></p>
        <p style="color:white">Pod: <b>${process.env.HOSTNAME || 'unknown'}</b></p>
        <p style="color:white">Time: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: ENV,
    build: process.env.BUILD_NUMBER || 'local',
    pod: process.env.HOSTNAME || 'unknown',
    timestamp: new Date()
  });
});

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
module.exports = app;
