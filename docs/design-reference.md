# Referência visual da apresentação

Em 05/10/2026, o DrivePulse recebeu uma linguagem visual inspirada no aplicativo Localiza Assinatura. A referência são as capturas públicas da [página oficial no Google Play](https://play.google.com/store/apps/details?hl=pt_BR&id=com.localiza.meoo.app) e o [site Localiza Assinatura](https://assinatura.localiza.com/).

A revisão seguinte foi orientada pelo protótipo do usuário em `raio-x-assinatura`: `components/sections/Demo.tsx`, `Jornada.tsx`, `Impacto.tsx` e `lib/numeros.ts`. Recuperou a Conta Aberta e sua jornada de notificação, extrato, comparação explicada, próximo contrato e retrospectiva. O projeto fonte não foi editado.

As capturas orientaram o fundo claro, o veículo, a franquia e os atalhos. A experiência de assinante usa a paleta do protótipo fonte: marca `#04662b`, ações `#028444` e detalhes `#79de20`. O cabeçalho compacto e a navegação inferior substituem a barra lateral do dashboard anterior. O símbolo foi desenhado localmente em SVG para o conceito; não é o arquivo oficial da marca. A [imagem ilustrativa do Creta](https://assinatura.localiza.com/carros/hyundai/creta) vem da página pública de modelos da Localiza, armazenada localmente para a demonstração; não garante ano, cor ou configuração do veículo do cenário.

O produto continua sendo o DrivePulse. A hipótese central é tornar a entrega da assinatura compreensível para apoiar decisão e renovação. Manutenção, projeção e recomendações continuam como apoio, com ações persistidas. O CRLV registra conferência e a revisão registra agendamento fictício. Não há acesso à conta Localiza, documentos reais ou agenda de oficinas.

`/apresentar` inicia com uma notificação simulada e apresenta seis etapas, usando o próprio app em iframe de mesma origem. A comparação oferece perguntas guiadas com respostas determinísticas e premissas editáveis. Os números vêm da mesma API. As telas e a apresentação identificam dados fictícios e ausência de vínculo oficial; melhoria de NPS não é apresentada como comprovada.

A evolução amplia o monólito existente com `OwnershipCalculator`, `AccountService`, rotas REST de extrato/comparação e interesse contratual. Não adiciona tabelas, microsserviços ou IA. Os componentes de assinante estão em `subscriber-app.tsx`, `account-views.tsx` e `ownership-view.tsx`; tema em `subscriber.css`; apresentação em `case-presentation.tsx`.
