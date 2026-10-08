

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MoveLeft } from "lucide-react"

import { mockAssessments } from "@/data/riskAssessment"
import { Link } from "react-router-dom"

export default function RiskAssessmentPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAssessments = mockAssessments.filter((assessment) =>
    assessment.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Risk Assessments</h1>
            <p className="text-muted-foreground mt-1">Manage and track your risk assessments</p>
          </div>
          <div className="flex items-center gap-3">
          <Button variant="default" onClick={() => window.history.back()}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Link to="create">
            <Button className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90">
              <Plus className="h-4 w-4" />
              New Risk Assessment
            </Button>
          </Link>
          </div>
        </div>

       

        {/* Current Assessments */}
        <div className="mb-8">
        

          {filteredAssessments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">📋</div>
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Nothing to see here!</h3>
                <p className="text-muted-foreground mb-4">No current risk assessments found.</p>
                <Link to="/create">
                  <Button variant="link">Find out more</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssessments.map((assessment) => (
                <Link key={assessment.id} to={`${assessment.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {assessment.badge}
                        </Badge>
                        <div>
                          <h3 className="font-medium">{assessment.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {assessment.description || "No description available"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Moderate risk
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Not attached to any Support Plan */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Not attached to any Support Plan</h2>
            <span className="text-sm text-muted-foreground">Sort by Risk (descending)</span>
          </div>

          <div className="grid gap-4">
            <Link to="generic-assessment">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      GA
                    </Badge>
                    <div>
                      <h3 className="font-medium">Generic Assessment for Risk Management</h3>
                      <p className="text-sm text-muted-foreground">Reviewed 27-06-2025 • 22:06 • System Generated</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Moderate risk
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
