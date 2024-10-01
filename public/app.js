const express = require('express');
const app = express();
const port = 3002;
const helmet = require('helmet');  // Importa o Helmet do X-Frame-Options
const moment = require('moment');
const path = require('path');
const feriados = require(path.join(__dirname, './api/feriados.json'));
const feriadosFixos = require(path.join(__dirname, './api/feriadosfixos.json'));
const feriadosNaoFixos = require(path.join(__dirname, './api/feriadosnaofixos.json'));
const fs = require('fs');
const servidor = require('./servidor');
const cors = require('cors');

// Middleware do Helmet para cabeçalhos de segurança
app.use(helmet({
  contentSecurityPolicy: false,  // Temporariamente desativar CSP para testes
  referrerPolicy: { policy: 'no-referrer' },  // Exemplo de configuração de Referrer-Policy
}));

// Defina o cabeçalho X-Frame-Options
app.use(helmet.frameguard({ action: 'SAMEORIGIN' })); // Impede que outros sites carreguem seu conteúdo em iframes


app.use(express.json());
app.use(cors({
  origin: '*',
 methods: ['GET', 'POST', 'PUT', 'DELETE'],
  headers: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
 res.header('Access-Control-Allow-Origin', '*');
 next();
});


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
app.get('/api/feriadosfixos.json', (req, res) => {
  try {
    res.json(feriadosFixos); // Retorna os feriados fixos como JSON
  } catch (error) {
    console.error('Erro ao retornar feriados fixos em JSON:', error);
    res.status(500).json({ message: 'Erro ao retornar feriados fixos em JSON' });
  }
});

// Defina a rota para exibir os feriados não fixos em JSON
app.get('/api/feriadosnaofixos.json', (req, res) => {
  try {
    res.json(feriadosNaoFixos); // Retorna os feriados não fixos como JSON
  } catch (error) {
    console.error('Erro ao retornar feriados não fixos em JSON:', error);
    res.status(500).json({ message: 'Erro ao retornar feriados não fixos em JSON' });
  }
});

// Define a rota para calcular os dias úteis entre duas datas
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

// Função para verificar se uma data é um feriado
function isFeriado(data) {
  const dataFormatada = moment(data).format('YYYY-MM-DD');
  return [...feriados, ...feriadosFixos, ...feriadosNaoFixos].some(feriado => feriado.date === dataFormatada);
}

// Função para calcular os dias úteis entre duas datas
function calculateDiasUteis(dataInicial, dataFinal) {
  const totalDias = moment(dataFinal).diff(moment(dataInicial), 'days') + 1;
  const diasNaoUteis = calculateDiasNaoUteis(dataInicial, dataFinal);
  return totalDias - diasNaoUteis;
}

// Função para calcular os dias não úteis entre duas datas
function calculateDiasNaoUteis(dataInicial, dataFinal) {
  const inicio = moment(dataInicial, 'YYYY-MM-DD');
  const fim = moment(dataFinal, 'YYYY-MM-DD');
  const diasNaoUteis = [];

  while (inicio.isSameOrBefore(fim)) {
    const formattedDate = inicio.format('YYYY-MM-DD');
    if (inicio.day() === 0 || inicio.day() === 6 || isFeriado(formattedDate)) { // Check for Sunday, Saturday and feriados
      diasNaoUteis.push(formattedDate);
    }
    inicio.add(1, 'day');
  }

  return diasNaoUteis.length;
}

// Função para calcular a data final após adicionar dias úteis a uma data inicial
function calculateDataFinal(dataInicial, quantDiasUteis) {
  const inicio = moment(dataInicial, 'YYYY-MM-DD');
  if (!inicio.isValid()) {
    throw new Error('Data inicial inválida');
  }
  let diasUteis = 0;

  // Se a data inicial for sábado ou domingo, adicione um dia até que seja um dia útil
  while (inicio.day() === 0 || inicio.day() === 6) {
    inicio.add(1, 'day');
  }

  // Continuar até que o número de dias úteis necessários seja atingido
  while (diasUteis < quantDiasUteis) {
    const formattedDate = inicio.format('YYYY-MM-DD');
    
    // Verifica se o dia não é fim de semana e não é feriado
    if (inicio.day() !== 0 && inicio.day() !== 6 && !isFeriado(formattedDate)) {
      diasUteis++;
    }
    inicio.add(1, 'day');
  }

  return inicio.format('YYYY-MM-DD');
}

// Define a rota para adicionar um novo feriado
app.post('/api/novo-feriado', (req, res) => {
  try {
    const { date, nome, type, fixed } = req.body;

    // Adiciona o novo feriado ao arquivo feriados.json
    const novoFeriado = { date, nome, type };
    feriados.push(novoFeriado);
    fs.writeFileSync(path.join(__dirname, './api/feriados.json'), JSON.stringify(feriados, null, 2));

    // Atualiza o arquivo feriadosfixos.json ou feriadosnaofixos.json de acordo com o tipo de feriado
    if (fixed === 'fixed') {
      feriadosFixos.push(novoFeriado);
      fs.writeFileSync(path.join(__dirname, './api/feriadosfixos.json'), JSON.stringify(feriadosFixos, null, 2));
    } else {
      feriadosNaoFixos.push(novoFeriado);
      fs.writeFileSync(path.join(__dirname, './api/feriadosnaofixos.json'), JSON.stringify(feriadosNaoFixos, null, 2));
    }

    res.json({ message: 'Feriado adicionado com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar feriado:', error);
    res.status(500).json({ message: 'Erro ao adicionar feriado' });
  }
});

// Use as rotas do servidor.js 
app.use('/api', servidor);

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:3002`);
});
