"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Download,
  FileText,
  Info,
  LoaderCircle,
  Send,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import { date, money, number } from "@/lib/format";
import { requestApi, track } from "@/lib/api";
import type {
  Account,
  ContractOption,
  OwnershipPart,
} from "@/lib/account-types";

function ReferenceRows({ items }: { items: OwnershipPart[] }) {
  return (
    <ul className="account-reference-rows">
      {items.map((i) => (
        <li key={i.id}>
          <details>
            <summary>
              <strong>{i.name}</strong>
              <span>
                {money(i.monthlyValue)}
                <small>/mês</small>
              </span>
              <ChevronDown size={13} />
            </summary>
            <p>{i.explanation}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
export function AccountStatement({ account }: { account: Account }) {
  const [month, setMonth] = useState(account.statementMonth);
  const [feedback, setFeedback] = useState("");
  const services = account.dashboard.serviceValue.items.filter(
    (i) => i.id !== "service-insurance" && i.date.startsWith(month),
  );
  const monthLabel = date(`${month}-01`, { month: "long", year: "numeric" });
  return (
    <div className="account-statement">
      <section className="statement-intro statement-compact-intro">
        <span className="account-eyebrow">SUA ASSINATURA, SEM CAIXA-PRETA</span>
        <h2>Seu mês, de conta aberta.</h2>
        <p>
          Feito, incluído e estimado. Toque nos valores para entender cada
          referência.
        </p>
      </section>
      <div className="statement-month">
        <CalendarDays size={19} />
        <label htmlFor="statement-month">Extrato de</label>
        <select
          id="statement-month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            track("account_view", "/conta-aberta", e.target.value);
          }}
        >
          {[
            "2026-09",
            "2026-08",
            "2026-07",
            "2026-06",
            "2026-05",
            "2026-04",
          ].map((m) => (
            <option key={m} value={m}>
              {date(`${m}-01`, { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>
        <ChevronDown size={15} />
      </div>
      <section className="statement-section">
        <div className="statement-section-header">
          <span className="statement-icon">
            <CheckCheck size={22} />
          </span>
          <div>
            <span className="account-eyebrow">01 · ACONTECEU</span>
            <h2>Feito em {monthLabel.split(" ")[0]}</h2>
          </div>
          <span className="statement-tag">REGISTRADO</span>
        </div>
        {services.length ? (
          <ul className="performed-services">
            {services.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.name}</strong>
                  <p>{s.description}</p>
                  <span>
                    {date(s.date, { day: "numeric", month: "short" })} · sem
                    cobrança adicional pelo serviço
                  </span>
                </div>
                <div>
                  <strong>{money(s.referenceValue)}</strong>
                  <small>valor de referência</small>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="account-empty">
            Nenhum serviço utilizado neste mês. As coberturas abaixo continuaram
            disponíveis conforme o contrato.
          </p>
        )}
        <p className="section-footnote">
          Referências fictícias dos serviços registrados. Não são reembolso nem
          economia comprovada.
        </p>
      </section>
      <section className="statement-section">
        <div className="statement-section-header">
          <span className="statement-icon">
            <ShieldCheck size={22} />
          </span>
          <div>
            <span className="account-eyebrow">02 · ESTÁ NO SEU PLANO</span>
            <h2>Incluído na assinatura</h2>
          </div>
        </div>
        <details className="statement-explainer">
          <summary>Como ler estes valores?</summary>
          <p className="section-description">
            Custos de um carro próprio que servem de referência para entender a
            cobertura. Não são valores cobrados à parte na sua fatura.
          </p>
        </details>
        <ReferenceRows items={account.includedReferences} />
        <div className="covered-note">
          <BadgeCheck size={18} />
          <span>
            Você não precisa usar um serviço todo mês para ter a cobertura.
            Consulte as condições do seu contrato.
          </span>
        </div>
      </section>
      <section className="statement-section estimated-section">
        <div className="statement-section-header">
          <span className="statement-icon">
            <Info size={22} />
          </span>
          <div>
            <span className="account-eyebrow">03 · NÃO APARECE NO BOLETO</span>
            <h2>O custo de ter o carro</h2>
          </div>
          <span className="statement-tag neutral">ESTIMATIVA</span>
        </div>
        <details className="statement-explainer">
          <summary>Por que estes custos entram na comparação?</summary>
          <p className="section-description">
            Ao comprar, o dinheiro fica no veículo e ele pode perder valor.
            Estas estimativas entram apenas na comparação com carro próprio.
          </p>
        </details>
        <ReferenceRows items={account.estimatedCosts} />
      </section>
      <section className="account-comparison-summary">
        <span>MESMA BASE · {account.comparison.inputs.months} MESES</span>
        <div>
          <p>
            Ter este carro à vista
            <br />
            <strong>
              {money(account.comparison.cashMonthly)}
              <small>/mês equivalente</small>
            </strong>
          </p>
          <p>
            Sua assinatura
            <br />
            <strong>
              {money(account.dashboard.subscription.monthlyPrice)}
              <small>/mês no contrato</small>
            </strong>
          </p>
        </div>
        <Link href="/vale-a-pena">
          Entender a conta e mudar as premissas <ArrowRight size={18} />
        </Link>
      </section>
      <Link className="subscriber-link-card" href="/vale-a-pena">
        <span className="link-card-icon">
          <CircleHelp size={24} />
        </span>
        <div>
          <h2>E se eu tivesse financiado?</h2>
          <p>Veja a resposta com a conta aberta.</p>
        </div>
        <ArrowRight size={18} />
      </Link>
      <section className="account-feedback">
        <p>Agora ficou mais claro o que sua assinatura cobre?</p>
        {feedback ? (
          <p role="status">
            <Check size={17} /> {feedback}
          </p>
        ) : (
          <div>
            <button
              onClick={() => {
                setFeedback(
                  "Obrigado! Sua resposta foi registrada na demonstração.",
                );
                track("account_view", "/conta-aberta", "coverage-clear:yes");
              }}
            >
              Sim, ficou claro
            </button>
            <button
              onClick={() => {
                setFeedback(
                  "Vamos explicar a composição. Abra a comparação logo acima.",
                );
                track("account_view", "/conta-aberta", "coverage-clear:no");
              }}
            >
              Ainda tenho dúvidas
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export function ContractDecisions({
  account,
  reload,
  notify,
}: {
  account: Account;
  reload: () => Promise<void>;
  notify: (s: string) => void;
}) {
  const [selected, setSelected] = useState<ContractOption | null>(null);
  return (
    <div className="contract-decisions">
      <section className="statement-intro">
        <span className="account-eyebrow">A PRÓXIMA ESCOLHA TAMBÉM É SUA</span>
        <h2>
          Renovar, ajustar
          <br />
          ou ficar com o carro?
        </h2>
        <p>
          Compare os caminhos pelo seu uso. Sem precisar trocar de aplicativo.
        </p>
      </section>
      <div className="contract-context">
        <CalendarDays size={21} />
        <div>
          <strong>
            Seu contrato vai até{" "}
            {date(account.dashboard.subscription.endDate, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
          <p>
            Este é um planejamento antecipado, com opções e preços fictícios.
            Nenhuma oferta está disponível para contratação.
          </p>
        </div>
      </div>
      <section className="usage-context">
        <span>SUA MÉDIA NOS ÚLTIMOS 3 MESES COMPLETOS</span>
        <strong>
          {number(account.recentAverageKm)} <small>km/mês</small>
        </strong>
        <p>
          {account.recentAverageKm > 1000
            ? "Uma franquia de 1.000 km fica abaixo do seu uso recente. Vamos considerar o excedente antes de decidir."
            : "Uma franquia de 1.000 km pode combinar com seu uso recente."}
        </p>
      </section>
      <div className="contract-option-list">
        {account.contractOptions.map((o) => (
          <article
            key={o.id}
            className={`contract-option ${o.recommended ? "recommended" : ""}`}
          >
            {o.recommended && (
              <span className="contract-recommended">
                <Check size={14} /> COMBINA COM SEU USO RECENTE
              </span>
            )}
            <div>
              <h2>{o.name}</h2>
              {o.monthlyPrice !== null ? (
                <strong>
                  {money(o.monthlyPrice)}
                  <small>/mês simulado</small>
                </strong>
              ) : (
                <span className="statement-tag">PROPOSTA A CONSULTAR</span>
              )}
            </div>
            <p>{o.description}</p>
            {!o.fitsUsage && o.allowanceKm !== null && (
              <p className="plan-warning">
                No ritmo médio recente: cerca de{" "}
                {number(Math.max(0, account.recentAverageKm - o.allowanceKm))}{" "}
                km excedentes, ou{" "}
                {money(
                  Math.max(0, account.recentAverageKm - o.allowanceKm) *
                    account.dashboard.subscription.excessKmPrice,
                )}{" "}
                além da mensalidade. A tarifa de excedente atual é apenas
                referência.
              </p>
            )}
            <button
              disabled={account.registeredInterests.includes(o.id)}
              className="account-button secondary"
              onClick={() => setSelected(o)}
            >
              {account.registeredInterests.includes(o.id) ? (
                <>
                  <CheckCheck size={17} /> Interesse registrado
                </>
              ) : (
                <>
                  {o.cta}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </article>
        ))}
      </div>
      <p className="section-footnote">
        A franquia sugerida considera histórico, não prevê sua rotina futura. O
        preço final, a disponibilidade e as condições dependem de uma proposta
        real.
      </p>
      {selected && (
        <InterestDialog
          option={selected}
          close={() => setSelected(null)}
          complete={async (m) => {
            setSelected(null);
            notify(m);
            await reload();
          }}
        />
      )}
    </div>
  );
}
function InterestDialog({
  option,
  close,
  complete,
}: {
  option: ContractOption;
  close: () => void;
  complete: (s: string) => Promise<void>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  async function submit() {
    setPending(true);
    setError("");
    try {
      const r = await requestApi<{ message: string }>("/actions", {
        method: "POST",
        body: JSON.stringify({
          type: "contract-interest",
          targetId: option.id,
        }),
      });
      await complete(r.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível registrar.");
      setPending(false);
    }
  }
  return (
    <dialog
      ref={ref}
      className="account-dialog"
      aria-labelledby="interest-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) close();
      }}
    >
      <button
        className="dialog-close"
        aria-label="Fechar"
        disabled={pending}
        onClick={close}
      >
        <X size={20} />
      </button>
      <Send size={29} />
      <h2 id="interest-title">Registrar seu interesse?</h2>
      <p>
        {option.name}. Este registro fica salvo no protótipo. Nenhum contrato,
        compra ou contato com a Localiza será realizado.
      </p>
      {error && (
        <p role="alert" className="account-error">
          {error}
        </p>
      )}
      <button
        className="account-button"
        disabled={pending}
        onClick={() => void submit()}
      >
        {pending ? (
          <>
            <LoaderCircle className="spin" size={17} /> Registrando...
          </>
        ) : (
          "Confirmar interesse na demonstração"
        )}
      </button>
    </dialog>
  );
}

export function Retrospective({
  account,
  notify,
}: {
  account: Account;
  notify: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function share() {
    setBusy(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Minha Conta Aberta",
          text: account.shareText,
        });
        notify("Retrospectiva compartilhada.");
      } else {
        await navigator.clipboard.writeText(account.shareText);
        notify("Resumo copiado. Já pode enviar ao seu grupo.");
      }
      track("recap_share", "/retrospectiva");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        notify(
          "Não foi possível compartilhar. Use a opção de baixar o resumo.",
        );
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([account.shareText], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "minha-conta-aberta.txt";
    a.click();
    URL.revokeObjectURL(url);
    track("recap_share", "/retrospectiva", "download");
  }
  return (
    <div className="retrospective-view">
      <section className="recap-card">
        <span>MINHA ASSINATURA EM 2026</span>
        <h2>
          Menos boletos.
          <br />
          Mais caminho.
        </h2>
        <p className="recap-period">{account.periodLabel}</p>
        <div className="recap-main">
          <strong>{account.usedServicesCount}</strong>
          <p>
            serviços e documentos
            <br />
            resolvidos nesta jornada
          </p>
        </div>
        <ul>
          {account.dashboard.serviceValue.items
            .filter((i) => i.id !== "service-insurance")
            .map((i) => (
              <li key={i.id}>
                <CheckCheck size={17} />
                <span>{i.name}</span>
                <strong>{money(i.referenceValue)}</strong>
              </li>
            ))}
        </ul>
        <div className="recap-total">
          <span>Valor de referência dos serviços utilizados</span>
          <strong>{money(account.usedServicesReferenceTotal)}</strong>
        </div>
        <p className="recap-fineprint">
          Dados fictícios · valores de referência, sem promessa de economia. A
          proteção disponível é cobertura, e não foi contada como serviço
          realizado.
        </p>
        <span className="recap-brand">
          Localiza assinatura · conceito Conta Aberta
        </span>
      </section>
      <button
        className="account-button"
        disabled={busy}
        onClick={() => void share()}
      >
        <Share2 size={19} />
        {busy ? "Preparando..." : "Compartilhar minha retrospectiva"}
      </button>
      <button className="account-button secondary" onClick={download}>
        <Download size={18} /> Baixar resumo
      </button>
      <div className="recap-context">
        <FileText size={20} />
        <p>
          Sua mensalidade é de{" "}
          <strong>{money(account.dashboard.subscription.monthlyPrice)}</strong>.
          O período mostra apenas o que já aconteceu, até a data da
          demonstração.
        </p>
      </div>
      <Link href="/fim-contrato" className="subscriber-link-card">
        <div>
          <h2>E daqui para frente?</h2>
          <p>Planeje o próximo contrato com seu uso em mãos.</p>
        </div>
        <ArrowRight size={19} />
      </Link>
    </div>
  );
}
