# Verificação do MVP

Verificado em 05/10/2026 no Windows, com SDK .NET 10.0.401, Node.js 22.19 e PostgreSQL 17.11 real.

## Resultados

| Verificação | Resultado |
| --- | --- |
| Build e publicação da API | Aprovados |
| Testes de regras .NET | 11 aprovados, 0 falhas; projeção, prioridades, conversão e comparação de propriedade |
| Testes do cliente HTTP frontend | 3 aprovados, 0 falhas |
| Build de produção Next.js | Aprovado, nove telas do produto/admin, modo de apresentação e proxy dinâmico |
| ESLint e TypeScript | Aprovados |
| API conectada a PostgreSQL | Saúde pronta, Conta Aberta e comparação incluídas no OpenAPI |
| Smoke de integração | Projeção, valor dos serviços, histórico, timeline, validação, eventos, persistência e idempotência aprovados |
| Ação pelo navegador | Confirmação de documento persistida, visível após recarregar e na timeline; pendências removidas; próxima ação esgotada corretamente |
| Administração | Eventos reais de navegação e ações registrados; conversão por recomendações distintas conferida |
| Interface desktop e celular | Nove telas verificadas em cada viewport (1440 e 390 px), sem erros JavaScript, respostas API >=400 ou overflow horizontal |
| Axe | Zero violações nas nove telas desktop, nove móveis, apresentação desktop/mobile e diálogo de interesse contratual, com regras WCAG 2 A/AA e 2.1 AA |
| Modo de apresentação | Seis etapas funcionais; notificação abre o extrato, botões alternam o app real e premissas abrem o formulário |
| Atalhos e filtros | CRLV, revisão e ajuda abrem diálogos funcionais; Escape fecha; selecionar o filtro já ativo mantém a tela disponível |
| Conta Aberta | Troca de mês mostra a revisão de julho; serviços e retrospectiva excluem cobertura disponível dos cuidados efetivamente realizados |
| Comparação | Recalcular com juros/rendimento zero e revenda maior passa a favorecer comprar; valores e método vêm da API; entradas inválidas recebem 400 |
| Interesse contratual | Confirmação pela UI persistida no PostgreSQL isolado e visível após recarregar; repetir requisição retorna o mesmo evento |
| Retrospectiva | Texto copiado contém os três registros e R$1.150 em referências; a API também fornece o período exato |
| Docker Compose | Configuração validada; execução dos containers não verificada porque o daemon não iniciou neste ambiente |

Os testes de ações utilizaram uma base PostgreSQL demonstrativa separada. Na verificação do navegador, as requisições da interface foram encaminhadas para a API dessa base; nenhuma resposta de dados foi fabricada. O cenário principal continua com as pendências originais para apresentação.

A verificação automatizada de acessibilidade não substitui testes com pessoas e tecnologias assistivas. Foram conferidos também fechamento por Escape, diálogo nativo, foco em tabelas roláveis, navegação móvel, indicação de dados fictícios e hierarquia visual das capturas.

## Cenário conferido

- Referência: 20/10/2026.
- Uso acumulado: 1.180,65 km.
- Projeção: 1.830 km; franquia: 1.500 km.
- Excedente projetado: 330 km; custo estimado fictício: R$247,50.
- Meta diária restante: 29,03 km nos próximos 11 dias.
- Serviços e documentos utilizados: três registros, R$1.150,00 em referências. Proteção disponível excluída de `/services` e de atendimentos realizados.
- Último extrato fechado: setembro de 2026; assistência com pneu, referência R$180.
- Uso médio dos três meses completos anteriores: 1.425 km/mês; plano de 1.000 km não recomendado.
- Comparação inicial: compra à vista R$3.580,38/mês equivalente; financiamento R$4.375,06/mês equivalente; assinatura R$2.890/mês. Premissas fictícias para 24 meses.
- Ordem demonstrada: revisão vencida, plano de uso, documento; depois nenhuma recomendação pendente.

As verificações visuais, ESLint, build e testes foram repetidos após a recuperação da Conta Aberta do protótipo original. O backend ganhou cálculo determinístico, extrato, opções por uso e interesse contratual. A verificação de persistência desta evolução usou a base isolada; o cenário principal mantém três alertas pendentes e nenhum interesse registrado. A melhora de NPS/renovação é hipótese a validar, e não resultado destes testes. Compartilhamento por área de transferência foi conferido; o diálogo nativo de compartilhamento do dispositivo não foi automatizado.

Capturas atualizadas: [desktop](assets/dashboard.png), [celular](assets/mobile.png) e [apresentação](assets/presentation.png).
