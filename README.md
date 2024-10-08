<li> Para calcular os dias úteis entre duas datas, você pode passar os parâmetros : </li>
<li> 1 - dataInicial e dataFinal como query strings, como por exemplo: http://localhost:3002/dias-uteis?dataInicial=2022-01-01&dataFinal=2022-01-31</li>
<li> 2- Para calcular a data final com base em uma data inicial e uma quantidade de dias úteis, você pode passar os parâmetros dataInicial e quantDiasUteis como query strings, como por exemplo: http://localhost:3002/dias-uteis?dataInicial=2022-01-01&quantDiasUteis=10</li>
<li> 3- Nenhum parâmetro. Retorno: json dos feriados nacionais + estaduais + municipais  : http://localhost:3002/feriados</li>
<li> 4-Feriados Fixos</li>
<li> 5- Feriados Não Fixos</li>
<li> 6- Adicionar Feriados</li>

<h1>API Dias Úteis</h1>
      <p>Para usar essa API, você precisa informar os parâmetros obrigatórios:</p>
      <ul>
        <li><code>dataInicial</code>: Data inicial no formato YYYY-MM-DD . como por exemplo: http://localhost:3002/dias-uteis?dataInicial=2022-01-01&dataFinal=2022-01-31</li>
        <li><code>dataFinal</code>: Data final no formato YYYY-MM-DD</li>
        <li><code>quantDiasUteis</code>: Número de dias úteis que você deseja calcular</li>
            <li>instalar o módulo cors utilizando o npm (Node Package Manager).
          <li> Siga os seguintes passos:</li>

<li> 1-Abra o terminal ou prompt de comando.</li>
<li> 2-Navegue até o diretório onde o seu projeto está localizado, se ainda não estiver lá.</li>
<li>3-Execute o seguinte comando para instalar o cors: npm install cors</li>
<li>Isso irá adicionar o módulo cors à sua aplicação. Após a instalação, tente rodar novamente o seu servidor com o comando: node app.js</li>
      </ul>
      <p>Exemplos de uso:</p>
      <ul>
        <li><code>http://localhost:3002/dias-uteis?dataInicial=2024-01-01&dataFinal=2024-12-31</code></li>
        <li><code>http://localhost:3002/dias-uteis?dataInicial=2024-01-01&quantDiasUteis=10</code></li>
      </ul>
