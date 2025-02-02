import { Link } from "react-router-dom"

interface StatCardProps {
    title: string
    value: number
    className?: string
    href: string
  }
  
  export function StatCard({ title, value, href, className }: StatCardProps) {
    return (
      <Link to={href}>
      <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
      </Link>
    )
  }
  
  