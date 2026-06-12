"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type SessionActionState = {
  error?: string;
};

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readAmount(formData: FormData, key: string) {
  const raw = readRequiredString(formData, key).replace(/[,. ]/g, "");
  if (!/^\d+$/.test(raw)) {
    return null;
  }

  return Number(raw);
}

export async function createPlayer(formData: FormData) {
  const name = readRequiredString(formData, "name");

  if (name.length < 2) {
    return;
  }

  await prisma.player.create({
    data: { name },
  });

  revalidatePath("/players");
  revalidatePath("/ranking");
}

export async function updatePlayerName(formData: FormData) {
  const id = readRequiredString(formData, "id");
  const name = readRequiredString(formData, "name");

  if (!id || name.length < 2) {
    return;
  }

  await prisma.player.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/players");
  revalidatePath("/ranking");
  revalidatePath("/sessions");
}

export async function deactivatePlayer(formData: FormData) {
  const id = readRequiredString(formData, "id");

  if (!id) {
    return;
  }

  await prisma.player.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/players");
  revalidatePath("/sessions/new");
}

export async function createSession(
  _previousState: SessionActionState,
  formData: FormData,
): Promise<SessionActionState> {
  const playedAtValue = readRequiredString(formData, "playedAt");
  const note = readRequiredString(formData, "note");
  const playerIds = formData
    .getAll("playerIds")
    .filter((value): value is string => typeof value === "string");

  if (playerIds.length < 2) {
    return { error: "Can chon it nhat 2 nguoi choi." };
  }

  const playedAt = playedAtValue ? new Date(`${playedAtValue}T20:00:00`) : null;
  if (!playedAt || Number.isNaN(playedAt.getTime())) {
    return { error: "Ngay choi khong hop le." };
  }

  const rows = playerIds.map((playerId) => {
    const startAmount = readAmount(formData, `startAmount-${playerId}`);
    const endAmount = readAmount(formData, `endAmount-${playerId}`);

    return {
      playerId,
      startAmount,
      endAmount,
      profitLoss:
        startAmount === null || endAmount === null ? null : endAmount - startAmount,
    };
  });

  if (
    rows.some(
      (row) =>
        row.startAmount === null ||
        row.endAmount === null ||
        row.startAmount < 0 ||
        row.endAmount < 0,
    )
  ) {
    return { error: "So tien bat dau va ket thuc phai la so nguyen khong am." };
  }

  const totalProfitLoss = rows.reduce(
    (total, row) => total + (row.profitLoss ?? 0),
    0,
  );

  if (totalProfitLoss !== 0) {
    return {
      error: `Tong lai/lo phai bang 0. Hien dang lech ${totalProfitLoss.toLocaleString("vi-VN")} d.`,
    };
  }

  const activePlayers = await prisma.player.findMany({
    where: {
      id: { in: playerIds },
      isActive: true,
    },
    select: { id: true },
  });

  if (activePlayers.length !== playerIds.length) {
    return { error: "Danh sach nguoi choi khong hop le hoac da ngung hoat dong." };
  }

  const session = await prisma.gameSession.create({
    data: {
      playedAt,
      note: note || null,
      players: {
        create: rows.map((row) => ({
          playerId: row.playerId,
          startAmount: row.startAmount ?? 0,
          endAmount: row.endAmount ?? 0,
          profitLoss: row.profitLoss ?? 0,
        })),
      },
    },
  });

  revalidatePath("/sessions");
  revalidatePath("/ranking");
  redirect(`/sessions/${session.id}`);
}
