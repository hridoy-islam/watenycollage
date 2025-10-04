"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { toast } from "sonner"

interface PDFGeneratorProps {
  application: any
  applicationJob: any
}

export default function PDFGenerator({ application, applicationJob }: PDFGeneratorProps) {
  const handleGeneratePDF = () => {
    // Placeholder for PDF generation logic
    toast.info("PDF generation feature coming soon!")

    // In a real implementation, you would use a library like jsPDF or react-pdf
    // to generate a PDF from the application data
    console.log("Generating PDF for:", { application, applicationJob })
  }

  return (
    <Button onClick={handleGeneratePDF} className="bg-watney text-white hover:bg-watney/90">
      <FileDown className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  )
}
