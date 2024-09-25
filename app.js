const express = require('express');
const app = express();
const port = 3002;
const moment = require('moment');
const feriados = require('./feriados');
const feriadosFixos = require('./feriadosfixos.json');
const feriadosNaoFixos = require('./feriadosnaofixos.json');

app.set('view engine', 'ejs'); // Configura o motor de template como EJS

// Defina a rota para exibir os feriados em JSON
app.get('/api/feriados', (req, res) => {
  try {
    res.json(feriados); // Retorna os feriados como JSON
  } catch (error) {
    console.error('Erro ao retornar feriados em JSON:', error);
    res.status(500).json({ message: 'Erro ao retornar feriados em JSON' });
  }
});

// Defina a rota para exibir os feriados fixos em JSON
app.get('/api/feriadosfixos', (req, res) => {
  try {
    res.json(feriadosFixos); // Retorna os feriados fixos como JSON
  } catch (error) {
    console.error('Erro ao retornar feriados fixos em JSON:', error);
    res.status(500).json({ message: 'Erro ao retornar feriados fixos em JSON' });
  }
});

// Defina a rota para exibir os feriados não fixos em JSON
app.get('/api/feriadosnaofixos', (req, res) => {
  try {
    res.json(feriadosNaoFixos); // Retorna os feriados não fixos como JSON
  } catch (error) {
    console.error('Erro ao retornar feriados não fixos em JSON:', error);
    res.status(500).json({ message: 'Erro ao retornar feriados não fixos em JSON' });
  }
});

// Defina a rota para renderizar a view
app.get('/', (req, res) => {
  try {
    res.render('feriados', { feriados: feriados }); // Renderiza a view feriados.ejs com os feriados
  } catch (error) {
    console.error('Erro ao renderizar view:', error);
    res.status(500).json({ message: 'Erro ao renderizar view' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:3002`);
});
