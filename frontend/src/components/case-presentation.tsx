"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Signal,
  Wifi,
} from "lucide-react";
import { LocalizaBrand } from "./localiza-brand";
import type { Account } from "@/lib/account-types";
import { requestApi } from "@/lib/api";
import { money } from "@/lib/format";

const steps = [
  {
    title: "O resumo do mês chega",
    label: "Notificação",
    path: "",
    pain: "Ele vê o boleto, mas nem sempre vê o que recebeu.",
    solution:
      "Uma notificação no fechamento do mês leva ao extrato. O contato acontece quando há algo útil para mostrar.",
  },
  {
    title: "A assinatura abre a conta",
    label: "Conta Aberta",
    path: "/conta-aberta",
    pain: "Os serviços e as coberturas ficam invisíveis depois da contratação.",
    solution:
      "Feito, incluído e estimado aparecem separados. A Conta Aberta torna a entrega compreensível sem inventar uma economia.",
  },
  {
    title: "A parcela não é a conta toda",
    label: "Vale a pena?",
    path: "/vale-a-pena",
    pain: "A comparação costuma parar na mensalidade versus a parcela.",
    solution:
      "O mesmo carro e período, com despesas, entrada, juros e revenda. As perguntas guiadas dão respostas com cálculos do backend.",
  },
  {
    title: "A resposta mostra a conta",
    label: "Premissas",
    path: "/vale-a-pena?premissas=1",
    pain: "Um número sem premissas não ajuda o cliente a confiar.",
    solution:
      "Ele pode mudar preço, revenda e taxas. O resultado também mostra quando comprar fica mais barato. Nenhuma resposta é gerada por IA.",
  },
  {
    title: "O próximo contrato começa pelo uso",
    label: "Próximo contrato",
    path: "/fim-contrato",
    pain: "No fim do contrato, ele precisa decidir sem enxergar seus caminhos.",
    solution:
      "Renovar, ajustar a franquia ou pedir proposta de compra no mesmo app. A sugestão considera o histórico; o interesse fica salvo após confirmação.",
  },
  {
    title: "O valor recebido vira história",
    label: "Retrospectiva",
    path: "/retrospectiva",
    pain: "É difícil recomendar uma assinatura cujo valor não ficou claro.",
    solution:
      "Uma retrospectiva do período, pronta para compartilhar. Ela mostra cuidados registrados e identifica os valores de referência.",
  },
];
export function CasePresentation() {
  const [step, setStep] = useState(0),
    [frameUrl, setFrameUrl] = useState("/conta-aberta"),
    [frameKey, setFrameKey] = useState(0);
  const [account, setAccount] = useState<Account | null>(null),
    [error, setError] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const c = new AbortController();
    void requestApi<Account>("/account", { signal: c.signal })
      .then(setAccount)
      .catch(() => {
        if (!c.signal.aborted)
          setError("A API precisa estar disponível para abrir o cenário.");
      });
    return () => c.abort();
  }, []);
  useEffect(() => {
    const sync = (e: MessageEvent) => {
      if (
        e.origin !== location.origin ||
        e.source !== frame.current?.contentWindow ||
        e.data?.type !== "drivepulse:screen"
      )
        return;
      setStep((current) => {
        if (steps[current].path.split("?")[0] === e.data.path) return current;
        const found = steps.findIndex(
          (s) => s.path.split("?")[0] === e.data.path,
        );
        return found >= 0 ? found : current;
      });
    };
    window.addEventListener("message", sync);
    return () => window.removeEventListener("message", sync);
  }, []);
  function show(index: number) {
    const next = Math.max(0, Math.min(steps.length - 1, index));
    setStep(next);
    if (steps[next].path) {
      setFrameUrl(steps[next].path);
      setFrameKey((k) => k + 1);
    }
  }
  const active = steps[step];
  return (
    <main className="case-presentation">
      <header className="case-presentation-header">
        <Link href="/">
          <ArrowLeft size={17} /> Abrir aplicativo
        </Link>
        <span>RUPTURADOS · DRIVEPULSE · CASE 2</span>
        <span>Conceito não oficial</span>
      </header>
      <section className="case-presentation-layout">
        <div className="case-presentation-story">
          <LocalizaBrand />
          <span className="case-kicker">CONTA ABERTA</span>
          <h1>
            Valeu a pena?
            <br />
            <em>Agora o cliente vê.</em>
          </h1>
          <p className="case-thesis">
            Transformar a mensalidade em valor percebido — e valor percebido em
            uma decisão informada.
          </p>
          <div className="case-progress">
            <span>JORNADA DO CLIENTE</span>
            <strong>
              {step + 1}
              <small> / {steps.length}</small>
            </strong>
          </div>
          <div className="case-step-story">
            <h2>{active.title}</h2>
            <p>
              <span>A DOR</span>
              {active.pain}
            </p>
            <p>
              <span>A RESPOSTA NO APP</span>
              {active.solution}
            </p>
          </div>
          <nav className="case-step-dots" aria-label="Etapas da apresentação">
            {steps.map((s, i) => (
              <button
                key={s.label}
                className={i === step ? "selected" : ""}
                aria-pressed={i === step}
                onClick={() => show(i)}
              >
                <span>{i + 1}</span>
                {s.label}
              </button>
            ))}
          </nav>
          <div className="case-step-controls">
            <button disabled={step === 0} onClick={() => show(step - 1)}>
              <ChevronLeft size={18} /> Anterior
            </button>
            <button
              disabled={step === steps.length - 1}
              onClick={() => show(step + 1)}
            >
              Próximo <ChevronRight size={18} />
            </button>
          </div>
          <div className="case-validation-note">
            <Check size={17} />
            <p>
              <strong>Hipótese a validar:</strong> mais clareza sobre a entrega
              pode melhorar percepção de valor, renovação e indicação. O
              protótipo registra uso, dúvidas e interesses; não comprova melhora
              no NPS.
            </p>
          </div>
        </div>
        <div className="case-device-column">
          <div className="case-device">
            <div className="case-device-screen">
              <div className="case-device-status" aria-hidden="true">
                <strong>9:41</strong>
                <span />
                <div>
                  <Signal size={14} />
                  <Wifi size={14} />
                  <BatteryFull size={19} />
                </div>
              </div>
              {step === 0 ? (
                <div className="case-lockscreen">
                  <p className="case-clock">08:12</p>
                  <p>Quinta-feira, 1 de outubro</p>
                  <button className="case-push" onClick={() => show(1)}>
                    <span>
                      <Bell size={17} /> LOCALIZA ASSINATURA{" "}
                      <small>agora</small>
                    </span>
                    <strong>
                      Sua Conta Aberta de {account?.monthLabel || "setembro"}{" "}
                      chegou
                    </strong>
                    <p>
                      Veja o que sua assinatura cobriu. Cuidados recebidos,
                      custos explicados.
                    </p>
                    <span className="case-push-open">
                      Toque para abrir <ArrowRight size={14} />
                    </span>
                  </button>
                  <div className="case-lock-label">
                    NOTIFICAÇÃO SIMULADA · PROTÓTIPO
                  </div>
                </div>
              ) : (
                <iframe
                  key={frameKey}
                  ref={frame}
                  src={frameUrl}
                  className="case-live-frame"
                  title={`App interativo: ${active.label}`}
                />
              )}
            </div>
          </div>
          <span className="case-device-caption">
            {step === 0
              ? "Toque na notificação para começar"
              : "Aplicativo real do protótipo · interaja com a tela"}
          </span>
          <p className="case-data-note">
            {error ||
              (account
                ? `Cenário: Marina · Creta · mensalidade ${money(account.dashboard.subscription.monthlyPrice)}. Dados fictícios.`
                : "Carregando cenário da demonstração...")}
          </p>
        </div>
      </section>
    </main>
  );
}
