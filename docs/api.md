# REST API

Prefixo: `/api/v1`. JSON em camelCase, datas ISO, valores monetários decimais em reais. Erros de validação usam ProblemDetails (`application/problem+json`). Os contratos também estão disponíveis em `/openapi/v1.json`.

| Método | Recurso | Comportamento |
| --- | --- | --- |
| GET | `/dashboard` | Cliente, veículo, contrato, quilometragem, alertas, próxima ação, serviços e timeline |
| GET | `/account` | Extrato do mês fechado (feito/incluído/estimado), comparação com fontes, valor coberto no dia, benefício contextual e retrospectiva |
| POST | `/comparison` | Recalcula compra à vista/financiada versus mensalidade do contrato com premissas validadas |
| POST | `/assistant` | Pergunta livre ao assistente de IA; o modelo chama o motor de cálculo como ferramenta. 503 quando `ANTHROPIC_API_KEY` não está configurada |
| GET | `/usage?months=6` | Meses e registros diários; período permitido de 1 a 12 meses |
| GET | `/timeline?type=all` | Histórico filtrado; tipos all, maintenance, mileage, document, assistance, subscription, recommendation |
| GET | `/services` | Serviços utilizados e valor de referência agregado |
| GET | `/recommendations` | A recomendação de maior prioridade ainda disponível |
| POST | `/actions` | Registra uma ação e atualiza alerta, recomendação, timeline e utilização |
| POST | `/events` | Registra interação permitida; resposta 204 |
| GET | `/admin/overview` | Clientes, eventos, ações, conversão e utilização por página |
| GET | `/health` | Prontidão da API e conexão com PostgreSQL |

## Ações

```json
{
  "type": "schedule-maintenance",
  "targetId": "maintenance-20k",
  "scheduledDate": "2026-10-22"
}
```

Tipos: `schedule-maintenance`, `review-document`, `mileage-plan`, `dismiss-recommendation`. A data é exigida somente para manutenção e deve ser igual ou posterior à referência demonstrativa. Para o plano de uso, os identificadores `mileage-plan` e `mileage-october` são normalizados para a mesma ação. Repetir uma ação retorna o mesmo `eventId`, sem duplicar o registro.

```json
{
  "message": "Revisão registrada para 22/10/2026 na demonstração.",
  "eventId": "identificador-do-evento"
}
```

A API serializa as alterações do cliente demonstrativo dentro de uma transação PostgreSQL e possui índice único de tipo e alvo da ação. As relações de cliente, assinatura, veículo, utilização, serviços e eventos têm chaves estrangeiras.

## Eventos e métricas

```json
{
  "name": "recommendation_view",
  "page": "/",
  "metadata": "maintenance-20k"
}
```

Eventos públicos permitidos: `page_view`, `recommendation_view`, `action_click`, `timeline_filter`, `usage_filter`, `account_view`, `comparison_run`, `assistant_ask`, `recap_share`. Página é um caminho de até 120 caracteres; metadados têm limite de 2.048 caracteres. O servidor registra também `action_completed` e `recommendation_dismissed` quando uma ação realmente ocorre.

## Comparação

```json
{"vehiclePrice":145000,"resaleValue":108000,"months":24,"downPaymentPercent":20,"interestMonthlyPercent":1.99,"yieldMonthlyPercent":0.8,"ipvaPercent":4,"insuranceAnnual":4200,"maintenanceAnnual":1800,"tiresTotal":1800,"licensingAnnual":230}
```

Todos os campos representam premissas fictícias. A mensalidade vem do contrato, sem aceitar substituição pelo navegador. Revenda não pode superar o preço de compra. Preço permitido: R$10 mil a R$1 milhão; prazo de 12 a 60 meses; juros de 0 a 5% ao mês; rendimento líquido de 0 a 3% ao mês. Custos negativos são rejeitados com 400.

A resposta inclui valores mensais equivalentes, fluxos a valor presente, parcela, entrada, diferenças com sinal, composição, método e escopo. Despesas recorrentes são provisões uniformes; revenda entra ao final. Valores mensais de coberturas não se somam aos serviços utilizados como economia recebida. `/services` exclui a antiga referência de disponibilidade da proteção do seed.

A conversão representa recomendações distintas que foram vistas e atendidas, divididas pelas recomendações distintas vistas. Visualizações repetidas não alteram a taxa, ações sem uma exposição correspondente não aumentam o numerador e dispensas não contam como conclusão. A utilização por funcionalidade agrupa os caminhos reais das páginas. A demonstração possui um cliente principal, sem pretensão de representar a operação de uma empresa.

## Persistência local

O MVP cria o schema com EF Core `EnsureCreated` e popula o seed uma única vez. É apropriado para essa base demonstrativa inicial. Alterações futuras do schema devem passar por migrações versionadas; `EnsureCreated` não atualiza tabelas existentes.
