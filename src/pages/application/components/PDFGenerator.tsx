import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { File } from 'lucide-react';
import ApplicationPDFDocument from './PDFDocument';
import { Button } from '@/components/ui/button';

interface PDFGeneratorProps {
  application: any;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ application }) => {
  if (!application) return null;

  const fileName = `${application?.personalDetailsData?.firstName || 'Applicant'}_${application?.personalDetailsData?.lastName || ''}_Application.pdf`;

  return (
    <PDFDownloadLink
      document={<ApplicationPDFDocument formData={application} />}
      fileName={fileName}
    >
      <Button className="flex flex-row gap-2 bg-watney text-white hover:bg-watney/90 px-4 py-2 rounded-md items-center text-sm">
        <File className="w-4" />
        PDF
      </Button>
    </PDFDownloadLink>
  );
};

export default PDFGenerator;
