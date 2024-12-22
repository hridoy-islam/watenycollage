"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/stat-card"
import { RefreshCw } from 'lucide-react'

const stats = [
  {
    title: "Applications",
    value: 1426
  },
  {
    title: "Students",
    value: 1070
  },
  {
    title: "Waiting LLC Approval",
    value: 0
  },
  {
    title: "New",
    value: 125
  },
  {
    title: "Processing",
    value: 29
  },
  {
    title: "Application Made",
    value: 4
  },
  {
    title: "Offer Made",
    value: 0
  },
  {
    title: "Enrolled",
    value: 594
  },
  {
    title: "Rejected",
    value: 367
  },
  {
    title: "Hold",
    value: 1
  },
  {
    title: "App made to LCC",
    value: 113
  },
  {
    title: "Deregister",
    value: 60
  },
  {
    title: "SLC Course Completed",
    value: 133
  }
]

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold">General Report</h2>
        <div className="flex items-center space-x-2">
          <Button className="bg-supperagent text-white hover:bg-supperagent/90" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Data
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="rounded-lg bg-supperagent p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-white">
                Applications by academic year:
              </label>
              <Select defaultValue="2024-2025">
                <SelectTrigger className="mt-2 bg-white border-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

