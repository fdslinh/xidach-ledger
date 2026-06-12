export function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSignedVnd(amount: number) {
  if (amount === 0) {
    return "0 d";
  }

  const value = formatVnd(Math.abs(amount));
  return `${amount > 0 ? "+" : "-"}${value}`;
}

export function amountTone(amount: number) {
  if (amount > 0) {
    return "text-emerald-700";
  }

  if (amount < 0) {
    return "text-red-600";
  }

  return "text-slate-600";
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
