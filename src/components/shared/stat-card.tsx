interface StatCardProps {
    title: string
    value: number
    className?: string
  }
  
  export function StatCard({ title, value, className }: StatCardProps) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
    )
  }
  
  