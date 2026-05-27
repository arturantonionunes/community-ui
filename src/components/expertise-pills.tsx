import Link from 'next/link';

interface ExpertisePillsProps {
  tags: Array<{ slug: string; label: string; proficiency: number }>;
}

const ICON_BY_PROFICIENCY: Record<number, string> = {
  1: '○',
  2: '◐',
  3: '●',
};

export function ExpertisePills({ tags }: ExpertisePillsProps) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => {
        const icon = ICON_BY_PROFICIENCY[t.proficiency] ?? '○';
        return (
          <Link
            key={t.slug}
            href={`/community/experts?tag=${encodeURIComponent(t.slug)}`}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
            title={`Proficiency: ${t.proficiency}`}
          >
            <span aria-hidden className="text-[10px]">{icon}</span>
            #{t.label}
          </Link>
        );
      })}
    </div>
  );
}
