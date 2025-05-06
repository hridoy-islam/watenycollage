"use client"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "./file-upload"

interface ProfilePictureStepProps {
  value?: string
  onNext: (profilePictureUrl: string | undefined) => void
}

export function ProfilePictureStep({ value, onNext }: ProfilePictureStepProps) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

  const handleNext = () => {
    // If there's a profile picture, you'd typically upload it to a server
    // and get back a URL. For now, we'll just pass the existing value.
    onNext(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-center justify-center space-y-2">
        <CardTitle className="text-3xl">Profile Picture</CardTitle>
        <CardDescription>
          Upload a professional photo for your profile. This is optional and you can skip this step.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <FileUpload onFileSelected={setProfilePicture} value={value} />
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <Button variant="default" onClick={handleNext} className="bg-watney text-white hover:bg-watney/90">
            Skip
          </Button>
          <Button onClick={handleNext} className="bg-watney text-white hover:bg-watney/90">Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}
