import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Stepper } from "@/components/shared/stepper"
import { PersonalInfo } from "../components/personal-info"
import { ContactInfo } from "../components/contact-info"
import { AddressInfo } from "../components/address-info"
import { AdditionalInfo } from "../components/additional-info"
import { StudentFormData, initialFormData } from "@/types/index"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from '@/routes/hooks'
import { Link } from 'react-router-dom'

const steps = [
  {
    title: "Personal Info",
    description: "Basic details",
  },
  {
    title: "Contact",
    description: "How to reach you",
  },
  {
    title: "Address",
    description: "Your location",
  },
  {
    title: "Additional",
    description: "Extra details",
  },
]

export default function NewStudentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<StudentFormData>(initialFormData)
  const router = useRouter()

  const updateFields = (fields: Partial<StudentFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }))
  }

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically submit the form data to your backend
    console.log('Form submitted:', formData)
    router.push('/students')
  }

  return (
    <div className="px-4 mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/students')}
          >
            <Link to='/admin/students/'>
            <ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-semibold">Add New Student</h1>
        </div>
      </div>

      <Card className="mx-auto px-4 p-6">
        <Stepper currentStep={currentStep} steps={steps} />
        
        <form onSubmit={handleSubmit} className="mt-8">
          {currentStep === 0 && (
            <PersonalInfo data={formData} updateFields={updateFields} />
          )}
          {currentStep === 1 && (
            <ContactInfo data={formData} updateFields={updateFields} />
          )}
          {currentStep === 2 && (
            <AddressInfo data={formData} updateFields={updateFields} />
          )}
          {currentStep === 3 && (
            <AdditionalInfo data={formData} updateFields={updateFields} />
          )}

          <div className="mt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={back}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button type="submit" className="bg-[#1e40af]">
                Save Data
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-[#1e40af]"
                onClick={next}
              >
                Next
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}

