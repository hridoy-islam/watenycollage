import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, User, ClipboardCheck, FileText, Heart, Activity, TrendingUp, Settings, PenTool, MoveLeft, Pen } from 'lucide-react';
import moment from 'moment';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface AssessmentData {
  [key: string]: any;
}

interface UserData {
  _id: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  serviceuserAssessmentId?: string;
  [key: string]: any;
}

// Safely extract name from user objects (completedBy, lastReviewedBy)
function getUserName(user: any): string | undefined {
  if (!user) return undefined;
  if (typeof user === 'object' && user.name) return user.name;
  return String(user);
}

// Formatter for short-form inline fields, handling undefined issues safely
function formatVal(v: any): string {
  if (v === undefined || v === null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.length > 0 ? v.filter(Boolean).join(', ') : '—';
  if (typeof v === 'object') {
    // If it's an unhandled object, try to extract name, else stringify
    if (v.name) return String(v.name);
    return JSON.stringify(v);
  }
  return String(v);
}

function formatDate(v: any): string {
  if (!v) return '—';
  return moment(v as string).format('DD/MM/YYYY');
}

// ---------------------------------------------
// Component: Standard Horizontal Field Row
// ---------------------------------------------
function FieldRow({ label, value, isSignature = false }: { label: string; value: any; isSignature?: boolean }) {
  const isEmpty = value === undefined || value === null || value === '';

  let displayContent: React.ReactNode = formatVal(value);

  // Signature rendering logic
  if (isSignature) {
    if (!isEmpty && typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:image'))) {
      displayContent = <img src={value} alt={`${label} Signature`} className="max-h-16 object-contain" />;
    } else if (value === true) {
      displayContent = '✓ Signed';
    } else if (isEmpty || value === false) {
      displayContent = 'Not Signed';
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 px-5 hover:bg-gray-50/50 transition-colors border-b border-gray-200 last:border-b-0 rounded-none">
      <dt className="text-sm font-medium text-gray-500 min-w-[200px] flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">
        {displayContent}
      </dd>
    </div>
  );
}

// ---------------------------------------------
// Component: Vertical Block for Large Text/Arrays
// ---------------------------------------------
function ContentBlock({ label, value, isList = false }: { label: string; value: any; isList?: boolean }) {
  const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

  return (
    <div className="flex flex-col gap-2 py-4 px-5 hover:bg-gray-50/50 transition-colors border-b border-gray-200 last:border-b-0 rounded-none">
      <dt className="text-sm font-semibold text-gray-700">{label}</dt>
      <dd className="text-sm text-gray-900 leading-relaxed">
        {isEmpty ? (
          <span className="text-gray-400 italic">—</span>
        ) : isList && Array.isArray(value) ? (
          <ul className="space-y-2 mt-1">
            {value.filter(Boolean).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 bg-watney mt-2 flex-shrink-0 rounded-none" />
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-wrap">{String(value)}</p>
        )}
      </dd>
    </div>
  );
}

// ---------------------------------------------
// Component: Section Card Wrapper
// ---------------------------------------------
function SectionCard({ title, icon: Icon, children, className = '' }: { title: string; icon?: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-fit rounded-lg ${className}`}>
      <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50/30 rounded-t-lg">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-watney" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-0 pb-0">
        <dl className="flex flex-col m-0">{children}</dl>
      </CardContent>
    </Card>
  );
}

function ContactGroup({ data, prefix, label }: { data: AssessmentData; prefix: string; label: string }) {
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full rounded-lg">
      <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50/30 rounded-t-lg">
        <CardTitle className="text-sm font-semibold text-gray-800">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-0 pb-0">
        <dl className="flex flex-col m-0">
          <FieldRow label="Name" value={data[`${prefix}Name`]} />
          <FieldRow label="Address" value={data[`${prefix}Address`]} />
          <FieldRow label="Telephone" value={data[`${prefix}Telephone`]} />
        </dl>
      </CardContent>
    </Card>
  );
}

const CONTACT_GROUPS = [
  { prefix: 'socialWorker', label: 'Social Worker (Care Manager)' },
  { prefix: 'generalPractitioner', label: 'General Practitioner' },
  { prefix: 'hospitalConsultants', label: 'Hospital Consultants' },
  { prefix: 'pharmacist', label: 'Pharmacist' },
  { prefix: 'communityNurse', label: 'Community Nurse' },
  { prefix: 'nextOfKin1', label: 'Next of Kin (1)' },
  { prefix: 'nextOfKin2', label: 'Next of Kin (2)' },
  { prefix: 'keyHolder', label: 'Key Holder — Relationship' },
  { prefix: 'otherAgency', label: 'Other Agency Providing Services' },
];

const MAINTENANCE_OUTCOMES = [
  { title: 'Desired Outcome: My basic physical needs are being met', prefix: 'physicalNeeds', hasExtra: false, helpLabel: 'How you can help me with my physical health', riskLabel: 'What are the identified risks?' },
  { title: 'Desired Outcome: Being clean and presentable in appearance', prefix: 'cleanPresentable', hasExtra: false, helpLabel: 'How you can help me being clean and presentable in appearance', riskLabel: 'What (if any) are the identified risks?' },
  { title: 'Desired Outcome: Having appropriate food and drink at appropriate times', prefix: 'foodAndDrink', hasExtra: true, helpLabel: 'How you can help me with eating and drinking', riskLabel: 'What (if any) are the identified risks?' },
  { title: 'Desired Outcome: Being physically comfortable', prefix: 'physicallyComfortable', hasExtra: false, helpLabel: 'How you can help me being physically comfortable', riskLabel: 'What (if any) are the identified risks?' },
  { title: 'Desired Outcome: Ensuring personal safety and security', prefix: 'personalSafety', hasExtra: false, helpLabel: 'How you can help me with my feel safe and secure', riskLabel: 'What (if any) are the identified risks?' },
  { title: 'Desired Outcome: Having a clean and tidy home environment', prefix: 'cleanTidyHome', hasExtra: false, helpLabel: 'How you can help me have a clean and tidy home environment', riskLabel: 'What (if any) are the identified risks?' },
  { title: 'Desired Outcome: Keeping alert and active', prefix: 'alertAndActive', hasExtra: false, helpLabel: 'How you can help me keep alert and active', riskLabel: 'What (if any) are the identified risks?' },
  { title: 'Desired Outcome: Having social contact & company including opportunities to contribute as well as receive help', prefix: 'socialContact', hasExtra: false, helpLabel: 'How you can help me have contact and company', riskLabel: 'What (if any) are the identified risks?' },
  { title: 'Desired Outcome: Having control over daily routines', prefix: 'dailyRoutines', hasExtra: false, helpLabel: 'How you can help me have control over daily routines', riskLabel: 'What (if any) are the identified risks?' },
];

function maintenanceFields(outcome: typeof MAINTENANCE_OUTCOMES[0]) {
  const base = [
    { key: `${outcome.prefix}CanDo`, label: 'What I can still do for myself' },
    { key: `${outcome.prefix}FindDifficult`, label: 'What I find difficult' },
    { key: `${outcome.prefix}Help`, label: outcome.helpLabel },
    { key: `${outcome.prefix}Risks`, label: outcome.riskLabel },
  ];
  if (outcome.hasExtra) {
    base.splice(2, 0,
      { key: `${outcome.prefix}ThingsIEnjoy`, label: 'Things I enjoy' },
      { key: `${outcome.prefix}ThingsIDoNotLike`, label: 'Things I do not like' },
      { key: `${outcome.prefix}HowAndWhereIPreferToEat`, label: 'This is how and where I prefer to eat' },
      { key: `${outcome.prefix}ThingsIMustHave`, label: 'These are the things I must have' },
    );
  }
  return base;
}

export default function ServiceUserNeedsAssessmentPage() {
  const { sid } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sid) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch user data from users/sid
        const userRes = await axiosInstance.get(`/users/${sid}`);
        const userData = userRes.data?.data;
        
        if (!userData) {
          throw new Error('User not found');
        }

        setUserData(userData);

        // Step 2: Check if serviceuserAssessmentId exists
        if (userData.serviceuserAssessmentId) {
          // Fetch the assessment data
          const assessmentRes = await axiosInstance.get(`/serviceuser-assessment/${userData.serviceuserAssessmentId}`);
          setData(assessmentRes.data?.data || {});
          setHasAssessment(true);
        } else {
          setHasAssessment(false);
          setData(null);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err?.message || 'Failed to load data');
        setHasAssessment(false);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sid]);

  // Get user's display name
  const userDisplayName =
  userData?.name ||
  (
    [userData?.title, userData?.firstName, userData?.lastName]
      .filter(Boolean)
      .join(" ")
  ) ||
  (
    [userData?.givenName, userData?.familyName]
      .filter(Boolean)
      .join(" ")
  ) ||
  data?.myName ||
  "Unknown User";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <BlinkingDots />
      </div>
    );
  }

  // Show error state
  if (error && !userData) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <p className="text-red-600 font-medium text-lg">Error Loading Data</p>
          <p className="text-sm text-red-500 mt-2">{error}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="rounded-lg">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
      </div>
    );
  }

  // Show state when no assessment is available
  if (!hasAssessment) {
    return (
      <div className=" mx-auto pb-10">
        {/* Header */}
        <div className="pb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Needs Assessment Details</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="font-semibold text-watney py-1 rounded-none">
                  {userDisplayName}
                </span>
              </div>
            </div>
            <Button className="bg-watney text-white hover:bg-watney/90" onClick={() => navigate(-1)}>
              <MoveLeft className="h-4 w-4 mr-2" />Back
            </Button>
          </div>
        </div>

        {/* No Assessment Available Card */}
        <div className="mt-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Assessment Available</h2>
              <p className="text-gray-500 text-center max-w-4xl">
                {userDisplayName} does not have a completed needs assessment yet. 
                Once an assessment is completed and linked to this service user, it will appear here.
              </p>
           
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Original assessment display (when data exists)
  const tabItems = [
    { value: 'tab1', label: 'Personal Details', icon: User },
    { value: 'tab2', label: 'Assessment & Contacts', icon: ClipboardCheck },
    { value: 'tab3', label: 'My Service Delivery Plan', icon: FileText },
    { value: 'tab4', label: 'Beliefs', icon: Heart },
    { value: 'tab5', label: 'Maintenance Outcomes', icon: Activity },
    { value: 'tab6', label: 'Change Outcomes', icon: TrendingUp },
    { value: 'tab7', label: 'Service Process Outcomes', icon: Settings },
    { value: 'tab8', label: 'Sign-off', icon: PenTool },
  ];

  return (
    <div className=" mx-auto pb-10">
      {/* Header */}
      <div className="pb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Needs Assessment Details</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="font-semibold text-watney py-1 rounded-none">
                {data?.myName || userDisplayName}
              </span>
            </div>
          </div>
          <div className='flex gap-2'>

          <Button className="bg-watney text-white hover:bg-watney/90" onClick={() => navigate(-1)}>
            <MoveLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <Button  className="bg-watney text-white hover:bg-watney/90" onClick={() => navigate(`/dashboard/people-planner/serviceuser-assessment/${userData?.serviceuserAssessmentId}/edit`)}>
            <Pen className="h-4 w-4 mr-2" />Edit
          </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tab1" className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Vertical Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <TabsList className="flex flex-col h-fit bg-white border border-gray-200 shadow-sm overflow-hidden p-0 rounded-lg">
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="w-full justify-start gap-3 px-4 py-3.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 data-[state=active]:bg-watney data-[state=active]:text-white data-[state=active]:shadow-md transition-all border-l-4 border-transparent data-[state=active]:border-watney/80 text-left"
                >
                  <tab.icon className="h-4 w-4 flex-shrink-0" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* Tab 1: Personal Details */}
            <TabsContent value="tab1" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Contact Information" icon={User}>
                  <FieldRow label="My Name" value={data?.myName} />
                  <FieldRow label="I like to be known as:" value={data?.preferredName} />
                  <FieldRow label="My Address" value={data?.myAddress} />
                  <FieldRow label="My Phone number:" value={data?.myPhoneNumber} />
                  <FieldRow label="My birthday:" value={formatDate(data?.myBirthday)} />
                </SectionCard>

                <SectionCard title="Important Relationships & Risks">
                  <ContentBlock label="Important people to me:" value={data?.importantPeopleToMe} />
                  <ContentBlock label="Areas of high risk for me are:" value={data?.areasOfHighRisk} />
                </SectionCard>

                <SectionCard title="Background & Preferences">
                  <ContentBlock label="My background, skills and interests:" value={data?.backgroundSkillsAndInterests} />
                  <ContentBlock label="I like:" value={data?.likes} />
                  <ContentBlock label="I dislike:" value={data?.dislikes} />
                </SectionCard>

                <SectionCard title="Communication & Critical Needs" className="lg:col-span-2">
                  <ContentBlock label="Tips for talking to me:" value={data?.tipsForTalkingToMe} />
                  <ContentBlock label="My critical care and support needs are:" value={data?.criticalCareAndSupportNeeds} isList={true} />
                </SectionCard>
              </div>
            </TabsContent>

            {/* Tab 2: Assessment & Contacts */}
            <TabsContent value="tab2" className="mt-0 focus-visible:outline-none">
              <div className="space-y-6">
                <SectionCard title="Assessment Information" icon={ClipboardCheck}>
                  <FieldRow label="SERVICE USER ID NUMBER" value={data?.serviceUserIdNumber} />
                  <FieldRow label="DATE OF ASSESSMENT" value={formatDate(data?.dateOfAssessment)} />
                  <FieldRow label="ASSESSOR'S NAME" value={data?.assessorName} />
                  <FieldRow label="ASSESSOR'S SIGNATURE" value={data?.assessorSignature} isSignature />
                </SectionCard>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Contacts table</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {CONTACT_GROUPS.map((g) => (
                      <ContactGroup key={g.prefix} data={data} prefix={g.prefix} label={g.label} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: My Service Delivery Plan / Needs Assessment in Detail */}
            <TabsContent value="tab3" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-6">
                <SectionCard title="My Service Delivery Plan / Needs Assessment in Detail" icon={FileText}>
                  <ContentBlock label="What is important for you to know about my past:" value={data?.importantAboutMyPast} />
                  <ContentBlock label="How my past affects the way I am today:" value={data?.howMyPastAffectsMeToday} />
                  <ContentBlock label="How you can support me to make the best use of my past and overcome any difficulties it causes for me:" value={data?.howToSupportMeWithMyPast} />
                  <ContentBlock label="What it is important for you to know about my cultural background:" value={data?.importantAboutMyCulturalBackground} />
                  <ContentBlock label="How you can support me to maintain my cultural identity:" value={data?.howToSupportMyCulturalIdentity} />
                  <ContentBlock label="What you need to know about my use of language:" value={data?.myUseOfLanguage} />
                  <ContentBlock label="People and organisations which are important to me:" value={data?.peopleAndOrganisationsImportantToMe} />
                </SectionCard>
              </div>
            </TabsContent>

            {/* Tab 4: Beliefs */}
            <TabsContent value="tab4" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-6">
                <SectionCard title="Beliefs" icon={Heart}>
                  <ContentBlock label="These are my beliefs, which are important to me:" value={data?.myBeliefs} />
                  <ContentBlock label="This is how you can help me sustain my beliefs:" value={data?.howToHelpSustainMyBeliefs} />
                  <ContentBlock label="Specific information which may be useful to help support me:" value={data?.specificSupportInformation} />
                </SectionCard>
              </div>
            </TabsContent>

            {/* Tab 5: Maintenance / Prevention Outcomes */}
            <TabsContent value="tab5" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-6">
                {MAINTENANCE_OUTCOMES.map((outcome) => (
                  <SectionCard key={outcome.prefix} title={outcome.title} icon={Activity}>
                    {maintenanceFields(outcome).map((f) => (
                      <ContentBlock key={f.key} label={f.label} value={data?.[f.key]} />
                    ))}
                  </SectionCard>
                ))}
              </div>
            </TabsContent>

            {/* Tab 6: Change Outcomes */}
            <TabsContent value="tab6" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-6">
                <SectionCard title="Improvements in physical symptoms and / or behaviour" icon={TrendingUp}>
                  <ContentBlock label="How you can help me improve my physical symptoms:" value={data?.physicalSymptomsHelpImprove} />
                  <ContentBlock label="How you can support me to improve my behaviour" value={data?.physicalSymptomsSupportImprove} />
                  <ContentBlock label="(Other)" value={data?.physicalSymptomsOther} />
                </SectionCard>

                <SectionCard title="Improvements in morale and well-being">
                  <ContentBlock label="How you can support me to improve my morale & well-being:" value={data?.moraleWellbeingSupportImprove} />
                </SectionCard>
              </div>
            </TabsContent>

            {/* Tab 7: Service Process Outcomes */}
            <TabsContent value="tab7" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 gap-6">
                <SectionCard title="Desired Outcome: Feeling valued and respected" icon={Settings}>
                  <ContentBlock label="How you will treat and value me in a respectful, person-centred way" value={data?.feelingValuedRespectedSupport} />
                </SectionCard>

                <SectionCard title="Desired Outcome: Being treated as an individual">
                  <ContentBlock label="How you will treat me as an individual, and deliver support in the way I want it" value={data?.treatedAsIndividualSupport} />
                </SectionCard>

                <SectionCard title="Desired Outcome: Having a say and control over services">
                  <ContentBlock label="How you will support me to have a say, and exercise control over the service I receive" value={data?.sayAndControlSupport} />
                </SectionCard>

                <SectionCard title="Desired Outcome: Compatibility with & respect for cultural & religious preferences">
                  <ContentBlock label="How you will ensure compatibility with & respect for my cultural & religious preferences" value={data?.culturalReligiousCompatibilitySupport} />
                </SectionCard>
              </div>
            </TabsContent>

            {/* Tab 8: Sign-off */}
            <TabsContent value="tab8" className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Sign-off" icon={PenTool}>
                  <FieldRow label="Completed by:" value={getUserName(data?.completedBy)} />
                  <FieldRow label="Date:" value={formatDate(data?.completedDate)} />
                  <FieldRow label="Last reviewed by:" value={getUserName(data?.lastReviewedBy)} />
                  <FieldRow label="Date:" value={formatDate(data?.lastReviewedDate)} />
                </SectionCard>

                <SectionCard title="With information from (please tick):" className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <FieldRow label="Person" value={data?.informationFromPerson} />
                    <FieldRow label="Relative" value={data?.informationFromRelative} />
                    <FieldRow label="Agencies" value={data?.informationFromAgencies} />
                    <FieldRow label="Other" value={data?.informationFromOther} />
                    <FieldRow label="Observation" value={data?.informationFromObservation} />
                  </div>
                </SectionCard>

                <SectionCard title="Agreed with:" className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    <FieldRow label="Signature of person" value={data?.signatureOfPerson} isSignature />
                    <FieldRow label="Signature of relative/s (if applicable)" value={data?.signatureOfRelative} isSignature />
                  </div>
                </SectionCard>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}