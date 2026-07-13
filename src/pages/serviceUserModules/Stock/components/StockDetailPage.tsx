
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Plus } from "lucide-react"
import { StockChart } from "./stock-chart"
import { AddStockDialog } from "./add-stock-dialog"
import { useNavigate, useParams } from "react-router-dom"

// Mock data for individual medication
const mockMedicationData = {
  1: {
    name: "Acidex oral suspension aniseed",
    currentStock: 150,
    unit: "ml",
    expectedStock: 200,
    dateRange: { start: "2 Aug", end: "16 Aug" },
    logs: [
      {
        id: 1,
        date: "15-08-2025 01:05",
        action: "Administered",
        description: "For Daljit Singh's 20:00 scheduled meds, 10 ml Acidex oral suspension aniseed was administered.",
        administeredBy: "Rajveer Singh",
        witnessedBy: "MD Jishrul Islam Jony",
        stockCount: 150,
        expectedStock: 200,
      },
      {
        id: 2,
        date: "14-08-2025 01:02",
        action: "Administered",
        description: "For Daljit Singh's 20:00 scheduled meds, 10 ml Acidex oral suspension aniseed was administered.",
        administeredBy: "Rajveer Singh",
        witnessedBy: "MD Jishrul Islam Jony",
        stockCount: 160,
        expectedStock: 210,
      },
      {
        id: 3,
        date: "13-08-2025 01:01",
        action: "Administered",
        description: "For Daljit Singh's 20:00 scheduled meds, 10 ml Acidex oral suspension aniseed was administered.",
        administeredBy: "Rajveer Singh",
        witnessedBy: "MD Jishrul Islam Jony",
        stockCount: 170,
        expectedStock: 220,
      },
    ],
  },
}

export default function StockDetailPage() {
  const navigate = useNavigate()
const {id} = useParams()
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const medicationId = id
  const medication = mockMedicationData[medicationId as keyof typeof mockMedicationData]

  if (!medication) {
    return <div>Medication not found</div>
  }
  return (
    <div className="min-h-screen b">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
           
              <Button variant="default" className="bg-theme text-white hover:bg-theme/90" size="sm" onClick={()=> navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
           
            <div>
              <h1 className="text-2xl font-bold ">Stock - {medication.name}</h1>
              <p className="text-muted-foreground">{medication.name} / Stock</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddStockOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Stock Count
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Date Range:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={medication.dateRange.start}
                  className="px-3 py-1 border rounded text-sm"
                  readOnly
                />
                <span>to</span>
                <input
                  type="text"
                  value={medication.dateRange.end}
                  className="px-3 py-1 border rounded text-sm"
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Chart */}
        <Card>
          <CardContent className="p-6">
            <StockChart />
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Logs</CardTitle>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">Stock Count</div>
                  <div className="text-muted-foreground">({medication.unit})</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Expected Stock</div>
                  <div className="text-muted-foreground">({medication.unit})</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medication.logs.map((log) => (
                <div key={log.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground min-w-32">{log.date}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">A</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{log.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.administeredBy}, witnessed by {log.witnessedBy}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.description}</p>
                  </div>
                  <div className="text-right min-w-24">
                    <div className="text-sm font-medium">{log.stockCount}</div>
                    <div className="text-sm font-medium">{log.expectedStock}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Stock Dialog */}
        <AddStockDialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen} medicationName={medication.name} />
      </div>
    </div>
  )
}
