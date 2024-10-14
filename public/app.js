const express = require('express');
const app = express();
const port = 3002;
const helmet = require('helmet');  // Importa o Helmet para aumentar a segurança, incluindo o cabeçalho X-Frame-Options
const moment = require('moment');  // Importa a biblioteca Moment.js para manipulação de datas
const path = require('path');  // Importa a biblioteca path para manipular caminhos de arquivos
const feriados = require(path.join(__dirname, './api/feriados.json'));  // Importa o arquivo JSON que contém feriados
const feriadosFixos = require(path.join(__dirname, './api/feriadosfixos.json'));  // Importa o JSON de feriados fixos
const feriadosNaoFixos = require(path.join(__dirname, './api/feriadosnaofixos.json'));  // Importa o JSON de feriados não fixos
const fs = require('fs');  // Importa o módulo de sistema de arquivos para leitura e escrita de arquivos
const servidor = require('./servidor');  // Importa o arquivo 'servidor.js' que contém a lógica do backend
const cors = require('cors');  // Importa o módulo CORS para permitir requisições entre diferentes domínios
const https = require('https');

const keyPath = 'ssl.key/server.key'; // Caminho para o arquivo da chave privada SSL (geralmente .key). Utilizada para decifrar informações recebidas de clientes.
const certPath = 'ssl.crt/server.crt'; // Caminho para o arquivo do certificado SSL (geralmente .crt). Fornece a autenticação de identidade do servidor e permite a criptografia de dados.


if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };


 // Middleware do Helmet para adicionar cabeçalhos de segurança na configuração atual
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "frame-ancestors": ["*"], // Permite que o conteúdo seja carregado em iframes de qualquer origem
      "script-src": ["'self'", "'unsafe-inline'"], 
      "style-src": ["'self'", "'unsafe-inline'"] 
    },
  },
}));

app.use(express.json());  // Habilita o suporte para JSON no corpo das requisições

// Configura o CORS para permitir requisições de qualquer origem e com métodos específicos
app.use(cors({
  origin: '*',  // Permite requisições de qualquer origem
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Permite esses métodos nas requisições
  headers: ['Content-Type', 'Authorization']  // Permite os cabeçalhos especificados
}));

// Middleware para adicionar o cabeçalho Access-Control-Allow-Origin para permitir acesso de qualquer origem
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');  // Permite que qualquer domínio acesse os recursos da API
  next();  // Passa para o próximo middleware
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
  const inicio = moment(dataInicial, 'YYYY-MM-DD').add(1, 'day'); // Começa no próximo dia útil

  if (!inicio.isValid()) {
    throw new Error('Data inicial inválida');
  }

  let diasUteis = 0;

  // Se o próximo dia for sábado ou domingo, pula para o próximo dia útil
  while (inicio.day() === 0 || inicio.day() === 6) {
    inicio.add(1, 'day');
  }

  // Continua até atingir o número necessário de dias úteis
  while (diasUteis < quantDiasUteis) {
    const formattedDate = inicio.format('YYYY-MM-DD');

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
// Inicie o servidor
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`Servidor rodando em https://localhost:3002`);
});
} else {
console.error('Arquivos de certificado SSL não encontrados');
process.exit(1);
}
