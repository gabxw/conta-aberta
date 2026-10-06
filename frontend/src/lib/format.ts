export const number = (value: number, digits = 0) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(
    value,
  );
export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
export const date = (
  value: string,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" },
) =>
  new Intl.DateTimeFormat("pt-BR", { ...options, timeZone: "UTC" }).format(
    new Date(value.length === 10 ? `${value}T12:00:00Z` : value),
  );
