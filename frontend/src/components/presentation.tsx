"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BatteryFull,
  CarFront,
  ChartNoAxesCombined,
  ShieldCheck,
  Signal,
  Smartphone,
  Wifi,
} from "lucide-react";
import { LocalizaBrand } from "./localiza-brand";
import { requestApi } from "@/lib/api";
import { money, number } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

const screens = [
  {
    path: "/",
    label: "Início",
    icon: CarFront,
    description:
      "O carro, os atalhos do dia a dia e a recomendação mais relevante.",
  },
  {
    path: "/historico",
    label: "Gestão de km",
    icon: ChartNoAxesCombined,
    description:
      "Uso real e projeção explicada, antes de o excedente acontecer.",
  },
  {
    path: "/servicos",
    label: "Meus serviços",
    icon: ShieldCheck,
    description: "O valor dos cuidados incluídos, com composição transparente.",
  },
  {
    path: "/veiculo",
    label: "Meu carro",
    icon: CarFront,
    description:
      "Documentos, manutenção e o histórico de cada cuidado registrado.",
  },
];

export function Presentation() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [screen, setScreen] = useState("/");
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const syncScreen = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== "drivepulse:screen" ||
        !screens.some((item) => item.path === event.data.path)
      )
        return;
      setScreen(event.data.path);
    };
    window.addEventListener("message", syncScreen);
    return () => window.removeEventListener("message", syncScreen);
  }, []);
  function showScreen(path: string) {
    setScreen(path);
    if (frame.current) frame.current.src = path;
  }
  useEffect(() => {
    const controller = new AbortController();
    void requestApi<Dashboard>("/dashboard", { signal: controller.signal })
      .then(setData)
      .catch(() => {
        if (!controller.signal.aborted)
          setError("A API precisa estar disponível para apresentar os dados.");
      });
    return () => controller.abort();
  }, []);
  const selected = screens.find((s) => s.path === screen)!;
  return (
    <main className="presentation-page">
      <div className="presentation-top">
        <Link href="/">
          <ArrowLeft size={17} />
          Voltar ao app
        </Link>
        <span>DrivePulse · protótipo independente</span>
      </div>
      <section className="presentation-layout">
        <div className="presentation-story">
          <LocalizaBrand />
          <span className="concept-label">
            <Smartphone size={15} />
            UMA EVOLUÇÃO CONCEITUAL DO APP
          </span>
          <h1>
            Seu carro.
            <br />
            Seu próximo <em>passo.</em>
          </h1>
          <p>
            Mais do que mostrar informações: transformar os dados da assinatura
            em um cuidado que chega antes do imprevisto.
          </p>
          <div className="presentation-example">
            <span>UM EXEMPLO DO CENÁRIO DEMONSTRATIVO</span>
            <div>
              <strong>
                {data ? number(data.mileage.allowanceKm) : "—"}
                <small> km contratados</small>
              </strong>
              <ArrowUpRight size={25} />
              <strong>
                {data ? number(data.mileage.projectedKm) : "—"}
                <small> km projetados</small>
              </strong>
            </div>
            <p>
              {error ||
                (data
                  ? `O cliente pode se antecipar a ${money(data.mileage.estimatedExcessCost)} de excedente estimado.`
                  : "Carregando os dados reais da demonstração...")}
            </p>
          </div>
          <div
            className="presentation-tabs"
            aria-label="Escolher tela para apresentar"
          >
            {screens.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                aria-pressed={screen === path}
                className={screen === path ? "selected" : ""}
                onClick={() => showScreen(path)}
              >
                <Icon size={18} />
                {label}
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
          <p className="presentation-caption">{selected.description}</p>
          <div className="presentation-disclosure">
            <span />
            Conceito não oficial, sem vínculo com a Localiza.
            <br />
            Dados fictícios. As interações do protótipo funcionam.
          </div>
        </div>
        <div className="presentation-device">
          <div className="device-frame">
            <div className="device-screen">
              <div className="device-status" aria-hidden="true">
                <strong>9:41</strong>
                <span className="device-island" />
                <span>
                  <Signal size={14} />
                  <Wifi size={14} />
                  <BatteryFull size={19} />
                </span>
              </div>
              <iframe
                ref={frame}
                src="/"
                title={`Aplicativo demonstrativo — ${selected.label}`}
                className="live-app-frame"
              />
            </div>
          </div>
          <span className="device-hint">
            App interativo · navegue e registre um cuidado
          </span>
        </div>
      </section>
    </main>
  );
}
