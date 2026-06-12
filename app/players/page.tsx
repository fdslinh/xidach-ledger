import { createPlayer, deactivatePlayer, updatePlayerName } from "@/app/actions";
import { EmptyState } from "@/app/components/EmptyState";
import { PageHeader } from "@/app/components/PageHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    include: { sessions: true },
  });

  return (
    <div>
      <PageHeader title="Người chơi" subtitle="Quản lý danh sách bạn chơi." />

      <form action={createPlayer} className="mb-5 flex gap-2">
        <input
          name="name"
          minLength={2}
          required
          placeholder="Tên người chơi"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
        <button className="h-12 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800">
          Thêm
        </button>
      </form>

      {players.length === 0 ? (
        <EmptyState
          title="Chưa có người chơi"
          body="Thêm ít nhất hai người chơi để bắt đầu ghi buổi chơi."
        />
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {players.map((player) => (
            <div key={player.id} className="px-4 py-4">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${
                    player.isActive ? "bg-emerald-700" : "bg-slate-400"
                  }`}
                >
                  {player.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-slate-950">{player.name}</div>
                  <div className="text-xs text-slate-500">
                    {player.sessions.length} buổi chơi
                    {!player.isActive ? " · đã ngừng" : ""}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <form action={updatePlayerName} className="flex gap-2">
                  <input type="hidden" name="id" value={player.id} />
                  <input
                    name="name"
                    defaultValue={player.name}
                    minLength={2}
                    required
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  />
                  <button className="rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Lưu
                  </button>
                </form>

                {player.isActive ? (
                  <form action={deactivatePlayer}>
                    <input type="hidden" name="id" value={player.id} />
                    <button className="rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                      Ngừng
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
