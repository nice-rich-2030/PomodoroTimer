import type { ReactNode } from 'react'

export default function SectionLabel({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-default-500 mb-2.5">
      <span aria-hidden="true" className="text-default-400">
        {icon}
      </span>
      {children}
    </h2>
  )
}
