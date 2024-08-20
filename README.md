Para calcular os dias úteis entre duas datas, você pode passar os parâmetros :
1 - dataInicial e dataFinal como query strings, como por exemplo: http://localhost:3001/dias-uteis?dataInicial=2022-01-01&dataFinal=2022-01-31
2- Para calcular a data final com base em uma data inicial e uma quantidade de dias úteis, você pode passar os parâmetros dataInicial e quantDiasUteis como query strings, como por exemplo: http://localhost:3001/dias-uteis?dataInicial=2022-01-01&quantDiasUteis=10
3- Nenhum parâmetro. Retorno: json dos feriados nacionais + estaduais + municipais  : http://localhost:3001/feriados
