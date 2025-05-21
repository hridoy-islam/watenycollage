'use client';

import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from './file-upload';
import male from '@/assets/imges/home/male.jpeg';
import female from '@/assets/imges/home/female.jpg';

interface ProfilePictureStepProps {
  value?: string;
  onNext: (profilePictureUrl: string | undefined) => void;
}

export function ProfilePictureStep({ value, onNext }: ProfilePictureStepProps) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleNext = () => {
    // If there's a profile picture, you'd typically upload it to a server
    // and get back a URL. For now, we'll just pass the existing value.
    onNext(value);
  };


   const handleSkip = () => {
    setProfilePicture(null);
    onNext(undefined); // Or null, depending on how you handle it in parent
  };


  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-col items-center justify-center space-y-2">
        <CardTitle className="text-3xl">Profile Picture</CardTitle>
        <CardDescription>
          Upload a clear, professional-looking photo to personalize your
          profile. Headshot-style images with a plain background are preferred.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
          {/* Grid 1: File Upload */}
          <div className="flex flex-col items-center justify-center gap-4">
            <FileUpload onFileSelected={setProfilePicture} value={value} />
            <Button  variant="outline"  onClick={handleSkip}>
              Skip This Step
            </Button>
          </div>

          {/* Grid 2: Example Images + Description */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex gap-4">
              <img
                src={male}
                alt="Example Profile 1"
                className="h-28 w-28 border-2 border-gray-300 object-cover"
              />
              <img
                src={female}
                alt="Example Profile 2"
                className="h-28 w-28 border-2 border-gray-300 object-cover"
              />
            </div>
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              Example: A well-lit headshot with a neutral background in business
              attire.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {/* <Button variant="default" onClick={handleNext} className="bg-watney text-white hover:bg-watney/90">
            Skip
          </Button> */}
           <Button
            onClick={handleNext}
            className="bg-watney text-white hover:bg-watney/90"
            disabled={!profilePicture} // Only enabled when a picture is selected
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
