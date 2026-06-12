"use client";

import { useActionState, useMemo, useState } from "react";
import { createSession, type SessionActionState } from "@/app/actions";
import { formatSignedVnd } from "@/lib/format";

type Player = {
  id: string;
  name: string;
};

type RowState = {
  selected: boolean;
  startAmount: string;
  endAmount: string;
};

const initialActionState: SessionActionState = {};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function parseAmount(value: string) {
  return value ? Number(value) : 0;
}

export function SessionEntryForm({ players }: { players: Player[] }) {
  const [state, action, pending] = useActionState(createSession, initialActionState);
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      players.map((player) => [
        player.id,
        { selected: true, startAmount: "5000000", endAmount: "5000000" },
      ]),
    ),
  );

  const selectedRows = useMemo(
    () => players.filter((player) => rows[player.id]?.selected),
    [players, rows],
  );

  const totalDifference = selectedRows.reduce((total, player) => {
    const row = rows[player.id];
    return total + parseAmount(row.endAmount) - parseAmount(row.startAmount);
  }, 0);

  const canSave = selectedRows.length >= 2 && totalDifference === 0 && !pending;

  function updateRow(playerId: string, patch: Partial<RowState>) {
    setRows((current) => ({
      ...current,
      [playerId]: {
        ...current[playerId],
        ...patch,
      },
    }));
  }

  if (players.length < 2) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        Cần ít nhất hai người chơi đang hoạt động trước khi tạo buổi chơi.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800" htmlFor="playedAt">
          Ngày chơi
        </label>
        <input
          id="playedAt"
          name="playedAt"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800" htmlFor="note">
          Ghi chú
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Tụ tập cuối tuần"
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-semibold text-slate-950">Chọn người chơi</h2>
          <p className="mt-1 text-xs text-slate-500">Nhập số tiền VND dạng số nguyên.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {players.map((player) => {
            const row = rows[player.id];
            const profitLoss =
              parseAmount(row.endAmount) - parseAmount(row.startAmount);

            return (
              <div key={player.id} className="space-y-3 px-4 py-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="playerIds"
                    value={player.id}
                    checked={row.selected}
                    onChange={(event) =>
                      updateRow(player.id, { selected: event.target.checked })
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                  <span className="flex-1 font-semibold text-slate-950">{player.name}</span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      profitLoss > 0
                        ? "text-emerald-700"
                        : profitLoss < 0
                          ? "text-red-600"
                          : "text-slate-500"
                    }`}
                  >
                    {formatSignedVnd(profitLoss)}
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-medium text-slate-500">
                    Bắt đầu
                    <input
                      name={`startAmount-${player.id}`}
                      inputMode="numeric"
                      value={row.startAmount}
                      disabled={!row.selected}
                      onChange={(event) =>
                        updateRow(player.id, {
                          startAmount: onlyDigits(event.target.value),
                        })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-right text-sm text-slate-950 outline-none focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-slate-500">
                    Kết thúc
                    <input
                      name={`endAmount-${player.id}`}
                      inputMode="numeric"
                      value={row.endAmount}
                      disabled={!row.selected}
                      onChange={(event) =>
                        updateRow(player.id, {
                          endAmount: onlyDigits(event.target.value),
                        })
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-right text-sm text-slate-950 outline-none focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">Tổng cộng</span>
          <span
            className={`text-lg font-bold tabular-nums ${
              totalDifference === 0 ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {formatSignedVnd(totalDifference)}
          </span>
        </div>
        {totalDifference !== 0 ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800">
            Tổng lãi/lỗ phải bằng 0 để lưu buổi chơi.
          </p>
        ) : null}
        {state.error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        disabled={!canSave}
        className="h-14 w-full rounded-2xl bg-emerald-700 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:shadow-none"
      >
        {pending ? "Đang lưu..." : "Lưu buổi chơi"}
      </button>
    </form>
  );
}
