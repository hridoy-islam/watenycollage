import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoveLeft, Briefcase, User } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Separator } from '@/components/ui/separator';

export default function ReferenceDetailsPage() {
  const { id, refId, refType } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReferenceDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user data
      const userRes = await axiosInstance.get(`/users/${id}`);
      const user = userRes.data.data;
      
      // Fetch reference data
      const refRes = await axiosInstance.get(`/reference/${refId}`);
      const reference = refRes.data.data;
      
      setUserData(user);
      setReferenceData(reference);
    } catch (error: any) {
      console.error('Error fetching reference details:', error);
      setError('Failed to load reference details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && refId) {
      fetchReferenceDetails();
    }
  }, [id, refId]);

  // Get referee data based on reference type
  const getRefereeData = () => {
    if (!userData) return null;
    
    switch (refType) {
      case 'ref1':
        return userData.professionalReferee1;
      case 'ref2':
        return userData.professionalReferee2;
      case 'ref3':
        return userData.personalReferee;
      default:
        return null;
    }
  };

  // Helper function to convert boolean/string to yes/no display
  const toYesNo = (value: boolean | string | null | undefined) => {
    if (value === true || value === 'yes') return 'Yes';
    if (value === false || value === 'no') return 'No';
    return 'N/A';
  };

  // Helper function to get badge variant based on value
  const getBadgeVariant = (value: boolean | string | null | undefined) => {
    if (value === true || value === 'yes') return "default";
    if (value === false || value === 'no') return "secondary";
    return "outline";
  };

  // Helper function to get badge style based on value
  const getBadgeStyle = (value: boolean | string | null | undefined) => {
    if (value === true || value === 'yes') return "bg-green-100 text-green-800 hover:bg-green-100";
    if (value === false || value === 'no') return "bg-red-100 text-red-800 hover:bg-red-100";
    return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  // Helper function to format rating values
  const formatRating = (value: string | null | undefined) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const refereeData = getRefereeData();

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90"
          >
            <MoveLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 text-lg">{error}</p>
              <Button 
                onClick={fetchReferenceDetails}
                className="mt-4 bg-watney text-white hover:bg-watney/90"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reference Details</h1>
            <p className="font-medium">
              {refType === 'ref3' ? 'Personal Reference' : 'Professional Reference'} for {userData?.title || ''} {userData?.firstName || ''} {userData?.initial || ''} {userData?.lastName || ''}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90"
          >
            <MoveLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referee Information */}
          <Card>
            <CardHeader className="bg-watney text-white">
              <CardTitle className="flex items-center gap-2">
                {refType === 'ref3' ? <User className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                Referee Information
              </CardTitle>
              <CardDescription className='text-white'>
                {refType === 'ref3' ? 'Personal Referee Details' : 'Professional Referee Details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {refereeData ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="font-medium">{refereeData.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Position</label>
                      <p className="font-medium">{refereeData.position || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                      <p className="font-medium">{refereeData.relationship || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Organization</label>
                      <p className="font-medium">{refereeData.organisation || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="font-medium">{refereeData.address || 'N/A'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telephone</label>
                      <p className="font-medium">{refereeData.tel || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fax</label>
                      <p className="font-medium">{refereeData.fax || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{refereeData.email || 'N/A'}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No referee information available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reference Form Details */}
          <Card>
            <CardHeader className="bg-watney">
              <CardTitle className="flex items-center text-white gap-2">
                Reference Form Details
              </CardTitle>
              <CardDescription className='text-white'>
                Submitted reference information and responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {referenceData ? (
                <>
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                    {/* <div className="grid grid-cols-2 gap-4">
                     
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Position Applied</label>
                        <p className="font-medium">{referenceData.positionApplied || 'N/A'}</p>
                      </div>
                    </div> */}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Referee Name</label>
                        <p className="font-medium">{referenceData.refereeName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Referee Position</label>
                        <p className="font-medium">{referenceData.refereePosition || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                        <p className="font-medium">{referenceData.relationship || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">How Long Known</label>
                        <p className="font-medium">{referenceData.howLongKnown || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Employment Period for Professional References */}
                    {(refType === 'ref1' || refType === 'ref2') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Employment From</label>
                          <p className="font-medium">
                            {formatDate(referenceData.employmentFrom)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Employment Till</label>
                          <p className="font-medium">
                            {formatDate(referenceData.employmentTill)}
                          </p>
                        </div>
                      </div>
                    )}

                    {referenceData.reasonLeaving && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Reason for Leaving</label>
                        <p className="font-medium">{referenceData.reasonLeaving}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Personal Reference Specific Fields */}
                  {refType === 'ref3' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Health & Personal Assessment</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className='flex gap-4'>
                          <label className="text-sm font-medium text-muted-foreground">Serious Illness</label>
                          <Badge 
                            variant={getBadgeVariant(referenceData.seriousIllness)}
                            className={getBadgeStyle(referenceData.seriousIllness)}
                          >
                            {toYesNo(referenceData.seriousIllness)}
                          </Badge>
                        </div>
                        <div className='flex gap-4'>
                          <label className="text-sm font-medium text-muted-foreground">Drug Dependency</label>
                          <Badge 
                            variant={getBadgeVariant(referenceData.drugsDependency)}
                            className={getBadgeStyle(referenceData.drugsDependency)}
                          >
                            {toYesNo(referenceData.drugsDependency)}
                          </Badge>
                        </div>
                      </div>

                      {/* Personal Traits */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Personal Traits</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Reliable', value: referenceData.reliable },
                            { label: 'Punctual', value: referenceData.punctual },
                            { label: 'Trustworthy', value: referenceData.trustworthy },
                            { label: 'Approachable', value: referenceData.approachable },
                            { label: 'Tactful', value: referenceData.tactful },
                            { label: 'Discreet', value: referenceData.discreet },
                            { label: 'Self Motivated', value: referenceData.selfMotivated },
                            { label: 'Able to Work Alone', value: referenceData.ableToWorkAlone },
                          ].map((trait) => (
                            <div key={trait.label} className="flex justify-between items-center">
                              <span className="text-sm">{trait.label}</span>
                              <Badge 
                                variant={getBadgeVariant(trait.value)}
                                className={getBadgeStyle(trait.value)}
                              >
                                {toYesNo(trait.value)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ratings */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Ratings</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Competency Level', value: referenceData.competency },
                            { label: 'Common Sense Level', value: referenceData.commonSense },
                            { label: 'Relates Well with Users', value: referenceData.relatesWell },
                          ].map((rating) => (
                            rating.value && (
                              <div key={rating.label} className="flex justify-between items-center">
                                <span className="text-sm">{rating.label}</span>
                                <Badge 
                                  variant="outline" 
                                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"
                                >
                                  {formatRating(rating.value)}
                                </Badge>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Cautions and Convictions */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            This position is exempted from the Rehabilitation of Offenders Act 1974, and any convictions must be declared. Are you aware of any cautions, convictions or pending prosecutions held by the applicant?
                          </label>
                          <div className="mt-1">
                            <Badge
                              variant={getBadgeVariant(referenceData.cautionsConvictions)}
                              className={getBadgeStyle(referenceData.cautionsConvictions)}
                            >
                              {toYesNo(referenceData.cautionsConvictions)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Additional Comments */}
                      {referenceData.additionalComments && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Additional Comments
                          </label>
                          <p className="mt-1 rounded-md bg-muted/10 p-3 font-medium">
                            {referenceData.additionalComments}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Professional Reference Specific Fields */}
                  {(refType === 'ref1' || refType === 'ref2') && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Professional Assessment</h3>
                      
                      {/* Ratings */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Professional Characteristics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Quality of Work', value: referenceData.qualityOrganization },
                            { label: 'Courteous & Polite', value: referenceData.courteousPolite },
                            { label: 'Follows Policies', value: referenceData.willingnessFollowPolicies },
                            { label: 'Integrity & Trust', value: referenceData.integrityTrust },
                            { label: 'Equal Opportunities', value: referenceData.attitudeEqualOpportunities },
                            { label: 'Emotional Control', value: referenceData.emotionalControl },
                            { label: 'Proactive Approach', value: referenceData.proactiveApproach },
                            { label: 'Respect Team', value: referenceData.respectTeam },
                            { label: 'Empathy Service User', value: referenceData.empathyClients },
                            { label: 'Attitude Criticism', value: referenceData.attitudesCriticism },
                            { label: 'Grooming Appearance', value: referenceData.groomingAppearance },
                            { label: 'Attendance Punctuality', value: referenceData.attendancePunctuality },
                          ].map((characteristic) => (
                            characteristic.value && (
                              <div key={characteristic.label} className="flex justify-between items-center">
                                <span className="text-sm">{characteristic.label}</span>
                                <Badge 
                                  variant="outline" 
                                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 capitalize"
                                >
                                  {formatRating(characteristic.value)}
                                </Badge>
                              </div>
                            )
                          ))}
                        </div>
                      </div>

                      {/* Unsuitable Reasons */}
                      {referenceData.unsuitableReason && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Unsuitable Reasons
                          </label>
                          <p className="mt-1 rounded-md bg-muted/50 p-3 font-medium">
                            {referenceData.unsuitableReason}
                          </p>
                        </div>
                      )}

                      {/* Re-employment */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Re-employment</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Would Re-employ</span>
                          <Badge 
                            variant={getBadgeVariant(referenceData.wouldReemploy)}
                            className={getBadgeStyle(referenceData.wouldReemploy)}
                          >
                            {toYesNo(referenceData.wouldReemploy)}
                          </Badge>
                        </div>
                        {referenceData.noReemployReason && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Reason</label>
                            <p className="font-medium mt-1 p-3 bg-muted/50 rounded-md">
                              {referenceData.noReemployReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Common Fields */}
                  <div className="space-y-4">
                    {/* Suitability Opinion */}
                    {referenceData.suitabilityOpinion && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Suitability Opinion</label>
                        <p className="font-medium mt-1 p-3 bg-muted/10 rounded-md">
                          {referenceData.suitabilityOpinion}
                        </p>
                      </div>
                    )}

                    {/* Referee Date */}
                    {referenceData.refereeDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Reference Date</label>
                        <p className="font-medium">{formatDate(referenceData.refereeDate)}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No reference form data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}