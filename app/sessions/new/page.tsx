import { PageHeader } from "@/app/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { SessionEntryForm } from "./SessionEntryForm";

export const dynamic = "force-dynamic";

export default async function NewSessionPage() {
  const players = await prisma.player.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="Tạo buổi chơi mới"
        subtitle="Chọn người chơi, nhập tiền đầu và cuối buổi."
        backHref="/sessions"
      />
      <SessionEntryForm players={players} />
    </div>
  );
}
