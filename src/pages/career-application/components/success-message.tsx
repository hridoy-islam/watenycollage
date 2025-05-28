import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"

export function SuccessMessage() {
  return (
    <Card className=" mx-auto p-20">
      <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground">
          Thank you for submitting your application. We will review your information and get back to you soon.
        </p>
        <Button asChild className="bg-watney text-white hover:bg-watney/90">
          <Link to="/">Done</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
