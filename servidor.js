const express = require('express'); // Importa o framework Express para criar o servidor web
const app = express(); // Cria uma instância do servidor
const port = 3002; // Define a porta em que o servidor vai rodar
const moment = require('moment');  // Importa a biblioteca Moment.js para manipulação de datas
const cors = require('cors'); // importa o módulo cors (Cross-Origin Resource Sharing) para ser usado no servidor Node.js. 

app.use(express.json()); // Habilita o parsing de JSON nos requests
app.use(express.static('public'));  // Serve arquivos estáticos da pasta 'public'

const fs = require('fs');  // Importa o módulo File System para ler arquivos
const feriadosJson = fs.readFileSync('./public/feriados.json', 'utf8');   // Lê o arquivo JSON com os feriados
const feriados = JSON.parse(feriadosJson);  // Converte o conteúdo do arquivo para um objeto JavaScript

// Configura o middleware 'cors' para permitir requisições de qualquer origem ('*')
// e habilita os métodos HTTP especificados (GET, POST, PUT, DELETE) e os cabeçalhos definidos
app.use(cors({
  origin: '*', // Permite requisições de qualquer domínio
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Especifica os métodos HTTP permitidos
  headers: ['Content-Type', 'Authorization'] // Define os cabeçalhos permitidos nas requisições
}));

// Middleware personalizado para definir o cabeçalho 'Access-Control-Allow-Origin' manualmente
// Isso garante que todas as respostas incluam esse cabeçalho, permitindo acessos de qualquer origem
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
  next(); // Continua para o próximo middleware ou rota
});


app.get('/feriadosfixos', (req, res) => {
  const feriadosFixosJson = fs.readFileSync('./feriadosfixos.json', 'utf8');
  const feriadosFixos = JSON.parse(feriadosFixosJson);
  res.json(feriadosFixos);
});

let feriadosfixos;
let feriadosnaofixos;

// Função que verifica se um determinado dia é feriado
function isHoliday(day, holidays) {
  return holidays.some(holiday => holiday.date === day.format('YYYY-MM-DD')) || isHolidayInFeriadosFixos(day);
}

function isHolidayInFeriadosFixos(day) {
  return feriadosfixos.some(feriado => feriado.date === day.format('YYYY-MM-DD'));
}

function isHolidayInFeriadosNaofixos(day) {
  return feriadosnaofixos.some(feriado => feriado.date === day.format('YYYY-MM-DD'));
}

const feriadosfixosJson = fs.readFileSync('./feriadosfixos.json', 'utf8');
feriadosfixos = JSON.parse(feriadosfixosJson);

const feriadosnaofixosJson = fs.readFileSync('./feriadosnaofixos.json', 'utf8');
feriadosnaofixos = JSON.parse(feriadosnaofixosJson);

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
      
      // Código do lado do servidor
      app.post('/api/novo-feriado', (req, res) => {
        try {
          const { date, nome, type, fixed } = req.body;
      
          // Validar os dados de entrada
          if (!date || !nome || !type || !fixed) {
            throw new Error('Parâmetros inválidos');
          }
      
          // Validar o formato da data
          const momentDate = moment(date, 'YYYY-MM-DD');
          if (!momentDate.isValid()) {
            throw new Error('Data inválida');
          }
      
          // Validar o tipo
          const validTypes = ['feriado nacional', 'feriado estadual', 'feriado municipal', 'ponto facultativo'];
          if (!validTypes.includes(type)) {
            throw new Error('Tipo de feriado inválido');
          }
      
          // Salve os dados do feriado no arquivo correto
          if (fixed === 'non-fixed') {
            // Save to feriadosnaofixos.json
            const feriadosnaofixosData = require('./feriadosnaofixos.json');
            feriadosnaofixosData.push({ date, nome, type });
            fs.writeFileSync('./feriadosnaofixos.json', JSON.stringify(feriadosnaofixosData, null, 2));
          } else {
            // Save to feriadosfixos.json
            const feriadosfixosData = require('./feriadosfixos.json');
            feriadosfixosData.push({ date, nome, type });
            fs.writeFileSync('./feriadosfixos.json', JSON.stringify(feriadosfixosData, null, 2));
          }

          // Update the feriados array with the new feriado
          feriados.push({ date, nome, type });

          // Reload the feriadosfixos.json file
          const feriadosfixosJson = fs.readFileSync('./feriadosfixos.json', 'utf8');
          feriadosfixos = JSON.parse(feriadosfixosJson);

         // Reload the feriadosnaofixos.json file
         const feriadosnaofixosJson = fs.readFileSync('./feriadosnaofixos.json', 'utf8');
         feriadosnaofixos = JSON.parse(feriadosnaofixosJson);

        
      
          res.json({ message: 'Feriado adicionado com sucesso!' });
        } catch (error) {
          console.error(error);
          res.status(400).json({ error: 'Erro ao adicionar feriado' });
        }
      });
      
      // Inicializa o servidor na porta definida
      app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:3002`);
      });