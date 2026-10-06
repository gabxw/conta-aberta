"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  LoaderCircle,
  Route,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { requestApi } from "@/lib/api";
import { date, number } from "@/lib/format";
import type { Dashboard } from "@/lib/types";
import type { SelectedAction } from "./views";
export function ActionDialog({
  action,
  data,
  onClose,
  onComplete,
}: {
  action: SelectedAction;
  data: Dashboard;
  onClose: () => void;
  onComplete: (message: string) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [scheduledDate, setScheduledDate] = useState(
      data.referenceDate.slice(0, 10),
    );
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  const schedule = action.type === "schedule-maintenance",
    mileage = action.type === "mileage-plan",
    dismiss = action.type === "dismiss-recommendation";
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await requestApi<{ message: string; eventId: string }>(
        "/actions",
        {
          method: "POST",
          body: JSON.stringify({
            type: action.type,
            targetId: action.id,
            ...(schedule ? { scheduledDate } : {}),
          }),
        },
      );
      await onComplete(result.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar a ação.",
      );
      setPending(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="action-dialog"
      onCancel={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
      aria-labelledby="action-title"
    >
      <div className="dialog-content">
        <button
          className="dialog-close icon-button"
          aria-label="Fechar"
          disabled={pending}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <span className="dialog-icon">
          {schedule ? (
            <Wrench size={27} />
          ) : mileage ? (
            <Route size={27} />
          ) : dismiss ? (
            <Clock3 size={27} />
          ) : (
            <FileCheck2 size={27} />
          )}
        </span>
        <span className="eyebrow">SEU PRÓXIMO MOVIMENTO</span>
        <h2 id="action-title">{action.title}</h2>
        <p>
          {action.description ||
            (dismiss
              ? "Esta sugestão será dispensada neste cenário. A próxima recomendação disponível aparecerá na sua visão geral."
              : "Registre este cuidado na sua assinatura e mantenha seu histórico atualizado.")}
        </p>
        <form onSubmit={submit}>
          {mileage && (
            <div className="plan-preview">
              <span>Para ficar dentro da franquia</span>
              <strong>
                {number(data.mileage.safeDailyKm, 1)}
                <small> km por dia</small>
              </strong>
              <p>
                Você tem{" "}
                {number(
                  Math.max(
                    0,
                    data.mileage.allowanceKm - data.mileage.currentKm,
                  ),
                )}{" "}
                km disponíveis para os próximos {data.mileage.remainingDays}{" "}
                dias. Agrupar trajetos pode ajudar.
              </p>
            </div>
          )}
          {schedule && (
            <label className="date-input">
              Quando você prefere realizar a manutenção?
              <input
                required
                type="date"
                min={data.referenceDate.slice(0, 10)}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <small>
                Agendamento demonstrativo. Escolha uma data a partir de{" "}
                {date(data.referenceDate, { day: "numeric", month: "long" })}.
              </small>
            </label>
          )}
          {!schedule && !mileage && !dismiss && (
            <div className="document-preview">
              <FileCheck2 size={22} />
              <div>
                <strong>Conferência de documento</strong>
                <span>
                  Ao confirmar, você registra que revisou este documento. O
                  registro ficará disponível no histórico.
                </span>
              </div>
            </div>
          )}
          <div className="dialog-note">
            <ShieldCheck size={15} />
            Sua ação será registrada na assinatura demonstrativa.
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button primary full"
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <>
                <LoaderCircle className="spin" size={18} />
                Registrando...
              </>
            ) : (
              <>
                {schedule
                  ? "Confirmar agendamento"
                  : mileage
                    ? "Ativar meu plano"
                    : dismiss
                      ? "Dispensar sugestão"
                      : "Confirmar revisão"}
                <ArrowRight size={17} />
              </>
            )}
          </button>
          <button
            className="text-button cancel"
            type="button"
            disabled={pending}
            onClick={onClose}
          >
            Voltar para meu espaço
          </button>
        </form>
      </div>
    </dialog>
  );
}
export function InfoDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      className="action-dialog"
      ref={dialog}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="help-title"
    >
      <div className="dialog-content">
        <button
          className="dialog-close icon-button"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
        <span className="dialog-icon">
          <CircleHelp size={28} />
        </span>
        <span className="eyebrow">CONTE COM A GENTE</span>
        <h2 id="help-title">Sua assinatura, mais simples.</h2>
        <p>
          Este é o conceito Conta Aberta, criado a partir do case da Localiza
          Assinatura no Ruptura 2026. É um projeto independente, sem vínculo
          oficial. Os preços seguem a FIPE; o cliente e os registros são de
          demonstração.
        </p>
        <div className="document-preview">
          <ShieldCheck size={22} />
          <div>
            <strong>Explore com tranquilidade</strong>
            <span>
              Veja seus quilômetros, registre um cuidado e acompanhe o resultado
              no histórico e na visão da operação.
            </span>
          </div>
        </div>
        <button className="button primary full" onClick={onClose}>
          Continuar meu caminho
          <ArrowRight size={17} />
        </button>
      </div>
    </dialog>
  );
}
