import { notFound } from "next/navigation";
import { Money } from "@/app/components/Money";
import { PageHeader } from "@/app/components/PageHeader";
import { formatDate, formatVnd } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { calculateSettlements } from "@/lib/settlement";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await prisma.gameSession.findUnique({
    where: { id },
    include: {
      players: {
        include: { player: true },
        orderBy: { profitLoss: "desc" },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const totalStart = session.players.reduce((total, row) => total + row.startAmount, 0);
  const totalEnd = session.players.reduce((total, row) => total + row.endAmount, 0);
  const totalProfitLoss = session.players.reduce(
    (total, row) => total + row.profitLoss,
    0,
  );
  const settlementSuggestions = calculateSettlements(session.players);

  return (
    <div>
      <PageHeader title={formatDate(session.playedAt)} backHref="/sessions" />

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
        <dl className="grid grid-cols-[120px_1fr] gap-y-4 text-sm">
          <dt className="text-slate-500">Ghi chú</dt>
          <dd className="font-medium text-slate-950">{session.note || "Không có ghi chú"}</dd>
          <dt className="text-slate-500">Thời gian</dt>
          <dd className="font-medium text-slate-950">{formatDate(session.playedAt)}</dd>
          <dt className="text-slate-500">Số người chơi</dt>
          <dd className="font-medium text-slate-950">{session.players.length} người</dd>
          <dt className="text-slate-500">Tổng lãi/lỗ</dt>
          <dd>
            <Money amount={totalProfitLoss} signed />
          </dd>
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
          <div>Người chơi</div>
          <div className="text-right">Bắt đầu</div>
          <div className="text-right">Kết thúc</div>
          <div className="text-right">Lãi/Lỗ</div>
        </div>
        <div className="divide-y divide-slate-100">
          {session.players.map((row, index) => (
            <div
              key={row.id}
              className={`grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center gap-2 px-4 py-4 text-sm ${
                row.profitLoss > 0 ? "bg-emerald-50/40" : row.profitLoss < 0 ? "bg-red-50/30" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-2 font-semibold text-slate-950">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs">
                  {index === 0 ? "1" : index + 1}
                </span>
                <span className="truncate">{row.player.name}</span>
              </div>
              <div className="text-right text-xs tabular-nums text-slate-700">
                {formatVnd(row.startAmount)}
              </div>
              <div className="text-right text-xs tabular-nums text-slate-700">
                {formatVnd(row.endAmount)}
              </div>
              <div className="text-right text-xs">
                <Money amount={row.profitLoss} signed />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-2 border-t border-slate-200 px-4 py-4 text-sm font-bold">
          <div>Tổng cộng</div>
          <div className="text-right text-xs tabular-nums">{formatVnd(totalStart)}</div>
          <div className="text-right text-xs tabular-nums">{formatVnd(totalEnd)}</div>
          <div className="text-right text-xs">
            <Money amount={totalProfitLoss} signed />
          </div>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Gợi ý thanh toán</h2>
        </div>

        {!settlementSuggestions.isBalanced ? (
          <div className="bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
            Tổng lãi/lỗ chưa cân bằng ({formatVnd(settlementSuggestions.totalProfitLoss)}).
            Kiểm tra lại số tiền trước khi tính thanh toán.
          </div>
        ) : settlementSuggestions.settlements.length === 0 ? (
          <div className="px-4 py-4 text-sm text-slate-500">
            Không có khoản thanh toán cần gợi ý.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {settlementSuggestions.settlements.map((settlement, index) => (
              <div
                key={`${settlement.fromPlayer}-${settlement.toPlayer}-${index}`}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-500">Từ</div>
                  <div className="truncate font-semibold text-slate-950">
                    {settlement.fromPlayer}
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-xs text-slate-400">trả</div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tabular-nums text-slate-950">
                    {formatVnd(settlement.amount)}
                  </div>
                </div>
                <div className="min-w-0 text-right">
                  <div className="text-xs font-medium text-slate-500">Đến</div>
                  <div className="truncate font-semibold text-slate-950">
                    {settlement.toPlayer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
