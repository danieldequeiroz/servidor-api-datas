const express = require('express');
const app = express();
const port = 3001;
const moment = require('moment');

app.use(express.json()); // Habilita o parsing de JSON nos requests

const fs = require('fs');
const feriadosJson = fs.readFileSync('./public/feriados.json', 'utf8');
const feriados = JSON.parse(feriadosJson);

// Função que verifica se um determinado dia é feriado
function isHoliday(day, holidays) {
  return holidays.some(holiday => holiday.date === day.format('YYYY-MM-DD'));
}

// API para calcular dias úteis entre duas datas
app.get('/dias-uteis', (req, res) => {
  if (!req.query.dataInicial || !req.query.dataFinal && !req.query.quantDiasUteis) {
    // Nenhum parâmetro ou parâmetro inválido
    res.status(400).json({ error: 'Parâmetros inválidos' });
  } else if (req.query.dataInicial && req.query.dataFinal) {
    // Data Inicial, Data Final
    const startDate = moment(req.query.dataInicial, 'YYYY-MM-DD');
    const endDate = moment(req.query.dataFinal, 'YYYY-MM-DD');
    if (!startDate.isValid() || !endDate.isValid()) {
      // Data inválida
      res.status(400).json({ error: 'Data inválida' });
    } else {
      let totalDays = 0;
      for (let day = startDate; day <= endDate; day.add(1, 'days')) {
        if (day.isoWeekday() !== 6 && day.isoWeekday() !== 7 && !isHoliday(day, feriados)) {
          totalDays++;
        }
      }
      res.json({ diasUteis: totalDays });
    }
  } else if (req.query.dataInicial && req.query.quantDiasUteis) {
    // Data Inicial, quant dias úteis
    const startDate = moment(req.query.dataInicial, 'YYYY-MM-DD');
    if (!startDate.isValid()) {
      // Data inválida
      res.status(400).json({ error: 'Data inválida' });
    } else {
      const quantDiasUteis = parseInt(req.query.quantDiasUteis);
      if (isNaN(quantDiasUteis) || quantDiasUteis <= 0) {
        // Quantidade de dias úteis inválida
        res.status(400).json({ error: 'Quantidade de dias úteis inválida' });
      } else {
        let endDate = startDate.clone();
        for (let i = 0; i < quantDiasUteis; i++) {
          endDate.add(1, 'days');
          while (endDate.isoWeekday() === 6 || endDate.isoWeekday() === 7 || isHoliday(endDate, feriados)) {
            endDate.add(1, 'days');
          }
        }
        res.json({ dataFinal: endDate.format('YYYY-MM-DD') });
      }
    }
  } else {
    // Nenhum parâmetro
    res.json(feriados);
  }
});

app.get('/', (req, res) => {
  res.send('Bem-vindo ao Servidor API DATAS');
});

app.get('/feriados', (req, res) => {
    res.json(feriados);
  });

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:3001`);
});
