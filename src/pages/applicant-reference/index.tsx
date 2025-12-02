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
import { Briefcase, User, MoveLeft, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import moment from 'moment';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReferencePdfDocument } from './components/ReferencePdfDocument';

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
      <div className={`flex items-center justify-between px-4 py-2 text-white bg-watney`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-lg font-medium">{title}</span>
        </div>
        
        {/* PDF Download Button - Only show if submitted */}
        {isSubmitted && referenceData && (
            <PDFDownloadLink
                document={
                    <ReferencePdfDocument
                        type={referenceType === 'ref3' ? 'personal' : 'professional'}
                        data={referenceData}
                        refereeData={refereeData}
                    />
                }
                fileName={`${referenceData.applicantName || 'Applicant'}_${referenceType}_Reference.pdf`}
            >
                {/* @ts-ignore */}
                {({ blob, url, loading, error }) => (
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        disabled={loading}
                        className="flex items-center gap-2 bg-white text-watney hover:bg-gray-100"
                    >
                        <Download className="h-4 w-4" />
                        {loading ? 'Generating...' : 'Download PDF'}
                    </Button>
                )}
            </PDFDownloadLink>
        )}
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

      {/* Reference Cards */}
      <div className="grid grid-cols-1 gap-6">
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
    {/* Referee Info */}
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

    {/* Referee Response */}
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
            <p className="mt-2 text-sm text-muted-foreground">
              The referee has not yet submitted their reference feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-y-3 md:grid-cols-2">
              <InfoRow label="Referee Name" value={referenceData?.refereeName} />
              <InfoRow label="Position" value={referenceData?.refereePosition} />
              <InfoRow label="Relationship to applicant" value={referenceData?.relationship} />
              <InfoRow
                label="How long have you known the applicant?"
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

            {referenceData?.reasonForLeaving && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Reason for leaving:
                </span>
                <p className="mt-1 rounded bg-muted/10 p-2">
                  {referenceData.reasonForLeaving}
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
              <div className="pt-2">
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  Please give your opinion of the applicant's suitability for the post applied for
                </span>
                <p className="rounded bg-muted/10 p-2 text-sm">
                  {referenceData.suitabilityOpinion}
                </p>
              </div>
            )}

            {referenceData?.refereeDate && (
              <InfoRow
                label="Date"
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
    <p className="mt-0.5 font-semibold text-sm">{value || 'N/A'}</p>
  </div>
);

const PersonalSection = ({
  data,
  toYesNo,
  getBadgeStyle,
  formatRating
}: any) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-2">
      <TraitItem
        label="Does the applicant suffer from any serious or recurring illness?"
        value={data.seriousIllness}
        toYesNo={toYesNo}
        getBadgeStyle={getBadgeStyle}
      />
      <TraitItem
        label="Was the applicant to your personal knowledge dependent upon drugs or medication?"
        value={data.drugsDependency}
        toYesNo={toYesNo}
        getBadgeStyle={getBadgeStyle}
      />
    </div>

    <div>
      <span className="text-sm font-medium text-muted-foreground block mb-2">
        From what you know of the applicant, would you consider them to be:
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {[
          'Reliable',
          'Punctual',
          'Trustworthy',
          'Approachable',
          'Tactful',
          'Discreet',
          'Self Motivated',
          'Able To Work Alone'
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
      <span className="text-sm font-medium text-muted-foreground block mb-2">
        Bearing in mind that the applicant will deal with a variety of situations, how would you rate their level of:
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {[
          { label: 'Competency', value: data.competency },
          { label: 'Common sense', value: data.commonSense }
        ]
          .filter((i) => i.value)
          .map((r) => (
            <div key={r.label} className="flex items-center justify-between  pb-1">
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

    {data.relatesWell && (
        <div className="flex flex-col gap-1">
             <span className="text-sm text-muted-foreground">
                Do you consider that the applicant relates well with / would relate well with service users in their care?
            </span>
            <div>
                 <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-sm text-blue-700"
                >
                    {formatRating(data.relatesWell)}
                </Badge>
            </div>
        </div>
    )}

    <div className="py-2 space-y-2">
      <span className="text-sm block">
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
        <span className="text-sm font-medium text-muted-foreground block mb-1">
          Would you like to make any other comments about the suitability of the applicant for this post?
        </span>
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
  <div className="space-y-4">
    <div className="mt-4">
      <span className="text-sm font-medium text-muted-foreground block mb-2">
        Applicant's general ability / Characteristics
      </span>
      <div className="grid grid-cols-1 gap-2">
        {[
          { label: 'Quality and organization of work', value: data.qualityOrganization },
          { label: 'Courteous and polite', value: data.courteousPolite },
          { label: 'Willingness to follow policies', value: data.willingnessFollowPolicies },
          { label: 'Integrity and trust', value: data.integrityTrust },
          {
            label: 'Attitude towards equal opportunities i.e. sex, race, religion, age',
            value: data.attitudeEqualOpportunities
          },
          { label: 'Emotional Control', value: data.emotionalControl },
          { label: 'Pro-active approach to work', value: data.proactiveApproach },
          { label: 'Respect to and from team', value: data.respectTeam },
          { label: 'Empathy towards service user / clients', value: data.empathyClients },
          { label: 'Attitudes towards criticism', value: data.attitudesCriticism },
          { label: 'Grooming and Appearance', value: data.groomingAppearance },
          { label: 'Attendance / Punctuality', value: data.attendancePunctuality }
        ]
          .filter((i) => i.value)
          .map((char) => (
            <div key={char.label} className="flex items-center justify-between border-b border-gray-100 pb-1 last:border-0">
              <span className="text-sm pr-4">{char.label}</span>
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-sm capitalize text-blue-700 whitespace-nowrap"
              >
                {formatRating(char.value)}
              </Badge>
            </div>
          ))}
      </div>
    </div>

    {data.unsuitableReason && (
      <div>
        <span className="text-sm font-medium text-muted-foreground block mb-1">
          Do you know any reason(s) why, including health, which would make this applicant unsuitable for employment?
        </span>
        <p className="mt-0.5 rounded bg-muted/10 p-2 text-sm">
          {data.unsuitableReason}
        </p>
      </div>
    )}

    <div className="border-t pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="flex items-center justify-between col-span-1 md:col-span-2">
          <span className="text-sm font-medium text-muted-foreground">Would you re-employ this applicant?</span>
          <Badge className={getBadgeStyle(data.wouldReemploy)}>
            {toYesNo(data.wouldReemploy)}
          </Badge>
        </div>
        {data.noReemployReason && (
          <div className="col-span-1 md:col-span-2">
            <span className="text-sm font-medium text-muted-foreground block mb-1">
                If 'No' please state the reason.
            </span>
            <p className="mt-0.5 rounded bg-muted/10 p-2 text-sm">
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
  <div className="flex items-center justify-between border-b border-gray-100 pb-1 last:border-0">
    <span className="text-sm pr-2">{label}</span>
    <Badge className={`${getBadgeStyle(value)} whitespace-nowrap`}>{toYesNo(value)}</Badge>
  </div>
);