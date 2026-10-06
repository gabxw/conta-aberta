"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Download,
  Info,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { date, money, number } from "@/lib/format";
import { track } from "@/lib/api";
import type { Account, OwnershipPart } from "@/lib/account-types";

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

// Paisagem do Rio desenhada em SVG (Pão de Açúcar, bondinho, Cristo, mar e pôr do sol).
function RioIllustration() {
  return (
    <svg
      viewBox="0 0 348 230"
      className="recap-rio"
      role="img"
      aria-label="Ilustração do Rio de Janeiro"
    >
      <defs>
        <linearGradient id="rio-ceu" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6b4fc4" />
          <stop offset=".55" stopColor="#f39bb8" />
          <stop offset="1" stopColor="#ffcf9f" />
        </linearGradient>
        <linearGradient id="rio-mar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2f8fb8" />
          <stop offset="1" stopColor="#1b4f7a" />
        </linearGradient>
      </defs>
      <rect width="348" height="230" fill="url(#rio-ceu)" />
      <circle cx="250" cy="118" r="38" fill="#ffe39a" />
      <path
        d="M0 160 L35 130 L62 98 L84 70 L100 60 L116 74 L150 120 L190 142 L250 148 L348 150 V230 H0Z"
        fill="#3a5f86"
        opacity=".85"
      />
      <rect x="98" y="38" width="5" height="23" fill="#2b2160" />
      <rect x="90" y="44" width="21" height="4" rx="2" fill="#2b2160" />
      <path d="M118 182 Q132 146 160 140 Q182 148 192 182Z" fill="#203a5c" />
      <path d="M178 182 Q205 100 232 92 Q262 100 272 182Z" fill="#162c49" />
      <path d="M160 140 L232 92" stroke="#fff" strokeWidth="1.6" opacity=".8" />
      <rect x="190" y="116" width="10" height="7" rx="2" fill="#fff" />
      <rect y="176" width="348" height="54" fill="url(#rio-mar)" />
      <path
        d="M10 192 q12 -6 24 0 t24 0 M120 202 q12 -6 24 0 t24 0 M240 190 q12 -6 24 0 t24 0"
        stroke="#fff"
        strokeWidth="2.5"
        fill="none"
        opacity=".55"
      />
      <path d="M0 222 Q174 208 348 222 V230 H0Z" fill="#f6dcae" />
    </svg>
  );
}

function WorldRing({ percent }: { percent: number }) {
  const r = 78;
  const length = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 200 200" className="recap-ring" aria-hidden="true">
      <circle
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke="#04662b"
        strokeOpacity=".2"
        strokeWidth="20"
      />
      <circle
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke="#04662b"
        strokeWidth="20"
        strokeLinecap="round"
        strokeDasharray={`${(length * Math.min(percent, 100)) / 100} ${length}`}
        transform="rotate(-90 100 100)"
      />
      <circle cx="100" cy="100" r="52" fill="#04662b" />
      <path
        d="M60 100 h80 M100 50 v100 M70 72 q30 14 60 0 M70 128 q30 -14 60 0"
        stroke="#79de20"
        strokeWidth="3"
        fill="none"
        opacity=".8"
      />
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fontSize="28"
        fontWeight="900"
        fill="#fff"
      >
        {percent.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
      </text>
    </svg>
  );
}

const recapCards = ["Estrada", "Destino", "Valor"];

export function Retrospective({
  account,
  notify,
}: {
  account: Account;
  notify: (s: string) => void;
}) {
  const recap = account.recap;
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState(0);
  const stories = useRef<HTMLDivElement>(null);
  function goTo(i: number) {
    const el = stories.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  }
  async function share() {
    setBusy(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Minha retrospectiva",
          text: recap.shareText,
        });
        notify("Retrospectiva compartilhada.");
      } else {
        await navigator.clipboard.writeText(recap.shareText);
        notify("Resumo copiado. Já pode enviar para quem quiser.");
      }
      track("recap_share", "/retrospectiva");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        notify("Não foi possível compartilhar. Use a opção de baixar o resumo.");
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([recap.shareText], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "minha-retrospectiva.txt";
    a.click();
    URL.revokeObjectURL(url);
    track("recap_share", "/retrospectiva", "download");
  }
  return (
    <div className="retrospective-view">
      <section className="statement-intro">
        <span className="account-eyebrow">NO FIM DO CICLO</span>
        <h2>Seus {recap.months} meses de assinatura</h2>
        <p>{recap.periodLabel}. Deslize para ver cada parte.</p>
      </section>
      <div
        className="recap-stories"
        ref={stories}
        onScroll={(e) => {
          const el = e.currentTarget;
          setCard(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
        }}
      >
        <article className="recap-story story-road" aria-label="Quilômetros rodados">
          <span className="story-tag">SEUS {recap.months} MESES NA ESTRADA</span>
          <strong className="story-big">{number(recap.totalKm)}</strong>
          <span className="story-unit">km rodados</span>
          <WorldRing percent={recap.worldTripPercent} />
          <p className="story-center">de uma volta ao mundo</p>
          <p className="story-foot">
            Até a Lua faltam <b>{number(recap.kmToMoon)} km</b>. Bora?
          </p>
        </article>
        <article className="recap-story story-trip" aria-label="Destino favorito">
          <RioIllustration />
          <div className="story-trip-body">
            <span className="story-tag">SEU DESTINO FAVORITO</span>
            <strong className="story-city">
              {recap.favoriteDestination.city}
            </strong>
            <p>
              {recap.favoriteDestination.trips} viagens,{" "}
              <b>{number(recap.favoriteDestination.km)} km</b> nessa rota
            </p>
            <p className="story-others">
              Também: {recap.otherDestinations.map((d) => d.city).join(" e ")}
            </p>
            <p className="story-fine">Com a sua permissão de localização</p>
          </div>
        </article>
        <article className="recap-story story-value" aria-label="Valor recebido">
          <span className="story-tag">A ASSINATURA CUIDOU DE</span>
          <strong className="story-money">{money(recap.coveredTotal)}</strong>
          <p>
            Você pagou {money(recap.paidTotal)} de mensalidade.
            {recap.equivalents.length > 0 && " A diferença daria para:"}
          </p>
          <ul className="story-equivalents">
            {recap.equivalents.map((e) => (
              <li key={e.label}>
                <b>{e.count}</b>
                {e.label}
              </li>
            ))}
          </ul>
          <p className="story-fine">
            Custo de ter o carro estimado com a FIPE e taxas públicas.
          </p>
        </article>
      </div>
      <div className="recap-dots" aria-label="Partes da retrospectiva">
        {recapCards.map((c, i) => (
          <button
            key={c}
            aria-label={`Ver ${c}`}
            aria-current={card === i ? "true" : undefined}
            className={card === i ? "active" : ""}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
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
      <p className="section-footnote">
        Dados de demonstração. Km e destinos viriam do carro conectado, só com a
        permissão do cliente.
      </p>
    </div>
  );
}
