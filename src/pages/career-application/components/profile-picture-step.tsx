'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import male from '@/assets/imges/home/male.jpeg';
import female from '@/assets/imges/home/female.jpg';
import { useSelector } from 'react-redux';
import { ImageUploader } from './userImage-uploader';

export function ProfilePictureStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  refreshData
}) {
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    defaultValues?.image || null
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);


  useEffect(() => {
  if (defaultValues?.image && defaultValues.image !== '') {
    setProfilePictureUrl(defaultValues.image);
  }
}, [defaultValues]);

const isValidImageUrl = (url) => {
  return url && url.startsWith('http');
};

  const handleNext = () => {
    // Pass only the image URL as part of the form data
    onSaveAndContinue({ image: profilePictureUrl });
  };

  const handleUploadComplete = (uploadResponse) => {
    if (uploadResponse?.success && uploadResponse.data?.fileUrl) {
      const fileUrl = uploadResponse.data.fileUrl;
      setProfilePictureUrl(fileUrl); // Update local state with new image URL

     
      
    }

    setUploadOpen(false);

    if (refreshData) {
      refreshData();
    }
  };

  const handleSkip = () => {
    setProfilePictureUrl(null);
    setCurrentStep(2); // Go to next step
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
            <div className="h-[200px] w-[200px] overflow-hidden  border-2 border-gray-300 bg-gray-100">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <Button
              variant="default"
              className="bg-watney text-white hover:bg-watney/90"
              onClick={() => setUploadOpen(true)}
            >
              Upload Image
            </Button>

            {!profilePictureUrl && (
              <Button variant="outline" onClick={handleSkip}>
                Skip This Step
              </Button>
            )}
          </div>

          {/* Grid 2: Example Images + Description */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex gap-4">
              <img
                src={male}
                alt="Example Profile 1"
                className="h-48 w-48 border-2 border-gray-300 object-cover"
              />
              <img
                src={female}
                alt="Example Profile 2"
                className="h-48 w-48 border-2 border-gray-300 object-cover"
              />
            </div>
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              Example: A well-lit headshot with a neutral background in business
              attire.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={handleNext}
            className="bg-watney text-white hover:bg-watney/90"
            disabled={!isValidImageUrl(profilePictureUrl)} // Only enable if an image is selected
          >
            Next
          </Button>
        </div>

        <ImageUploader
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUploadComplete={handleUploadComplete}
          entityId={user?._id}
        />
      </CardContent>
    </Card>
  );
}