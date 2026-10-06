/** Marca do conceito Conta Aberta, desenhada em SVG. Não usa a marca oficial da Localiza. */
export function AppBrand({ light = false }: { light?: boolean }) {
  return (
    <span className={`app-brand ${light ? "app-brand-light" : ""}`}>
      <svg width="31" height="38" viewBox="0 0 31 38" aria-hidden="true">
        <path d="M4 0h16l11 11v23a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4Z" fill="currentColor" />
        <path d="M20 0v7a4 4 0 0 0 4 4h7L20 0Z" fill="#79de20" />
        <path d="M7 19h17M7 25h17M7 31h10" stroke="#79de20" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span>
        <strong>Conta Aberta</strong>
        <small>conceito para o app de assinatura</small>
      </span>
    </span>
  );
}
