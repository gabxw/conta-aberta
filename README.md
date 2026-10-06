# DrivePulse

**Seu carro por assinatura, um passo à frente.**

DrivePulse é um projeto de portfólio inspirado na experiência de um hackathon da Localiza: começar pela dor do usuário e pelos dados, antes de escolher tecnologia. O produto é fictício e independente de qualquer operadora.

A interface recupera a **Conta Aberta**, proposta do grupo Rupturados no case: tornar visível o valor recebido na assinatura e apoiar a próxima decisão. O fluxo parte do extrato, compara comprar e assinar com premissas editáveis, apresenta caminhos para o próximo contrato e compartilha uma retrospectiva. A linguagem de aplicativo usa a paleta do protótipo original e navegação móvel, com identificação de conceito não oficial. Consulte [as referências e decisões](docs/design-reference.md).

Em vez de apenas listar informações do contrato, o sistema responde: **o que merece minha atenção agora e o que posso fazer?**

![Início do DrivePulse](docs/assets/dashboard.png)

[Veja também a interface no celular](docs/assets/mobile.png).

Para apresentar, abra **http://localhost:3000/apresentar**. A jornada tem seis etapas: notificação simulada, extrato, comparação, premissas, próximo contrato e retrospectiva. O app funciona dentro da moldura de celular.

![Modo de apresentação](docs/assets/presentation.png)

## Experimente

Com Docker Desktop ativo, na raiz:

```powershell
docker compose up --build -d
```

- Produto: http://localhost:3000
- Modo de apresentação: http://localhost:3000/apresentar
- Conta Aberta: http://localhost:3000/conta-aberta
- Comparação editável: http://localhost:3000/vale-a-pena
- Próximo contrato: http://localhost:3000/fim-contrato
- Retrospectiva: http://localhost:3000/retrospectiva
- Administração: http://localhost:3000/admin
- API: http://localhost:5080/api/v1/dashboard
- Saúde da API e banco: http://localhost:5080/api/v1/health
- OpenAPI: http://localhost:5080/openapi/v1.json

O PostgreSQL, a API e o frontend sobem juntos. O banco recebe dados fictícios na primeira execução e mantém as ações entre reinícios. As portas do Compose ficam restritas ao computador local.

```powershell
docker compose logs -f
docker compose down
```

`down` preserva os dados. Para apagar **somente a base demonstrativa deste projeto** e recomeçar a história, use `docker compose down -v`.

## A história demonstrada

Marina Costa possui um Hyundai Creta e franquia de 1.500 km/mês. No dia de referência, 20/10/2026, já percorreu 1.180,65 km. Seu ritmo aponta para **1.830 km**, ou 330 km acima da franquia. A interface explica a previsão e oferece criar um plano para os dias restantes antes que o excesso aconteça.

A data de referência é fixa e identificada na interface. Isso mantém os números coerentes e permite apresentar o mesmo cenário em qualquer momento. Novos eventos usam o dia do cenário com o horário da interação, mantendo a timeline coerente.

### Funcionalidades

- Conta Aberta do mês fechado, com histórico mensal e separação entre realizado, incluído e estimado.
- Comparação determinística de compra à vista, financiamento e assinatura, com revenda e custo do capital; admite cenários em que a compra custa menos.
- Opções de próximo contrato pelo uso recente, com registro de interesse confirmado e persistido.
- Retrospectiva para copiar, compartilhar pelo dispositivo ou baixar como texto.
- Dashboard com uso mensal, projeção, cuidados pendentes e veículo.
- Next Best Action com motivo da recomendação e ações persistidas.
- Plano de quilometragem, agendamento demonstrativo de manutenção e revisão de documento.
- Timeline de acontecimentos, incluindo ações feitas no produto.
- Histórico mensal e diário de uso.
- Valor de referência dos serviços incluídos já utilizados, com composição transparente.
- Administração com utilização por funcionalidade, eventos recentes e ações concluídas.
- Estados de carregamento, erro e confirmação; navegação responsiva.

O valor dos serviços **não representa economia financeira garantida**. Os três serviços e documentos utilizados somam R$1.150 em referências; cobertura de proteção disponível é mostrada separadamente e não conta como atendimento realizado. Os preços da comparação são premissas fictícias editáveis, específicas do cenário Creta. Agendamentos e interesses ficam registrados na demonstração; não são enviados a oficinas ou à Localiza.

## Stack e organização

| Camada | Tecnologia |
| --- | --- |
| API | .NET 10 / ASP.NET Core |
| Persistência | PostgreSQL 17 / Entity Framework Core 10 |
| Web | Next.js / TypeScript / React |
| Interface | Tailwind CSS, fontes locais e ilustrações SVG |
| Ambiente | Docker Compose |

```text
backend/          API, domínio, persistência, seed e testes
frontend/         Aplicação Next.js e proxy para a API
docs/             Arquitetura, decisões e plano de implementação
scripts/          Inicialização local e verificação de integração
compose.yaml      Ambiente completo
```

A arquitetura é um monólito simples. O navegador acessa um proxy de mesma origem no Next.js; a API concentra regras, validação e banco. Consulte [as decisões de arquitetura](docs/architecture.md).

O ponto de extensão `IRecommendationProvider` permite trocar as regras por um agente posteriormente. **Nenhuma integração com OpenAI foi implementada**, e o projeto não precisa de chaves de IA.

## Desenvolvimento sem containers

Requisitos: SDK .NET 10, Node.js 22 e PostgreSQL 17. Crie o banco `drivepulse`, com usuário `drivepulse` e senha demonstrativa `drivepulse_demo_local`, na porta 5433. Altere `ConnectionStrings__DrivePulse` para outra configuração.

```powershell
# Terminal 1, raiz do projeto
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:ASPNETCORE_URLS = 'http://127.0.0.1:5080'
$env:ConnectionStrings__DrivePulse = 'Host=127.0.0.1;Port=5433;Database=drivepulse;Username=drivepulse;Password=drivepulse_demo_local'
dotnet run --project backend/DrivePulse.Api
```

```powershell
# Terminal 2
cd frontend
npm ci
$env:API_BASE_URL = 'http://127.0.0.1:5080/api/v1'
npm run dev
```

O script `scripts/dev.ps1` também inicia o banco Docker e a API, e mantém o frontend no terminal. Use `-UseExistingDatabase` se o PostgreSQL já estiver disponível. As credenciais do exemplo servem apenas para a demonstração local.

## Verificação

```powershell
dotnet test backend/DrivePulse.slnx
cd frontend
npm test
npm run lint
npm run typecheck
npm run build
```

`scripts/smoke.py` verifica projeção, composição do valor, validação, eventos e idempotência das ações com uma API conectada a PostgreSQL. Execute contra uma **base demonstrativa descartável**, pois o script conclui uma recomendação:

```powershell
python scripts/smoke.py http://127.0.0.1:5090/api/v1
```

## Limites do MVP

O ambiente é uma demonstração local, com um cliente principal e dados fictícios. Autenticação de produção, segregação por cliente, faturamento, telemetria e agenda real de oficinas estão fora deste MVP. A administração também é demonstrativa. A previsão usa ritmo médio linear, com uma explicação visível, e não afirma prever mudanças futuras de comportamento.

Para uma evolução pública, os próximos passos são autenticação, autorização por cliente, migrações versionadas e avaliação das recomendações com usuários reais. O MVP entrega a experiência e o fluxo completo de dados sem antecipar essa complexidade.
