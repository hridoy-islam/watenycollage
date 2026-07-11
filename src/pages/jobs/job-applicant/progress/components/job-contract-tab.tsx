import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pen, Download } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { JobContractPdf } from './job-contract-pdf';

interface JobContract {
  _id: string;
  userId: string;
  contractContent?: string;
  signatureUrl?: string;
  createdAt?: string;
}

interface Props {
  userId: string;
}

export function JobContractTab({ userId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JobContract | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/job-contracts?userId=${userId}`);
        const result = res.data?.data?.result?.[0];
        setData(result || null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

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
      <div className="flex justify-center py-10">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Job Contract Not Submitted</h3>
          <p className="mt-1 text-sm text-gray-500">The applicant has not yet submitted their job contract.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Job Contract</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Submitted</Badge>
            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/recruitment/admin/job-contract/${userId}/edit`)}>
              <Pen className="mr-1 h-3 w-3" /> Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
    

        <div className="flex  pt-2">
          <PDFDownloadLink
            document={<JobContractPdf contractContent={data.contractContent || ''} signatureUrl={data.signatureUrl} createdAt={data.createdAt} />}
            fileName={`job-contract-${(data.userId as any)?.name}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <Button size="lg" className="bg-watney text-white hover:bg-watney/90" disabled={pdfLoading}>
                <Download className="mr-1 h-3 w-3" /> Download PDF
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </CardContent>
    </Card>
  );
}
