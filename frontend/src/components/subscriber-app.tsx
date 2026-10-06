"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CarFront,
  CircleHelp,
  FileText,
  House,
  MapPin,
  Menu,
  Route,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { AppBrand } from "./app-brand";
import { requestApi, track } from "@/lib/api";
import { date, money, number } from "@/lib/format";
import type { Account } from "@/lib/account-types";
import type { TimelineEvent, Usage } from "@/lib/types";
import { AccountStatement, Retrospective } from "./account-views";
import { OwnershipView } from "./ownership-view";
import { ActionDialog, InfoDialog } from "./dialogs";
import {
  VehicleHero,
  UsageView,
  ServicesView,
  VehicleView,
  type SelectedAction,
} from "./views";

export type SubscriberScreen =
  | "home"
  | "account"
  | "comparison"
  | "recap"
  | "usage"
  | "services"
  | "vehicle";
const routes = {
  home: "/",
  account: "/conta-aberta",
  comparison: "/vale-a-pena",
  recap: "/retrospectiva",
  usage: "/historico",
  services: "/servicos",
  vehicle: "/veiculo",
};
const titles = {
  home: "Início",
  account: "Conta Aberta",
  comparison: "Vale a pena?",
  recap: "Minha retrospectiva",
  usage: "Gestão de km",
  services: "Serviços",
  vehicle: "Meu carro",
};
const tabs = [
  { path: "/", label: "Início", icon: House },
  { path: "/conta-aberta", label: "Conta Aberta", icon: FileText },
  { path: "/servicos", label: "Serviços", icon: Wrench },
  { path: "/veiculo", label: "Meu carro", icon: CarFront },
];

export function SubscriberApp({ screen }: { screen: SubscriberScreen }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [months, setMonths] = useState("6"),
    [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [action, setAction] = useState<SelectedAction | null>(null),
    [notice, setNotice] = useState("");
  const [help, setHelp] = useState(false),
    [menu, setMenu] = useState(false),
    [notifications, setNotifications] = useState(false);
  const path = routes[screen];
  const seenRecommendation = useRef("");
  useEffect(() => {
    const next = account?.dashboard.nextBestAction;
    if (screen === "home" && next && seenRecommendation.current !== next.id) {
      seenRecommendation.current = next.id;
      track("recommendation_view", path, next.id);
    }
  }, [account, path, screen]);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const [a, u, t] = await Promise.all([
          requestApi<Account>("/account", { signal }),
          screen === "usage"
            ? requestApi<Usage>(`/usage?months=${months}`, { signal })
            : Promise.resolve(null),
          screen === "vehicle"
            ? requestApi<{ events: TimelineEvent[] }>(
                `/timeline?type=${filter}`,
                { signal },
              )
            : Promise.resolve(null),
        ]);
        if (signal?.aborted) return;
        setAccount(a);
        setUsage(u);
        if (t) setEvents(t.events);
        setError("");
      } catch (e) {
        if (!signal?.aborted)
          setError(
            e instanceof Error
              ? e.message
              : "Não foi possível carregar sua assinatura.",
          );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [screen, months, filter],
  );
  useEffect(() => {
    const c = new AbortController();
    queueMicrotask(() => {
      if (!c.signal.aborted) void load(c.signal);
    });
    return () => c.abort();
  }, [load]);
  useEffect(() => {
    track("page_view", path);
    if (screen === "account") track("account_view", path);
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "drivepulse:screen", path },
        window.location.origin,
      );
  }, [path, screen]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  const openAction = (a: SelectedAction) => {
    track("action_click", path, a.id);
    setAction(a);
  };
  const data = account?.dashboard;
  return (
    <div className="subscriber-app app-theme">
      <a className="skip-link" href="#subscriber-content">
        Ir para o conteúdo
      </a>
      <header className="subscriber-header">
        <div>
          <button
            className="header-icon"
            aria-label="Minha conta e ajuda"
            onClick={() => setHelp(true)}
          >
            <UserRound size={22} />
          </button>
          <Link
            href="/"
            aria-label="Conta Aberta, início"
          >
            <AppBrand light />
          </Link>
          <div className="header-actions">
            <button
              className="header-icon"
              aria-label="Ver avisos"
              aria-expanded={notifications}
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={21} />
              <span className="notification-dot" />
            </button>
            <button
              className="header-icon"
              aria-label="Abrir menu"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <nav className="subscriber-menu" aria-label="Mais opções">
          <Link href="/vale-a-pena">Comparar com comprar</Link>
          <Link href="/retrospectiva">Minha retrospectiva</Link>
          <Link href="/historico">Gestão de km</Link>
          <Link href="/apresentar">Apresentar o case</Link>
          <Link href="/admin">Administração da demo</Link>
          <button
            onClick={() => {
              setHelp(true);
              setMenu(false);
            }}
          >
            Ajuda sobre o protótipo
          </button>
        </nav>
      )}
      {notifications && (
        <section className="subscriber-notifications" aria-label="Seus avisos">
          <strong>
            Sua Conta Aberta de {account?.monthLabel || "outubro"}
          </strong>
          <p>
            O resumo da assinatura está disponível. Veja os cuidados recebidos e
            a comparação de custos.
          </p>
          <Link href="/conta-aberta">
            Abrir meu extrato <ArrowRight size={16} />
          </Link>
          {data?.alerts
            .filter((a) => a.status === "pending")
            .map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setNotifications(false);
                  openAction({
                    id: a.id,
                    type: a.actionType,
                    title: a.title,
                    description: a.description,
                  });
                }}
              >
                {a.title}
                <ArrowRight size={16} />
              </button>
            ))}
        </section>
      )}
      <main
        id="subscriber-content"
        className={`subscriber-content screen-${screen}`}
      >
        {screen === "home" ? (
          <div className="subscriber-welcome">
            <span>Olá, {data?.customer.firstName || "Marina"}!</span>
            <h1>Vamos seguir juntos?</h1>
          </div>
        ) : (
          <div className="subscriber-page-title">
            <Link href="/" aria-label="Voltar ao início">
              <ArrowLeft size={21} />
            </Link>
            <h1>{titles[screen]}</h1>
          </div>
        )}
        <div className="subscriber-demo-note">
          Conceito para o app Localiza Assinatura · dados de demonstração{" "}
          {data && (
            <span>
              ·{" "}
              {date(data.referenceDate, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        {error ? (
          <div className="error-state" role="alert">
            <h2>Não conseguimos abrir sua assinatura</h2>
            <p>{error}</p>
            <button
              className="button primary"
              onClick={() => {
                setLoading(true);
                void load();
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : loading || !account ? (
          <div className="loading-state" aria-label="Carregando assinatura">
            <div />
            <div />
            <div />
          </div>
        ) : (
          <>
            {screen === "home" && (
              <>
                <section className="today-card" aria-label="Hoje na sua assinatura">
                  <span className="today-label">
                    Este mês sua assinatura já cobriu
                  </span>
                  <strong className="today-value">
                    {money(account.today.coveredThisMonth)}
                  </strong>
                  <span className="today-chip">
                    + {money(account.today.coveredToday)} hoje
                  </span>
                  <Sparkline values={account.today.cumulativeByDay} />
                  <p className="today-note">
                    É o que custaria ter este carro: desvalorização, IPVA,
                    seguro, manutenção e o rendimento do dinheiro, pela FIPE.{" "}
                    <Link href="/vale-a-pena">Ver a conta</Link>
                  </p>
                </section>
                <section className="benefit-card">
                  <span className="benefit-pin">
                    <MapPin size={22} />
                  </span>
                  <div>
                    <p>
                      {account.benefit.title} · {account.benefit.distance}
                    </p>
                    <h2>
                      {account.benefit.partner}: {account.benefit.discount}
                    </h2>
                    <p>{account.benefit.reason}</p>
                    <button
                      className="account-button secondary"
                      onClick={() =>
                        setNotice("Benefício ativado na demonstração.")
                      }
                    >
                      Ativar benefício
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </section>
                <Link className="account-entry" href="/conta-aberta">
                  <div className="account-entry-top">
                    <span>
                      <FileText size={17} /> CONTA ABERTA
                    </span>
                    <span className="new-pill">NOVO</span>
                  </div>
                  <h2>
                    O que sua assinatura
                    <br />
                    fez por você?
                  </h2>
                  <p>
                    Seu extrato de {account.monthLabel}.<br />
                    Cuidados recebidos, custos explicados.
                  </p>
                  <div className="account-entry-bottom">
                    <span>Ver minha Conta Aberta</span>
                    <ArrowRight size={21} />
                  </div>
                </Link>
                <VehicleHero data={account.dashboard} openAction={openAction} />
                {account.dashboard.nextBestAction && (
                  <section className="subscriber-care">
                    <span className="account-eyebrow">SEU PRÓXIMO CUIDADO</span>
                    <h2>{account.dashboard.nextBestAction.title}</h2>
                    <p>{account.dashboard.nextBestAction.description}</p>
                    <button
                      className="account-button secondary"
                      onClick={() => {
                        const next = account.dashboard.nextBestAction!;
                        openAction({
                          id: next.id,
                          type: next.type as SelectedAction["type"],
                          title: next.title,
                          description: next.description,
                        });
                      }}
                    >
                      {account.dashboard.nextBestAction.ctaLabel}
                      <ArrowRight size={17} />
                    </button>
                  </section>
                )}
                <Link className="subscriber-link-card" href="/vale-a-pena">
                  <span className="link-card-icon">
                    <CircleHelp size={24} />
                  </span>
                  <div>
                    <h2>Assinar ou comprar?</h2>
                    <p>Compare com o custo completo de ter este carro.</p>
                  </div>
                  <ArrowRight size={19} />
                </Link>
                <section className="subscriber-rhythm">
                  <div>
                    <Route size={20} />
                    <h2>Seu ritmo neste mês</h2>
                  </div>
                  <p>
                    A projeção é de{" "}
                    <strong>
                      {number(account.dashboard.mileage.projectedKm)} km
                    </strong>{" "}
                    para sua franquia de{" "}
                    {number(account.dashboard.mileage.allowanceKm)} km.
                  </p>
                  <Link href="/historico">
                    Acompanhar minha quilometragem <ArrowRight size={16} />
                  </Link>
                </section>
                <Link className="subscriber-link-card" href="/retrospectiva">
                  <span className="link-card-icon">
                    <ShieldCheck size={24} />
                  </span>
                  <div>
                    <h2>Sua assinatura em perspectiva</h2>
                    <p>Veja e compartilhe os cuidados desta jornada.</p>
                  </div>
                  <ArrowRight size={19} />
                </Link>
              </>
            )}
            {screen === "account" && <AccountStatement account={account} />}
            {screen === "comparison" && <OwnershipView account={account} />}
            {screen === "recap" && (
              <Retrospective account={account} notify={setNotice} />
            )}
            {screen === "usage" && usage && (
              <UsageView
                data={usage}
                dashboard={account.dashboard}
                months={months}
                setMonths={(v) => {
                  if (v === months) return;
                  setLoading(true);
                  setMonths(v);
                  track("usage_filter", path, v);
                }}
                openAction={openAction}
              />
            )}
            {screen === "services" && (
              <ServicesView data={account.dashboard.serviceValue} />
            )}
            {screen === "vehicle" && (
              <VehicleView
                data={account.dashboard}
                events={events}
                filter={filter}
                setFilter={(v) => {
                  if (v === filter) return;
                  setLoading(true);
                  setFilter(v);
                  track("timeline_filter", path, v);
                }}
                openAction={openAction}
              />
            )}
          </>
        )}
        <footer className="subscriber-footer">
          <span>DrivePulse · Conta Aberta</span>
          <Link href="/apresentar">
            Apresentar o case <ArrowRight size={13} />
          </Link>
        </footer>
      </main>
      <nav className="subscriber-tabs" aria-label="Navegação do aplicativo">
        {tabs.map(({ path: href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={
              path === href ||
              (href === "/conta-aberta" &&
                ["comparison", "recap"].includes(screen))
                ? "active"
                : ""
            }
            aria-current={path === href ? "page" : undefined}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        ))}
        <button onClick={() => setHelp(true)}>
          <CircleHelp size={22} />
          <span>Ajuda</span>
        </button>
      </nav>
      {notice && (
        <div role="status" className="toast">
          <ShieldCheck size={18} />
          {notice}
        </div>
      )}
      {help && <InfoDialog onClose={() => setHelp(false)} />}
      {action && data && (
        <ActionDialog
          action={action}
          data={data}
          onClose={() => setAction(null)}
          onComplete={async (message) => {
            setAction(null);
            setNotice(message);
            await load();
          }}
        />
      )}
    </div>
  );
}

// Linha do valor acumulado no mês, dia a dia.
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 300},${60 - (v / max) * 54}`)
    .join(" ");
  return (
    <svg
      className="today-spark"
      viewBox="0 0 300 62"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={`0,62 ${points} 300,62`} fill="#79de20" opacity=".25" />
      <polyline
        points={points}
        fill="none"
        stroke="#028444"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
