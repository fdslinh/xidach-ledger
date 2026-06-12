import { amountTone, formatSignedVnd, formatVnd } from "@/lib/format";

export function Money({ amount, signed = false }: { amount: number; signed?: boolean }) {
  return (
    <span className={`font-semibold tabular-nums ${amountTone(amount)}`}>
      {signed ? formatSignedVnd(amount) : formatVnd(amount)}
    </span>
  );
}
