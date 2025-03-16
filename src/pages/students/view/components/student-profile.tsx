import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploader } from '@/components/shared/image-uploader';
import moment from 'moment';
import axios from 'axios';

export function StudentProfile({ student }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    student?.profilePhotoUrl
  );

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://core.qualitees.co.uk/api/documents?where=entity_id,${student.id},&file_type=profile&limit=1`,
        {
          headers: {
            'x-company-token': import.meta.env.VITE_COMPANY_TOKEN // Add the custom header
          }
        }
      );

      if (response.data.result && response.data.result.length > 0) {
        setProfilePhotoUrl(response.data.result[0].file_url); // Assuming the API returns the URL of the uploaded image
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [student?._id]); // Re-fetch data if student.id changes

  useEffect(() => {
    if (!uploadOpen) {
      fetchData(); // Refetch data when the upload dialog is closed
    }
  }, [uploadOpen]); // Re-fetch data when uploadOpen changes

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="grid grid-cols-[auto,1fr,1fr] gap-6 p-6">
        <div className="relative">
          <div className="relative h-48 w-48 overflow-hidden rounded-full">
            <img
              src={
                profilePhotoUrl ||
                'https://kzmjkvje8tr2ra724fhh.lite.vusercontent.net/placeholder.svg'
              }
              alt={`${student?.firstName} ${student?.lastName}`}
              className="h-full w-full object-cover"
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-7 rounded-full"
              onClick={() => setUploadOpen(true)}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">
              {student?.title} {student?.firstName} {student?.lastName}
            </h2>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm text-muted-foreground">
                {student?.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Phone:</span>
              <span className="text-sm text-muted-foreground">
                {student?.phone}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Date of Birth:</span>
              <span className="text-sm text-muted-foreground">
                {moment(student?.dob).format('DD-MM-YYYY')}
                {/* {student.dob} */}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Address</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>{student?.addressLine1}</p>
              <p>{student?.addressLine2}</p>
              <p>{student?.state}</p>
              <p>{student?.postCode}</p>
              <p>{student?.country}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <ImageUploader
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={(data) => {
          setProfilePhotoUrl(data.url); // Update the profile photo URL after upload
        }}
        studentId={student?.id}
      />
    </Card>
  );
}
