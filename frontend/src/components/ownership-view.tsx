"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  CircleHelp,
  Info,
  LoaderCircle,
  SlidersHorizontal,
} from "lucide-react";
import type { Account, Comparison, OwnershipInputs } from "@/lib/account-types";
import { money, number } from "@/lib/format";
import { requestApi, track } from "@/lib/api";

const fields: {
  key: keyof OwnershipInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}[] = [
  {
    key: "vehiclePrice",
    label: "Preço de compra",
    min: 10000,
    max: 1000000,
    step: 100,
    unit: "R$",
  },
  {
    key: "resaleValue",
    label: "Revenda esperada no fim",
    min: 0,
    max: 1000000,
    step: 100,
    unit: "R$",
  },
  {
    key: "months",
    label: "Período da comparação",
    min: 12,
    max: 60,
    step: 1,
    unit: "meses",
  },
  {
    key: "downPaymentPercent",
    label: "Entrada no financiamento",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
  },
  {
    key: "interestMonthlyPercent",
    label: "Juros do financiamento",
    min: 0,
    max: 5,
    step: 0.01,
    unit: "% ao mês",
  },
  {
    key: "yieldMonthlyPercent",
    label: "Rendimento líquido do dinheiro",
    min: 0,
    max: 3,
    step: 0.01,
    unit: "% ao mês",
  },
  {
    key: "ipvaPercent",
    label: "Alíquota simulada de IPVA",
    min: 0,
    max: 10,
    step: 0.1,
    unit: "% ao ano",
  },
  {
    key: "insuranceAnnual",
    label: "Seguro de carro próprio",
    min: 0,
    max: 50000,
    step: 10,
    unit: "R$/ano",
  },
  {
    key: "maintenanceAnnual",
    label: "Manutenção prevista",
    min: 0,
    max: 50000,
    step: 10,
    unit: "R$/ano",
  },
  {
    key: "tiresTotal",
    label: "Pneus no período",
    min: 0,
    max: 50000,
    step: 10,
    unit: "R$",
  },
  {
    key: "licensingAnnual",
    label: "Licenciamento",
    min: 0,
    max: 5000,
    step: 1,
    unit: "R$/ano",
  },
];
export function OwnershipView({ account }: { account: Account }) {
  const [comparison, setComparison] = useState<Comparison>(account.comparison);
  const [inputs, setInputs] = useState(account.comparison.inputs);
  const [mode, setMode] = useState<"cash" | "financed">("financed");
  const [editing, setEditing] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const [question, setQuestion] = useState("finance");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("premissas") === "1")
      queueMicrotask(() => setEditing(true));
  }, []);
  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const c = await requestApi<Comparison>("/comparison", {
        method: "POST",
        body: JSON.stringify(inputs),
      });
      setComparison(c);
      setEditing(false);
      track("comparison_run", "/vale-a-pena", mode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confira as premissas.");
    } finally {
      setPending(false);
    }
  }
  const ownership =
    mode === "cash" ? comparison.cashMonthly : comparison.financedMonthly;
  const difference =
    mode === "cash" ? comparison.cashDifference : comparison.financedDifference;
  const maximum = Math.max(ownership, comparison.subscriptionMonthly) * 1.06;
  return (
    <div className="ownership-view">
      <section className="statement-intro">
        <span className="account-eyebrow">A PARCELA NÃO É A CONTA TODA</span>
        <h2>
          Vamos comparar
          <br />
          do jeito certo.
        </h2>
        <p>
          Mesmo carro, mesmo período. Com despesas, revenda e o rendimento do
          dinheiro na conta.
        </p>
      </section>
      <section
        className="guided-questions"
        aria-label="Dúvidas sobre a assinatura"
      >
        <p>O que você quer entender?</p>
        <div>
          {[
            { id: "finance", label: "E se eu tivesse financiado?" },
            { id: "cash", label: "E se eu comprasse à vista?" },
            { id: "coverage", label: "O que está incluído?" },
          ].map((q) => (
            <button
              key={q.id}
              aria-pressed={question === q.id}
              className={question === q.id ? "selected" : ""}
              onClick={() => {
                setQuestion(q.id);
                if (q.id !== "coverage")
                  setMode(q.id === "cash" ? "cash" : "financed");
                track("comparison_run", "/vale-a-pena", q.id);
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </section>
      {question === "coverage" && (
        <div className="coverage-answer">
          <ShieldAnswer />
          <p>
            IPVA, licenciamento, proteção e cuidados por desgaste seguem as
            condições do seu plano. Os valores comparativos são referências de
            carro próprio, não cobranças adicionais.
          </p>
          <Link href="/conta-aberta">
            Ver composição na Conta Aberta <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <section className="comparison-card">
        <div className="comparison-card-heading">
          <span className="statement-icon">
            <Calculator size={22} />
          </span>
          <div>
            <h2>
              {mode === "cash" ? "Comprar à vista" : "Comprar financiado"} ×
              assinar
            </h2>
            <p>
              {account.dashboard.vehicle.brand}{" "}
              {account.dashboard.vehicle.model} · {comparison.inputs.months}{" "}
              meses · cenário fictício
            </p>
          </div>
        </div>
        <div className="comparison-mode" aria-label="Modo de compra">
          <button
            aria-pressed={mode === "cash"}
            className={mode === "cash" ? "selected" : ""}
            onClick={() => {
              setMode("cash");
              setQuestion("cash");
            }}
          >
            À vista
          </button>
          <button
            aria-pressed={mode === "financed"}
            className={mode === "financed" ? "selected" : ""}
            onClick={() => {
              setMode("financed");
              setQuestion("finance");
            }}
          >
            Financiado
          </button>
        </div>
        <div className="ownership-bars">
          <div>
            <div>
              <span>Carro próprio</span>
              <strong>
                {money(ownership)}
                <small>/mês equivalente</small>
              </strong>
            </div>
            <span className="comparison-track">
              <i style={{ width: `${(ownership / maximum) * 100}%` }} />
            </span>
          </div>
          <div>
            <div>
              <span>Sua assinatura</span>
              <strong>
                {money(comparison.subscriptionMonthly)}
                <small>/mês no contrato</small>
              </strong>
            </div>
            <span className="comparison-track subscription">
              <i
                style={{
                  width: `${(comparison.subscriptionMonthly / maximum) * 100}%`,
                }}
              />
            </span>
          </div>
        </div>
        <div
          className={`comparison-answer ${difference < 0 ? "ownership-wins" : ""}`}
          aria-live="polite"
        >
          <span>
            <Info size={19} />
            {difference >= 0
              ? "NESTAS PREMISSAS, ASSINAR CUSTA MENOS"
              : "NESTAS PREMISSAS, COMPRAR CUSTA MENOS"}
          </span>
          <strong>
            {money(Math.abs(difference))}
            <small>de diferença por mês equivalente</small>
          </strong>
          <p>
            {difference >= 0
              ? "A diferença favorece a assinatura neste cenário. Ela muda quando preço, revenda, juros ou rendimento mudam."
              : "A compra fica mais barata neste cenário. A assinatura ainda oferece previsibilidade e os serviços do contrato; a decisão depende das suas prioridades."}
          </p>
        </div>
        {mode === "financed" && (
          <div className="financing-note">
            <p>
              Parcela simulada: <strong>{money(comparison.installment)}</strong>{" "}
              em {comparison.inputs.months} vezes, com entrada de{" "}
              <strong>{money(comparison.downPayment)}</strong>.
            </p>
            <p>
              A parcela sozinha não considera os cuidados, o capital da entrada
              e o valor que você recuperaria ao vender.
            </p>
          </div>
        )}
        <button
          className="account-button secondary"
          onClick={() => setEditing(!editing)}
          aria-expanded={editing}
        >
          <SlidersHorizontal size={18} />{" "}
          {editing ? "Fechar edição" : "Ver e ajustar as premissas"}
          <ChevronDown size={16} />
        </button>
      </section>
      {editing && (
        <form className="assumptions-form" onSubmit={(e) => void calculate(e)}>
          <div>
            <h2>Abra a conta. Ajuste o cenário.</h2>
            <p>
              Valores fictícios para demonstração. A mensalidade da assinatura
              vem do contrato e fica em {money(comparison.subscriptionMonthly)}.
            </p>
          </div>
          <div className="assumptions-grid">
            {fields.map((f) => (
              <label key={f.key}>
                {f.label}
                <span>
                  <input
                    required
                    type="number"
                    name={f.key}
                    value={inputs[f.key]}
                    min={f.min}
                    max={f.key === "resaleValue" ? inputs.vehiclePrice : f.max}
                    step={f.step}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        [f.key]:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                  <small>{f.unit}</small>
                </span>
              </label>
            ))}
          </div>
          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}
          <button className="account-button" disabled={pending}>
            {pending ? (
              <>
                <LoaderCircle className="spin" size={17} /> Calculando...
              </>
            ) : (
              <>
                <Calculator size={17} /> Recalcular comparação
              </>
            )}
          </button>
        </form>
      )}
      <details className="calculation-details">
        <summary>
          <CircleHelp size={18} /> De onde vem esse número?
          <ChevronDown size={16} />
        </summary>
        <div>
          <h3>Custo mensal de um carro próprio à vista</h3>
          <ul>
            {comparison.cashBreakdown.map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <strong>{money(p.monthlyValue)}</strong>
              </li>
            ))}
            <li className="calculation-total">
              <strong>Total por mês equivalente</strong>
              <strong>{money(comparison.cashMonthly)}</strong>
            </li>
          </ul>
          <p>{comparison.method}</p>
          <h3>Os fluxos a valor presente</h3>
          <ul>
            <li>
              <span>Compra à vista, descontada a revenda</span>
              <strong>{money(comparison.cashPresentCost)}</strong>
            </li>
            <li>
              <span>Compra financiada, descontada a revenda</span>
              <strong>{money(comparison.financedPresentCost)}</strong>
            </li>
            <li>
              <span>Assinatura no mesmo período</span>
              <strong>{money(comparison.subscriptionPresentCost)}</strong>
            </li>
          </ul>
          <p>
            Revenda esperada: {money(comparison.inputs.resaleValue)}. Juros:{" "}
            {number(comparison.inputs.interestMonthlyPercent, 2)}% ao mês.
            Rendimento líquido:{" "}
            {number(comparison.inputs.yieldMonthlyPercent, 2)}% ao mês.
          </p>
        </div>
      </details>
      <p className="section-footnote">{comparison.scope}</p>
      <Link className="subscriber-link-card" href="/fim-contrato">
        <div>
          <h2>Agora, qual é o próximo passo?</h2>
          <p>Compare renovar, mudar o plano ou ficar com o carro.</p>
        </div>
        <ArrowRight size={20} />
      </Link>
    </div>
  );
}
function ShieldAnswer() {
  return (
    <span>
      <Check size={18} /> O que seu plano cobre
    </span>
  );
}
