const express = require('express');
const app = express();
const port = 3000;
const moment = require('moment');
const feriados = require('./feriados');
res.json(feriados);

app.set('view engine', 'ejs'); // Configura o motor de template como EJS

app.get('/', (req, res) => {
  res.render('feriados', { feriados: feriados }); // Renderiza a view feriados.ejs com os feriados
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:3000`);
});
