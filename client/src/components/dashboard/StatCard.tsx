interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  iconColor: string
  onClick: () => void
  isActive: boolean
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  iconColor,
  onClick,
  isActive,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-md ${
        isActive
          ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
          : 'border-indigo-100 bg-white shadow-sm'
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color} ${iconColor}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>

        <p className="text-xs font-medium text-slate-500">{title}</p>
      </div>
    </button>
  )
}
