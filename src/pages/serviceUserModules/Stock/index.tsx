import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Clock, Calendar, MoveLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

// Mock data for medications
const mockMedications = {
  scheduled: [
    {
      id: 1,
      name: "Acidex oral suspension aniseed",
      icon: "💊",
      stockCount: 150,
      unit: "ml",
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      name: "Paracetamol 500mg tablets",
      icon: "💊",
      stockCount: 24,
      unit: "tablets",
      lastUpdated: "2024-01-14",
    },
    {
      id: 3,
      name: "Clonidine 75mg tablets",
      icon: "💊",
      stockCount: 30,
      unit: "tablets",
      lastUpdated: "2024-01-13",
    },
    {
      id: 4,
      name: "Furosemide 40mg tablets",
      icon: "💊",
      stockCount: 28,
      unit: "tablets",
      lastUpdated: "2024-01-12",
    },
    {
      id: 5,
      name: "Folic acid Digoxin oral solution",
      icon: "💊",
      stockCount: 100,
      unit: "ml",
      lastUpdated: "2024-01-11",
    },
    {
      id: 6,
      name: "Hydrochlorothiazide 25mg tablets",
      icon: "💊",
      stockCount: 50,
      unit: "tablets",
      lastUpdated: "2024-01-10",
    },
    {
      id: 7,
      name: "Levothyroxine 100 mcg solution",
      icon: "💊",
      stockCount: 75,
      unit: "ml",
      lastUpdated: "2024-01-09",
    },
    {
      id: 8,
      name: "Lisinopril 10mg tablets",
      icon: "💊",
      stockCount: 60,
      unit: "tablets",
      lastUpdated: "2024-01-08",
    },
  ],
  nonScheduled: [
    {
      id: 9,
      name: "Ibuprofen 200mg tablets",
      icon: "💊",
      stockCount: 40,
      unit: "tablets",
      lastUpdated: "2024-01-15",
    },
    {
      id: 10,
      name: "Loratadine 10mg tablets",
      icon: "💊",
      stockCount: 20,
      unit: "tablets",
      lastUpdated: "2024-01-14",
    },
    {
      id: 11,
      name: "Omeprazole 20mg capsules",
      icon: "💊",
      stockCount: 30,
      unit: "capsules",
      lastUpdated: "2024-01-13",
    },
    {
      id: 12,
      name: "Paracetamol 120mg/5ml oral solution",
      icon: "💊",
      stockCount: 200,
      unit: "ml",
      lastUpdated: "2024-01-12",
    },
  ],
}

function MedicationCard({ medication, type }: { medication: any; type: string }) {
  const getStockStatus = (count: number) => {
      if (count < 20) return { color: "bg-red-100 text-red-800", label: "Low Stock" }
      if (count < 50) return { color: "bg-yellow-100 text-yellow-800", label: "Medium Stock" }
      return { color: "bg-green-100 text-green-800", label: "Good Stock" }
    }
    
    const stockStatus = getStockStatus(medication.stockCount)
    return (
        <Link to={`${medication.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
              {medication.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-black truncate">{medication.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={stockStatus.color}>
                  {medication.stockCount} {medication.unit}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(medication.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Package className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


export default function StockPage() {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen ">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold ">Medication Stock</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage medication inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="default" onClick={() => window.history.back()}>
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button className=" text-white" onClick={()=> navigate("/admin/people-planner/mar-chart/add-medication")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </div>

        {/* Scheduled Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            {mockMedications.scheduled.map((medication) => (
              <MedicationCard key={medication.id} medication={medication} type="scheduled" />
            ))}
          </CardContent>
        </Card>

        {/* Non-Scheduled (PRN) Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Not Scheduled (PRN)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            {mockMedications.nonScheduled.map((medication) => (
              <MedicationCard key={medication.id} medication={medication} type="prn" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
