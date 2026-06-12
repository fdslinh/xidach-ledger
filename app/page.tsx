import Link from "next/link";
import { Money } from "@/app/components/Money";
import { PageHeader } from "@/app/components/PageHeader";
import { formatDate, formatSignedVnd } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSessionSummary } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sessions, entries, playersCount] = await Promise.all([
    prisma.gameSession.findMany({
      orderBy: { playedAt: "desc" },
      take: 4,
      include: { players: { include: { player: true } } },
    }),
    prisma.gameSessionPlayer.findMany(),
    prisma.player.count({ where: { isActive: true } }),
  ]);

  const netProfit = entries.reduce((total, entry) => total + Math.max(entry.profitLoss, 0), 0);
  const biggestWin = entries.reduce(
    (max, entry) => Math.max(max, entry.profitLoss),
    0,
  );
  const biggestLoss = entries.reduce(
    (min, entry) => Math.min(min, entry.profitLoss),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Xì Dách Ledger"
        subtitle="Thắng vui, thua nhớ, chơi có hệ thống."
      />

      <section className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-950 p-5 text-white shadow-xl shadow-emerald-950/20">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-emerald-50">Tổng giải ngân</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Toàn thời gian</span>
        </div>
        <div className="mt-4 text-4xl font-bold tracking-normal text-emerald-100">
          {formatSignedVnd(netProfit)}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-emerald-100">Số buổi</div>
            <div className="mt-1 text-lg font-bold">{sessions.length}</div>
          </div>
          <div>
            <div className="text-emerald-100">Lãi nhiều</div>
            <div className="mt-1 text-lg font-bold">
              {formatSignedVnd(biggestWin)}
            </div>
          </div>
          <div>
            <div className="text-emerald-100">Lỗ nhiều</div>
            <div className="mt-1 text-lg font-bold text-orange-200">
              {formatSignedVnd(biggestLoss)}
            </div>
          </div>
        </div>
      </section>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">Buổi chơi gần đây</h2>
        <Link href="/sessions" className="text-sm font-semibold text-emerald-700">
          Xem tất cả
        </Link>
      </div>

      <div className="mb-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Chưa có buổi chơi nào.
          </div>
        ) : (
          sessions.map((session) => {
            const summary = getSessionSummary(session.players);

            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-slate-50"
              >
                <div>
                  <div className="font-semibold text-slate-950">
                    {formatDate(session.playedAt)}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {session.players.length} người chơi
                  </div>
                </div>
                <Money amount={summary.totalPositiveProfit} signed />
              </Link>
            );
          })
        )}
      </div>

      <Link
        href={playersCount >= 2 ? "/sessions/new" : "/players"}
        className="flex h-14 items-center justify-center rounded-2xl bg-emerald-700 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-800"
      >
        {playersCount >= 2 ? "+ Tạo buổi chơi mới" : "Thêm người chơi"}
      </Link>
    </div>
  );
}
