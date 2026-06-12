import Link from "next/link";
import { EmptyState } from "@/app/components/EmptyState";
import { Money } from "@/app/components/Money";
import { PageHeader } from "@/app/components/PageHeader";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSessionSummary } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessions = await prisma.gameSession.findMany({
    orderBy: { playedAt: "desc" },
    include: {
      players: {
        include: { player: true },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Buổi chơi"
        subtitle="Lịch sử các ván đã ghi."
        action={{ href: "/sessions/new", label: "+ Tạo" }}
      />

      {sessions.length === 0 ? (
        <EmptyState
          title="Chưa có buổi chơi"
          body="Tạo buổi chơi đầu tiên để theo dõi lời lỗ."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const summary = getSessionSummary(session.players);

            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-950">
                      {formatDate(session.playedAt)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {session.players.length} người chơi
                    </div>
                  </div>
                  <Money amount={summary.totalPositiveProfit} signed />
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                  Ghi chú: {session.note || "Không có ghi chú"}
                </p>

                <div className="space-y-2 text-xs">
                  {summary.biggestWinner ? (
                    <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                      Thắng lớn nhất: {summary.biggestWinner.player.name} (
                      <Money amount={summary.biggestWinner.profitLoss} signed />)
                    </div>
                  ) : null}
                  {summary.biggestLoser ? (
                    <div className="rounded-lg bg-red-50 px-3 py-2 text-red-600">
                      Thua nhiều nhất: {summary.biggestLoser.player.name} (
                      <Money amount={summary.biggestLoser.profitLoss} signed />)
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
