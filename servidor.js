const express = require('express'); // Importa o framework Express para criar o servidor web
const app = express(); // Cria uma instância do servidor
const port = 3001; // Define a porta em que o servidor vai rodar
const moment = require('moment');  // Importa a biblioteca Moment.js para manipulação de datas

app.use(express.json()); // Habilita o parsing de JSON nos requests
app.use(express.static('public'));  // Serve arquivos estáticos da pasta 'public'

const fs = require('fs');  // Importa o módulo File System para ler arquivos
const feriadosJson = fs.readFileSync('./public/feriados.json', 'utf8');   // Lê o arquivo JSON com os feriados
const feriados = JSON.parse(feriadosJson);  // Converte o conteúdo do arquivo para um objeto JavaScript

// Função que verifica se um determinado dia é feriado
function isHoliday(day, holidays) {
  return holidays.some(holiday => holiday.date === day.format('YYYY-MM-DD'));
}

// API para calcular dias úteis entre duas datas
app.get('/dias-uteis', (req, res) => {
    // Verifica se os parâmetros 'dataInicial' e 'dataFinal' ou 'quantDiasUteis' estão presentes
  if (!req.query.dataInicial || !req.query.dataFinal && !req.query.quantDiasUteis) {
    // Nenhum parâmetro ou parâmetro inválido
    res.status(400).json({ error: 'Parâmetros inválidos' });  // Retorna erro se os parâmetros estiverem ausentes ou inválidos
  } else if (req.query.dataInicial && req.query.dataFinal) {
   // Caso os parâmetros 'dataInicial' e 'dataFinal' sejam fornecidos
    const startDate = moment(req.query.dataInicial, 'YYYY-MM-DD'); // Converte a data inicial
    const endDate = moment(req.query.dataFinal, 'YYYY-MM-DD');  // Converte a data final
    if (!startDate.isValid() || !endDate.isValid()) {
      // Data inválida
      res.status(400).json({ error: 'Data inválida' });   // Retorna erro se as datas forem inválidas
    } else {
      let totalDays = 0;  // Variável para contar os dias úteis
      for (let day = startDate; day <= endDate; day.add(1, 'days')) {
         // Incrementa o dia e verifica se não é fim de semana ou feriado
        if (day.isoWeekday() !== 6 && day.isoWeekday() !== 7 && !isHoliday(day, feriados)) {
          totalDays++;  // Incrementa o contador de dias úteis
        }
      }
      res.json({ diasUteis: totalDays });   // Retorna a quantidade de dias úteis entre as datas
    }
  } else if (req.query.dataInicial && req.query.quantDiasUteis) {
    // Caso os parâmetros 'dataInicial' e 'quantDiasUteis' sejam fornecidos
    const startDate = moment(req.query.dataInicial, 'YYYY-MM-DD');  // Converte a data inicial
    if (!startDate.isValid()) {
      // Data inválida
      res.status(400).json({ error: 'Data inválida' }); // Retorna erro se a data inicial for inválida
    } else {
      const quantDiasUteis = parseInt(req.query.quantDiasUteis);   // Converte a quantidade de dias úteis
      if (isNaN(quantDiasUteis) || quantDiasUteis <= 0) {
        // Quantidade de dias úteis inválida
        res.status(400).json({ error: 'Quantidade de dias úteis inválida' });  // Retorna erro se a quantidade for inválida
      } else {
        let endDate = startDate.clone();  // Clona a data inicial para calcular a data final
        for (let i = 0; i < quantDiasUteis; i++) {
          endDate.add(1, 'days');  // Incrementa um dia de cada vez
           // Pula finais de semana e feriados
          while (endDate.isoWeekday() === 6 || endDate.isoWeekday() === 7 || isHoliday(endDate, feriados)) {
            endDate.add(1, 'days');
          }
        }
        res.json({ dataFinal: endDate.format('YYYY-MM-DD') });  // Retorna a data final calculada
      }
    }
  } else {
      // Se nenhum parâmetro for fornecido, retorna a lista de feriados
    res.json(feriados);
  }
});
// Rota principal que retorna uma mensagem de boas-vindas
app.get('/', (req, res) => {
  res.send('Bem-vindo ao Servidor API DATAS');
});
// API que retorna a lista de feriados
app.get('/feriados', (req, res) => {
    res.json(feriados);
  });
// Inicializa o servidor na porta definida
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:3001`);
});
