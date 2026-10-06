import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  ChartNoAxesCombined,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  Gauge,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { date, money, number } from "@/lib/format";
import { VehicleIllustration } from "./vehicle-illustration";
import type {
  ActionType,
  AdminOverview,
  Dashboard,
  ServiceValue,
  TimelineEvent,
  Usage,
} from "@/lib/types";
export type SelectedAction = {
  type: ActionType;
  id: string;
  title: string;
  description?: string;
};
type ActionProps = { data: Dashboard; openAction: (a: SelectedAction) => void };
export function DashboardView({ data, openAction }: ActionProps) {
  const next = data.nextBestAction;
  return (
    <>
      <section className="overview-grid">
        <VehicleHero data={data} openAction={openAction} />
        <article className="next-action">
          <div className="card-kicker">
            <span className="sparkle-icon">
              <Sparkles size={17} />
            </span>
            DRIVEPULSE
            <span className="live-dot" />
          </div>
          {next ? (
            <>
              <div className="recommendation-tag">
                O próximo passo, antes do imprevisto
              </div>
              <h2>{next.title}</h2>
              <p>{next.description}</p>
              <div className="recommendation-reason">
                <Zap size={14} />
                {next.reason}
              </div>
              <button
                className="button primary full"
                onClick={() =>
                  openAction({
                    type: next.type as ActionType,
                    id: next.id,
                    title: next.title,
                    description: next.description,
                  })
                }
              >
                {next.ctaLabel}
                <ArrowRight size={17} />
              </button>
              <button
                className="text-button defer"
                onClick={() =>
                  openAction({
                    type: "dismiss-recommendation",
                    id: next.id,
                    title: "Dispensar sugestão",
                  })
                }
              >
                Ver a próxima sugestão
              </button>
            </>
          ) : (
            <div className="all-clear">
              <CheckCheck size={36} />
              <h2>Tudo em sintonia.</h2>
              <p>Você já cuidou das recomendações para este momento.</p>
              <Link className="text-link" href="/veiculo">
                Ver seu histórico
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </article>
      </section>
      <section className="middle-grid">
        <MileageCard data={data} openAction={openAction} />
        <article className="value-card">
          <div className="section-top">
            <h2>Meus benefícios</h2>
            <span className="round-icon">
              <ShieldCheck size={20} />
            </span>
          </div>
          <p className="muted">Serviços incluídos que você já utilizou</p>
          <div className="value-amount">
            {money(data.serviceValue.total)}
            <span>em serviços utilizados</span>
          </div>
          <div className="value-items">
            {data.serviceValue.items.slice(0, 3).map((item, i) => (
              <div key={item.id}>
                <span className={`service-mini mini-${i}`}>
                  <ServiceIcon name={item.name} />
                </span>
                <span>{item.name}</span>
                <strong>{money(item.referenceValue)}</strong>
              </div>
            ))}
          </div>
          <div className="reference-note">
            Valores de referência dos serviços.
            <br />
            Não representam economia garantida.
          </div>
          <Link href="/servicos" className="text-link">
            Explorar meus serviços
            <ArrowUpRight size={16} />
          </Link>
        </article>
      </section>
      <section className="bottom-grid">
        <article className="timeline-card">
          <div className="section-top">
            <h2>Histórico do meu carro</h2>
            <Link href="/veiculo" className="text-link">
              Ver tudo
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <Timeline events={data.timeline.slice(0, 3)} compact />
        </article>
        <article className="month-card">
          <div className="section-top">
            <h2>Meu uso neste mês</h2>
            <Route size={20} />
          </div>
          <div className="trip-total">
            <strong>{number(data.usageSummary.totalTrips)}</strong>
            <span>
              viagens feitas
              <br />
              neste mês
            </span>
          </div>
          <div className="month-stats">
            <div>
              <span>Média diária</span>
              <strong>
                {number(data.usageSummary.averageDailyKm, 1)}
                <small> km</small>
              </strong>
            </div>
            <div>
              <span>Dia mais ativo</span>
              <strong>{data.usageSummary.mostUsedDay}</strong>
            </div>
          </div>
          <Link href="/historico" className="text-link">
            Conhecer meu ritmo
            <ArrowRight size={15} />
          </Link>
        </article>
      </section>
    </>
  );
}
export function VehicleHero({ data, openAction }: ActionProps) {
  const document = data.alerts.find(
    (a) => a.type === "document" && a.status === "pending",
  );
  const maintenance = data.alerts.find(
    (a) => a.type === "maintenance" && a.status === "pending",
  );
  const percentage = Math.min(
    100,
    (data.mileage.currentKm / data.mileage.allowanceKm) * 100,
  );
  return (
    <article className="vehicle-hero">
      <div className="car-section-title">
        <h2>Meu carro</h2>
        <span className="car-active">
          <Check size={12} />
          Assinatura ativa
        </span>
      </div>
      <div className="vehicle-stage">
        <VehicleIllustration />
      </div>
      <div className="vehicle-title">
        <span className="plate">{data.vehicle.plate}</span>
        <h3>
          {data.vehicle.brand} {data.vehicle.model} {data.vehicle.year}
        </h3>
        <p>{data.vehicle.version} · imagem ilustrativa</p>
      </div>
      <div className="vehicle-usage">
        <span>Km rodados neste mês</span>
        <div
          className="vehicle-usage-track"
          role="progressbar"
          aria-label="Franquia mensal utilizada"
          aria-valuemin={0}
          aria-valuemax={data.mileage.allowanceKm}
          aria-valuenow={Math.min(
            data.mileage.allowanceKm,
            data.mileage.currentKm,
          )}
          aria-valuetext={`${number(data.mileage.currentKm, 2)} km de ${number(data.mileage.allowanceKm)} km`}
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <div className="vehicle-usage-values">
          <span>
            <strong>{number(data.mileage.currentKm, 2)} km</strong> /{" "}
            {number(data.mileage.allowanceKm)} km
          </span>
          <Link href="/historico">
            Mais detalhes
            <ChevronDown size={14} />
          </Link>
        </div>
      </div>
      <div className="car-shortcuts" aria-label="Atalhos do carro">
        {document ? (
          <button
            onClick={() =>
              openAction({
                type: document.actionType,
                id: document.id,
                title: document.title,
                description: document.description,
              })
            }
          >
            <FileCheck2 size={23} />
            <span>CRLV</span>
          </button>
        ) : (
          <button disabled aria-label="CRLV já conferido">
            <FileCheck2 size={23} />
            <span>CRLV conferido</span>
          </button>
        )}
        {maintenance ? (
          <button
            onClick={() =>
              openAction({
                type: maintenance.actionType,
                id: maintenance.id,
                title: maintenance.title,
                description: maintenance.description,
              })
            }
          >
            <Wrench size={23} />
            <span>Revisão</span>
          </button>
        ) : (
          <button disabled aria-label="Revisão já registrada">
            <Wrench size={23} />
            <span>Revisão registrada</span>
          </button>
        )}
        <Link href="/historico">
          <Route size={23} />
          <span>Gestão de km</span>
        </Link>
      </div>
      <Link className="hero-bottom" href="/veiculo">
        <span>Mais opções do carro</span>
        <ArrowRight size={17} />
      </Link>
    </article>
  );
}
function MileageCard({ data, openAction }: ActionProps) {
  const m = data.mileage;
  return (
    <article className="mileage-card">
      <div className="section-top">
        <h2>Gestão de km</h2>
        <span className="period-pill">
          {date(data.referenceDate, { month: "long" })}
          <CalendarDays size={13} />
        </span>
      </div>
      <div className="mileage-summary">
        <div>
          <span>Seu ritmo aponta para</span>
          <strong>
            {number(m.projectedKm)}
            <small> km</small>
          </strong>
        </div>
        <div className="allowance-note">
          <span>Franquia mensal</span>
          <strong>{number(m.allowanceKm)} km</strong>
        </div>
        <span className={`warning-pill ${m.excessKm <= 0 ? "within" : ""}`}>
          <TrendingUp size={13} />
          {m.excessKm > 0
            ? `${number(m.excessKm)} km além da franquia`
            : "Dentro da franquia"}
        </span>
      </div>
      <div className="mileage-current">
        <span>Rodados até agora</span>
        <strong>
          {number(m.currentKm, 2)} <small>km</small>
        </strong>
      </div>
      <MileageChart data={data} />
      <div className="chart-legend">
        <span>
          <i className="actual" />
          Uso registrado
        </span>
        <span>
          <i className="projected" />
          Projeção
        </span>
        <span>
          <i className="allowance" />
          Franquia
        </span>
      </div>
      <div className="mileage-tip">
        <span className="tip-icon">
          <Route size={19} />
        </span>
        <p>
          {m.excessKm > 0 ? (
            <>
              No ritmo atual, o excedente estimado é de{" "}
              <strong>{money(m.estimatedExcessCost)}.</strong> Ainda dá tempo de
              ajustar o caminho.
            </>
          ) : (
            <>
              Seu ritmo está dentro da franquia. Acompanhe os próximos trajetos.
            </>
          )}
        </p>
        <button
          aria-label="Planejar meu uso"
          onClick={() =>
            openAction({
              type: "mileage-plan",
              id: "mileage-plan",
              title: "Seu plano para o restante do mês",
            })
          }
        >
          <ArrowUpRight size={21} />
        </button>
      </div>
    </article>
  );
}
function MileageChart({ data }: { data: Dashboard }) {
  const m = data.mileage,
    max = Math.max(m.projectedKm, m.allowanceKm) * 1.23,
    w = 560,
    h = 145,
    left = 42,
    right = 18,
    top = 10,
    bottom = 24;
  const x = (day: number) => left + ((day - 1) / 30) * (w - left - right),
    y = (km: number) => top + (1 - km / max) * (h - top - bottom);
  const points = m.series.filter(
      (s) =>
        s.date.slice(0, 10) <= data.referenceDate.slice(0, 10) &&
        s.actualKm >= 0,
    ),
    currentDay = Number(data.referenceDate.slice(8, 10));
  const actualPath = points
    .map(
      (p, i) =>
        `${i ? "L" : "M"}${x(Number(p.date.slice(8, 10)))} ${y(p.actualKm)}`,
    )
    .join(" ");
  return (
    <svg
      className="mileage-chart"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Uso atual ${number(m.currentKm)} quilômetros. Projeção ${number(m.projectedKm)} quilômetros. Franquia ${number(m.allowanceKm)} quilômetros.`}
    >
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#4c8a70" stopOpacity=".18" />
          <stop offset="1" stopColor="#4c8a70" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 500, 1000, 1500, 2000]
        .filter((v) => v <= max)
        .map((v) => (
          <g key={v}>
            <line
              x1={left}
              x2={w - right}
              y1={y(v)}
              y2={y(v)}
              stroke="#eceee8"
              strokeDasharray="3 4"
            />
            <text x="3" y={y(v) + 4} fill="#7c867c" fontSize="10">
              {number(v)}
            </text>
          </g>
        ))}
      <line
        x1={left}
        x2={w - right}
        y1={y(m.allowanceKm)}
        y2={y(m.allowanceKm)}
        stroke="#a0a49c"
        strokeDasharray="6 5"
      />
      {actualPath && (
        <>
          <path
            d={`${actualPath}L${x(currentDay)} ${y(0)}L${left} ${y(0)}Z`}
            fill="url(#chart-fill)"
          />
          <path
            d={actualPath}
            stroke="#36705a"
            strokeWidth="2.8"
            fill="none"
            strokeLinejoin="round"
          />
        </>
      )}
      <path
        d={`M${x(currentDay)} ${y(m.currentKm)}L${x(31)} ${y(m.projectedKm)}`}
        stroke="#cf8962"
        strokeWidth="2.5"
        strokeDasharray="5 4"
        fill="none"
      />
      <line
        x1={x(currentDay)}
        x2={x(currentDay)}
        y1={top}
        y2={y(0)}
        stroke="#bbc6bd"
        strokeDasharray="2 4"
      />
      <circle
        cx={x(currentDay)}
        cy={y(m.currentKm)}
        r="4"
        fill="#36705a"
        stroke="white"
        strokeWidth="2"
      />
      <circle
        cx={x(31)}
        cy={y(m.projectedKm)}
        r="4"
        fill="#cf8962"
        stroke="white"
        strokeWidth="2"
      />
      {[1, 5, 10, 15, 20, 25, 31].map((d) => (
        <text
          key={d}
          x={x(d)}
          y={h - 4}
          fill="#7c867c"
          fontSize="10"
          textAnchor="middle"
        >
          {d === currentDay ? "Hoje" : String(d).padStart(2, "0")}
        </text>
      ))}
    </svg>
  );
}
function Timeline({
  events,
  compact = false,
}: {
  events: TimelineEvent[];
  compact?: boolean;
}) {
  if (!events.length)
    return (
      <p className="empty-state">
        Nenhum registro para este filtro. Sua história continua no próximo
        trajeto.
      </p>
    );
  return (
    <div className={`timeline ${compact ? "compact" : ""}`}>
      {events.map((event) => (
        <div className="timeline-event" key={event.id}>
          <div className={`timeline-symbol ${event.type}`}>
            <EventIcon type={event.type} />
          </div>
          <div className="event-copy">
            <strong>{event.title}</strong>
            <p>{event.description}</p>
            {!compact && (
              <span className="event-status">
                {(
                  {
                    completed: "Concluído",
                    scheduled: "Agendado",
                    active: "Ativo",
                    pending: "Pendente",
                    dismissed: "Adiado",
                    confirmed: "Confirmado",
                  } as Record<string, string>
                )[event.status] || event.status}
              </span>
            )}
          </div>
          <time dateTime={event.occurredAt}>{date(event.occurredAt)}</time>
        </div>
      ))}
    </div>
  );
}
function EventIcon({ type }: { type: string }) {
  return type.includes("maintenance") || type.includes("service") ? (
    <Wrench size={16} />
  ) : type.includes("document") ? (
    <FileCheck2 size={16} />
  ) : type.includes("mileage") || type.includes("usage") ? (
    <Route size={16} />
  ) : (
    <Check size={16} />
  );
}
function ServiceIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  return lower.includes("manuten") || lower.includes("revis") ? (
    <Wrench size={18} />
  ) : lower.includes("segur") || lower.includes("prote") ? (
    <ShieldCheck size={18} />
  ) : lower.includes("assist") ? (
    <CircleHelp size={18} />
  ) : (
    <CarFront size={18} />
  );
}
export function UsageView({
  data,
  dashboard,
  months,
  setMonths,
  openAction,
}: {
  data: Usage;
  dashboard: Dashboard;
  months: string;
  setMonths: (v: string) => void;
  openAction: (a: SelectedAction) => void;
}) {
  const max = Math.max(
    ...data.months.map((m) => Math.max(m.distanceKm, m.allowanceKm)),
    1,
  );
  return (
    <>
      <div className="usage-intro">
        <div>
          <span className="eyebrow">QUILÔMETROS COM CONTEXTO</span>
          <h2>Seu ritmo, mês a mês.</h2>
        </div>
        <label className="select-wrap">
          <span>Período</span>
          <select value={months} onChange={(e) => setMonths(e.target.value)}>
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Últimos 12 meses</option>
          </select>
        </label>
      </div>
      <article className="usage-chart-card">
        <div className="section-top">
          <h3>Distância percorrida</h3>
          <div className="chart-legend">
            <span>
              <i className="actual" />
              Quilômetros
            </span>
            <span>
              <i className="allowance" />
              Franquia mensal
            </span>
          </div>
        </div>
        <div
          className="bar-chart"
          role="img"
          aria-label="Quilometragem mensal e comparação com a franquia"
        >
          {data.months.map((month, i) => (
            <div className="bar-group" key={month.month}>
              <strong>
                {number(month.distanceKm)}
                <small> km</small>
              </strong>
              <div className="bar-track">
                <span
                  className="bar-allowance"
                  style={{ bottom: `${(month.allowanceKm / max) * 86}%` }}
                  title={`Franquia ${number(month.allowanceKm)} km`}
                />
                <div
                  className={`usage-bar ${i === data.months.length - 1 ? "latest" : ""}`}
                  style={{ height: `${(month.distanceKm / max) * 86}%` }}
                />
              </div>
              <span>{month.label}</span>
              <small>{month.trips} viagens</small>
            </div>
          ))}
        </div>
      </article>
      <div className="usage-detail-grid">
        <MileageCard data={dashboard} openAction={openAction} />
        <article className="insight-card">
          <Sparkles size={24} />
          <span className="eyebrow">O QUE SEU USO CONTA</span>
          <h2>
            Pequenas escolhas.
            <br />
            Um caminho mais leve.
          </h2>
          {data.insights.map((insight, i) => (
            <p key={i}>
              <Check size={17} />
              {insight}
            </p>
          ))}
          <button
            className="button primary"
            onClick={() =>
              openAction({
                type: "mileage-plan",
                id: "mileage-plan",
                title: "Seu plano para o restante do mês",
              })
            }
          >
            Planejar meus quilômetros
            <ArrowRight size={17} />
          </button>
        </article>
      </div>
      <article className="daily-card">
        <div className="section-top">
          <h2>Seus últimos trajetos</h2>
          <span className="muted">Distância consolidada por dia</span>
        </div>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Seus últimos trajetos"
        >
          <table>
            <thead>
              <tr>
                <th>Dia</th>
                <th>Viagens</th>
                <th>Distância</th>
                <th>Ritmo</th>
              </tr>
            </thead>
            <tbody>
              {data.daily
                .slice(-7)
                .reverse()
                .map((day) => (
                  <tr key={day.date}>
                    <td>
                      {date(day.date, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td>{day.trips}</td>
                    <td>
                      <strong>{number(day.distanceKm, 1)} km</strong>
                    </td>
                    <td>
                      <span
                        className="distance-bar"
                        style={{
                          width: `${Math.max(8, Math.min(100, day.distanceKm))}%`,
                        }}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
export function ServicesView({ data }: { data: ServiceValue }) {
  return (
    <>
      <section className="services-hero">
        <div>
          <span className="eyebrow">CUIDADO QUE ACOMPANHA VOCÊ</span>
          <h2>
            A liberdade é sua.
            <br />
            Os detalhes ficam com a gente.
          </h2>
          <p>
            Uma assinatura vai além do carro. Conheça o valor de referência dos
            cuidados que você já utilizou.
          </p>
        </div>
        <div className="services-total">
          <ShieldCheck size={32} />
          <span>{data.periodLabel}</span>
          <strong>{money(data.total)}</strong>
          <small>Valor de referência dos serviços utilizados</small>
        </div>
      </section>
      <div className="service-section-heading">
        <h2>Cuidado recebido, na prática.</h2>
        <span>{data.items.length} serviços utilizados</span>
      </div>
      <section className="service-list">
        {data.items.map((item, i) => (
          <article key={item.id}>
            <span className="service-index">0{i + 1}</span>
            <span className="service-large-icon">
              <ServiceIcon name={item.name} />
            </span>
            <div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className="service-date">
                <CalendarDays size={13} />
                {date(item.date, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="service-price">
              <strong>{money(item.referenceValue)}</strong>
              <span>Valor de referência</span>
              <span className="included">
                <Check size={12} />
                Incluso na assinatura
              </span>
            </div>
          </article>
        ))}
      </section>
      <div className="disclosure">
        <CircleHelp size={19} />
        <p>
          Os valores apresentados são referências dos serviços efetivamente
          utilizados. Não representam uma economia garantida nem crédito para
          resgate.
        </p>
      </div>
    </>
  );
}
export function VehicleView({
  data,
  events,
  filter,
  setFilter,
  openAction,
}: {
  data: Dashboard;
  events: TimelineEvent[];
  filter: string;
  setFilter: (v: string) => void;
  openAction: (a: SelectedAction) => void;
}) {
  return (
    <>
      <section className="vehicle-page-grid">
        <VehicleHero data={data} openAction={openAction} />
        <article className="subscription-card">
          <span className="eyebrow">SUA ASSINATURA</span>
          <h2>{data.subscription.planName}</h2>
          <div className="subscription-price">
            {money(data.subscription.monthlyPrice)}
            <small>/mês</small>
          </div>
          <dl>
            <div>
              <dt>Franquia mensal</dt>
              <dd>{number(data.subscription.monthlyAllowanceKm)} km</dd>
            </div>
            <div>
              <dt>Quilômetro excedente</dt>
              <dd>{money(data.subscription.excessKmPrice)}/km</dd>
            </div>
            <div>
              <dt>Vigência</dt>
              <dd>
                {date(data.subscription.startDate)} —{" "}
                {date(data.subscription.endDate, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt>Hodômetro</dt>
              <dd>{number(data.vehicle.odometerKm)} km</dd>
            </div>
          </dl>
        </article>
      </section>
      <section className="care-section">
        <div className="section-top">
          <h2>Um pouco de atenção agora.</h2>
          <span className="muted">Cuidados para seguir tranquilo</span>
        </div>
        {data.alerts.filter((a) => a.status === "pending").length ? (
          <div className="alert-list">
            {data.alerts
              .filter((a) => a.status === "pending")
              .map((alert) => (
                <article key={alert.id}>
                  <div className={`alert-icon ${alert.severity}`}>
                    <EventIcon type={alert.type} />
                  </div>
                  <div>
                    <h3>{alert.title}</h3>
                    <p>{alert.description}</p>
                    <small>
                      Referência:{" "}
                      {date(alert.dueDate, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </small>
                  </div>
                  <button
                    className="button secondary"
                    onClick={() =>
                      openAction({
                        type: alert.actionType,
                        id: alert.id,
                        title: alert.title,
                        description: alert.description,
                      })
                    }
                  >
                    Cuidar disso
                    <ArrowRight size={16} />
                  </button>
                </article>
              ))}
          </div>
        ) : (
          <div className="clear-banner">
            <CheckCheck size={20} />
            Todos os cuidados deste momento estão registrados.
          </div>
        )}
      </section>
      <article className="full-timeline-card">
        <div className="section-top">
          <h2>A história do seu veículo</h2>
          <div className="filters" aria-label="Filtrar histórico">
            {[
              { value: "all", label: "Tudo" },
              { value: "maintenance", label: "Manutenção" },
              { value: "document", label: "Documentos" },
              { value: "mileage", label: "Uso" },
            ].map((option) => (
              <button
                key={option.value}
                className={filter === option.value ? "selected" : ""}
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <Timeline events={events} />
      </article>
    </>
  );
}
const actionNames: Record<string, string> = {
  page_view: "Visita a uma página",
  recommendation_view: "Recomendação vista",
  action_click: "Clique em uma ação",
  timeline_filter: "Filtro do histórico",
  usage_filter: "Filtro de uso",
  account_view: "Conta Aberta e clareza da cobertura",
  comparison_run: "Comparação de custos",
  contract_view: "Opções do próximo contrato",
  recap_share: "Compartilhamento da retrospectiva",
  action_completed: "Ação concluída",
  recommendation_dismissed: "Sugestão dispensada",
};
export function AdminView({
  data,
  refresh,
}: {
  data: AdminOverview;
  refresh: () => void;
}) {
  const max = Math.max(...data.eventsByName.map((e) => e.count), 1);
  return (
    <>
      <div className="admin-banner">
        <span>
          <Gauge size={19} />
          Ambiente demonstrativo · visão operacional sem autenticação
        </span>
        <button className="text-link" onClick={refresh}>
          <RefreshCw size={15} />
          Atualizar dados
        </button>
      </div>
      <section className="admin-metrics">
        {[
          {
            label: "Clientes ativos",
            value: number(data.activeCustomers),
            note: `de ${number(data.totalCustomers)} clientes`,
            icon: CarFront,
          },
          {
            label: "Eventos registrados",
            value: number(data.totalEvents),
            note: "interações no produto",
            icon: ChartNoAxesCombined,
          },
          {
            label: "Ações concluídas",
            value: number(data.actionsCompleted),
            note: "cuidados que viraram ação",
            icon: CheckCheck,
          },
          {
            label: "Conversão das sugestões",
            value: `${number(data.recommendationConversion, 1)}%`,
            note: "recomendações atendidas",
            icon: Sparkles,
          },
        ].map((item) => (
          <article key={item.label}>
            <item.icon size={21} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </section>
      <section className="admin-detail-grid">
        <article className="admin-event-chart">
          <div className="section-top">
            <h2>Como o produto é usado</h2>
            <span className="muted">Eventos por categoria</span>
          </div>
          {data.eventsByName.map((event) => (
            <div className="horizontal-bar" key={event.name}>
              <div>
                <span>{actionNames[event.name] || event.name}</span>
                <strong>{number(event.count)}</strong>
              </div>
              <span>
                <i style={{ width: `${(event.count / max) * 100}%` }} />
              </span>
            </div>
          ))}
        </article>
        <article className="feature-card">
          <h2>Uso das funcionalidades</h2>
          <table>
            <thead>
              <tr>
                <th>Funcionalidade</th>
                <th>Pessoas</th>
                <th>Eventos</th>
              </tr>
            </thead>
            <tbody>
              {data.featureUsage.map((feature) => (
                <tr key={feature.feature}>
                  <td>
                    {(
                      {
                        "/": "Visão geral",
                        "/historico": "Meu uso",
                        "/servicos": "Serviços",
                        "/veiculo": "Meu veículo",
                        "/admin": "Operação",
                      } as Record<string, string>
                    )[feature.feature] || feature.feature}
                  </td>
                  <td>{feature.users}</td>
                  <td>{feature.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
      <article className="daily-card">
        <div className="section-top">
          <h2>Atividade recente</h2>
          <span className="muted">Persistida no banco de dados</span>
        </div>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Atividade recente"
        >
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Cliente</th>
                <th>Página</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <span className="table-event-icon">
                      <ArrowDownLeft size={13} />
                    </span>
                    {actionNames[event.name] || event.name}
                  </td>
                  <td>{event.customerName}</td>
                  <td>{event.page}</td>
                  <td>
                    {date(event.occurredAt, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.recentEvents.length && (
            <p className="empty-state">
              As próximas interações aparecerão aqui.
            </p>
          )}
        </div>
      </article>
    </>
  );
}
