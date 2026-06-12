import { EmptyState } from "@/app/components/EmptyState";
import { Money } from "@/app/components/Money";
import { PageHeader } from "@/app/components/PageHeader";
import { formatSignedVnd } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const players = await prisma.player.findMany({
    include: { sessions: true },
  });

  const ranking = players
    .map((player) => {
      const profits = player.sessions.map((entry) => entry.profitLoss);
      const sessionsPlayed = profits.length;
      const totalProfitLoss = profits.reduce((total, value) => total + value, 0);
      const winCount = profits.filter((value) => value > 0).length;
      const lossCount = profits.filter((value) => value < 0).length;

      return {
        id: player.id,
        name: player.name,
        isActive: player.isActive,
        sessionsPlayed,
        totalProfitLoss,
        winCount,
        lossCount,
        winRate: sessionsPlayed === 0 ? 0 : Math.round((winCount / sessionsPlayed) * 100),
        averageProfitLoss:
          sessionsPlayed === 0 ? 0 : Math.round(totalProfitLoss / sessionsPlayed),
        biggestWin: profits.length ? Math.max(...profits) : 0,
        biggestLoss: profits.length ? Math.min(...profits) : 0,
      };
    })
    .sort((a, b) => b.totalProfitLoss - a.totalProfitLoss);

  const podium = ranking.filter((row) => row.sessionsPlayed > 0).slice(0, 3);

  return (
    <div>
      <PageHeader title="Ranking" subtitle="Thống kê lời lỗ toàn thời gian." />

      {ranking.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu"
          body="Thêm người chơi và tạo buổi chơi để xem bảng xếp hạng."
        />
      ) : (
        <>
          {podium.length > 0 ? (
            <section className="mb-5 rounded-3xl bg-slate-950 px-4 py-6 text-white">
              <div className="grid grid-cols-3 items-end gap-3 text-center">
                {podium.map((player, index) => (
                  <div
                    key={player.id}
                    className={index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3"}
                  >
                    <div
                      className={`mx-auto flex rounded-full border-4 font-bold ${
                        index === 0
                          ? "h-20 w-20 items-center justify-center border-amber-300 bg-amber-100 text-2xl text-amber-700"
                          : "h-14 w-14 items-center justify-center border-slate-500 bg-slate-700 text-slate-100"
                      }`}
                    >
                      {player.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="mt-3 truncate font-bold">{player.name}</div>
                    <div className="mt-1 text-sm font-semibold text-emerald-300">
                      {formatSignedVnd(player.totalProfitLoss)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="space-y-3">
            {ranking.map((player, index) => (
              <article
                key={player.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-slate-950">
                      {player.name}
                      {!player.isActive ? (
                        <span className="ml-2 text-xs font-medium text-slate-400">
                          đã ngừng
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500">
                      {player.sessionsPlayed} buổi · thắng {player.winRate}%
                    </div>
                  </div>
                  <Money amount={player.totalProfitLoss} signed />
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">Thắng / thua</dt>
                    <dd className="mt-1 font-semibold">
                      {player.winCount} / {player.lossCount}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">Trung bình</dt>
                    <dd className="mt-1 font-semibold">
                      {formatSignedVnd(player.averageProfitLoss)}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">Lãi lớn nhất</dt>
                    <dd className="mt-1">
                      <Money amount={player.biggestWin} signed />
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">Lỗ lớn nhất</dt>
                    <dd className="mt-1">
                      <Money amount={player.biggestLoss} signed />
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
