import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MoveLeft, ChevronRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"  // ✅ React Router
import { predefinedAssessmentTemplates } from "@/data/riskAssessment"

export default function CreateRiskAssessmentPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customAssessmentName, setCustomAssessmentName] = useState("")
  const navigate = useNavigate()  // ✅ useNavigate from React Router

  const filteredTemplates = predefinedAssessmentTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateCustomAssessment = () => {
    
  }

  const handleTemplateSelect = (templateId: string) => {
    // ✅ Navigate to template
    navigate(`${templateId}`)
  }

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
        
            <Button variant="default" onClick={() => window.history.back()}>
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

          <h1 className="text-2xl font-bold">Add a Risk Assessment</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create Custom Assessment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Create a Customised Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-row items-center gap-4">
            <Input
              placeholder="Enter assessment name"
              value={customAssessmentName}
              onChange={(e) => setCustomAssessmentName(e.target.value)}
            />
            <Button
              onClick={handleCreateCustomAssessment}
              disabled={!customAssessmentName.trim()}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Create Custom Assessment
            </Button>
          </CardContent>
        </Card>

        {/* Predefined Templates */}
        <div className="space-y-2">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {template.badge}
                  </Badge>
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">No reviews yet</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No templates found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  )
}