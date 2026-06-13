type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-4">
        <span className="eyebrow">{eyebrow}</span>
        <span className="h-px flex-1 bg-neutral-300" />
      </div>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
        {title}
      </h1>
      {subtitle ? <p className="mt-3 text-neutral-600">{subtitle}</p> : null}
    </div>
  );
}
