import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: {
    href: string;
    label: string;
  };
  backHref?: string;
};

export function PageHeader({ title, subtitle, action, backHref }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        {backHref ? (
          <Link
            href={backHref}
            className="-ml-2 mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-xl text-slate-700 hover:bg-slate-100"
            aria-label="Quay lại"
          >
            ‹
          </Link>
        ) : null}
        <h1 className="text-2xl font-bold tracking-normal text-slate-950">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-900/20 hover:bg-emerald-800"
        >
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}
