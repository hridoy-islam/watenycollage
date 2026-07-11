import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MoveLeft,
  Loader2,
  Pencil
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import SignatureCanvas from 'react-signature-canvas';
import { format } from 'date-fns';

export default function JobContractForm() {
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [contractType, setContractType] = useState<any>(null);

  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureError, setSignatureError] = useState('');
  const signatureRef = useRef<SignatureCanvas>(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const todayDate = format(new Date(), 'dd/MM/yyyy');

  const applicant = useMemo(() => userData || {}, [userData]);

  const variablesMap = useMemo(() => {
    const job = userData?.jobId || {};
    return {
      todayDate,
      name: `${applicant.firstName || ''} ${applicant.initial || ''} ${applicant.lastName || ''}`.trim(),
      jobTitle: job.jobTitle || '',
      applicationDate: applicant.createdAt ? format(new Date(applicant.createdAt), 'dd/MM/yyyy') : '',
      title: applicant.title || '',
      firstName: applicant.firstName || '',
      lastName: applicant.lastName || '',
      dateOfBirth: applicant.dateOfBirth ? format(new Date(applicant.dateOfBirth), 'dd/MM/yyyy') : '',
      email: applicant.email || '',
      phone: applicant.phone || '',
      nationality: applicant.nationality || '',
      countryOfResidence: applicant.countryOfResidence || '',
      postalAddressLine1: applicant.postalAddressLine1 || '',
      postalCity: applicant.postalCity || '',
      postalPostCode: applicant.postalPostCode || '',
      postalCountry: applicant.postalCountry || '',
      availableFromDate: applicant.availableFromDate ? format(new Date(applicant.availableFromDate), 'dd/MM/yyyy') : '',
      admin: 'Everycare Romford',
      adminEmail: 'admin@everycareromford.co.uk',
      userSignature: '',
    };
  }, [applicant, todayDate]);

  const replacedBody = useMemo(() => {
    if (!contractType?.body) return '';
    let text = contractType.body;
    Object.entries(variablesMap).forEach(([key, value]) => {
      text = text.replace(new RegExp(`\\[${key}\\]`, 'g'), String(value));
    });
    return text;
  }, [contractType, variablesMap]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userStatusRes, appJobRes] = await Promise.all([
        axiosInstance.get(`/users/${id}`),
        axiosInstance.get(`/application-job?applicantId=${id}`)
      ]);

      const userStatus = userStatusRes.data?.data;
      const appJob = appJobRes.data?.data?.result?.[0];

      setIsAlreadySubmitted(userStatus.jobContractDone);
      setUserData({ ...userStatus, jobId: appJob?.jobId || null });

      if (userStatus.contractTypeId) {
        const ctRes = await axiosInstance.get(`/contract-type/${userStatus.contractTypeId}`);
        setContractType(ctRes.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSignature = async () => {
    if (!signatureRef.current) return;
    const dataUrl = signatureRef.current.toDataURL();
    if (!dataUrl) return;
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('entityId', id || '');
    formData.append('file_type', 'careerDoc');
    formData.append('file', file);
    setSignatureSaving(true);
    try {
      const response = await axiosInstance.post('/documents', formData);
      if (response.status === 200) {
        const url = response.data?.data?.fileUrl || response.data?.data?.url || response.data?.url;
        if (url) {
          setSignatureUrl(url);
          setShowSignaturePad(false);
        }
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
    } finally {
      setSignatureSaving(false);
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const onSubmit = async () => {
    setSignatureError('');
    if (!signatureUrl) {
      setSignatureError('Signature is required');
      return;
    }
    setSubmitting(true);
    try {
      const finalContent = replacedBody;
      const payload: any = {
        userId: id,
        contractTypeId: contractType?._id,
        contractContent: finalContent,
      };
      if (signatureUrl) {
        payload.signatureUrl = signatureUrl;
      }
      await axiosInstance.post('/job-contracts', payload);
      await axiosInstance.patch(`/users/${id}`, { jobContractDone: true });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting job contract:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const centerParts = text.split(/(<center>|<\/center>)/g);
    const allElements: JSX.Element[] = [];
    let isCentered = false;
    let centerIndex = 0;

    centerParts.forEach((part) => {
      if (part === '<center>') { isCentered = true; return; }
      if (part === '</center>') { isCentered = false; centerIndex++; return; }
      if (!part.trim()) return;

      const lines = part.split('\n');
      const localElements: JSX.Element[] = [];

      lines.forEach((line, i) => {
        if (i > 0) localElements.push(<br key={`nl-${i}`} />);

        const headerMatch = line.match(/^<header>(.*)<\/header>$/);
        const subtitleMatch = line.match(/^<subtitle>(.*)<\/subtitle>$/);

        if (headerMatch) {
          const inner = headerMatch[1];
          const innerEls: JSX.Element[] = [];
          let lastIdx = 0;
          const tagRx = /<(b|i)>(.*?)<\/\1>/g;
          let m;
          while ((m = tagRx.exec(inner)) !== null) {
            if (m.index > lastIdx) innerEls.push(<span key={`h-${i}-${lastIdx}`}>{inner.slice(lastIdx, m.index)}</span>);
            const T = m[1] === 'b' ? 'strong' : 'em';
            innerEls.push(<T key={`h-${i}-${m.index}`}>{m[2]}</T>);
            lastIdx = m.index + m[0].length;
          }
          if (lastIdx < inner.length) innerEls.push(<span key={`h-${i}-${lastIdx}`}>{inner.slice(lastIdx)}</span>);
          localElements.push(<div key={`header-${i}`} style={{ fontWeight: 'bold', fontSize: '18px', margin: '8px 0' }}>{innerEls}</div>);
          return;
        }

        if (subtitleMatch) {
          const inner = subtitleMatch[1];
          const innerEls: JSX.Element[] = [];
          let lastIdx = 0;
          const tagRx = /<(b|i)>(.*?)<\/\1>/g;
          let m;
          while ((m = tagRx.exec(inner)) !== null) {
            if (m.index > lastIdx) innerEls.push(<span key={`s-${i}-${lastIdx}`}>{inner.slice(lastIdx, m.index)}</span>);
            const T = m[1] === 'b' ? 'strong' : 'em';
            innerEls.push(<T key={`s-${i}-${m.index}`}>{m[2]}</T>);
            lastIdx = m.index + m[0].length;
          }
          if (lastIdx < inner.length) innerEls.push(<span key={`s-${i}-${lastIdx}`}>{inner.slice(lastIdx)}</span>);
          localElements.push(<div key={`subtitle-${i}`} style={{ fontSize: '15px', margin: '6px 0' }}>{innerEls}</div>);
          return;
        }

        const brParts = line.split(/(<br\s*\/?>)/g);
        brParts.forEach((seg, j) => {
          if (/<br\s*\/?>/.test(seg)) {
            localElements.push(<br key={`br-${i}-${j}`} />);
            return;
          }
          let lastIndex = 0;
          const tagRegex = /<(b|i)>(.*?)<\/\1>/g;
          let match;
          while ((match = tagRegex.exec(seg)) !== null) {
            if (match.index > lastIndex) {
              localElements.push(<span key={`t-${i}-${j}-${lastIndex}`}>{seg.slice(lastIndex, match.index)}</span>);
            }
            const Tag = match[1] === 'b' ? 'strong' : 'em';
            localElements.push(<Tag key={`tag-${i}-${j}-${match.index}`}>{match[2]}</Tag>);
            lastIndex = match.index + match[0].length;
          }
          if (lastIndex < seg.length) {
            localElements.push(<span key={`t-${i}-${j}-${lastIndex}`}>{seg.slice(lastIndex)}</span>);
          }
        });
      });

      if (isCentered) {
        allElements.push(<div key={`center-${centerIndex}`} style={{ textAlign: 'center' }}>{localElements}</div>);
      } else {
        allElements.push(...localElements);
      }
    });

    return allElements;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (!contractType) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-lg border-t-4 border-t-yellow-500 p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-2xl text-yellow-600">No Contract Type Assigned</CardTitle>
          <CardDescription className="mb-6 text-base">
            An admin needs to unlock a contract type before you can sign your job contract.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  if (isAlreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-3xl border-t-4 border-t-red-500 p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-red-500">Form Already Submitted</CardTitle>
          <CardDescription className="mb-6">You have already completed the Job Contract.</CardDescription>
          <Button className="mx-auto" onClick={() => navigate(-1)}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-3xl border-t-4 border-t-watney p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-watney">Thank You!</CardTitle>
          <CardDescription className="mb-6 text-2xl text-black">
            The Job Contract has been successfully completed.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate(-1)}>Done</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center">
      <div className="w-full">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-watney">
              <div className="flex flex-row items-center justify-between">
                <div>Job Contract</div>
                <Button
                  className="border-none bg-watney text-white hover:bg-watney/90"
                  onClick={() => navigate(-1)}
                >
                  <MoveLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Please review the contract below and provide your signature.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 md:p-8 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 md:p-6">
              <div className="text-sm text-gray-700 leading-relaxed">
                {renderFormattedText(replacedBody)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium">
                Signature <span className="text-red-500">*</span>
              </label>

              {signatureUrl && !showSignaturePad ? (
                <div className="flex flex-col items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 max-w-sm">
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    className="h-16 rounded border border-gray-300 bg-white object-contain"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setShowSignaturePad(true);
                        setTimeout(() => signatureRef.current?.clear(), 100);
                      }}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> Update Signature
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-300 bg-white max-w-sm">
                    <SignatureCanvas
                      ref={signatureRef}
                      penColor="black"
                      canvasProps={{
                        width: 400,
                        height: 120,
                        className: 'rounded-lg signature-canvas w-full max-w-sm',
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearSignature}
                      disabled={signatureSaving}
                    >
                      Clear
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveSignature}
                      disabled={signatureSaving}
                      className="bg-watney text-white hover:bg-watney/90"
                    >
                      {signatureSaving ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Signature'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {signatureError && (
                <p className="text-sm text-red-500">{signatureError}</p>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-6">
              <Button
                type="button"
                size="lg"
                disabled={submitting || signatureSaving}
                onClick={onSubmit}
                className="h-12 w-full min-w-[200px] bg-watney text-base text-white hover:bg-watney/90 md:w-auto"
              >
                {submitting ? 'Saving...' : 'Submit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
