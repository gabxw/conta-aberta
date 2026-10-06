"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CarFront,
  ChartNoAxesCombined,
  CheckCheck,
  ChevronRight,
  Gauge,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  X,
  CalendarDays,
  Smartphone,
  CircleHelp,
  Wrench,
} from "lucide-react";
import { LocalizaBrand } from "./localiza-brand";
import { requestApi, track } from "@/lib/api";
import { date } from "@/lib/format";
import type {
  AdminOverview,
  Dashboard,
  ServiceValue,
  TimelineEvent,
  Usage,
} from "@/lib/types";
import {
  DashboardView,
  UsageView,
  ServicesView,
  VehicleView,
  AdminView,
  type SelectedAction,
} from "./views";
import { ActionDialog, InfoDialog } from "./dialogs";
type Page = "dashboard" | "usage" | "services" | "vehicle" | "admin";
const navigation = [
  { page: "dashboard", href: "/", label: "Início", icon: LayoutDashboard },
  {
    page: "usage",
    href: "/historico",
    label: "Gestão de km",
    icon: ChartNoAxesCombined,
  },
  {
    page: "services",
    href: "/servicos",
    label: "Serviços",
    icon: Wrench,
  },
  { page: "vehicle", href: "/veiculo", label: "Meu carro", icon: CarFront },
] as const;
const headings = {
  dashboard: [
    "Sua assinatura, na palma da mão.",
    "Seu carro, seus cuidados e o próximo passo. Tudo por aqui.",
  ],
  usage: ["Gestão de km", "Acompanhe seu uso e se antecipe ao fim do mês."],
  services: [
    "Meus serviços",
    "Veja os cuidados incluídos que já fizeram parte da sua jornada.",
  ],
  vehicle: [
    "Meu carro",
    "Documentos, manutenção e o histórico da sua assinatura.",
  ],
  admin: [
    "O pulso da operação.",
    "Uso do produto e ações registradas em tempo real.",
  ],
};
export function DrivePulse({ page }: { page: Page }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null),
    [usage, setUsage] = useState<Usage | null>(null),
    [services, setServices] = useState<ServiceValue | null>(null),
    [events, setEvents] = useState<TimelineEvent[]>([]),
    [admin, setAdmin] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [months, setMonths] = useState("6"),
    [filter, setFilter] = useState("all"),
    [action, setAction] = useState<SelectedAction | null>(null),
    [notice, setNotice] = useState(""),
    [help, setHelp] = useState(false),
    [notifications, setNotifications] = useState(false);
  const pagePath = (
    {
      dashboard: "/",
      usage: "/historico",
      services: "/servicos",
      vehicle: "/veiculo",
      admin: "/admin",
    } as const
  )[page];
  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const main = await requestApi<Dashboard>("/dashboard", { signal });
        const detail =
          page === "usage"
            ? await requestApi<Usage>(`/usage?months=${months}`, { signal })
            : page === "services"
              ? await requestApi<ServiceValue>("/services", { signal })
              : page === "vehicle"
                ? await requestApi<{ events: TimelineEvent[] }>(
                    `/timeline?type=${filter}`,
                    { signal },
                  )
                : page === "admin"
                  ? await requestApi<AdminOverview>("/admin/overview", {
                      signal,
                    })
                  : null;
        if (signal?.aborted) return;
        setError("");
        setDashboard(main);
        if (page === "usage") setUsage(detail as Usage);
        if (page === "services") setServices(detail as ServiceValue);
        if (page === "vehicle")
          setEvents((detail as { events: TimelineEvent[] }).events);
        if (page === "admin") setAdmin(detail as AdminOverview);
      } catch (err) {
        if (!signal?.aborted)
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar seus dados.",
          );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, months, filter],
  );
  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void load(controller.signal);
    });
    return () => controller.abort();
  }, [load]);
  useEffect(() => {
    track("page_view", pagePath);
    if (window.parent !== window)
      window.parent.postMessage(
        { type: "drivepulse:screen", path: pagePath },
        window.location.origin,
      );
  }, [pagePath]);
  const seen = useRef("");
  useEffect(() => {
    const next = dashboard?.nextBestAction;
    if (page === "dashboard" && next && seen.current !== next.id) {
      seen.current = next.id;
      track("recommendation_view", pagePath, next.id);
    }
  }, [dashboard, page, pagePath]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  function openAction(selected: SelectedAction) {
    track("action_click", pagePath, selected.type);
    setAction(selected);
  }
  return (
    <div className="app-shell localiza-theme">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Link
          href="/"
          className="brand"
          aria-label="Localiza Assinatura — conceito DrivePulse, início"
        >
          <LocalizaBrand />
        </Link>
        <div className="workspace-label">DRIVEPULSE · CONCEITO DE EVOLUÇÃO</div>
        <nav aria-label="Navegação principal">
          {navigation.map(({ page: navPage, href, label, icon: Icon }) => (
            <Link
              className={`nav-link ${page === navPage ? "active" : ""}`}
              aria-current={page === navPage ? "page" : undefined}
              href={href}
              key={href}
            >
              <Icon size={19} />
              <span>{label}</span>
              {page === navPage && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="care-note">
            <span className="care-icon">
              <CircleHelp size={20} />
            </span>
            <strong>Precisa de ajuda?</strong>
            <p>Seus cuidados e documentos estão a um toque de distância.</p>
            <button onClick={() => setHelp(true)}>
              Explorar o app <ArrowUpRight size={15} />
            </button>
          </div>
          <Link href="/apresentar" className="nav-link presentation-link">
            <Smartphone size={18} />
            <span>Apresentar o app</span>
          </Link>
          <Link
            href="/admin"
            className={`nav-link admin-link ${page === "admin" ? "active" : ""}`}
          >
            <Gauge size={18} />
            <span>Visão da operação</span>
            <ArrowUpRight size={14} />
          </Link>
          <div className="account">
            <div className="avatar">MC</div>
            <div>
              <strong>{dashboard?.customer.name || "Sua conta"}</strong>
              <span>Assinatura demonstrativa</span>
            </div>
            <ShieldCheck size={17} />
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <Link
            href="/"
            className="mobile-brand"
            aria-label="Localiza Assinatura — conceito DrivePulse, início"
          >
            <LocalizaBrand />
          </Link>
          <div className="breadcrumb">
            Minha assinatura
            <ChevronRight size={13} />
            <span>
              {page === "admin"
                ? "Operação"
                : navigation.find((n) => n.page === page)?.label}
            </span>
          </div>
          <div className="topbar-right">
            <Link href="/apresentar" className="present-top-link">
              <Smartphone size={16} />
              Apresentar
            </Link>
            <span className="subscription-live">
              <span />
              Assinatura ativa
            </span>
            <button
              className="icon-button notification-button"
              onClick={() => setNotifications((v) => !v)}
              aria-label="Ver avisos"
              aria-expanded={notifications}
            >
              <Bell size={20} />
              {!!dashboard?.alerts.filter((a) => a.status === "pending")
                .length && <i />}
            </button>
            <div className="avatar small">MC</div>
          </div>
        </header>
        {notifications && (
          <div className="notifications" role="region" aria-label="Avisos">
            <div className="panel-heading">
              <strong>Seus avisos</strong>
              <button
                className="icon-button"
                aria-label="Fechar avisos"
                onClick={() => setNotifications(false)}
              >
                <X size={17} />
              </button>
            </div>
            {dashboard?.alerts.filter((a) => a.status === "pending").length ? (
              dashboard.alerts
                .filter((a) => a.status === "pending")
                .map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setNotifications(false);
                      openAction({
                        type: a.actionType,
                        id: a.id,
                        title: a.title,
                        description: a.description,
                      });
                    }}
                  >
                    <span className={`alert-bullet ${a.severity}`} />
                    <span>
                      <strong>{a.title}</strong>
                      <small>{a.description}</small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))
            ) : (
              <p>Seus cuidados estão em dia.</p>
            )}
          </div>
        )}
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "dashboard"
                  ? `Olá, ${dashboard?.customer.firstName || "..."}!`
                  : "MINHA ASSINATURA"}
              </div>
              <h1>{headings[page][0]}</h1>
              <p>{headings[page][1]}</p>
            </div>
            <div className="reference-date">
              <CalendarDays size={16} />
              <span>
                {dashboard
                  ? date(dashboard.referenceDate, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Carregando"}
                <small>Conceito não oficial · dados fictícios</small>
              </span>
            </div>
          </div>
          {error ? (
            <div className="error-state" role="alert">
              <span className="error-icon">
                <RefreshCw size={32} />
              </span>
              <h2>Uma pausa rápida no caminho.</h2>
              <p>{error}</p>
              <button
                className="button primary"
                onClick={() => {
                  setLoading(true);
                  setError("");
                  void load();
                }}
              >
                <RefreshCw size={16} />
                Tentar novamente
              </button>
            </div>
          ) : loading || !dashboard ? (
            <div
              className="loading-state"
              role="status"
              aria-label="Carregando seus dados"
            >
              <div className="skeleton skeleton-hero" />
              <div className="skeleton skeleton-next" />
              <div className="skeleton skeleton-chart" />
              <div className="skeleton skeleton-value" />
              <span className="sr-only">Preparando seu espaço...</span>
            </div>
          ) : (
            <>
              {page === "dashboard" && (
                <DashboardView data={dashboard} openAction={openAction} />
              )}{" "}
              {page === "usage" && usage && (
                <UsageView
                  data={usage}
                  dashboard={dashboard}
                  months={months}
                  setMonths={(v) => {
                    if (v === months) return;
                    track("usage_filter", pagePath, v);
                    setLoading(true);
                    setMonths(v);
                  }}
                  openAction={openAction}
                />
              )}{" "}
              {page === "services" && services && (
                <ServicesView data={services} />
              )}{" "}
              {page === "vehicle" && (
                <VehicleView
                  data={dashboard}
                  events={events}
                  filter={filter}
                  setFilter={(v) => {
                    if (v === filter) return;
                    track("timeline_filter", pagePath, v);
                    setLoading(true);
                    setFilter(v);
                  }}
                  openAction={openAction}
                />
              )}{" "}
              {page === "admin" && admin && (
                <AdminView data={admin} refresh={() => void load()} />
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <span className="footer-pulse" />
              DrivePulse · evolução conceitual
            </span>
            <Link href="/admin">
              Operação da demonstração <ArrowUpRight size={13} />
            </Link>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Navegação móvel">
        {navigation.map(({ href, page: navPage, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={page === navPage ? "page" : undefined}
            className={page === navPage ? "active" : ""}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
        <button onClick={() => setHelp(true)} aria-label="Ajuda">
          <CircleHelp size={20} />
          <span>Ajuda</span>
        </button>
      </nav>
      {action && dashboard && (
        <ActionDialog
          action={action}
          data={dashboard}
          onClose={() => setAction(null)}
          onComplete={async (message) => {
            setAction(null);
            setNotice(message);
            setLoading(true);
            await load();
          }}
        />
      )}
      {help && <InfoDialog onClose={() => setHelp(false)} />}
      {notice && (
        <div className="toast" role="status">
          <CheckCheck size={19} />
          <span>{notice}</span>
          <button aria-label="Fechar confirmação" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
