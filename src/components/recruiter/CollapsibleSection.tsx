'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function CollapsibleSection({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-[#ece4de] pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-lg font-semibold text-[#171717]">{title}</h2>
        <ChevronDown
          className={`h-5 w-5 text-[#9a9088] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}
