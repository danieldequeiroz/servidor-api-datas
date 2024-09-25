const express = require('express');
const app = express();
const port = 3002;
const moment = require('moment');
const feriados = require('./feriados');
const feriadosFixos = require('./feriadosfixos.json');
const feriadosNaoFixos = require('./feriadosnaofixos.json');
const fs = require('fs');

app.use(express.json()); // Habilita o suporte a JSON no corpo da requisição
app.use(express.static(__dirname)); // Serve arquivos estáticos do mesmo diretório

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

// Defina a rota para calcular os dias úteis entre duas datas
app.get('/dias-uteis', (req, res) => {
  try {
    const dataInicial = req.query.dataInicial;
    const dataFinal = req.query.dataFinal;
    const quantDiasUteis = req.query.quantDiasUteis;

    if (dataInicial && dataFinal) {
      // Calcula os dias úteis entre as duas datas
      const diasUteis = calculateDiasUteis(dataInicial, dataFinal);
      res.json({ diasUteis });
    } else if (dataInicial && quantDiasUteis) {
      // Calcula a data final após adicionar dias úteis a uma data inicial
      const dataFinal = calculateDataFinal(dataInicial, quantDiasUteis);
      res.json({ dataFinal });
    } else {
      res.status(400).json({ message: 'Parâmetros inválidos' });
    }
  } catch (error) {
    console.error('Erro ao calcular dias úteis:', error);
    res.status(500).json({ message: 'Erro ao calcular dias úteis' });
  }
});

// Defina a rota para adicionar um novo feriado
app.post('/api/novo-feriado', (req, res) => {
  try {
    const { date, nome, type } = req.body;

    // Adiciona o novo feriado ao arquivo feriados.json
    const novoFeriado = { date, nome, type };
    feriados.push(novoFeriado);
    fs.writeFileSync('./feriados.json', JSON.stringify(feriados, null, 2));

    res.json({ message: 'Feriado adicionado com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar feriado:', error);
    res.status(500).json({ message: 'Erro ao adicionar feriado' });
  }
});

// Defina a rota para adicionar um novo feriado não fixo
app.post('/api/novo-feriado-nao-fixo', (req, res) => {
  try {
    const { date, nome, type } = req.body;

    // Adiciona o novo feriado não fixo ao arquivo feriadosnaofixos.json
    const novoFeriado = { date, nome, type };
    feriadosNaoFixos.push(novoFeriado);
    fs.writeFileSync('./feriadosnaofixos.json', JSON.stringify(feriadosNaoFixos, null, 2));

    res.json({ message: 'Feriado não fixo adicionado com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar feriado não fixo:', error);
    res.status(500).json({ message: 'Erro ao adicionar feriado não fixo' });
  }
});

// Função para calcular os dias úteis entre duas datas
function calculateDiasUteis(dataInicial, dataFinal) {
  const inicio = moment(dataInicial, 'YYYY-MM-DD');
  const fim = moment(dataFinal, 'YYYY-MM-DD');
  const diasUteis = [];

  while (inicio.isSameOrBefore(fim)) {
    if (inicio.day() !== 0 && inicio.day() !== 6) {
      diasUteis.push(inicio.format('YYYY-MM-DD'));
    }
    inicio.add(1, 'day');
  }

  return diasUteis.length;
}

// Função para calcular a data final após adicionar dias úteis a uma data inicial
function calculateDataFinal(dataInicial, quantDiasUteis) {
  const inicio = moment(dataInicial, 'YYYY-MM-DD');
  let diasUteis = 0;

  while (diasUteis < quantDiasUteis) {
    inicio.add(1, 'day');
    if (inicio.day() !== 0 && inicio.day() !== 6) {
      diasUteis++;
    }
  }

  return inicio.format('YYYY-MM-DD');
}

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:3002`);
});
