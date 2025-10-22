import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Briefcase, Eye, MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Define TypeScript interfaces
interface Reference {
  _id: string;
  referenceType: string;
  applicantId: string;
  applicantName: string;
  relationship: string;
  refereeName?: string;
  [key: string]: any;
}

interface UserData {
  name?: string;
  ref1Submit?: boolean;
  ref2Submit?: boolean;
  ref3Submit?: boolean;
  personalReferee?: {
    name?: string;
    relationship?: string;
    [key: string]: any;
  };
  professionalReferee2?: {
    name?: string;
    relationship?: string;
    [key: string]: any;
  };
  firstName?: string;
  title?: string;
  initial?: string;
  lastName?: string;
}

interface ReferenceListItem {
  type: string;
  referenceType: string;
  status: string;
  data:
    | Reference
    | UserData['personalReferee']
    | UserData['professionalReferee2']
    | null;
  isSubmitted: boolean;
  refereeName: string;
  _id?: string;
}

export default function ApplicantReferencePage() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({});
  const { id, userId } = useParams();
  const navigate = useNavigate();

  const fetchAllReferences = async () => {
    setLoading(true);
    try {
      // Parallel API calls using Promise.all
      const [userRes, referenceRes] = await Promise.all([
        axiosInstance.get(
          `/users/${userId}?fields=ref1Submit,ref2Submit,ref3Submit,personalReferee,professionalReferee2,firstName,title,initial,lastName,name`
        ),
        axiosInstance.get(`/reference?applicantId=${userId}`)
      ]);

      // Handle user data and references
      setUserData(userRes.data.data);
      setReferences(referenceRes.data.data?.result || []);
    } catch (error) {
      console.error('Error fetching applications or job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferenceList = (): ReferenceListItem[] => {
    const referenceList: ReferenceListItem[] = [];

    // Reference 1 (Professional)
    const ref1 = references.find((ref) => ref.referenceType === 'ref1');
    referenceList.push({
      type: 'Professional Reference 1',
      referenceType: 'ref1',
      status: userData.ref1Submit ? 'Submitted' : 'Pending',
      data: ref1 || null,
      isSubmitted: !!userData.ref1Submit,
      refereeName:
        ref1?.refereeName || userData.professionalReferee2?.name || 'N/A',
      _id: ref1?._id
    });

    // Reference 2 (Professional)
    const ref2 = references.find((ref) => ref.referenceType === 'ref2');

    referenceList.push({
      type: 'Professional Reference 2',
      referenceType: 'ref2',
      status: userData.ref2Submit ? 'Submitted' : 'Pending',
      data: userData.professionalReferee2 || null,
      isSubmitted: !!userData.ref2Submit,
      refereeName: userData.professionalReferee2?.name || 'N/A',
      _id: ref2?._id
    });

    // Reference 3 (Personal)
    const ref3 = references.find((ref) => ref.referenceType === 'ref3');
    referenceList.push({
      type: 'Personal Reference',
      referenceType: 'ref3',
      status: userData.ref3Submit ? 'Submitted' : 'Pending',
      data: ref3 || userData.personalReferee || null,
      isSubmitted: !!userData.ref3Submit,
      refereeName: ref3?.refereeName || userData.personalReferee?.name || 'N/A',
      _id: ref3?._id
    });

    return referenceList;
  };

  const handleViewReference = (reference: ReferenceListItem) => {
    if (!reference.isSubmitted) {
      return;
    }

    navigate(
      `/dashboard/user/${userId}/reference/${reference._id}/${reference.referenceType}`
    );
  };

  const getRelationship = (reference: ReferenceListItem): string => {
    if (!reference.data) return 'N/A';

    // Type guard to check if it's a Reference object
    const isReference = (data: any): data is Reference => {
      return data && typeof data === 'object' && 'relationship' in data;
    };

    if (isReference(reference.data)) {
      return reference.data.relationship || 'N/A';
    }

    // For professionalReferee2 or personalReferee objects
    return (reference.data as any)?.relationship || 'N/A';
  };

  useEffect(() => {
    if (userId) {
      fetchAllReferences();
    }
  }, [userId]);

  const referenceList = getReferenceList();

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h2 className="text-2xl font-bold">
            References for {userData.title||''} {userData.firstName||''} {userData.initial||''} {userData.lastName||''}
          </h2>
        </div>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate(-1)}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* References Table */}
      <div className="rounded-md bg-white p-6 shadow-2xl">
        {loading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference Type</TableHead>
                <TableHead>Referee Name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referenceList.map((reference, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      {reference.type}
                    </div>
                  </TableCell>
                  <TableCell>{reference.refereeName}</TableCell>
                  <TableCell>{getRelationship(reference)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={reference.isSubmitted ? 'default' : 'secondary'}
                      className={
                        reference.isSubmitted
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      }
                    >
                      {reference.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() => handleViewReference(reference)}
                              disabled={!reference.isSubmitted}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {reference.isSubmitted
                                ? `View ${reference.type} Details`
                                : `${reference.type} Not Submitted`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
