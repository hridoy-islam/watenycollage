import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { File } from 'lucide-react';
import ApplicationPDFDocument from './PDFDocumentCareer';
import { Button } from '@/components/ui/button';

interface PDFGeneratorProps {
  application: any;
  applicationJob: any;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ application , applicationJob}) => {
  if (!application) return null;

  const fileName = `${application?.firstName || 'Applicant'}_${application?.lastName || ''}_Application.pdf`;

  return (
    <PDFDownloadLink
      document={<ApplicationPDFDocument formData={application}  applicationJob={applicationJob || []}/>}
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
