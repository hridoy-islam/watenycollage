import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FileUpload } from './file-upload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const documentsSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  nationalID: z.string().optional(),
  hasDocument: z.boolean().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  idDocument: z.instanceof(File).optional(),
  hasCertificates: z.boolean().optional(),
  certificatesDetails: z.array(z.string()).optional(), // Array of strings
  qualificationCertificates: z.array(z.instanceof(File)).optional(), // Array of files
  cvResume: z.instanceof(File).optional(),
  hasProofOfAddress: z.boolean().optional(),
  proofOfAddressType: z.string().optional(),
  proofOfAddressDate: z.string().optional(),
  proofOfAddress: z.instanceof(File).optional(),
  otherDocuments: z.instanceof(File).optional(),
  otherDocumentsDescription: z.string().optional(),
});

type DocumentsData = z.infer<typeof documentsSchema>;

export function DocumentsStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}: any) {
  const [currentSection, setCurrentSection] = useState(0);
  const [idDocuments, setIdDocuments] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [cvResume, setCvResume] = useState<File[]>([]);
  const [proofOfAddress, setProofOfAddress] = useState<File[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<File[]>([]);
  const [certificatesList, setCertificatesList] = useState<
    { details: string; file: File[] }[]
  >([{ details: '', file: [] }]);

  const form = useForm<DocumentsData>({
    defaultValues: {
      documentType: '',
      hasDocument: false,
      hasCertificates: true,
      hasProofOfAddress: true,
      ...defaultValues
    }
  });

  const documentType = form.watch('documentType');
  const nationalID = form.watch('nationalID');
  const passportNumber = form.watch('passportNumber');
  const passportExpiry = form.watch('passportExpiry');
  const hasCertificates = form.watch('hasCertificates');
  const certificatesDetails = form.watch('certificatesDetails');
  const hasProofOfAddress = form.watch('hasProofOfAddress');

  const [passportBlurred, setPassportBlurred] = useState(false);
  const [passportExpiryBlurred, setPassportExpiryBlurred] = useState(false);
  const [nationalIdBlurred, setNationalIdBlurred] = useState(false);

  const sections = [
    {
      title: 'ID Document',
      description: 'Please select and upload your identification document',
      required: false
    },
    {
      title: 'Qualification Certificates',
      description: 'Upload your educational or professional certificates',
      required: false
    },
    {
      title: 'CV/Resume',
      description: 'Upload your most recent CV or resume',
      required: false
    },
    {
      title: 'Proof of Address',
      description: 'Upload documents that verify your current address',
      required: false
    },
    {
      title: 'Other Documents',
      description: 'Upload any additional supporting documents',
      required: false
    }
  ];

  function prepareFileValue(files: File[] | undefined): string {
    return files && files.length > 0 ? files[0].name : '';
  }

  function onSubmit(data) {
    const filteredCertificatesDetails = certificatesList
      .map((certificate) => certificate.details.trim())
      .filter((detail) => detail !== '');
  
    // Update the form data with the filtered details
    data.certificatesDetails = filteredCertificatesDetails;
  
    // Prepare other file values
    data.idDocument = prepareFileValue(idDocuments);
    data.qualificationCertificates = prepareFileValue(certificates);
    data.cvResume = prepareFileValue(cvResume);
    data.proofOfAddress = prepareFileValue(proofOfAddress);
    data.otherDocuments = prepareFileValue(otherDocuments);
  
    onSaveAndContinue(data);
  }

  function handleBack() {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      setCurrentStep(6);
    }
  }

  function handleSkip() {
    const data = form.getValues() as DocumentsData;
    assignDocumentFiles(data);

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      onSaveAndContinue(data);
    }
  }

  function handleSaveSection() {
    const data = form.getValues() as DocumentsData;
    assignDocumentFiles(data);

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      onSaveAndContinue(data);
    }
  }

  function assignDocumentFiles(data) {
    data.idDocument = idDocuments ?? undefined;
    data.qualificationCertificates = certificates ?? undefined;
    data.cvResume = cvResume ?? undefined;
    data.proofOfAddress = proofOfAddress ?? undefined;
    data.otherDocuments = otherDocuments ?? undefined;
  }
  const removeFile = (
    fileList: File[],
    setFileList: React.Dispatch<React.SetStateAction<File[]>>,
    index: number
  ) => {
    const newFiles = [...fileList];
    newFiles.splice(index, 1);
    setFileList(newFiles);
  };

  const showPassportUpload =
    documentType === 'passport' &&
    passportNumber &&
    passportExpiry &&
    passportBlurred &&
    passportExpiryBlurred;

  const showNationalIdUpload =
    documentType === 'nationalID' && nationalID && nationalIdBlurred;

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium">{sections[0].title}</h3>
            <p className="text-sm text-gray-600">{sections[0].description}</p>

            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Document Type<span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="nationalID">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {documentType === 'passport' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Passport Number<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter passport number"
                          {...field}
                          onBlur={() => setPassportBlurred(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passportExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Passport Expiry Date
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          onBlur={() => setPassportExpiryBlurred(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {documentType === 'nationalID' && (
              <FormField
                control={form.control}
                name="nationalID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      National ID Number<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter National ID number"
                        {...field}
                        onBlur={() => setNationalIdBlurred(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Show upload field only when required information is provided */}
            {(showPassportUpload || showNationalIdUpload) && (
              <FormField
                control={form.control}
                name="idDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {documentType === 'passport'
                        ? 'Passport Copy'
                        : 'National ID Copy'}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <FileUpload
                        id="id-document"
                        onFilesSelected={setIdDocuments}
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple={false}
                        buttonLabel={`Upload ${documentType === 'passport' ? 'Passport' : 'National ID'}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {idDocuments.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Uploaded Files</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {idDocuments.map((file, index) => (
                      <TableRow key={`id-${index}`}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(idDocuments, setIdDocuments, index)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

        case 1: // Qualification Certificates
        return (
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium">{sections[1].title}</h3>
            <p className="text-sm text-gray-600">{sections[1].description}</p>
      
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCertificatesList((prev) => [...prev, { details: '', file: [] }]);
              }}

                          className="bg-watney text-white hover:bg-watney/90"

            >
              Add New Certificate
            </Button>
      
            {certificatesList.map((certificate, index) => (
              <div key={`certificate-${index}`} className="flex flex-row w-full gap-4">
                {/* Certificates Details Field */}
                <FormField
                  control={form.control}
                  name={`certificatesDetails.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Certificates Details {index + 1}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="List your qualifications (e.g., BSc Computer Science, 2020)"
                          {...field}
                          value={certificate.details}
                          onChange={(e) => {
                            const updatedCertificates = [...certificatesList];
                            updatedCertificates[index].details = e.target.value;
                            setCertificatesList(updatedCertificates);
                          
                            // Update react-hook-form value as well
                            const updatedDetailsArray = updatedCertificates.map((item) => item.details);
                            form.setValue('certificatesDetails', updatedDetailsArray);
                          }}
                          className='min-w-[500px]'
                          
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
      
                {/* Qualification Certificates Upload Field */}
                <FormField
                  control={form.control}
                  name={`qualificationCertificates.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Qualification Certificates {index + 1}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <FileUpload
                          id={`certificates-${index}`}
                          onFilesSelected={(files) => {
                            const updatedCertificates = [...certificatesList];
                            updatedCertificates[index].file = files;
                            setCertificatesList(updatedCertificates);
                          }}
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple={true}
                          buttonLabel="Upload Certificates"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
      
            {certificatesList.some((cert) => cert.file.length > 0) && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Uploaded Files</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificatesList.map((certificate, certIndex) =>
                      certificate.file.map((file, fileIndex) => (
                        <TableRow key={`cert-${certIndex}-file-${fileIndex}`}>
                          <TableCell>{`Certificate ${certIndex + 1}`}</TableCell>
                          <TableCell>{file.name}</TableCell>
                          <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedCertificates = [...certificatesList];
                                updatedCertificates[certIndex].file.splice(fileIndex, 1);
                                setCertificatesList(updatedCertificates);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );
      case 2: // CV/Resume
        return (
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium">{sections[2].title}</h3>
            <p className="text-sm text-gray-600">{sections[2].description}</p>

            <FormField
              control={form.control}
              name="cvResume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    CV/Resume
                    {sections[2].required && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <FileUpload
                      id="cv-resume"
                      onFilesSelected={setCvResume}
                      accept=".pdf,.doc,.docx"
                      multiple={false}
                      buttonLabel="Upload CV/Resume"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {cvResume.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Uploaded Files</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cvResume.map((file, index) => (
                      <TableRow key={`cv-${index}`}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(cvResume, setCvResume, index)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

      case 3: // Proof of Address
        return (
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium">{sections[3].title}</h3>
            <p className="text-sm text-gray-600">{sections[3].description}</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="proofOfAddressType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Document Type<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Utility bill, Bank statement"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="proofOfAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Proof of Address
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <FileUpload
                      id="proof-of-address"
                      onFilesSelected={setProofOfAddress}
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple={false}
                      buttonLabel="Upload Proof of Address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {proofOfAddress.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Uploaded Files</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proofOfAddress.map((file, index) => (
                      <TableRow key={`address-${index}`}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(
                                proofOfAddress,
                                setProofOfAddress,
                                index
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

      case 4: // Other Documents
        return (
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            {/* <h3 className="text-lg font-medium">{sections[4].title}</h3> */}
            <p className="text-sm text-gray-600">{sections[4].description}</p>

            {/* <FormField
              control={form.control}
              name="otherDocumentsDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Documents Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describe what these documents are (e.g., Reference letters, Work samples)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="otherDocuments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Supporting Documents</FormLabel>
                  <FormControl>
                    <FileUpload
                      id="other-documents"
                      onFilesSelected={setOtherDocuments}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      multiple={false}
                      buttonLabel="Upload Other Documents"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {otherDocuments.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Uploaded Files</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherDocuments.map((file, index) => (
                      <TableRow key={`other-${index}`}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(
                                otherDocuments,
                                setOtherDocuments,
                                index
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const isNextButtonDisabled = () => {
    if (sections[currentSection].required) {
      switch (currentSection) {
        case 0: // ID Document
          if (documentType === 'passport') {
            return (
              !passportNumber ||
              !form.watch('passportExpiry') ||
              idDocuments.length === 0
            );
          } else if (documentType === 'nationalID') {
            return !nationalID || idDocuments.length === 0;
          }
          return true;
        case 1: // Certificates
          return (
            hasCertificates &&
            (!certificatesDetails || certificates.length === 0)
          );
        case 2: // CV
          return cvResume.length === 0 && sections[currentSection].required;
        case 3: // Proof of Address
          return (
            hasProofOfAddress &&
            (!form.watch('proofOfAddressType') ||
              !form.watch('proofOfAddressDate') ||
              proofOfAddress.length === 0)
          );
        default:
          return false;
      }
    }
    return false;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent className="space-y-6">
            <h2 className="mb-4 text-xl font-semibold">Documents</h2>

            {/* <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Section {currentSection + 1} of {sections.length}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(((currentSection + 1) / sections.length) * 100)}% complete
                </span>
              </div>
              <Progress value={((currentSection + 1) / sections.length) * 100} />
            </div> */}

            {renderCurrentSection()}
          </CardContent>
        </div>

        <div className="flex justify-between px-6 py-4">
          <Button type="button" variant="outline" onClick={handleBack}  className='bg-watney text-white hover:bg-watney/90'>
            Back
          </Button>

          <div className="space-x-2">
            {!sections[currentSection].required && (
              <Button type="button" variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSaveSection}
              disabled={isNextButtonDisabled()}
              className='bg-watney text-white hover:bg-watney/90'
            >
              {currentSection < sections.length - 1 ? 'Next' : 'Next'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
