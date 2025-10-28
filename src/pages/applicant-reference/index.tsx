import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, User, MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Separator } from '@/components/ui/separator';
import moment from 'moment';

// Interfaces remain unchanged
interface Reference {
  _id: string;
  referenceType: string;
  applicantId: string;
  applicantName: string;
  relationship: string;
  refereeName?: string;
  refereePosition?: string;
  howLongKnown?: string;
  employmentFrom?: string;
  employmentTill?: string;
  reasonLeaving?: string;
  suitabilityOpinion?: string;
  refereeDate?: string;

  // Personal reference fields
  seriousIllness?: boolean | string;
  drugsDependency?: boolean | string;
  reliable?: boolean | string;
  punctual?: boolean | string;
  trustworthy?: boolean | string;
  approachable?: boolean | string;
  tactful?: boolean | string;
  discreet?: boolean | string;
  selfMotivated?: boolean | string;
  ableToWorkAlone?: boolean | string;
  competency?: string;
  commonSense?: string;
  relatesWell?: string;
  cautionsConvictions?: boolean | string;
  additionalComments?: string;

  // Professional reference fields
  qualityOrganization?: string;
  courteousPolite?: string;
  willingnessFollowPolicies?: string;
  integrityTrust?: string;
  attitudeEqualOpportunities?: string;
  emotionalControl?: string;
  proactiveApproach?: string;
  respectTeam?: string;
  empathyClients?: string;
  attitudesCriticism?: string;
  groomingAppearance?: string;
  attendancePunctuality?: string;
  unsuitableReason?: string;
  wouldReemploy?: boolean | string;
  noReemployReason?: string;

  [key: string]: any;
}

interface UserData {
  name?: string;
  ref1Submit?: boolean;
  ref2Submit?: boolean;
  ref3Submit?: boolean;
  personalReferee?: {
    name?: string;
    position?: string;
    relationship?: string;
    organisation?: string;
    address?: string;
    tel?: string;
    fax?: string;
    email?: string;
    [key: string]: any;
  };
  professionalReferee1?: {
    name?: string;
    position?: string;
    relationship?: string;
    organisation?: string;
    address?: string;
    tel?: string;
    fax?: string;
    email?: string;
    [key: string]: any;
  };
  professionalReferee2?: {
    name?: string;
    position?: string;
    relationship?: string;
    organisation?: string;
    address?: string;
    tel?: string;
    fax?: string;
    email?: string;
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
  data: Reference | null;
  refereeData:
    | UserData['personalReferee']
    | UserData['professionalReferee1']
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
  const { userId } = useParams();
  const navigate = useNavigate();

  const fetchAllReferences = async () => {
    setLoading(true);
    try {
      const [userRes, referenceRes] = await Promise.all([
        axiosInstance.get(
          `/users/${userId}?fields=ref1Submit,ref2Submit,ref3Submit,personalReferee,professionalReferee1,professionalReferee2,firstName,title,initial,lastName,name`
        ),
        axiosInstance.get(`/reference?applicantId=${userId}`)
      ]);
      setUserData(userRes.data.data);
      setReferences(referenceRes.data.data?.result || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReference = (type: string) =>
    references.find((ref) => ref.referenceType === type);

  const ref1 = getReference('ref1');
  const ref2 = getReference('ref2');
  const ref3 = getReference('ref3');

  const toYesNo = (value: any) => {
    if (value === true || value === 'yes') return 'Yes';
    if (value === false || value === 'no') return 'No';
    return 'N/A';
  };

  const getBadgeStyle = (value: any) => {
    if (value === true || value === 'yes') return 'bg-green-100 text-green-800';
    if (value === false || value === 'no') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatRating = (value: string | null | undefined) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    if (userId) fetchAllReferences();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  // Helper to render a reference card
  const renderReferenceCard = (
    title: string,
    icon: React.ReactNode,
    status: string,
    isSubmitted: boolean,
    refereeName: string,
    refereeData: any,
    referenceData: Reference | null,
    referenceType: 'ref1' | 'ref2' | 'ref3'
  ) => (
    <Card className="w-full overflow-hidden rounded-none">
      <div
        className={`flex items-center justify-between px-4 py-2 text-white bg-watney`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-lg font-medium">{title}</span>
        </div>
        {/* <Badge variant="secondary" className="text-sm">
          {isSubmitted ? 'Submitted' : 'Pending Response'}
        </Badge> */}
      </div>

      <CardContent className="pb-4 pt-4">
        <ReferenceContent
          refereeData={refereeData}
          referenceData={referenceData}
          referenceType={referenceType}
          toYesNo={toYesNo}
          getBadgeStyle={getBadgeStyle}
          formatRating={formatRating}
          formatDate={formatDate}
          userData={userData}
          isSubmitted={isSubmitted}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            References for {userData?.title} {userData?.firstName}{' '}
            {userData?.initial} {userData?.lastName}
          </h1>
        </div>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate(-1)}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Reference Cards - Always show all references provided by applicant */}
      <div className="grid grid-cols-1 gap-6">
        {/* Professional Reference 1 - Always show if referee data exists */}
        {userData.professionalReferee1 && renderReferenceCard(
          'Professional Reference 1',
          <Briefcase className="h-3.5 w-3.5" />,
          'Submitted',
          !!userData.ref1Submit,
          ref1?.refereeName || userData.professionalReferee1?.name || 'N/A',
          userData.professionalReferee1,
          ref1,
          'ref1'
        )}


        {/* Professional Reference 2 - Always show if referee data exists */}
        {userData.professionalReferee2 && renderReferenceCard(
          'Professional Reference 2',
          <Briefcase className="h-3.5 w-3.5" />,
          'Submitted',
          !!userData.ref2Submit,
          ref2?.refereeName || userData.professionalReferee2?.name || 'N/A',
          userData.professionalReferee2,
          ref2,
          'ref2'
        )}
        {/* Personal Reference - Always show if referee data exists */}
        {userData.personalReferee && renderReferenceCard(
          'Personal Reference',
          <User className="h-3.5 w-3.5" />,
          'Submitted',
          !!userData.ref3Submit,
          ref3?.refereeName || userData.personalReferee?.name || 'N/A',
          userData.personalReferee,
          ref3,
          'ref3'
        )}

        {/* Show fallback if no references are provided at all */}
        {!userData.professionalReferee1 && !userData.personalReferee && !userData.professionalReferee2 && (
          <Card className="w-full bg-transparent shadow-none">
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground">
                No references provided by applicant yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Updated Reference Content Component to handle both submitted and pending states
const ReferenceContent = ({
  refereeData,
  referenceData,
  referenceType,
  toYesNo,
  getBadgeStyle,
  formatRating,
  formatDate,
  isSubmitted
}: any) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {/* Referee Info (Provided by Applicant) - Always show this */}
    <Card className="border border-gray-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Referee Information</CardTitle>
        <CardDescription>Provided by applicant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-y-3 md:grid-cols-2">
          <InfoRow label="Name" value={refereeData?.name} />
          <InfoRow label="Position" value={refereeData?.position} />
          <InfoRow label="Relationship" value={refereeData?.relationship} />
          <InfoRow label="Organization" value={refereeData?.organisation} />
          <InfoRow label="Telephone" value={refereeData?.tel} />
          <InfoRow label="Email" value={refereeData?.email} />
          {refereeData?.address && (
            <div className="md:col-span-2">
              <span className="text-sm font-medium text-muted-foreground">Address</span>
              <p className="mt-1 font-semibold">{refereeData.address}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Referee Response - Conditionally show based on submission status */}
    <Card className="border border-gray-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Response from {referenceData?.refereeName || refereeData?.name || 'Referee'}
        </CardTitle>
        <CardDescription>
          {isSubmitted ? 'Submitted reference' : 'Awaiting response from referee'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSubmitted ? (
          <div className="py-6 text-center">
            <div className="mb-4 text-watney">
              <Briefcase className="mx-auto h-12 w-12" />
            </div>
            {/* <p className="text-lg font-medium text-muted-foreground">
              Waiting for referee response
            </p> */}
            <p className="mt-2 text-sm text-muted-foreground">
              The referee has not yet submitted their reference feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-y-3 md:grid-cols-2">
              <InfoRow label="Referee Name" value={referenceData?.refereeName} />
              <InfoRow label="Position" value={referenceData?.refereePosition} />
              <InfoRow label="Relationship" value={referenceData?.relationship} />
              <InfoRow
                label="How Long Known"
                value={referenceData?.howLongKnown}
              />
              {(referenceType === 'ref1' || referenceType === 'ref2') && (
                <>
                  <InfoRow
                    label="Employment From"
                    value={formatDate(referenceData?.employmentFrom)}
                  />
                  <InfoRow
                    label="Employment Till"
                    value={formatDate(referenceData?.employmentTill)}
                  />
                </>
              )}
            </div>

            {referenceData?.reasonLeaving && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Reason for Leaving
                </span>
                <p className="mt-1 rounded bg-muted/10 p-2">
                  {referenceData.reasonLeaving}
                </p>
              </div>
            )}

            {referenceType === 'ref3' && (
              <PersonalSection
                data={referenceData}
                toYesNo={toYesNo}
                getBadgeStyle={getBadgeStyle}
                formatRating={formatRating}
              />
            )}

            {(referenceType === 'ref1' || referenceType === 'ref2') && (
              <ProfessionalSection
                data={referenceData}
                toYesNo={toYesNo}
                getBadgeStyle={getBadgeStyle}
                formatRating={formatRating}
              />
            )}

            {referenceData?.suitabilityOpinion && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Suitability Opinion</span>
                <p className="mt-1 rounded bg-muted/10 p-2">
                  {referenceData.suitabilityOpinion}
                </p>
              </div>
            )}

            {referenceData?.refereeDate && (
              <InfoRow
                label="Reference Date"
                value={formatDate(referenceData.refereeDate)}
              />
            )}

            {referenceData?.createdAt && (
              <div className="pt-2 text-right text-sm text-muted-foreground">
                Submitted on: {moment(referenceData.createdAt).format('DD MMM YYYY')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

const InfoRow = ({
  label,
  value
}: {
  label: string;
  value?: string | null;
}) => (
  <div>
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <p className="mt-0.5 font-semibold">{value || 'N/A'}</p>
  </div>
);

const PersonalSection = ({
  data,
  toYesNo,
  getBadgeStyle,
  formatRating
}: any) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <TraitItem
        label="Serious Illness"
        value={data.seriousIllness}
        toYesNo={toYesNo}
        getBadgeStyle={getBadgeStyle}
      />
      <TraitItem
        label="Drug Dependency"
        value={data.drugsDependency}
        toYesNo={toYesNo}
        getBadgeStyle={getBadgeStyle}
      />
    </div>

    <div>
      <span className="text-sm font-medium text-muted-foreground">Personal Traits</span>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {[
          'Reliable',
          'Punctual',
          'Trustworthy',
          'Approachable',
          'Tactful',
          'Discreet',
          'Self Motivated',
          'Able to Work Alone'
        ].map((label) => (
          <TraitItem
            key={label}
            label={label}
            value={
              data[
                label.replace(/\s+/g, '').charAt(0).toLowerCase() +
                  label.replace(/\s+/g, '').slice(1)
              ]
            }
            toYesNo={toYesNo}
            getBadgeStyle={getBadgeStyle}
          />
        ))}
      </div>
    </div>

    <div>
      <span className="text-sm font-medium text-muted-foreground">Ratings</span>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {[
          { label: 'Competency', value: data.competency },
          { label: 'Common Sense', value: data.commonSense },
          { label: 'Relates Well', value: data.relatesWell }
        ]
          .filter((i) => i.value)
          .map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-sm">{r.label}</span>
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-sm text-blue-700"
              >
                {formatRating(r.value)}
              </Badge>
            </div>
          ))}
      </div>
    </div>

    <div className="flex items-center justify-between py-2">
      <span className="text-sm">
        This position is exempted from the Rehabilitation of Offenders Act 1974,
        and any convictions must be declared. Are you aware of any cautions,
        convictions or pending prosecutions held by the applicant?
      </span>
      <Badge className={getBadgeStyle(data.cautionsConvictions)}>
        {toYesNo(data.cautionsConvictions)}
      </Badge>
    </div>

    {data.additionalComments && (
      <div>
        <span className="text-sm font-medium text-muted-foreground">Additional Comments</span>
        <p className="mt-0.5 rounded bg-muted/10 p-2 text-sm">
          {data.additionalComments}
        </p>
      </div>
    )}
  </div>
);

const ProfessionalSection = ({
  data,
  toYesNo,
  getBadgeStyle,
  formatRating
}: any) => (
  <div className="space-y-2">
    <div className="mt-4">
      <span className="text-sm font-medium text-muted-foreground">Professional Characteristics</span>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {[
          { label: 'Quality of Work', value: data.qualityOrganization },
          { label: 'Courteous & Polite', value: data.courteousPolite },
          { label: 'Follows Policies', value: data.willingnessFollowPolicies },
          { label: 'Integrity & Trust', value: data.integrityTrust },
          {
            label: 'Equal Opportunities',
            value: data.attitudeEqualOpportunities
          },
          { label: 'Emotional Control', value: data.emotionalControl },
          { label: 'Proactive Approach', value: data.proactiveApproach },
          { label: 'Respect Team', value: data.respectTeam },
          { label: 'Empathy Clients', value: data.empathyClients },
          { label: 'Attitude Criticism', value: data.attitudesCriticism },
          { label: 'Grooming Appearance', value: data.groomingAppearance },
          { label: 'Attendance Punctuality', value: data.attendancePunctuality }
        ]
          .filter((i) => i.value)
          .map((char) => (
            <div key={char.label} className="flex items-center justify-between">
              <span className="text-sm">{char.label}</span>
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-sm capitalize text-blue-700"
              >
                {formatRating(char.value)}
              </Badge>
            </div>
          ))}
      </div>
    </div>

    {data.unsuitableReason && (
      <div>
        <span className="text-sm font-medium text-muted-foreground">Unsuitable Reasons</span>
        <p className="mt-0.5 rounded bg-muted/50 p-2 text-sm">
          {data.unsuitableReason}
        </p>
      </div>
    )}

    <div>
      <span className="text-sm font-medium text-muted-foreground">Re-employment</span>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Would Re-employ</span>
          <Badge className={getBadgeStyle(data.wouldReemploy)}>
            {toYesNo(data.wouldReemploy)}
          </Badge>
        </div>
        {data.noReemployReason && (
          <div className="col-span-2">
            <span className="text-sm font-medium text-muted-foreground">Reason</span>
            <p className="mt-0.5 rounded bg-muted/50 p-2 text-sm">
              {data.noReemployReason}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const TraitItem = ({
  label,
  value,
  toYesNo,
  getBadgeStyle
}: {
  label: string;
  value: any;
  toYesNo: any;
  getBadgeStyle: any;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <Badge className={getBadgeStyle(value)}>{toYesNo(value)}</Badge>
  </div>
);