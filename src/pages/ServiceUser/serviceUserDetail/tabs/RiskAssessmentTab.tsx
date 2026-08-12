import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { Save, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { SignatureField } from '../components/SignatureFieldRisk';

interface MovingHandlingEntry {
  selectedOption: string;
  score: string;
  risk: string;
  minimiseRisk: string;
}

interface YesNoField {
  applicable: boolean | null;
  comments: string;
  action: string;
}

interface MedicationEntry {
  name: string;
  dose: string;
  frequency: string;
  timeTaken: string;
  numberPerDay: string;
  sideEffects: string;
  coshhRisk: boolean | null;
}

type FixedEntriesKey =
  | 'mobilityEntries'
  | 'fallEntries'
  | 'incontinenceEntries'
  | 'attachmentEntries'
  | 'mentalHealthEntries'
  | 'sightHearingEntries'
  | 'weightEntries'
  | 'unpredictableMovementsEntries'
  | 'taskEntries';

const emptyMovingHandlingEntry = (): MovingHandlingEntry => ({
  selectedOption: '',
  score: '',
  risk: '',
  minimiseRisk: ''
});

const MOBILITY_OPTIONS: string[] = [
  'Can stand unaided (2)',
  'Uses walking aid (0)',
  'Stands with support to steady (3)',
  'Assistance needed with handling equipment (8)',
  'Uses hoist (10)',
  'Unable to weight bear – needs hoist – no hoist in place (40)'
];

const FALL_OPTIONS: string[] = [
  'Never (0)',
  'Occasionally (2)',
  'Monthly (5)',
  'Weekly (10)',
  'Daily (20)'
];

const INCONTINENCE_OPTIONS: string[] = [
  'None (0)',
  'Urinary (2)',
  'Faecal (5)',
  'Bath (10)'
];

const ATTACHMENT_OPTIONS: string[] = ['No (0)', 'Yes (2) Score 2 for each.'];

const MENTAL_HEALTH_OPTIONS: string[] = [
  'Confusion (5)',
  'Agitation (8)',
  'Uncooperative (10)',
  'Dementia (15)',
  'Aggressive (20)',
  'Violent (25)'
];

const SIGHT_HEARING_OPTIONS: string[] = [
  'No (0)',
  'Sight (2)',
  'Hearing (2)',
  'Both (5)'
];

const WEIGHT_OPTIONS: string[] = [
  '8- 10 stone (3)',
  '10- 12 stone (5)',
  '12 stone plus (10)'
];

const UNPREDICTABLE_MOVEMENTS_OPTIONS: string[] = ['No (0)', 'Yes (5)'];

const TASK_OPTIONS: string[] = [
  'Bed to commode/wheelchair (2)',
  'Chair to wheelchair/commode (2)',
  'Wheelchair/commode to chair (2)',
  'Lying in bed to sitting onto side of bed (2)',
  'Into bath/shower (5)',
  'Repositioning in bed turning/up into bed (1)'
];

const mapSingleEntry = (savedEntries: any[] | undefined) => {
  const entry = savedEntries?.[0];
  return [
    {
      selectedOption: entry?.selectedOption || '',
      score: entry?.score ?? '',
      risk: entry?.risk || '',
      minimiseRisk: entry?.minimiseRisk || ''
    }
  ];
};

interface RiskAssessmentForm {
  // Header
  serviceUserName: string;
  preferredTermOfAddress: string;
  dateOfFirstAssessment: Date | null;
  address: string;
  dob: Date | null;
  telNumber: string;
  caseManager: string;
  assessorsName: string;
  assessorsSignatureUrl: string;

  // Section 1
  section1Explanation: string;
  mobilityEntries: MovingHandlingEntry[];
  mobilityTotalScore: string;
  mobilityRiskRating: string;
  fallEntries: MovingHandlingEntry[];
  fallTotalScore: string;
  incontinenceEntries: MovingHandlingEntry[];
  incontinenceTotalScore: string;
  attachmentEntries: MovingHandlingEntry[];
  attachmentTotalScore: string;
  mentalHealthEntries: MovingHandlingEntry[];
  mentalHealthTotalScore: string;
  sightHearingEntries: MovingHandlingEntry[];
  sightHearingTotalScore: string;
  weightEntries: MovingHandlingEntry[];
  weightTotalScore: string;
  unpredictableMovementsEntries: MovingHandlingEntry[];
  unpredictableMovementsTotalScore: string;
  movingHandlingTotalScore: string;

  // Section 2
  section2Explanation: string;
  taskEntries: MovingHandlingEntry[];
  tasksTotalScore: string;

  // Section 3
  section3Explanation: string;
  medicationSupplies: YesNoField[];
  takingMedication: YesNoField[];
  topicalApplications: YesNoField[];
  medications: MedicationEntry[];
  medicalCareTasks: YesNoField[];
  hasAllergies: boolean | null;
  allergiesComments: string;
  allergiesAction: string;

  // Section 4
  section4Explanation: string;
  riskCooking: boolean | null;
  riskBathing: boolean | null;
  riskDressing: boolean | null;
  riskCleaning: boolean | null;
  riskOutings: boolean | null;
  riskOther: boolean | null;
  riskOtherText: string;
  agreedActionServiceUser: string;
  workerRiskCooking: boolean | null;
  workerRiskBathing: boolean | null;
  workerRiskDressing: boolean | null;
  workerRiskCleaning: boolean | null;
  workerRiskOutings: boolean | null;
  workerRiskOther: boolean | null;
  workerRiskOtherText: string;
  agreedActionWorkers: string;
  aggressiveBehaviourVerbal: string;
  aggressiveBehaviourVerbalAction: string;
  aggressiveBehaviourPhysical: string;
  aggressiveBehaviourPhysicalAction: string;
  criminalHistory: boolean | null;
  criminalHistoryDetails: string;
  transmittableDiseases: string;

  // Section 5
  section5Explanation: string;
  accommodationType: string;
  accommodationOther: string;
  travellingRisks: boolean | null;
  travellingRisksDetails: string;
  hasTelephone: boolean | null;
  telephoneConcerns: boolean | null;
  highCrimeArea: boolean | null;
  areaIsolated: boolean | null;
  safetyRisksComments: string;
  waterCutOff: string;
  gasCutOff: string;
  electricMeter: string;
  electricalWiringConcerns: boolean | null;
  electricMeterType: string;
  lightingConcerns: boolean | null;
  circuitBreaker: boolean | null;
  heatingSource: string;
  gasConcerns: boolean | null;
  heatingConcerns: boolean | null;
  cookingSource: string;
  hotWaterConcerns: boolean | null;
  thermostaticRegulator: boolean | null;
  securityLocks: boolean | null;
  keyBox: boolean | null;
  keyBoxLocation: string;
  stairGates: boolean | null;
  monitoredMedicationBox: boolean | null;
  keySafe: boolean | null;
  serviceUserSmoker: boolean | null;
  fireHazards: boolean | null;
  staffRisks: boolean | null;
  serviceUserRisks: boolean | null;
  fireOfficerAssessment: boolean | null;
  fireEscapeRoutes: string;
  unauthorisedActivitiesClarified: boolean | null;
  adequateLighting: boolean | null;
  accessWaysHazards: boolean | null;
  buildingRepair: boolean | null;
  tripsFallsHazards: boolean | null;
  stairsRepair: boolean | null;
  lowCeilings: boolean | null;
  ventilationConcerns: boolean | null;
  leadConcerns: boolean | null;
  asbestosConcerns: boolean | null;
  noiseConcerns: boolean | null;
  dirtDustConcerns: boolean | null;
  wasteConcerns: boolean | null;
  pestInfestation: boolean | null;
  unsanitaryConditions: boolean | null;
  coldHeatConcerns: boolean | null;
  roomSizeConcerns: boolean | null;
  liftsHoistsConcerns: boolean | null;
  adaptationsConcerns: boolean | null;
  brokenGlazing: boolean | null;
  coshhSubstances: boolean | null;
  coshhSheetsAvailable: boolean | null;
  animalsInHome: boolean | null;
  animalSafetyRisk: boolean | null;
  animalHygieneRisk: boolean | null;
  animalWaste: boolean | null;
  environmentalWaste: boolean | null;
  bodilyExcrements: boolean | null;
  identifiedRisksStaff: boolean | null;
  crackedWindows: boolean | null;
  identifiedRisksServiceUser: boolean | null;
  protectiveClothingNeeded: boolean | null;
  risksToStaff: boolean | null;
  risksToServiceUser: boolean | null;
  risksToOthers: boolean | null;
  cashSecure: boolean | null;
  financialRisks: boolean | null;
  financialRisksMinimise: string;
  staffHandleMoney: boolean | null;
  foodInDate: boolean | null;
  foodPreparation: boolean | null;
  foodHygieneStandards: boolean | null;
  cookingFacilitiesSafe: boolean | null;
  refrigeratorTemp: boolean | null;
  freezerTemp: boolean | null;
  handWashingFacilities: boolean | null;
  kitchenClean: boolean | null;
  separateStorage: boolean | null;
  hotColdWater: boolean | null;
  staffTrainingNeeded: boolean | null;
  outingStaffRisks: boolean | null;
  outingServiceUserRisks: boolean | null;
  staffTakeOut: boolean | null;
  staffTransport: boolean | null;
  publicTransport: boolean | null;
  otherTransport: boolean | null;
  carUsed: boolean | null;

  // Section 6
  section6Explanation: string;
  careWorkerComments: string;
  additionalRisksIdentified: string;

  // Section 7
  actionNeededPriorService: string;
  assessorName: string;
  assessorSignatureUrl: string;
  assessorDate: Date | null;
  serviceUserNameKin: string;
  serviceUserSignatureUrl: string;
  serviceUserDate: Date | null;
  nextReviewDate: Date | null;
  personResponsible: string;
  dateCompletionReview: Date | null;
  equipmentRequired: string;
  equipmentSupplierName: string;
  equipmentSupplierTel: string;
  equipmentServiceInterval: string;
  equipmentServiceDate: Date | null;
  hoistServiceDate: Date | null;

  // Details (free text) for environment / premises / finance / food / outings checks
  travellingDirectionDetails: string;
  electricalWiringConcernsDetails: string;
  circuitBreakerDetails: string;
  lightingConcernsDetails: string;
  gasConcernsDetails: string;
  heatingConcernsDetails: string;
  hotWaterConcernsDetails: string;
  thermostaticRegulatorDetails: string;
  securityLocksDetails: string;
  stairGatesDetails: string;
  monitoredMedicationBoxDetails: string;
  keySafeDetails: string;
  serviceUserSmokerDetails: string;
  fireHazardsDetails: string;
  staffRisksDetails: string;
  serviceUserRisksDetails: string;
  fireOfficerAssessmentDetails: string;
  unauthorisedActivitiesClarifiedDetails: string;
  adequateLightingDetails: string;
  accessWaysHazardsDetails: string;
  buildingRepairDetails: string;
  tripsFallsHazardsDetails: string;
  stairsRepairDetails: string;
  lowCeilingsDetails: string;
  ventilationConcernsDetails: string;
  leadConcernsDetails: string;
  asbestosConcernsDetails: string;
  noiseConcernsDetails: string;
  dirtDustConcernsDetails: string;
  wasteConcernsDetails: string;
  pestInfestationDetails: string;
  unsanitaryConditionsDetails: string;
  coldHeatConcernsDetails: string;
  roomSizeConcernsDetails: string;
  liftsHoistsConcernsDetails: string;
  adaptationsConcernsDetails: string;
  brokenGlazingDetails: string;
  coshhSubstancesDetails: string;
  coshhSheetsAvailableDetails: string;
  animalsInHomeDetails: string;
  animalSafetyRiskDetails: string;
  animalHygieneRiskDetails: string;
  animalWasteDetails: string;
  environmentalWasteDetails: string;
  bodilyExcrementsDetails: string;
  identifiedRisksStaffDetails: string;
  crackedWindowsDetails: string;
  identifiedRisksServiceUserDetails: string;
  protectiveClothingNeededDetails: string;
  risksToStaffDetails: string;
  risksToServiceUserDetails: string;
  risksToOthersDetails: string;
  cashSecureDetails: string;
  staffHandleMoneyDetails: string;
  foodInDateDetails: string;
  foodPreparationDetails: string;
  foodHygieneStandardsDetails: string;
  cookingFacilitiesSafeDetails: string;
  refrigeratorTempDetails: string;
  freezerTempDetails: string;
  handWashingFacilitiesDetails: string;
  kitchenCleanDetails: string;
  separateStorageDetails: string;
  hotColdWaterDetails: string;
  staffTrainingNeededDetails: string;
  outingStaffRisksDetails: string;
  outingServiceUserRisksDetails: string;
  staffTakeOutDetails: string;
  staffTransportDetails: string;
  publicTransportDetails: string;
  otherTransportDetails: string;
  carUsedDetails: string;
}

const emptyYesNoField = (): YesNoField => ({
  applicable: null,
  comments: '',
  action: ''
});

const emptyMedication = (): MedicationEntry => ({
  name: '',
  dose: '',
  frequency: '',
  timeTaken: '',
  numberPerDay: '',
  sideEffects: '',
  coshhRisk: null
});

const emptyForm = (): RiskAssessmentForm => ({
  serviceUserName: '',
  preferredTermOfAddress: '',
  dateOfFirstAssessment: null,
  address: '',
  dob: null,
  telNumber: '',
  caseManager: '',
  assessorsName: '',
  assessorsSignatureUrl: '',
  section1Explanation: '',
  mobilityEntries: [emptyMovingHandlingEntry()],
  mobilityTotalScore: '',
  mobilityRiskRating: '',
  fallEntries: [emptyMovingHandlingEntry()],
  fallTotalScore: '',
  incontinenceEntries: [emptyMovingHandlingEntry()],
  incontinenceTotalScore: '',
  attachmentEntries: [emptyMovingHandlingEntry()],
  attachmentTotalScore: '',
  mentalHealthEntries: [emptyMovingHandlingEntry()],
  mentalHealthTotalScore: '',
  sightHearingEntries: [emptyMovingHandlingEntry()],
  sightHearingTotalScore: '',
  weightEntries: [emptyMovingHandlingEntry()],
  weightTotalScore: '',
  unpredictableMovementsEntries: [emptyMovingHandlingEntry()],
  unpredictableMovementsTotalScore: '',
  movingHandlingTotalScore: '',
  section2Explanation: '',
  taskEntries: [emptyMovingHandlingEntry()],
  tasksTotalScore: '',
  section3Explanation: '',
  medicationSupplies: Array(8)
    .fill(null)
    .map(() => emptyYesNoField()),
  takingMedication: Array(15)
    .fill(null)
    .map(() => emptyYesNoField()),
  topicalApplications: Array(6)
    .fill(null)
    .map(() => emptyYesNoField()),
  medications: Array(6)
    .fill(null)
    .map(() => emptyMedication()),
  medicalCareTasks: Array(5)
    .fill(null)
    .map(() => emptyYesNoField()),
  hasAllergies: null,
  allergiesComments: '',
  allergiesAction: '',
  section4Explanation: '',
  riskCooking: null,
  riskBathing: null,
  riskDressing: null,
  riskCleaning: null,
  riskOutings: null,
  riskOther: null,
  riskOtherText: '',
  agreedActionServiceUser: '',
  workerRiskCooking: null,
  workerRiskBathing: null,
  workerRiskDressing: null,
  workerRiskCleaning: null,
  workerRiskOutings: null,
  workerRiskOther: null,
  workerRiskOtherText: '',
  agreedActionWorkers: '',
  aggressiveBehaviourVerbal: '',
  aggressiveBehaviourVerbalAction: '',
  aggressiveBehaviourPhysical: '',
  aggressiveBehaviourPhysicalAction: '',
  criminalHistory: null,
  criminalHistoryDetails: '',
  transmittableDiseases: '',
  section5Explanation: '',
  accommodationType: '',
  accommodationOther: '',
  travellingRisks: null,
  travellingRisksDetails: '',
  hasTelephone: null,
  telephoneConcerns: null,
  highCrimeArea: null,
  areaIsolated: null,
  safetyRisksComments: '',
  waterCutOff: '',
  gasCutOff: '',
  electricMeter: '',
  electricalWiringConcerns: null,
  electricMeterType: '',
  lightingConcerns: null,
  circuitBreaker: null,
  heatingSource: '',
  gasConcerns: null,
  heatingConcerns: null,
  cookingSource: '',
  hotWaterConcerns: null,
  thermostaticRegulator: null,
  securityLocks: null,
  keyBox: null,
  keyBoxLocation: '',
  stairGates: null,
  monitoredMedicationBox: null,
  keySafe: null,
  serviceUserSmoker: null,
  fireHazards: null,
  staffRisks: null,
  serviceUserRisks: null,
  fireOfficerAssessment: null,
  fireEscapeRoutes: '',
  unauthorisedActivitiesClarified: null,
  adequateLighting: null,
  accessWaysHazards: null,
  buildingRepair: null,
  tripsFallsHazards: null,
  stairsRepair: null,
  lowCeilings: null,
  ventilationConcerns: null,
  leadConcerns: null,
  asbestosConcerns: null,
  noiseConcerns: null,
  dirtDustConcerns: null,
  wasteConcerns: null,
  pestInfestation: null,
  unsanitaryConditions: null,
  coldHeatConcerns: null,
  roomSizeConcerns: null,
  liftsHoistsConcerns: null,
  adaptationsConcerns: null,
  brokenGlazing: null,
  coshhSubstances: null,
  coshhSheetsAvailable: null,
  animalsInHome: null,
  animalSafetyRisk: null,
  animalHygieneRisk: null,
  animalWaste: null,
  environmentalWaste: null,
  bodilyExcrements: null,
  identifiedRisksStaff: null,
  crackedWindows: null,
  identifiedRisksServiceUser: null,
  protectiveClothingNeeded: null,
  risksToStaff: null,
  risksToServiceUser: null,
  risksToOthers: null,
  cashSecure: null,
  financialRisks: null,
  financialRisksMinimise: '',
  staffHandleMoney: null,
  foodInDate: null,
  foodPreparation: null,
  foodHygieneStandards: null,
  cookingFacilitiesSafe: null,
  refrigeratorTemp: null,
  freezerTemp: null,
  handWashingFacilities: null,
  kitchenClean: null,
  separateStorage: null,
  hotColdWater: null,
  staffTrainingNeeded: null,
  outingStaffRisks: null,
  outingServiceUserRisks: null,
  staffTakeOut: null,
  staffTransport: null,
  publicTransport: null,
  otherTransport: null,
  carUsed: null,
  section6Explanation: '',
  careWorkerComments: '',
  additionalRisksIdentified: '',
  actionNeededPriorService: '',
  assessorName: '',
  assessorSignatureUrl: '',
  assessorDate: null,
  serviceUserNameKin: '',
  serviceUserSignatureUrl: '',
  serviceUserDate: null,
  nextReviewDate: null,
  personResponsible: '',
  dateCompletionReview: null,
  equipmentRequired: '',
  equipmentSupplierName: '',
  equipmentSupplierTel: '',
  equipmentServiceInterval: '',
  equipmentServiceDate: null,
  hoistServiceDate: null,
  travellingDirectionDetails: '',
  electricalWiringConcernsDetails: '',
  circuitBreakerDetails: '',
  lightingConcernsDetails: '',
  gasConcernsDetails: '',
  heatingConcernsDetails: '',
  hotWaterConcernsDetails: '',
  thermostaticRegulatorDetails: '',
  securityLocksDetails: '',
  stairGatesDetails: '',
  monitoredMedicationBoxDetails: '',
  keySafeDetails: '',
  serviceUserSmokerDetails: '',
  fireHazardsDetails: '',
  staffRisksDetails: '',
  serviceUserRisksDetails: '',
  fireOfficerAssessmentDetails: '',
  unauthorisedActivitiesClarifiedDetails: '',
  adequateLightingDetails: '',
  accessWaysHazardsDetails: '',
  buildingRepairDetails: '',
  tripsFallsHazardsDetails: '',
  stairsRepairDetails: '',
  lowCeilingsDetails: '',
  ventilationConcernsDetails: '',
  leadConcernsDetails: '',
  asbestosConcernsDetails: '',
  noiseConcernsDetails: '',
  dirtDustConcernsDetails: '',
  wasteConcernsDetails: '',
  pestInfestationDetails: '',
  unsanitaryConditionsDetails: '',
  coldHeatConcernsDetails: '',
  roomSizeConcernsDetails: '',
  liftsHoistsConcernsDetails: '',
  adaptationsConcernsDetails: '',
  brokenGlazingDetails: '',
  coshhSubstancesDetails: '',
  coshhSheetsAvailableDetails: '',
  animalsInHomeDetails: '',
  animalSafetyRiskDetails: '',
  animalHygieneRiskDetails: '',
  animalWasteDetails: '',
  environmentalWasteDetails: '',
  bodilyExcrementsDetails: '',
  identifiedRisksStaffDetails: '',
  crackedWindowsDetails: '',
  identifiedRisksServiceUserDetails: '',
  protectiveClothingNeededDetails: '',
  risksToStaffDetails: '',
  risksToServiceUserDetails: '',
  risksToOthersDetails: '',
  cashSecureDetails: '',
  staffHandleMoneyDetails: '',
  foodInDateDetails: '',
  foodPreparationDetails: '',
  foodHygieneStandardsDetails: '',
  cookingFacilitiesSafeDetails: '',
  refrigeratorTempDetails: '',
  freezerTempDetails: '',
  handWashingFacilitiesDetails: '',
  kitchenCleanDetails: '',
  separateStorageDetails: '',
  hotColdWaterDetails: '',
  staffTrainingNeededDetails: '',
  outingStaffRisksDetails: '',
  outingServiceUserRisksDetails: '',
  staffTakeOutDetails: '',
  staffTransportDetails: '',
  publicTransportDetails: '',
  otherTransportDetails: '',
  carUsedDetails: ''
});

const toISOString = (date: Date | null) =>
  date
    ? new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      ).toISOString()
    : undefined;

const getServiceUserName = (user: any) =>
  [user?.firstName, user?.middleInitial, user?.lastName]
    .filter(Boolean)
    .join(' ') ||
  user?.name ||
  '';

const withUserFallback = (
  form: RiskAssessmentForm,
  user: any
): RiskAssessmentForm => ({
  ...form,
  serviceUserName: form.serviceUserName || getServiceUserName(user),
  address: form.address || user?.address || '',
  dob: form.dob || (user?.dateOfBirth ? new Date(user.dateOfBirth) : null)
});

const mapToForm = (item: any): RiskAssessmentForm => ({
  serviceUserName: item.serviceUserName || '',
  preferredTermOfAddress: item.preferredTermOfAddress || '',
  dateOfFirstAssessment: item.dateOfFirstAssessment
    ? new Date(item.dateOfFirstAssessment)
    : null,
  address: item.address || '',
  dob: item.dob ? new Date(item.dob) : null,
  telNumber: item.telNumber || '',
  caseManager: item.caseManager || '',
  assessorsName: item.assessorsName || '',
  assessorsSignatureUrl: item.assessorsSignatureUrl || '',
  section1Explanation: item.section1Explanation || '',
  mobilityEntries: mapSingleEntry(item.mobilityEntries),
  mobilityTotalScore: item.mobilityTotalScore || '',
  mobilityRiskRating: item.mobilityRiskRating || '',
  fallEntries: mapSingleEntry(item.fallEntries),
  fallTotalScore: item.fallTotalScore || '',
  incontinenceEntries: mapSingleEntry(item.incontinenceEntries),
  incontinenceTotalScore: item.incontinenceTotalScore || '',
  attachmentEntries: mapSingleEntry(item.attachmentEntries),
  attachmentTotalScore: item.attachmentTotalScore || '',
  mentalHealthEntries: mapSingleEntry(item.mentalHealthEntries),
  mentalHealthTotalScore: item.mentalHealthTotalScore || '',
  sightHearingEntries: mapSingleEntry(item.sightHearingEntries),
  sightHearingTotalScore: item.sightHearingTotalScore || '',
  weightEntries: mapSingleEntry(item.weightEntries),
  weightTotalScore: item.weightTotalScore || '',
  unpredictableMovementsEntries: mapSingleEntry(
    item.unpredictableMovementsEntries
  ),
  unpredictableMovementsTotalScore: item.unpredictableMovementsTotalScore || '',
  movingHandlingTotalScore: item.movingHandlingTotalScore || '',
  section2Explanation: item.section2Explanation || '',
  taskEntries: mapSingleEntry(item.taskEntries),
  tasksTotalScore: item.tasksTotalScore || '',
  section3Explanation: item.section3Explanation || '',
  medicationSupplies:
    item.medicationSupplies?.length > 0
      ? item.medicationSupplies
      : Array(8)
          .fill(null)
          .map(() => emptyYesNoField()),
  takingMedication:
    item.takingMedication?.length > 0
      ? item.takingMedication
      : Array(15)
          .fill(null)
          .map(() => emptyYesNoField()),
  topicalApplications:
    item.topicalApplications?.length > 0
      ? item.topicalApplications
      : Array(6)
          .fill(null)
          .map(() => emptyYesNoField()),
  medications:
    item.medications?.length > 0
      ? item.medications
      : Array(6)
          .fill(null)
          .map(() => emptyMedication()),
  medicalCareTasks:
    item.medicalCareTasks?.length > 0
      ? item.medicalCareTasks
      : Array(5)
          .fill(null)
          .map(() => emptyYesNoField()),
  hasAllergies: item.hasAllergies ?? null,
  allergiesComments: item.allergiesComments || '',
  allergiesAction: item.allergiesAction || '',
  section4Explanation: item.section4Explanation || '',
  riskCooking: item.riskCooking ?? null,
  riskBathing: item.riskBathing ?? null,
  riskDressing: item.riskDressing ?? null,
  riskCleaning: item.riskCleaning ?? null,
  riskOutings: item.riskOutings ?? null,
  riskOther: item.riskOther ?? null,
  riskOtherText: item.riskOtherText || '',
  agreedActionServiceUser: item.agreedActionServiceUser || '',
  workerRiskCooking: item.workerRiskCooking ?? null,
  workerRiskBathing: item.workerRiskBathing ?? null,
  workerRiskDressing: item.workerRiskDressing ?? null,
  workerRiskCleaning: item.workerRiskCleaning ?? null,
  workerRiskOutings: item.workerRiskOutings ?? null,
  workerRiskOther: item.workerRiskOther ?? null,
  workerRiskOtherText: item.workerRiskOtherText || '',
  agreedActionWorkers: item.agreedActionWorkers || '',
  aggressiveBehaviourVerbal: item.aggressiveBehaviourVerbal || '',
  aggressiveBehaviourVerbalAction: item.aggressiveBehaviourVerbalAction || '',
  aggressiveBehaviourPhysical: item.aggressiveBehaviourPhysical || '',
  aggressiveBehaviourPhysicalAction:
    item.aggressiveBehaviourPhysicalAction || '',
  criminalHistory: item.criminalHistory ?? null,
  criminalHistoryDetails: item.criminalHistoryDetails || '',
  transmittableDiseases: item.transmittableDiseases || '',
  section5Explanation: item.section5Explanation || '',
  accommodationType: item.accommodationType || '',
  accommodationOther: item.accommodationOther || '',
  travellingRisks: item.travellingRisks ?? null,
  travellingRisksDetails: item.travellingRisksDetails || '',
  hasTelephone: item.hasTelephone ?? null,
  telephoneConcerns: item.telephoneConcerns ?? null,
  highCrimeArea: item.highCrimeArea ?? null,
  areaIsolated: item.areaIsolated ?? null,
  safetyRisksComments: item.safetyRisksComments || '',
  waterCutOff: item.waterCutOff || '',
  gasCutOff: item.gasCutOff || '',
  electricMeter: item.electricMeter || '',
  electricalWiringConcerns: item.electricalWiringConcerns ?? null,
  electricMeterType: item.electricMeterType || '',
  lightingConcerns: item.lightingConcerns ?? null,
  circuitBreaker: item.circuitBreaker ?? null,
  heatingSource: item.heatingSource || '',
  gasConcerns: item.gasConcerns ?? null,
  heatingConcerns: item.heatingConcerns ?? null,
  cookingSource: item.cookingSource || '',
  hotWaterConcerns: item.hotWaterConcerns ?? null,
  thermostaticRegulator: item.thermostaticRegulator ?? null,
  securityLocks: item.securityLocks ?? null,
  keyBox: item.keyBox ?? null,
  keyBoxLocation: item.keyBoxLocation || '',
  stairGates: item.stairGates ?? null,
  monitoredMedicationBox: item.monitoredMedicationBox ?? null,
  keySafe: item.keySafe ?? null,
  serviceUserSmoker: item.serviceUserSmoker ?? null,
  fireHazards: item.fireHazards ?? null,
  staffRisks: item.staffRisks ?? null,
  serviceUserRisks: item.serviceUserRisks ?? null,
  fireOfficerAssessment: item.fireOfficerAssessment ?? null,
  fireEscapeRoutes: item.fireEscapeRoutes || '',
  unauthorisedActivitiesClarified: item.unauthorisedActivitiesClarified ?? null,
  adequateLighting: item.adequateLighting ?? null,
  accessWaysHazards: item.accessWaysHazards ?? null,
  buildingRepair: item.buildingRepair ?? null,
  tripsFallsHazards: item.tripsFallsHazards ?? null,
  stairsRepair: item.stairsRepair ?? null,
  lowCeilings: item.lowCeilings ?? null,
  ventilationConcerns: item.ventilationConcerns ?? null,
  leadConcerns: item.leadConcerns ?? null,
  asbestosConcerns: item.asbestosConcerns ?? null,
  noiseConcerns: item.noiseConcerns ?? null,
  dirtDustConcerns: item.dirtDustConcerns ?? null,
  wasteConcerns: item.wasteConcerns ?? null,
  pestInfestation: item.pestInfestation ?? null,
  unsanitaryConditions: item.unsanitaryConditions ?? null,
  coldHeatConcerns: item.coldHeatConcerns ?? null,
  roomSizeConcerns: item.roomSizeConcerns ?? null,
  liftsHoistsConcerns: item.liftsHoistsConcerns ?? null,
  adaptationsConcerns: item.adaptationsConcerns ?? null,
  brokenGlazing: item.brokenGlazing ?? null,
  coshhSubstances: item.coshhSubstances ?? null,
  coshhSheetsAvailable: item.coshhSheetsAvailable ?? null,
  animalsInHome: item.animalsInHome ?? null,
  animalSafetyRisk: item.animalSafetyRisk ?? null,
  animalHygieneRisk: item.animalHygieneRisk ?? null,
  animalWaste: item.animalWaste ?? null,
  environmentalWaste: item.environmentalWaste ?? null,
  bodilyExcrements: item.bodilyExcrements ?? null,
  identifiedRisksStaff: item.identifiedRisksStaff ?? null,
  crackedWindows: item.crackedWindows ?? null,
  identifiedRisksServiceUser: item.identifiedRisksServiceUser ?? null,
  protectiveClothingNeeded: item.protectiveClothingNeeded ?? null,
  risksToStaff: item.risksToStaff ?? null,
  risksToServiceUser: item.risksToServiceUser ?? null,
  risksToOthers: item.risksToOthers ?? null,
  cashSecure: item.cashSecure ?? null,
  financialRisks: item.financialRisks ?? null,
  financialRisksMinimise: item.financialRisksMinimise || '',
  staffHandleMoney: item.staffHandleMoney ?? null,
  foodInDate: item.foodInDate ?? null,
  foodPreparation: item.foodPreparation ?? null,
  foodHygieneStandards: item.foodHygieneStandards ?? null,
  cookingFacilitiesSafe: item.cookingFacilitiesSafe ?? null,
  refrigeratorTemp: item.refrigeratorTemp ?? null,
  freezerTemp: item.freezerTemp ?? null,
  handWashingFacilities: item.handWashingFacilities ?? null,
  kitchenClean: item.kitchenClean ?? null,
  separateStorage: item.separateStorage ?? null,
  hotColdWater: item.hotColdWater ?? null,
  staffTrainingNeeded: item.staffTrainingNeeded ?? null,
  outingStaffRisks: item.outingStaffRisks ?? null,
  outingServiceUserRisks: item.outingServiceUserRisks ?? null,
  staffTakeOut: item.staffTakeOut ?? null,
  staffTransport: item.staffTransport ?? null,
  publicTransport: item.publicTransport ?? null,
  otherTransport: item.otherTransport ?? null,
  carUsed: item.carUsed ?? null,
  section6Explanation: item.section6Explanation || '',
  careWorkerComments: item.careWorkerComments || '',
  additionalRisksIdentified: item.additionalRisksIdentified || '',
  actionNeededPriorService: item.actionNeededPriorService || '',
  assessorName: item.assessorName || '',
  assessorSignatureUrl: item.assessorSignatureUrl || '',
  assessorDate: item.assessorDate ? new Date(item.assessorDate) : null,
  serviceUserNameKin: item.serviceUserNameKin || '',
  serviceUserSignatureUrl: item.serviceUserSignatureUrl || '',
  serviceUserDate: item.serviceUserDate ? new Date(item.serviceUserDate) : null,
  nextReviewDate: item.nextReviewDate ? new Date(item.nextReviewDate) : null,
  personResponsible: item.personResponsible || '',
  dateCompletionReview: item.dateCompletionReview
    ? new Date(item.dateCompletionReview)
    : null,
  equipmentRequired: item.equipmentRequired || '',
  equipmentSupplierName: item.equipmentSupplierName || '',
  equipmentSupplierTel: item.equipmentSupplierTel || '',
  equipmentServiceInterval: item.equipmentServiceInterval || '',
  equipmentServiceDate: item.equipmentServiceDate
    ? new Date(item.equipmentServiceDate)
    : null,
  hoistServiceDate: item.hoistServiceDate
    ? new Date(item.hoistServiceDate)
    : null,
  travellingDirectionDetails: item.travellingDirectionDetails || '',
  electricalWiringConcernsDetails: item.electricalWiringConcernsDetails || '',
  circuitBreakerDetails: item.circuitBreakerDetails || '',
  lightingConcernsDetails: item.lightingConcernsDetails || '',
  gasConcernsDetails: item.gasConcernsDetails || '',
  heatingConcernsDetails: item.heatingConcernsDetails || '',
  hotWaterConcernsDetails: item.hotWaterConcernsDetails || '',
  thermostaticRegulatorDetails: item.thermostaticRegulatorDetails || '',
  securityLocksDetails: item.securityLocksDetails || '',
  stairGatesDetails: item.stairGatesDetails || '',
  monitoredMedicationBoxDetails: item.monitoredMedicationBoxDetails || '',
  keySafeDetails: item.keySafeDetails || '',
  serviceUserSmokerDetails: item.serviceUserSmokerDetails || '',
  fireHazardsDetails: item.fireHazardsDetails || '',
  staffRisksDetails: item.staffRisksDetails || '',
  serviceUserRisksDetails: item.serviceUserRisksDetails || '',
  fireOfficerAssessmentDetails: item.fireOfficerAssessmentDetails || '',
  unauthorisedActivitiesClarifiedDetails:
    item.unauthorisedActivitiesClarifiedDetails || '',
  adequateLightingDetails: item.adequateLightingDetails || '',
  accessWaysHazardsDetails: item.accessWaysHazardsDetails || '',
  buildingRepairDetails: item.buildingRepairDetails || '',
  tripsFallsHazardsDetails: item.tripsFallsHazardsDetails || '',
  stairsRepairDetails: item.stairsRepairDetails || '',
  lowCeilingsDetails: item.lowCeilingsDetails || '',
  ventilationConcernsDetails: item.ventilationConcernsDetails || '',
  leadConcernsDetails: item.leadConcernsDetails || '',
  asbestosConcernsDetails: item.asbestosConcernsDetails || '',
  noiseConcernsDetails: item.noiseConcernsDetails || '',
  dirtDustConcernsDetails: item.dirtDustConcernsDetails || '',
  wasteConcernsDetails: item.wasteConcernsDetails || '',
  pestInfestationDetails: item.pestInfestationDetails || '',
  unsanitaryConditionsDetails: item.unsanitaryConditionsDetails || '',
  coldHeatConcernsDetails: item.coldHeatConcernsDetails || '',
  roomSizeConcernsDetails: item.roomSizeConcernsDetails || '',
  liftsHoistsConcernsDetails: item.liftsHoistsConcernsDetails || '',
  adaptationsConcernsDetails: item.adaptationsConcernsDetails || '',
  brokenGlazingDetails: item.brokenGlazingDetails || '',
  coshhSubstancesDetails: item.coshhSubstancesDetails || '',
  coshhSheetsAvailableDetails: item.coshhSheetsAvailableDetails || '',
  animalsInHomeDetails: item.animalsInHomeDetails || '',
  animalSafetyRiskDetails: item.animalSafetyRiskDetails || '',
  animalHygieneRiskDetails: item.animalHygieneRiskDetails || '',
  animalWasteDetails: item.animalWasteDetails || '',
  environmentalWasteDetails: item.environmentalWasteDetails || '',
  bodilyExcrementsDetails: item.bodilyExcrementsDetails || '',
  identifiedRisksStaffDetails: item.identifiedRisksStaffDetails || '',
  crackedWindowsDetails: item.crackedWindowsDetails || '',
  identifiedRisksServiceUserDetails:
    item.identifiedRisksServiceUserDetails || '',
  protectiveClothingNeededDetails: item.protectiveClothingNeededDetails || '',
  risksToStaffDetails: item.risksToStaffDetails || '',
  risksToServiceUserDetails: item.risksToServiceUserDetails || '',
  risksToOthersDetails: item.risksToOthersDetails || '',
  cashSecureDetails: item.cashSecureDetails || '',
  staffHandleMoneyDetails: item.staffHandleMoneyDetails || '',
  foodInDateDetails: item.foodInDateDetails || '',
  foodPreparationDetails: item.foodPreparationDetails || '',
  foodHygieneStandardsDetails: item.foodHygieneStandardsDetails || '',
  cookingFacilitiesSafeDetails: item.cookingFacilitiesSafeDetails || '',
  refrigeratorTempDetails: item.refrigeratorTempDetails || '',
  freezerTempDetails: item.freezerTempDetails || '',
  handWashingFacilitiesDetails: item.handWashingFacilitiesDetails || '',
  kitchenCleanDetails: item.kitchenCleanDetails || '',
  separateStorageDetails: item.separateStorageDetails || '',
  hotColdWaterDetails: item.hotColdWaterDetails || '',
  staffTrainingNeededDetails: item.staffTrainingNeededDetails || '',
  outingStaffRisksDetails: item.outingStaffRisksDetails || '',
  outingServiceUserRisksDetails: item.outingServiceUserRisksDetails || '',
  staffTakeOutDetails: item.staffTakeOutDetails || '',
  staffTransportDetails: item.staffTransportDetails || '',
  publicTransportDetails: item.publicTransportDetails || '',
  otherTransportDetails: item.otherTransportDetails || '',
  carUsedDetails: item.carUsedDetails || ''
});

export const RiskAssessmentTab: React.FC = () => {
  const { sid } = useParams<{ sid: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState<RiskAssessmentForm>(emptyForm());
  const { toast } = useToast();

  const setField = <K extends keyof RiskAssessmentForm>(
    key: K,
    value: RiskAssessmentForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateFixedEntry = (
    entriesKey: FixedEntriesKey,
    index: number,
    field: keyof MovingHandlingEntry,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [entriesKey]: prev[entriesKey].map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const fetchRiskAssessment = useCallback(async () => {
    if (!sid) return;
    try {
      const [assessmentRes, userRes] = await Promise.all([
        axiosInstance.get('/risk-assessment', {
          params: { serviceUserId: sid, limit: 1 }
        }),
        axiosInstance.get(`/users/${sid}`)
      ]);
      const user = userRes.data?.data;
      setUserData(user);
      const result = assessmentRes.data?.data?.result || [];
      if (result.length > 0) {
        setAssessmentId(result[0]._id);
        setForm(withUserFallback(mapToForm(result[0]), user));
        setShowForm(true);
      } else {
        setAssessmentId(null);
        setForm(withUserFallback(emptyForm(), user));
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to fetch risk assessment:', error);
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    fetchRiskAssessment();
  }, [fetchRiskAssessment]);

  const handleSave = async () => {
    if (!sid) return;
    setSaving(true);
    try {
      const payload = {
        serviceUserId: sid,
        serviceUserName: form.serviceUserName,
        preferredTermOfAddress: form.preferredTermOfAddress,
        dateOfFirstAssessment: toISOString(form.dateOfFirstAssessment),
        address: form.address,
        dob: toISOString(form.dob),
        telNumber: form.telNumber,
        caseManager: form.caseManager,
        assessorsName: form.assessorsName,
        assessorsSignatureUrl: form.assessorsSignatureUrl,
        section1Explanation: form.section1Explanation,
        mobilityEntries: form.mobilityEntries,
        mobilityTotalScore: form.mobilityTotalScore,
        mobilityRiskRating: form.mobilityRiskRating,
        fallEntries: form.fallEntries,
        fallTotalScore: form.fallTotalScore,
        incontinenceEntries: form.incontinenceEntries,
        incontinenceTotalScore: form.incontinenceTotalScore,
        attachmentEntries: form.attachmentEntries,
        attachmentTotalScore: form.attachmentTotalScore,
        mentalHealthEntries: form.mentalHealthEntries,
        mentalHealthTotalScore: form.mentalHealthTotalScore,
        sightHearingEntries: form.sightHearingEntries,
        sightHearingTotalScore: form.sightHearingTotalScore,
        weightEntries: form.weightEntries,
        weightTotalScore: form.weightTotalScore,
        unpredictableMovementsEntries: form.unpredictableMovementsEntries,
        unpredictableMovementsTotalScore: form.unpredictableMovementsTotalScore,
        movingHandlingTotalScore: form.movingHandlingTotalScore,
        section2Explanation: form.section2Explanation,
        taskEntries: form.taskEntries,
        tasksTotalScore: form.tasksTotalScore,
        section3Explanation: form.section3Explanation,
        medicationSupplies: form.medicationSupplies,
        takingMedication: form.takingMedication,
        topicalApplications: form.topicalApplications,
        medications: form.medications,
        medicalCareTasks: form.medicalCareTasks,
        hasAllergies: form.hasAllergies,
        allergiesComments: form.allergiesComments,
        allergiesAction: form.allergiesAction,
        section4Explanation: form.section4Explanation,
        riskCooking: form.riskCooking,
        riskBathing: form.riskBathing,
        riskDressing: form.riskDressing,
        riskCleaning: form.riskCleaning,
        riskOutings: form.riskOutings,
        riskOther: form.riskOther,
        riskOtherText: form.riskOtherText,
        agreedActionServiceUser: form.agreedActionServiceUser,
        workerRiskCooking: form.workerRiskCooking,
        workerRiskBathing: form.workerRiskBathing,
        workerRiskDressing: form.workerRiskDressing,
        workerRiskCleaning: form.workerRiskCleaning,
        workerRiskOutings: form.workerRiskOutings,
        workerRiskOther: form.workerRiskOther,
        workerRiskOtherText: form.workerRiskOtherText,
        agreedActionWorkers: form.agreedActionWorkers,
        aggressiveBehaviourVerbal: form.aggressiveBehaviourVerbal,
        aggressiveBehaviourVerbalAction: form.aggressiveBehaviourVerbalAction,
        aggressiveBehaviourPhysical: form.aggressiveBehaviourPhysical,
        aggressiveBehaviourPhysicalAction:
          form.aggressiveBehaviourPhysicalAction,
        criminalHistory: form.criminalHistory,
        criminalHistoryDetails: form.criminalHistoryDetails,
        transmittableDiseases: form.transmittableDiseases,
        section5Explanation: form.section5Explanation,
        accommodationType: form.accommodationType,
        accommodationOther: form.accommodationOther,
        travellingRisks: form.travellingRisks,
        travellingRisksDetails: form.travellingRisksDetails,
        hasTelephone: form.hasTelephone,
        telephoneConcerns: form.telephoneConcerns,
        highCrimeArea: form.highCrimeArea,
        areaIsolated: form.areaIsolated,
        safetyRisksComments: form.safetyRisksComments,
        waterCutOff: form.waterCutOff,
        gasCutOff: form.gasCutOff,
        electricMeter: form.electricMeter,
        electricalWiringConcerns: form.electricalWiringConcerns,
        electricMeterType: form.electricMeterType,
        lightingConcerns: form.lightingConcerns,
        circuitBreaker: form.circuitBreaker,
        heatingSource: form.heatingSource,
        gasConcerns: form.gasConcerns,
        heatingConcerns: form.heatingConcerns,
        cookingSource: form.cookingSource,
        hotWaterConcerns: form.hotWaterConcerns,
        thermostaticRegulator: form.thermostaticRegulator,
        securityLocks: form.securityLocks,
        keyBox: form.keyBox,
        keyBoxLocation: form.keyBoxLocation,
        stairGates: form.stairGates,
        monitoredMedicationBox: form.monitoredMedicationBox,
        keySafe: form.keySafe,
        serviceUserSmoker: form.serviceUserSmoker,
        fireHazards: form.fireHazards,
        staffRisks: form.staffRisks,
        serviceUserRisks: form.serviceUserRisks,
        fireOfficerAssessment: form.fireOfficerAssessment,
        fireEscapeRoutes: form.fireEscapeRoutes,
        unauthorisedActivitiesClarified: form.unauthorisedActivitiesClarified,
        adequateLighting: form.adequateLighting,
        accessWaysHazards: form.accessWaysHazards,
        buildingRepair: form.buildingRepair,
        tripsFallsHazards: form.tripsFallsHazards,
        stairsRepair: form.stairsRepair,
        lowCeilings: form.lowCeilings,
        ventilationConcerns: form.ventilationConcerns,
        leadConcerns: form.leadConcerns,
        asbestosConcerns: form.asbestosConcerns,
        noiseConcerns: form.noiseConcerns,
        dirtDustConcerns: form.dirtDustConcerns,
        wasteConcerns: form.wasteConcerns,
        pestInfestation: form.pestInfestation,
        unsanitaryConditions: form.unsanitaryConditions,
        coldHeatConcerns: form.coldHeatConcerns,
        roomSizeConcerns: form.roomSizeConcerns,
        liftsHoistsConcerns: form.liftsHoistsConcerns,
        adaptationsConcerns: form.adaptationsConcerns,
        brokenGlazing: form.brokenGlazing,
        coshhSubstances: form.coshhSubstances,
        coshhSheetsAvailable: form.coshhSheetsAvailable,
        animalsInHome: form.animalsInHome,
        animalSafetyRisk: form.animalSafetyRisk,
        animalHygieneRisk: form.animalHygieneRisk,
        animalWaste: form.animalWaste,
        environmentalWaste: form.environmentalWaste,
        bodilyExcrements: form.bodilyExcrements,
        identifiedRisksStaff: form.identifiedRisksStaff,
        crackedWindows: form.crackedWindows,
        identifiedRisksServiceUser: form.identifiedRisksServiceUser,
        protectiveClothingNeeded: form.protectiveClothingNeeded,
        risksToStaff: form.risksToStaff,
        risksToServiceUser: form.risksToServiceUser,
        risksToOthers: form.risksToOthers,
        cashSecure: form.cashSecure,
        financialRisks: form.financialRisks,
        financialRisksMinimise: form.financialRisksMinimise,
        staffHandleMoney: form.staffHandleMoney,
        foodInDate: form.foodInDate,
        foodPreparation: form.foodPreparation,
        foodHygieneStandards: form.foodHygieneStandards,
        cookingFacilitiesSafe: form.cookingFacilitiesSafe,
        refrigeratorTemp: form.refrigeratorTemp,
        freezerTemp: form.freezerTemp,
        handWashingFacilities: form.handWashingFacilities,
        kitchenClean: form.kitchenClean,
        separateStorage: form.separateStorage,
        hotColdWater: form.hotColdWater,
        staffTrainingNeeded: form.staffTrainingNeeded,
        outingStaffRisks: form.outingStaffRisks,
        outingServiceUserRisks: form.outingServiceUserRisks,
        staffTakeOut: form.staffTakeOut,
        staffTransport: form.staffTransport,
        publicTransport: form.publicTransport,
        otherTransport: form.otherTransport,
        carUsed: form.carUsed,
        section6Explanation: form.section6Explanation,
        careWorkerComments: form.careWorkerComments,
        additionalRisksIdentified: form.additionalRisksIdentified,
        actionNeededPriorService: form.actionNeededPriorService,
        assessorName: form.assessorName,
        assessorSignatureUrl: form.assessorSignatureUrl,
        assessorDate: toISOString(form.assessorDate),
        serviceUserNameKin: form.serviceUserNameKin,
        serviceUserSignatureUrl: form.serviceUserSignatureUrl,
        serviceUserDate: toISOString(form.serviceUserDate),
        nextReviewDate: toISOString(form.nextReviewDate),
        personResponsible: form.personResponsible,
        dateCompletionReview: toISOString(form.dateCompletionReview),
        equipmentRequired: form.equipmentRequired,
        equipmentSupplierName: form.equipmentSupplierName,
        equipmentSupplierTel: form.equipmentSupplierTel,
        equipmentServiceInterval: form.equipmentServiceInterval,
        equipmentServiceDate: toISOString(form.equipmentServiceDate),
        hoistServiceDate: toISOString(form.hoistServiceDate),
        travellingDirectionDetails: form.travellingDirectionDetails,
        electricalWiringConcernsDetails: form.electricalWiringConcernsDetails,
        circuitBreakerDetails: form.circuitBreakerDetails,
        lightingConcernsDetails: form.lightingConcernsDetails,
        gasConcernsDetails: form.gasConcernsDetails,
        heatingConcernsDetails: form.heatingConcernsDetails,
        hotWaterConcernsDetails: form.hotWaterConcernsDetails,
        thermostaticRegulatorDetails: form.thermostaticRegulatorDetails,
        securityLocksDetails: form.securityLocksDetails,
        stairGatesDetails: form.stairGatesDetails,
        monitoredMedicationBoxDetails: form.monitoredMedicationBoxDetails,
        keySafeDetails: form.keySafeDetails,
        serviceUserSmokerDetails: form.serviceUserSmokerDetails,
        fireHazardsDetails: form.fireHazardsDetails,
        staffRisksDetails: form.staffRisksDetails,
        serviceUserRisksDetails: form.serviceUserRisksDetails,
        fireOfficerAssessmentDetails: form.fireOfficerAssessmentDetails,
        unauthorisedActivitiesClarifiedDetails:
          form.unauthorisedActivitiesClarifiedDetails,
        adequateLightingDetails: form.adequateLightingDetails,
        accessWaysHazardsDetails: form.accessWaysHazardsDetails,
        buildingRepairDetails: form.buildingRepairDetails,
        tripsFallsHazardsDetails: form.tripsFallsHazardsDetails,
        stairsRepairDetails: form.stairsRepairDetails,
        lowCeilingsDetails: form.lowCeilingsDetails,
        ventilationConcernsDetails: form.ventilationConcernsDetails,
        leadConcernsDetails: form.leadConcernsDetails,
        asbestosConcernsDetails: form.asbestosConcernsDetails,
        noiseConcernsDetails: form.noiseConcernsDetails,
        dirtDustConcernsDetails: form.dirtDustConcernsDetails,
        wasteConcernsDetails: form.wasteConcernsDetails,
        pestInfestationDetails: form.pestInfestationDetails,
        unsanitaryConditionsDetails: form.unsanitaryConditionsDetails,
        coldHeatConcernsDetails: form.coldHeatConcernsDetails,
        roomSizeConcernsDetails: form.roomSizeConcernsDetails,
        liftsHoistsConcernsDetails: form.liftsHoistsConcernsDetails,
        adaptationsConcernsDetails: form.adaptationsConcernsDetails,
        brokenGlazingDetails: form.brokenGlazingDetails,
        coshhSubstancesDetails: form.coshhSubstancesDetails,
        coshhSheetsAvailableDetails: form.coshhSheetsAvailableDetails,
        animalsInHomeDetails: form.animalsInHomeDetails,
        animalSafetyRiskDetails: form.animalSafetyRiskDetails,
        animalHygieneRiskDetails: form.animalHygieneRiskDetails,
        animalWasteDetails: form.animalWasteDetails,
        environmentalWasteDetails: form.environmentalWasteDetails,
        bodilyExcrementsDetails: form.bodilyExcrementsDetails,
        identifiedRisksStaffDetails: form.identifiedRisksStaffDetails,
        crackedWindowsDetails: form.crackedWindowsDetails,
        identifiedRisksServiceUserDetails:
          form.identifiedRisksServiceUserDetails,
        protectiveClothingNeededDetails: form.protectiveClothingNeededDetails,
        risksToStaffDetails: form.risksToStaffDetails,
        risksToServiceUserDetails: form.risksToServiceUserDetails,
        risksToOthersDetails: form.risksToOthersDetails,
        cashSecureDetails: form.cashSecureDetails,
        staffHandleMoneyDetails: form.staffHandleMoneyDetails,
        foodInDateDetails: form.foodInDateDetails,
        foodPreparationDetails: form.foodPreparationDetails,
        foodHygieneStandardsDetails: form.foodHygieneStandardsDetails,
        cookingFacilitiesSafeDetails: form.cookingFacilitiesSafeDetails,
        refrigeratorTempDetails: form.refrigeratorTempDetails,
        freezerTempDetails: form.freezerTempDetails,
        handWashingFacilitiesDetails: form.handWashingFacilitiesDetails,
        kitchenCleanDetails: form.kitchenCleanDetails,
        separateStorageDetails: form.separateStorageDetails,
        hotColdWaterDetails: form.hotColdWaterDetails,
        staffTrainingNeededDetails: form.staffTrainingNeededDetails,
        outingStaffRisksDetails: form.outingStaffRisksDetails,
        outingServiceUserRisksDetails: form.outingServiceUserRisksDetails,
        staffTakeOutDetails: form.staffTakeOutDetails,
        staffTransportDetails: form.staffTransportDetails,
        publicTransportDetails: form.publicTransportDetails,
        otherTransportDetails: form.otherTransportDetails,
        carUsedDetails: form.carUsedDetails
      };

      if (assessmentId) {
        await axiosInstance.patch(`/risk-assessment/${assessmentId}`, payload);
        toast({
          title: 'Success!',
          description: 'Risk Assessment updated successfully',
          className: 'bg-watney border-none text-white'
        });
      } else {
        const res = await axiosInstance.post('/risk-assessment', payload);
        setAssessmentId(res.data?.data?._id || null);
        toast({
          title: 'Success!',
          description: 'Risk Assessment created successfully',
          className: 'bg-watney border-none text-white'
        });
      }
    } catch (error: any) {
      console.error('Failed to save risk assessment:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to save Risk Assessment',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderRiskSectionTable = (
    entriesKey: FixedEntriesKey,
    title: string,
    options: string[],
    scoreLabel: string,
    scoreValue: string,
    onScoreChange: (value: string) => void
  ) => {
    const entry = form[entriesKey][0] || emptyMovingHandlingEntry();
    return (
      <div className="overflow-hidden rounded-lg border border-gray-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                {title}
              </th>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                RISK
              </th>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                HOW TO MINIMISE THE RISK
              </th>
            </tr>
          </thead>
          <tbody>
            {options.map((option, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-gray-300 px-3 py-2 align-middle text-gray-700">
                  {option}
                </td>
                {index === 0 && (
                  <>
                    <td
                      rowSpan={options.length}
                      className="border border-gray-300 px-2 py-2 align-top"
                    >
                      <Textarea
                        value={entry.risk}
                        onChange={(e) =>
                          updateFixedEntry(
                            entriesKey,
                            0,
                            'risk',
                            e.target.value
                          )
                        }
                        placeholder="Identified risk / current situation"
                        className="min-h-[140px] border-0 shadow-none focus-visible:ring-0"
                      />
                    </td>
                    <td
                      rowSpan={options.length}
                      className="border border-gray-300 px-2 py-2 align-top"
                    >
                      <Textarea
                        value={entry.minimiseRisk}
                        onChange={(e) =>
                          updateFixedEntry(
                            entriesKey,
                            0,
                            'minimiseRisk',
                            e.target.value
                          )
                        }
                        placeholder="How to minimise the risk"
                        className="min-h-[140px] border-0 shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                {scoreLabel}
              </td>
              <td colSpan={2} className="border border-gray-300 px-2 py-1">
                <Input
                  type="text"
                  value={scoreValue}
                  onChange={(e) => onScoreChange(e.target.value)}
                  placeholder="0"
                  className="h-9 w-32 bg-white"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderYesNoRadio = (
    value: boolean | null,
    onChange: (val: boolean | null) => void
  ) => {
    const yesId = `yes-${Math.random()}`;
    const noId = `no-${Math.random()}`;
    return (
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={yesId}
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked ? true : null)}
          />
          <Label htmlFor={yesId}>Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={noId}
            checked={value === false}
            onCheckedChange={(checked) => onChange(checked ? false : null)}
          />
          <Label htmlFor={noId}>No</Label>
        </div>
      </div>
    );
  };

  const updateYesNoField = (
    fieldKey:
      | 'medicationSupplies'
      | 'takingMedication'
      | 'topicalApplications'
      | 'medicalCareTasks',
    index: number,
    subField: keyof YesNoField,
    value: boolean | string | null
  ) => {
    setForm((prev) => ({
      ...prev,
      [fieldKey]: prev[fieldKey].map((row, i) =>
        i === index ? { ...row, [subField]: value } : row
      )
    }));
  };

  const updateMedicationEntry = (
    index: number,
    field: keyof MedicationEntry,
    value: string | boolean | null
  ) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (!showForm) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <FileText className="h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            No Risk Assessment exists for this service user yet.
          </p>
          <Button
            onClick={() => {
              setForm(withUserFallback(emptyForm(), userData));
              setShowForm(true);
            }}
            variant="default"
          >
            Save & Create Risk Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-center font-bold">Risk Assessment</CardTitle>
        <Button onClick={handleSave} disabled={saving} variant="default">
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Header Info */}
        <section className="space-y-4">
          <h3 className="text-sm text-center font-bold">Service User Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Service User Name</Label>
              <Input
                value={form.serviceUserName}
                onChange={(e) => setField('serviceUserName', e.target.value)}
                placeholder="Service user name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Preferred Term of Address</Label>
              <Input
                value={form.preferredTermOfAddress}
                onChange={(e) =>
                  setField('preferredTermOfAddress', e.target.value)
                }
                placeholder="Preferred term of address"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Date of First Assessment</Label>
              <CustomDatePicker
                selected={form.dateOfFirstAssessment}
                onChange={(date) => setField('dateOfFirstAssessment', date)}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Address"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">DOB</Label>
              <CustomDatePicker
                selected={form.dob}
                onChange={(date) => setField('dob', date)}
                placeholder="Select DOB"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Tel. Number</Label>
              <Input
                value={form.telNumber}
                onChange={(e) => setField('telNumber', e.target.value)}
                placeholder="Telephone number"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Case Manager</Label>
              <Input
                value={form.caseManager}
                onChange={(e) => setField('caseManager', e.target.value)}
                placeholder="Case manager"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Assessor's Name</Label>
              <Input
                value={form.assessorsName}
                onChange={(e) => setField('assessorsName', e.target.value)}
                placeholder="Assessor name"
              />
            </div>
            <div className="space-y-2">
              <SignatureField
                label="Assessor's Signature"
                entityId={sid}
                signatureUrl={form.assessorsSignatureUrl}
                onSaved={(url) => setField('assessorsSignatureUrl', url)}
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Section 1: Moving & Handling */}
        <section className="space-y-4">
          <h3 className="text-sm text-center font-bold">
            SECTION (1) MOVING & HANDLING
          </h3>

          {/* 1A. Mobility */}
          <div className="space-y-3">
            {renderRiskSectionTable(
              'mobilityEntries',
              "1A. SERVICE USERS' MOBILITY",
              MOBILITY_OPTIONS,
              'SCORE',
              form.mobilityTotalScore,
              (value) => setField('mobilityTotalScore', value)
            )}
          </div>

          {/* 1B. Falls */}
          <div className="space-y-3">
            {renderRiskSectionTable(
              'fallEntries',
              '1B. DOES THE SERVICE USER FALL?',
              FALL_OPTIONS,
              'SCORE =',
              form.fallTotalScore,
              (value) => setField('fallTotalScore', value)
            )}
          </div>

          {/* 1C. Incontinence */}
          <div className="space-y-3">
            {renderRiskSectionTable(
              'incontinenceEntries',
              '1C. INCONTINENCE',
              INCONTINENCE_OPTIONS,
              'SCORE =',
              form.incontinenceTotalScore,
              (value) => setField('incontinenceTotalScore', value)
            )}
          </div>

          {/* 1D. Attachments */}
          <div className="space-y-3">
            {renderRiskSectionTable(
              'attachmentEntries',
              '1D. DOES SERVICE USER HAVE ANY FORM OF ATTACHMENT E.G. CATHETER, IVI, OXYGEN?',
              ATTACHMENT_OPTIONS,
              'SCORE =',
              form.attachmentTotalScore,
              (value) => setField('attachmentTotalScore', value)
            )}
          </div>

          {/* 1E. Mental Health */}
          <div className="space-y-3">
            {renderRiskSectionTable(
              'mentalHealthEntries',
              '1E. DOES THE SERVICE USER HAVE ANY MENTAL HEALTH PROBLEMS OR CHALLENGING BEHAVIOUR? (PLEASE LIST ANY RELEVANT PSYCHIATRIC/PSYCHOLOGICAL DIAGNOSIS)',
              MENTAL_HEALTH_OPTIONS,
              'SCORE =',
              form.mentalHealthTotalScore,
              (value) => setField('mentalHealthTotalScore', value)
            )}
          </div>

          {/* 1F. Sight/Hearing */}
          <div className="space-y-3">
            {renderRiskSectionTable(
              'sightHearingEntries',
              '1F. DOES THE SERVICE USERS HAVE ANY SIGHT/ HEARING/ IMPEDIMENT?',
              SIGHT_HEARING_OPTIONS,
              'SCORE =',
              form.sightHearingTotalScore,
              (value) => setField('sightHearingTotalScore', value)
            )}
          </div>

          {/* 1G. Weight */}
          <div className="space-y-3">
            {renderRiskSectionTable(
              'weightEntries',
              '1G. HOW MUCH DOES THE PERSON WEIGH?',
              WEIGHT_OPTIONS,
              'SCORE =',
              form.weightTotalScore,
              (value) => setField('weightTotalScore', value)
            )}
          </div>

          {/* 1H. Unpredictable Movements */}
          <div className="space-y-3">
            {renderRiskSectionTable(
              'unpredictableMovementsEntries',
              '1H. DOES THE PERSON HAVE UNPREDICTABLE MOVEMENTS',
              UNPREDICTABLE_MOVEMENTS_OPTIONS,
              'SCORE =',
              form.unpredictableMovementsTotalScore,
              (value) => setField('unpredictableMovementsTotalScore', value)
            )}
          </div>

          {/* Total Score */}
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                    TOTAL SCORE FOR MOVING & HANDLING SECTION:
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                    Risk Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700">
                    Risk rating: 0-20 = Low Risk, 20-40 = Medium Risk, 40+ =
                    High Risk
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    Total Score = 20-40 Medium Risk
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <Separator />

        {/* Section 2: Moving & Handling Tasks */}
        <section className="space-y-4">
          <h3 className="text-sm text-center font-bold">
            SECTION (2) MOVING & HANDLING TASKS
          </h3>

          <div className="space-y-3">
            {renderRiskSectionTable(
              'taskEntries',
              '2A. WHAT TASKS DOES THE SERVICE USER NEED ASSISTANCE WITH?',
              TASK_OPTIONS,
              'Total score for Manual Handling tasks section',
              form.tasksTotalScore,
              (value) => setField('tasksTotalScore', value)
            )}
            <p className="text-sm text-gray-500">
              Risk rating 0-3 = Low Risk, 3-7 = Medium Risk, 7+ = High Risk
            </p>
          </div>
        </section>

        <Separator />

        {/* Section 3: Medication */}
        <section className="space-y-4">
          <h3 className="text-sm text-center font-bold">SECTION (3)</h3>
          <h3 className="text-sm text-center font-bold">MEDICATION</h3>

          {/* 3A. Obtaining Supplies/Storage */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">3A. Obtaining Supplies/Storage</h4>
            {[
              'Is the service user able to obtain supplies of medication as needed',
              'Can relatives/a neighbour etc. collect supplies',
              'Does the pharmacy used deliver',
              'Is medication stored in a suitable place',
              'Does the service user know where the medication is stored',
              'Can the family/service user tell you where medication is stored',
              'Is there excess medication in the house',
              'Can the family/service user return all excess medication to the pharmacy'
            ].map((label, index) => (
              <div key={index} className="space-y-2 border-b pb-3">
                <Label className="text-sm">{label}</Label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  {renderYesNoRadio(
                    form.medicationSupplies[index]?.applicable ?? null,
                    (val) =>
                      updateYesNoField(
                        'medicationSupplies',
                        index,
                        'applicable',
                        val
                      )
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Comments</Label>
                    <Textarea
                      value={form.medicationSupplies[index]?.comments || ''}
                      onChange={(e) =>
                        updateYesNoField(
                          'medicationSupplies',
                          index,
                          'comments',
                          e.target.value
                        )
                      }
                      placeholder="Comments"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Action</Label>
                    <Textarea
                      value={form.medicationSupplies[index]?.action || ''}
                      onChange={(e) =>
                        updateYesNoField(
                          'medicationSupplies',
                          index,
                          'action',
                          e.target.value
                        )
                      }
                      placeholder="Action"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Taking Medication */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">Taking Medication</h4>
            {[
              'Does the service user remember to take their medication',
              'Does the service user take any non-prescribed medication',
              'Does the service user require oxygen therapy',
              'Does the service user take medication via a nebuliser',
              'Does the service user take their medication accurately',
              'Are there any prompting aids etc used to assist the service user',
              'Does the service user want to take their medication',
              'Can the service user read labels on the medication',
              'Can the service user get the tablets etc. out of the bottle',
              'Can the service user pick tablets up once out of the container',
              'If difficulty with packaging could medication be in alternative containers',
              'Can the service user pick up a bottle and pour out a dose of liquid medication',
              'If difficulty taking medication could a relative/friend help',
              'Does the service user have any swallowing problems',
              'If the service user has swallowing difficulties could the medication be dispensed in soluble/liquid form'
            ].map((label, index) => (
              <div key={index} className="space-y-2 border-b pb-3">
                <Label className="text-sm">{label}</Label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  {renderYesNoRadio(
                    form.takingMedication[index]?.applicable ?? null,
                    (val) =>
                      updateYesNoField(
                        'takingMedication',
                        index,
                        'applicable',
                        val
                      )
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Comments</Label>
                    <Textarea
                      value={form.takingMedication[index]?.comments || ''}
                      onChange={(e) =>
                        updateYesNoField(
                          'takingMedication',
                          index,
                          'comments',
                          e.target.value
                        )
                      }
                      placeholder="Comments"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Action</Label>
                    <Textarea
                      value={form.takingMedication[index]?.action || ''}
                      onChange={(e) =>
                        updateYesNoField(
                          'takingMedication',
                          index,
                          'action',
                          e.target.value
                        )
                      }
                      placeholder="Action"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Applying Topical Applications */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">Applying Topical Applications</h4>
            {[
              'Can the service user use an inhaler',
              'Can the service user instil eye drops',
              'Can relatives/friend etc assist the service user',
              'Would a compliance aid for inhalers/eye drops etc help',
              'Can the service user apply creams/ointments etc',
              'Can a DN/relative/friend assist'
            ].map((label, index) => (
              <div key={index} className="space-y-2 border-b pb-3">
                <Label className="text-sm">{label}</Label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  {renderYesNoRadio(
                    form.topicalApplications[index]?.applicable ?? null,
                    (val) =>
                      updateYesNoField(
                        'topicalApplications',
                        index,
                        'applicable',
                        val
                      )
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Comments</Label>
                    <Textarea
                      value={form.topicalApplications[index]?.comments || ''}
                      onChange={(e) =>
                        updateYesNoField(
                          'topicalApplications',
                          index,
                          'comments',
                          e.target.value
                        )
                      }
                      placeholder="Comments"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Action</Label>
                    <Textarea
                      value={form.topicalApplications[index]?.action || ''}
                      onChange={(e) =>
                        updateYesNoField(
                          'topicalApplications',
                          index,
                          'action',
                          e.target.value
                        )
                      }
                      placeholder="Action"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Medication Details */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">Medication Details</h4>
            <div className="space-y-4">
              {form.medications.map((med, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <h5 className="text-sm text-center font-bold">Medication {index + 1}</h5>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Name of Medication</Label>
                      <Input
                        value={med.name}
                        onChange={(e) =>
                          updateMedicationEntry(index, 'name', e.target.value)
                        }
                        placeholder="Medication name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Dose</Label>
                      <Input
                        value={med.dose}
                        onChange={(e) =>
                          updateMedicationEntry(index, 'dose', e.target.value)
                        }
                        placeholder="Dose"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Frequency</Label>
                      <Input
                        value={med.frequency}
                        onChange={(e) =>
                          updateMedicationEntry(
                            index,
                            'frequency',
                            e.target.value
                          )
                        }
                        placeholder="Frequency"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Time Taken</Label>
                      <Input
                        value={med.timeTaken}
                        onChange={(e) =>
                          updateMedicationEntry(
                            index,
                            'timeTaken',
                            e.target.value
                          )
                        }
                        placeholder="Time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Number taken per day</Label>
                      <Input
                        value={med.numberPerDay}
                        onChange={(e) =>
                          updateMedicationEntry(
                            index,
                            'numberPerDay',
                            e.target.value
                          )
                        }
                        placeholder="Per day"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label className="text-sm">
                        Potential Side Effects e.g. stiffness, shaking, facial
                        contortion, shuffling gait, weight gain, excess sedation
                      </Label>
                      <Input
                        value={med.sideEffects}
                        onChange={(e) =>
                          updateMedicationEntry(
                            index,
                            'sideEffects',
                            e.target.value
                          )
                        }
                        placeholder="Side effects"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label className="text-sm">Any COSHH risks identified?</Label>
                      {renderYesNoRadio(med.coshhRisk, (val) =>
                        updateMedicationEntry(index, 'coshhRisk', val)
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Care Tasks */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">Medical Care Tasks</h4>
            {[
              'Can the service user empty their catheter',
              'Can the service user change their catheter bag',
              'Can a relative help the service user to manage their catheter',
              'Can the service user change their stoma independently',
              'Can a DN/relative/friend assist'
            ].map((label, index) => (
              <div key={index} className="space-y-2 border-b pb-3">
                <Label className="text-sm">{label}</Label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  {renderYesNoRadio(
                    form.medicalCareTasks[index]?.applicable ?? null,
                    (val) =>
                      updateYesNoField(
                        'medicalCareTasks',
                        index,
                        'applicable',
                        val
                      )
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Comments</Label>
                    <Textarea
                      value={form.medicalCareTasks[index]?.comments || ''}
                      onChange={(e) =>
                        updateYesNoField(
                          'medicalCareTasks',
                          index,
                          'comments',
                          e.target.value
                        )
                      }
                      placeholder="Comments"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Action</Label>
                    <Textarea
                      value={form.medicalCareTasks[index]?.action || ''}
                      onChange={(e) =>
                        updateYesNoField(
                          'medicalCareTasks',
                          index,
                          'action',
                          e.target.value
                        )
                      }
                      placeholder="Action"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Medical History */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">Medical History</h4>
            <div className="space-y-2">
              <Label className="text-sm">Does the Service User have any allergies?</Label>
              {renderYesNoRadio(form.hasAllergies, (val) =>
                setField('hasAllergies', val)
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Comments</Label>
                  <Textarea
                    value={form.allergiesComments}
                    onChange={(e) =>
                      setField('allergiesComments', e.target.value)
                    }
                    placeholder="Allergies comments"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Action</Label>
                  <Textarea
                    value={form.allergiesAction}
                    onChange={(e) =>
                      setField('allergiesAction', e.target.value)
                    }
                    placeholder="Action"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Section 4: Risks Associated with Maintaining Independence */}
        <section className="space-y-4">
          <h3 className="text-sm text-center font-bold">
            SECTION (4)
          </h3>
          <div>

          <h3 className="text-sm text-center font-bold">
           RISKS ASSOCIATED WITH MAINTAINING INDEPENDENCE IN DAILY
            ACTIVITIES
          </h3>
<p className='text-center'>DETAILED EXPLANATION:  Highlighting risk other and method of current control – what is the current situation?</p>
          </div>
          {/* 4A. Risks to Service User */}

          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                    4A. List Risks to Service User in relation to:
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800"></th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800"></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'riskCooking', label: 'Cooking' },
                  { key: 'riskBathing', label: 'Bathing' },
                  { key: 'riskDressing', label: 'Dressing' },
                  { key: 'riskCleaning', label: 'Cleaning' },
                  { key: 'riskOutings', label: 'Going on outings' },
                  { key: 'riskOther', label: 'Other' }
                ].map((item) => (
                  <tr key={item.key} className="bg-white">
                    <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700">
                      {item.label}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${item.key}-yes`}
                            checked={
                              form[item.key as keyof RiskAssessmentForm] ===
                              true
                            }
                            onCheckedChange={(checked) =>
                              setField(
                                item.key as keyof RiskAssessmentForm,
                                checked ? true : null
                              )
                            }
                          />
                          <Label htmlFor={`${item.key}-yes`}>Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${item.key}-no`}
                            checked={
                              form[item.key as keyof RiskAssessmentForm] ===
                              false
                            }
                            onCheckedChange={(checked) =>
                              setField(
                                item.key as keyof RiskAssessmentForm,
                                checked ? false : null
                              )
                            }
                          />
                          <Label htmlFor={`${item.key}-no`}>No</Label>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {item.key === 'riskOther' ? (
                        <Input
                          value={form.riskOtherText}
                          onChange={(e) =>
                            setField('riskOtherText', e.target.value)
                          }
                          placeholder="Specify other risk..."
                          className="border-0 shadow-none focus-visible:ring-0"
                        />
                      ) : (
                        <Textarea
                          value={
                            (form[
                              `${item.key}Comment` as keyof RiskAssessmentForm
                            ] as string) || ''
                          }
                          onChange={(e) =>
                            setField(
                              `${item.key}Comment` as keyof RiskAssessmentForm,
                              e.target.value as any
                            )
                          }
                          placeholder="Add comment..."
                          className="min-h-[60px] border-0 shadow-none focus-visible:ring-0"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4B. Agreed Action Service User */}
          <div className="space-y-2">
            <Label className="text-sm">
              4B. AGREED ACTION: BY EVERYCARE NEEDED TO MINIMISE THE RISKS TO
              SERVICE USER LISTED IN 4A ABOVE
            </Label>
            <h1 className="text-sm">
              Everycare Romford will ensure that S/u’s care package needs are
              met accordingly. Carer to ensure that the S/u is safe in the
              premises. Carer to ensure that S/u is free from any risk of harm.
              Carer to ensure they follow all the Govt guideline with PPE and
              infection control.
            </h1>
            <Textarea
              value={form.agreedActionServiceUser}
              onChange={(e) =>
                setField('agreedActionServiceUser', e.target.value)
              }
              placeholder="Agreed action"
              rows={3}
            />
          </div>

          {/* 4C. Risks to Workers */}
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                    4C. List Risks to Health & Social Care Workers:
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800"></th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800"></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'workerRiskCooking', label: 'Cooking' },
                  { key: 'workerRiskBathing', label: 'Bathing' },
                  { key: 'workerRiskDressing', label: 'Dressing' },
                  { key: 'workerRiskCleaning', label: 'Cleaning' },
                  { key: 'workerRiskOutings', label: 'Going on outings' },
                  { key: 'workerRiskOther', label: 'Other' }
                ].map((item) => (
                  <tr key={item.key} className="bg-white">
                    <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700">
                      {item.label}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${item.key}-yes`}
                            checked={
                              form[item.key as keyof RiskAssessmentForm] ===
                              true
                            }
                            onCheckedChange={(checked) =>
                              setField(
                                item.key as keyof RiskAssessmentForm,
                                checked ? true : null
                              )
                            }
                          />
                          <Label htmlFor={`${item.key}-yes`}>Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${item.key}-no`}
                            checked={
                              form[item.key as keyof RiskAssessmentForm] ===
                              false
                            }
                            onCheckedChange={(checked) =>
                              setField(
                                item.key as keyof RiskAssessmentForm,
                                checked ? false : null
                              )
                            }
                          />
                          <Label htmlFor={`${item.key}-no`}>No</Label>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {item.key === 'workerRiskOther' ? (
                        <Input
                          value={form.workerRiskOtherText}
                          onChange={(e) =>
                            setField('workerRiskOtherText', e.target.value)
                          }
                          placeholder="Specify other risk..."
                          className="border-0 shadow-none focus-visible:ring-0"
                        />
                      ) : (
                        <Textarea
                          value={
                            (form[
                              `${item.key}Comment` as keyof RiskAssessmentForm
                            ] as string) || ''
                          }
                          onChange={(e) =>
                            setField(
                              `${item.key}Comment` as keyof RiskAssessmentForm,
                              e.target.value as any
                            )
                          }
                          placeholder="Add comment..."
                          className="min-h-[60px] border-0 shadow-none focus-visible:ring-0"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4D. Agreed Action Workers */}
          <div className="space-y-2">
            <Label className="text-sm">
              4D. AGREED ACTION:BY EVERYCARE NEEDED TO MINIMISE THE RISKS TO
              HEALTH & SOCIAL CARE WORKERS LISTED IN 4C ABOVE
            </Label>
            <Textarea
              value={form.agreedActionWorkers}
              onChange={(e) => setField('agreedActionWorkers', e.target.value)}
              placeholder="Agreed action"
              rows={3}
            />
          </div>

          {/* Confidential: Behaviour / Criminal History */}
          <div className="space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
            <h4 className="text-sm text-center font-bold text-gray-800">
              RISKS ASSOCIATED WITH CLIENT'S BEHAVIOUR / CRIMINAL HISTORY
            </h4>
            <p className="text-xs font-semibold text-center ">
              THIS SECTION IS CONFIDENTIAL TO THE STAFF OF EVERYCARE & MUST
              NEVER FORM PART OF THE SERVICE USER'S HOUSE FILE
            </p>
            <p className="text-xs font-semibold ">
              THIS INFORMATION HAS TO BE COMMUNICATED TO THE SOCIAL CARE WORKER
              IN CONFIDENCE
            </p>

            {/* Table 1: Aggressive Behaviour (Verbal) */}
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-1/2 border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                      SERVICE USER PRONE TO AGGRESSIVE BEHAVIOUR (VERBAL)
                    </th>
                    <th className="w-1/2 border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                      IDENTIFIED RISK/S & ELIMINATION / LIMITATION ACTION
                      REQUIRED
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">
                      <Textarea
                        value={form.aggressiveBehaviourVerbal}
                        onChange={(e) =>
                          setField('aggressiveBehaviourVerbal', e.target.value)
                        }
                        placeholder="N/A"
                        className="min-h-[60px] border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.aggressiveBehaviourVerbalAction}
                        onChange={(e) =>
                          setField(
                            'aggressiveBehaviourVerbalAction',
                            e.target.value
                          )
                        }
                        placeholder="Identified risk/s & elimination/limitation action"
                        className="min-h-[60px] border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 2: Aggressive Behaviour (Physical) */}
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-1/2 border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                      SERVICE USER PRONE TO AGGRESSIVE BEHAVIOUR (PHYSICAL)
                    </th>
                    <th className="w-1/2 border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                      IDENTIFIED RISK/S & ELIMINATION / LIMITATION ACTION
                      REQUIRED
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">
                      <Textarea
                        value={form.aggressiveBehaviourPhysical}
                        onChange={(e) =>
                          setField(
                            'aggressiveBehaviourPhysical',
                            e.target.value
                          )
                        }
                        placeholder="N/A"
                        className="min-h-[60px] border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.aggressiveBehaviourPhysicalAction}
                        onChange={(e) =>
                          setField(
                            'aggressiveBehaviourPhysicalAction',
                            e.target.value
                          )
                        }
                        placeholder="Identified risk/s & elimination/limitation action"
                        className="min-h-[60px] border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 3: Criminal History - Single Field */}
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                      CRIMINAL HISTORY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">
                      <Textarea
                        value={form.criminalHistoryDetails}
                        onChange={(e) =>
                          setField('criminalHistoryDetails', e.target.value)
                        }
                        placeholder="N/A"
                        className="min-h-[80px] border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Transmittable Diseases */}
          <div className="space-y-2">
            <Label className="text-sm">Risk from Transmittable Diseases</Label>
            <Input
              value={form.transmittableDiseases}
              onChange={(e) =>
                setField('transmittableDiseases', e.target.value)
              }
              placeholder="N/A or details"
            />
          </div>
        </section>

        <Separator />

        {/* Section 5: Risks Associated with the Environment */}
        <section className="space-y-4">
          <h3 className="text-sm text-center font-bold">
            SECTION (5)
          </h3>
          <h3 className="text-sm text-center font-bold">
          RISKS ASSOCIATED WITH THE ENVIRONMENT
          </h3>

          {/* 5A. Type of Accommodation */}
          <div className="space-y-3 rounded-lg border border-gray-400 p-4">
            <h4 className="text-sm text-center font-bold">5A. Type of Accommodation</h4>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                'House (Detached)',
                'House (Semi Detached)',
                'House (Terraced)',
                'Bungalow (Detached)',
                'Bungalow (Semi Detached)',
                'Bungalow (Terraced)',
                'Flat (Purpose Built)',
                'Flat (Other)',
                'Mobile House',
                'Maisonette (Purpose Built)',
                'Maisonette (Other)',
                'Other Warden controlled'
              ].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`accom-${type}`}
                    checked={form.accommodationType === type}
                    onCheckedChange={(checked) =>
                      setField('accommodationType', checked ? type : '')
                    }
                  />
                  <Label htmlFor={`accom-${type}`} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Travelling */}
          {/* Travelling */}
          <div className="space-y-3 rounded-lg border border-gray-400 p-4">
            <h4 className="text-sm text-center font-bold">
              Directions - Travelling to and from the home of the Service User
            </h4>
            <Textarea
              value={form.travellingDirectionDetails}
              onChange={(e) =>
                setField('travellingDirectionDetails', e.target.value)
              }
              placeholder="Direction details"
              rows={3}
            />
            <div className="flex items-center gap-4">
              <Label className="text-sm">Any risks identified?</Label>
              {renderYesNoRadio(form.travellingRisks, (val) =>
                setField('travellingRisks', val)
              )}
            </div>
            <Input
              value={form.travellingRisksDetails}
              onChange={(e) =>
                setField('travellingRisksDetails', e.target.value)
              }
              placeholder="Additional risk details"
            />
          </div>

          {/* Safety Risks */}
          {/* Services Location Facilities & Fire Hazards */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-gray-300">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-[65%] border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800">
                      SERVICES LOCATION FACILITIES & FIRE HAZARDS
                    </th>
                    <th className=" border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <Label className="text-sm">Where is the water cut off?</Label>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.waterCutOff}
                        onChange={(e) =>
                          setField('waterCutOff', e.target.value)
                        }
                        placeholder="Location of water cut off"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <Label className="text-sm">Where is the gas cut off?</Label>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.gasCutOff}
                        onChange={(e) => setField('gasCutOff', e.target.value)}
                        placeholder="Location of gas cut off"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <Label className="text-sm">Where is the electric meter?</Label>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.electricMeter}
                        onChange={(e) =>
                          setField('electricMeter', e.target.value)
                        }
                        placeholder="Location of electric meter"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Electricity: Are there any workplace concerns relating
                          to the electrical wiring?
                        </Label>
                        {renderYesNoRadio(
                          form.electricalWiringConcerns,
                          (val) => setField('electricalWiringConcerns', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.electricalWiringConcernsDetails || ''}
                        onChange={(e) =>
                          setField(
                            'electricalWiringConcernsDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="Details of concerns"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <Label className="text-sm">
                        Is the electric meter the new trip switch style
                        (buttons) or the old flick switch style?
                      </Label>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.electricMeterType}
                        onChange={(e) =>
                          setField('electricMeterType', e.target.value)
                        }
                        placeholder="New trip switch / old flick switch"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Is there a residual current device (RCD)?
                        </Label>
                        {renderYesNoRadio(form.circuitBreaker, (val) =>
                          setField('circuitBreaker', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.circuitBreakerDetails || ''}
                        onChange={(e) =>
                          setField(
                            'circuitBreakerDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="RCD details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Are there any workplace concerns relating to lighting?
                        </Label>
                        {renderYesNoRadio(form.lightingConcerns, (val) =>
                          setField('lightingConcerns', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.lightingConcernsDetails || ''}
                        onChange={(e) =>
                          setField(
                            'lightingConcernsDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="Lighting concerns details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Electrical appliances: Is there a circuit breaker?
                          (Recommended).
                        </Label>
                        {renderYesNoRadio(form.circuitBreaker, (val) =>
                          setField('circuitBreaker', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.circuitBreakerDetails || ''}
                        onChange={(e) =>
                          setField(
                            'circuitBreakerDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="Circuit breaker details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <Label className="text-sm">
                        Heating: What is the source of heating: Coal fire, Gas
                        or Electricity
                      </Label>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.heatingSource}
                        onChange={(e) =>
                          setField('heatingSource', e.target.value)
                        }
                        placeholder="Coal fire, Gas or Electricity"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          If there is a gas supply are there any concerns
                          relating to the gas, is there any smell of gas, is the
                          boiler working properly, when was it last serviced,
                          etc.?
                        </Label>
                        {renderYesNoRadio(form.gasConcerns, (val) =>
                          setField('gasConcerns', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.gasConcernsDetails || ''}
                        onChange={(e) =>
                          setField('gasConcernsDetails', e.target.value as any)
                        }
                        placeholder="Gas concerns details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Are there any concerns relating to heating, is it
                          adequate, if there is central heating does it work
                          efficiently, can temperatures be controlled etc.?
                        </Label>
                        {renderYesNoRadio(form.heatingConcerns, (val) =>
                          setField('heatingConcerns', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.heatingConcernsDetails || ''}
                        onChange={(e) =>
                          setField(
                            'heatingConcernsDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="Heating concerns details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <Label className="text-sm">
                        Cooking: Is the source Electricity or Gas and what risks
                        are posed?
                      </Label>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.cookingSource}
                        onChange={(e) =>
                          setField('cookingSource', e.target.value)
                        }
                        placeholder="Electricity or Gas"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Hot water: Are there any concerns relating to water
                          supply, or concerns relating to sanitary/washing
                          facilities e.g. is hot water temperature safe, are
                          there adequate facilities for staff to wash their
                          hands and for clients to bathe/shower/wash?
                        </Label>
                        {renderYesNoRadio(form.hotWaterConcerns, (val) =>
                          setField('hotWaterConcerns', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.hotWaterConcernsDetails || ''}
                        onChange={(e) =>
                          setField(
                            'hotWaterConcernsDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="Hot water concerns details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Is there a shower with a thermostat regulator?
                        </Label>
                        {renderYesNoRadio(form.thermostaticRegulator, (val) =>
                          setField('thermostaticRegulator', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.thermostaticRegulatorDetails || ''}
                        onChange={(e) =>
                          setField(
                            'thermostaticRegulatorDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="If there is no regulator recommend that one is fitted"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Security: Are there adequate security locks, windows &
                          doors?
                        </Label>
                        {renderYesNoRadio(form.securityLocks, (val) =>
                          setField('securityLocks', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.securityLocksDetails || ''}
                        onChange={(e) =>
                          setField(
                            'securityLocksDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="Security details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <Label className="text-sm">
                        How is the property accessed. Is there a key box?
                        (Location)
                      </Label>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.keyBoxLocation}
                        onChange={(e) =>
                          setField('keyBoxLocation', e.target.value)
                        }
                        placeholder="Key box location and code"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Are stair gates fitted?
                        </Label>
                        {renderYesNoRadio(form.stairGates, (val) =>
                          setField('stairGates', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.stairGatesDetails || ''}
                        onChange={(e) =>
                          setField('stairGatesDetails', e.target.value as any)
                        }
                        placeholder="Stair gates details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Is there a monitored medication dose box?
                        </Label>
                        {renderYesNoRadio(form.monitoredMedicationBox, (val) =>
                          setField('monitoredMedicationBox', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.monitoredMedicationBoxDetails || ''}
                        onChange={(e) =>
                          setField(
                            'monitoredMedicationBoxDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="Medication box details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">Is there any Key Safe?</Label>
                        {renderYesNoRadio(form.keySafe, (val) =>
                          setField('keySafe', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.keySafeDetails || ''}
                        onChange={(e) =>
                          setField('keySafeDetails', e.target.value as any)
                        }
                        placeholder="Key safe details"
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center gap-4">
                        <Label className="flex-1 text-sm ">
                          Fire Hazard & Risk: Is the service user a smoker?
                        </Label>
                        {renderYesNoRadio(form.serviceUserSmoker, (val) =>
                          setField('serviceUserSmoker', val)
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <Textarea
                        value={form.serviceUserSmokerDetails || ''}
                        onChange={(e) =>
                          setField(
                            'serviceUserSmokerDetails',
                            e.target.value as any
                          )
                        }
                        placeholder="If so give advice ashtrays, extinguishing & smoking in bed."
                        rows={1}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
{/* Services Location Facilities & Fire Hazards */}
<div className="space-y-3 rounded-lg ">

  <div className="overflow-hidden rounded-lg border border-gray-300">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[65%]">
    SERVICES LOCATION FACILITIES & FIRE HAZARDS
          </th>
         <th></th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Where is the water cut off?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.waterCutOff}
              onChange={(e) => setField('waterCutOff', e.target.value)}
              placeholder="Location"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Where is the gas cut off?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.gasCutOff}
              onChange={(e) => setField('gasCutOff', e.target.value)}
              placeholder="Location"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Where is the electric meter?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.electricMeter}
              onChange={(e) => setField('electricMeter', e.target.value)}
              placeholder="Location"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Electricity: concerns relating to electrical wiring?</Label>
              {renderYesNoRadio(form.electricalWiringConcerns, (val) =>
                setField('electricalWiringConcerns', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.electricalWiringConcernsDetails || ''}
              onChange={(e) => setField('electricalWiringConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Electric meter type / RCD?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.electricMeterType}
              onChange={(e) => setField('electricMeterType', e.target.value)}
              placeholder="New trip switch / old flick switch"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Lighting concerns?</Label>
              {renderYesNoRadio(form.lightingConcerns, (val) =>
                setField('lightingConcerns', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.lightingConcernsDetails || ''}
              onChange={(e) => setField('lightingConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Electrical appliances: circuit breaker?</Label>
              {renderYesNoRadio(form.circuitBreaker, (val) =>
                setField('circuitBreaker', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.circuitBreakerDetails || ''}
              onChange={(e) => setField('circuitBreakerDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Heating source</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.heatingSource}
              onChange={(e) => setField('heatingSource', e.target.value)}
              placeholder="Coal fire, Gas or Electricity"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Gas concerns?</Label>
              {renderYesNoRadio(form.gasConcerns, (val) =>
                setField('gasConcerns', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.gasConcernsDetails || ''}
              onChange={(e) => setField('gasConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Heating concerns?</Label>
              {renderYesNoRadio(form.heatingConcerns, (val) =>
                setField('heatingConcerns', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.heatingConcernsDetails || ''}
              onChange={(e) => setField('heatingConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Cooking source</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.cookingSource}
              onChange={(e) => setField('cookingSource', e.target.value)}
              placeholder="Electricity or Gas"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Hot water concerns?</Label>
              {renderYesNoRadio(form.hotWaterConcerns, (val) =>
                setField('hotWaterConcerns', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.hotWaterConcernsDetails || ''}
              onChange={(e) => setField('hotWaterConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Shower with thermostatic regulator?</Label>
              {renderYesNoRadio(form.thermostaticRegulator, (val) =>
                setField('thermostaticRegulator', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.thermostaticRegulatorDetails || ''}
              onChange={(e) => setField('thermostaticRegulatorDetails', e.target.value as any)}
              placeholder="If no regulator, recommend one is fitted"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Security: adequate locks, windows & doors?</Label>
              {renderYesNoRadio(form.securityLocks, (val) =>
                setField('securityLocks', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.securityLocksDetails || ''}
              onChange={(e) => setField('securityLocksDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Key box?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.keyBoxLocation}
              onChange={(e) => setField('keyBoxLocation', e.target.value)}
              placeholder="Location"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Stair gates fitted?</Label>
              {renderYesNoRadio(form.stairGates, (val) =>
                setField('stairGates', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.stairGatesDetails || ''}
              onChange={(e) => setField('stairGatesDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Monitored medication dose box?</Label>
              {renderYesNoRadio(form.monitoredMedicationBox, (val) =>
                setField('monitoredMedicationBox', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.monitoredMedicationBoxDetails || ''}
              onChange={(e) => setField('monitoredMedicationBoxDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Key Safe?</Label>
              {renderYesNoRadio(form.keySafe, (val) =>
                setField('keySafe', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.keySafeDetails || ''}
              onChange={(e) => setField('keySafeDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Fire Hazards: Is the service user a smoker?</Label>
              {renderYesNoRadio(form.serviceUserSmoker, (val) =>
                setField('serviceUserSmoker', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.serviceUserSmokerDetails || ''}
              onChange={(e) => setField('serviceUserSmokerDetails', e.target.value as any)}
              placeholder="If so give advice ashtrays, extinguishing & smoking in bed"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Any obvious fire hazards?</Label>
              {renderYesNoRadio(form.fireHazards, (val) =>
                setField('fireHazards', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.fireHazardsDetails || ''}
              onChange={(e) => setField('fireHazardsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Identified risks to staff?</Label>
              {renderYesNoRadio(form.staffRisks, (val) =>
                setField('staffRisks', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.staffRisksDetails || ''}
              onChange={(e) => setField('staffRisksDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Identified risks to the service user?</Label>
              {renderYesNoRadio(form.serviceUserRisks, (val) =>
                setField('serviceUserRisks', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.serviceUserRisksDetails || ''}
              onChange={(e) => setField('serviceUserRisksDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Fire Officer Safety Assessment required?</Label>
              {renderYesNoRadio(form.fireOfficerAssessment, (val) =>
                setField('fireOfficerAssessment', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.fireOfficerAssessmentDetails || ''}
              onChange={(e) => setField('fireOfficerAssessmentDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Identify fire escape routes - are escape routes clear and unobstructed in the event of a fire or emergency?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.fireEscapeRoutes}
              onChange={(e) => setField('fireEscapeRoutes', e.target.value)}
              placeholder="Fire escape routes"
              rows={2}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

       {/* Premises */}
<div className="space-y-3 rounded-lg ">

  <div className="overflow-hidden rounded-lg border border-gray-300">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[65%]">
    PREMISES INCLUDING EXTERIOR OF BUILDING, ENTRANCES & GROUNDS
          </th>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[35%]">
          
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Unauthorised Activities for the Premises: Staff must not undertake to attempt any repairs externally or internally, hang pictures, move heavy furniture etc. has this been clarified to service user?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.unauthorisedActivitiesClarifiedDetails || ''}
              onChange={(e) => setField('unauthorisedActivitiesClarifiedDetails', e.target.value as any)}
              placeholder="Details"
              rows={2}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Is there adequate lighting in entrance ways?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.adequateLightingDetails || ''}
              onChange={(e) => setField('adequateLightingDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are access ways to and from the house free of hazards such as uneven paths, broken steps; can you observe any slipped roof slates / tiles etc.?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.accessWaysHazardsDetails || ''}
              onChange={(e) => setField('accessWaysHazardsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are buildings in an acceptable state of repair?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.buildingRepairDetails || ''}
              onChange={(e) => setField('buildingRepairDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Trips & Falls: Trailing wires, flooring type and safety issues - e.g. frayed loose or torn carpets. Are floors reasonably level or are there slopes or holes in tiles?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.tripsFallsHazardsDetails || ''}
              onChange={(e) => setField('tripsFallsHazardsDetails', e.target.value as any)}
              placeholder="Details"
              rows={2}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are stairs in an acceptable state of repair e.g. are they reasonably stable and are there loose or torn stair carpets?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.stairsRepairDetails || ''}
              onChange={(e) => setField('stairsRepairDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any low ceilings or beams which might present a head injury hazard?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.lowCeilingsDetails || ''}
              onChange={(e) => setField('lowCeilingsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to ventilation e.g. is ventilation adequate, is it dry or damp, are there draughts, etc.?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.ventilationConcernsDetails || ''}
              onChange={(e) => setField('ventilationConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to lead?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.leadConcernsDetails || ''}
              onChange={(e) => setField('leadConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to asbestos?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.asbestosConcernsDetails || ''}
              onChange={(e) => setField('asbestosConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to noise?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.noiseConcernsDetails || ''}
              onChange={(e) => setField('noiseConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to dirt or dust?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.dirtDustConcernsDetails || ''}
              onChange={(e) => setField('dirtDustConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to waste e.g. is waste disposed of correctly, is waste left to accumulate, etc.?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.wasteConcernsDetails || ''}
              onChange={(e) => setField('wasteConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to pest infestation?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.pestInfestationDetails || ''}
              onChange={(e) => setField('pestInfestationDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to unsanitary conditions?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.unsanitaryConditionsDetails || ''}
              onChange={(e) => setField('unsanitaryConditionsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to cold or heat?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.coldHeatConcernsDetails || ''}
              onChange={(e) => setField('coldHeatConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to room size?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.roomSizeConcernsDetails || ''}
              onChange={(e) => setField('roomSizeConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to lifts or hoists?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.liftsHoistsConcernsDetails || ''}
              onChange={(e) => setField('liftsHoistsConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any concerns relating to adaptations?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.adaptationsConcernsDetails || ''}
              onChange={(e) => setField('adaptationsConcernsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">Are there any broken or cracked glazing/mirrors?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.brokenGlazingDetails || ''}
              onChange={(e) => setField('brokenGlazingDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

         {/* Tasks and Equipment within the Home */}
<div className="space-y-3 rounded-lg">
 
  <div className="overflow-hidden rounded-lg border border-gray-300">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[65%]">
    TASKS AND EQUIPMENT WITHIN THE HOME
          </th>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[35%]">
            
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there any substances stored that appear hazardous (COSHH)?</Label>
              {renderYesNoRadio(form.coshhSubstances, (val) =>
                setField('coshhSubstances', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.coshhSubstancesDetails || ''}
              onChange={(e) => setField('coshhSubstancesDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there substances e.g. cleaning materials, pesticides, weed killers etc that staff is required to use?</Label>
              {renderYesNoRadio(form.coshhSubstances, (val) =>
                setField('coshhSubstances', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.coshhSubstancesDetails || ''}
              onChange={(e) => setField('coshhSubstancesDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">If yes are COSHH Sheets available?</Label>
              {renderYesNoRadio(form.coshhSheetsAvailable, (val) =>
                setField('coshhSheetsAvailable', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.coshhSheetsAvailableDetails || ''}
              onChange={(e) => setField('coshhSheetsAvailableDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <Label className="text-sm">What animals are in the home if any?</Label>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.animalsInHomeDetails || ''}
              onChange={(e) => setField('animalsInHomeDetails', e.target.value as any)}
              placeholder="List animals in the home"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Do the animals present a safety risk?</Label>
              {renderYesNoRadio(form.animalSafetyRisk, (val) =>
                setField('animalSafetyRisk', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.animalSafetyRiskDetails || ''}
              onChange={(e) => setField('animalSafetyRiskDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Do the animals present a hygiene risk?</Label>
              {renderYesNoRadio(form.animalHygieneRisk, (val) =>
                setField('animalHygieneRisk', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.animalHygieneRiskDetails || ''}
              onChange={(e) => setField('animalHygieneRiskDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are staff required to deal with animal waste?</Label>
              {renderYesNoRadio(form.animalWaste, (val) =>
                setField('animalWaste', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.animalWasteDetails || ''}
              onChange={(e) => setField('animalWasteDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are staff required to deal with environmental waste?</Label>
              {renderYesNoRadio(form.environmentalWaste, (val) =>
                setField('environmentalWaste', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.environmentalWasteDetails || ''}
              onChange={(e) => setField('environmentalWasteDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are staff required to deal with bodily excrements?</Label>
              {renderYesNoRadio(form.bodilyExcrements, (val) =>
                setField('bodilyExcrements', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.bodilyExcrementsDetails || ''}
              onChange={(e) => setField('bodilyExcrementsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">What are the identified risks to staff?</Label>
              {renderYesNoRadio(form.identifiedRisksStaff, (val) =>
                setField('identifiedRisksStaff', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.identifiedRisksStaffDetails || ''}
              onChange={(e) => setField('identifiedRisksStaffDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there any cracked / broken windows / Mirrors?</Label>
              {renderYesNoRadio(form.crackedWindows, (val) =>
                setField('crackedWindows', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.crackedWindowsDetails || ''}
              onChange={(e) => setField('crackedWindowsDetails', e.target.value as any)}
              placeholder="If yes do not attempt to clean them!"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there any identified risks to service user?</Label>
              {renderYesNoRadio(form.identifiedRisksServiceUser, (val) =>
                setField('identifiedRisksServiceUser', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.identifiedRisksServiceUserDetails || ''}
              onChange={(e) => setField('identifiedRisksServiceUserDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Is protective clothing needed?</Label>
              {renderYesNoRadio(form.protectiveClothingNeeded, (val) =>
                setField('protectiveClothingNeeded', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.protectiveClothingNeededDetails || ''}
              onChange={(e) => setField('protectiveClothingNeededDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there risks to staff?</Label>
              {renderYesNoRadio(form.risksToStaff, (val) =>
                setField('risksToStaff', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.risksToStaffDetails || ''}
              onChange={(e) => setField('risksToStaffDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there risks to service user?</Label>
              {renderYesNoRadio(form.risksToServiceUser, (val) =>
                setField('risksToServiceUser', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.risksToServiceUserDetails || ''}
              onChange={(e) => setField('risksToServiceUserDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there risks to others in environment?</Label>
              {renderYesNoRadio(form.risksToOthers, (val) =>
                setField('risksToOthers', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.risksToOthersDetails || ''}
              onChange={(e) => setField('risksToOthersDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


{/* Personal Protective Equipment (PPE) */}
<div className="space-y-3  ">
  <h4 className="text-sm text-center font-bold">
  </h4>
  <div className="overflow-hidden rounded-lg border border-gray-300">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[65%]">
    LIST ALL REQUIREMENTS FOR "PERSONAL PROTECTIVE EQUIPMENT" (PPE) / CLOTHING
          </th>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[35%]">
            
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Is protective clothing needed?</Label>
              {renderYesNoRadio(form.protectiveClothingNeeded, (val) =>
                setField('protectiveClothingNeeded', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.protectiveClothingNeededDetails || ''}
              onChange={(e) => setField('protectiveClothingNeededDetails', e.target.value as any)}
              placeholder="List PPE requirements"
              rows={2}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

{/* STAFF / SERVICE USER/S - OCCUPANTS / VISITORS TO THE PREMISES */}
<div className="space-y-3 ">
  <h4 className="text-sm text-center font-bold">
  </h4>
  <div className="overflow-hidden rounded-lg border border-gray-300">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[65%]">
                STAFF / SERVICE USER/S - OCCUPANTS / VISITORS TO THE PREMISES:

          </th>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[35%]">
            
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there any identified risks to staff?</Label>
              {renderYesNoRadio(form.identifiedRisksStaff, (val) =>
                setField('identifiedRisksStaff', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.identifiedRisksStaffDetails || ''}
              onChange={(e) => setField('identifiedRisksStaffDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there any identified risks to the service user?</Label>
              {renderYesNoRadio(form.identifiedRisksServiceUser, (val) =>
                setField('identifiedRisksServiceUser', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.identifiedRisksServiceUserDetails || ''}
              onChange={(e) => setField('identifiedRisksServiceUserDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there identified risks to others in the environment?</Label>
              {renderYesNoRadio(form.risksToOthers, (val) =>
                setField('risksToOthers', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.risksToOthersDetails || ''}
              onChange={(e) => setField('risksToOthersDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
{/* Finances */}
<div className="space-y-3 ">
  <div className="overflow-hidden rounded-lg border border-gray-300">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[65%]">
            Finances
          </th>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[35%]">
            Details
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Is cash and other valuables kept securely?</Label>
              {renderYesNoRadio(form.cashSecure, (val) =>
                setField('cashSecure', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.cashSecureDetails || ''}
              onChange={(e) => setField('cashSecureDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there any identified financial risks to staff or Service User?</Label>
              {renderYesNoRadio(form.financialRisks, (val) =>
                setField('financialRisks', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.financialRisksMinimise}
              onChange={(e) => setField('financialRisksMinimise', e.target.value)}
              placeholder="If 'Yes' – How can this be minimised?"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Will staff be required to handle money for Service User shopping?</Label>
              {renderYesNoRadio(form.staffHandleMoney, (val) =>
                setField('staffHandleMoney', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.staffHandleMoneyDetails || ''}
              onChange={(e) => setField('staffHandleMoneyDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  {/* Notes */}
  <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
    <p className="text-sm text-yellow-800">
      <strong>NOTE:</strong> Staff members are not permitted to know the PIN number of bank/building accounts or Pension Cards. This must be referred back to the Case Manager.
    </p>
    <p className="mt-2 text-sm text-yellow-800">
      Ensure Health & Social Care Workers are issued with a 'duplicate cash receipt book' and are instructed to issue the service user with a copy of the receipt on every occasion.
    </p>
  </div>
</div>

         {/* Food Hygiene */}
<div className="space-y-3 ">
  <div className="overflow-hidden rounded-lg border border-gray-300">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[65%]">
            Food Hygiene
          </th>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[35%]">
            
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Is the initial food stock in date, are there dented / rusty canned foods?</Label>
              {renderYesNoRadio(form.foodInDate, (val) =>
                setField('foodInDate', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.foodInDateDetails || ''}
              onChange={(e) => setField('foodInDateDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">If food is to be prepared/served?</Label>
              {renderYesNoRadio(form.foodPreparation, (val) =>
                setField('foodPreparation', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.foodPreparationDetails || ''}
              onChange={(e) => setField('foodPreparationDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are food hygiene standards adequate e.g., work surfaces (equipment/food storage areas)?</Label>
              {renderYesNoRadio(form.foodHygieneStandards, (val) =>
                setField('foodHygieneStandards', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.foodHygieneStandardsDetails || ''}
              onChange={(e) => setField('foodHygieneStandardsDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are cooking facilities safe and fit for use?</Label>
              {renderYesNoRadio(form.cookingFacilitiesSafe, (val) =>
                setField('cookingFacilitiesSafe', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.cookingFacilitiesSafeDetails || ''}
              onChange={(e) => setField('cookingFacilitiesSafeDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">If there is a refrigerator, does it indicate temperature as 6 degrees C.? If not seem, does it seem to be efficient / recommend service user purchases a thermometer.</Label>
              {renderYesNoRadio(form.refrigeratorTemp, (val) =>
                setField('refrigeratorTemp', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.refrigeratorTempDetails || ''}
              onChange={(e) => setField('refrigeratorTempDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">If there is a deep freezer, does it indicate temperature as minus 18 to minus 22 degrees C.? If not seem does it seem to be efficient / recommend service user purchases a thermometer.</Label>
              {renderYesNoRadio(form.freezerTemp, (val) =>
                setField('freezerTemp', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.freezerTempDetails || ''}
              onChange={(e) => setField('freezerTempDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there adequate hand washing facilities?</Label>
              {renderYesNoRadio(form.handWashingFacilities, (val) =>
                setField('handWashingFacilities', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.handWashingFacilitiesDetails || ''}
              onChange={(e) => setField('handWashingFacilitiesDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Is the kitchen clean?</Label>
              {renderYesNoRadio(form.kitchenClean, (val) =>
                setField('kitchenClean', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.kitchenCleanDetails || ''}
              onChange={(e) => setField('kitchenCleanDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Storage: are there separate areas for cleaning materials and other chemicals (COSHH)?</Label>
              {renderYesNoRadio(form.separateStorage, (val) =>
                setField('separateStorage', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.separateStorageDetails || ''}
              onChange={(e) => setField('separateStorageDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Is clean hot and cold water available?</Label>
              {renderYesNoRadio(form.hotColdWater, (val) =>
                setField('hotColdWater', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.hotColdWaterDetails || ''}
              onChange={(e) => setField('hotColdWaterDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

      {/* Outings */}
<div className="space-y-3 ">
  <div className="overflow-hidden rounded-lg border border-gray-300">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[65%]">
            Outings
          </th>
          <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-start font-bold text-gray-800 w-[35%]">
            
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Do staff need any training to use any equipment?</Label>
              {renderYesNoRadio(form.staffTrainingNeeded, (val) =>
                setField('staffTrainingNeeded', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.staffTrainingNeededDetails || ''}
              onChange={(e) => setField('staffTrainingNeededDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there any identified risks to staff?</Label>
              {renderYesNoRadio(form.outingStaffRisks, (val) =>
                setField('outingStaffRisks', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.outingStaffRisksDetails || ''}
              onChange={(e) => setField('outingStaffRisksDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Are there any identified risks to the service user?</Label>
              {renderYesNoRadio(form.outingServiceUserRisks, (val) =>
                setField('outingServiceUserRisks', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.outingServiceUserRisksDetails || ''}
              onChange={(e) => setField('outingServiceUserRisksDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Will staff need to take the service user out?</Label>
              {renderYesNoRadio(form.staffTakeOut, (val) =>
                setField('staffTakeOut', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.staffTakeOutDetails || ''}
              onChange={(e) => setField('staffTakeOutDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Will staff need to transport the service user?</Label>
              {renderYesNoRadio(form.staffTransport, (val) =>
                setField('staffTransport', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.staffTransportDetails || ''}
              onChange={(e) => setField('staffTransportDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Will public transport be used?</Label>
              {renderYesNoRadio(form.publicTransport, (val) =>
                setField('publicTransport', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.publicTransportDetails || ''}
              onChange={(e) => setField('publicTransportDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Will there be other means of transportation?</Label>
              {renderYesNoRadio(form.otherTransport, (val) =>
                setField('otherTransport', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.otherTransportDetails || ''}
              onChange={(e) => setField('otherTransportDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
        <tr className="bg-white">
          <td className="border border-gray-300 px-3 py-2">
            <div className="flex items-center gap-4">
              <Label className="flex-1 text-sm ">Will a car be used?</Label>
              {renderYesNoRadio(form.carUsed, (val) =>
                setField('carUsed', val)
              )}
            </div>
          </td>
          <td className="border border-gray-300 px-2 py-2">
            <Textarea
              value={form.carUsedDetails || ''}
              onChange={(e) => setField('carUsedDetails', e.target.value as any)}
              placeholder="Details"
              rows={1}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  {/* Note */}
  <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
    <p className="text-sm text-yellow-800">
      <strong>NOTE:</strong> If service user or staff members' car is to be used; valid tax, insurance certificate (explicitly stating that the car can be used for business purposes), MOT certificate/registration document must be seen, verified, photocopied and expiry dates entered onto Everycare database.
    </p>
  </div>
</div>
        </section>

        <Separator />

        {/* Section 6: Support Staff Input */}
        <section className="space-y-4">
          <h3 className="text-sm text-center font-bold">
            SECTION (6)
          </h3>
          <h3 className="text-sm text-center font-bold">
           SUPPORT STAFF INPUT
          </h3>
         
          <div className="space-y-2">
            <Label className="text-sm">6A. Health & Social Care Workers Comments</Label>
            <Textarea
              value={form.careWorkerComments}
              onChange={(e) => setField('careWorkerComments', e.target.value)}
              placeholder="Comments"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">
              Any additional risks identified by Health & Social Care Worker
            </Label>
            <Textarea
              value={form.additionalRisksIdentified}
              onChange={(e) =>
                setField('additionalRisksIdentified', e.target.value)
              }
              placeholder="Additional risks"
              rows={3}
            />
          </div>
        </section>

        <Separator />

        {/* Section 7: Action Plan and Agreement */}
        <section className="space-y-4">
          <h3 className="text-sm text-center font-bold">
            SECTION (7)
          </h3>
          <h3 className="text-sm text-center font-bold">
ACTION PLAN AND AGREEMENT
          </h3>

          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">Action Plan</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">
                  Action needed prior to commencement of service (if applicable)
                </Label>
                <Textarea
                  value={form.actionNeededPriorService}
                  onChange={(e) =>
                    setField('actionNeededPriorService', e.target.value)
                  }
                  placeholder="Action needed"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  Equipment required prior to commencement of package (if
                  applicable)
                </Label>
                <Textarea
                  value={form.equipmentRequired}
                  onChange={(e) =>
                    setField('equipmentRequired', e.target.value)
                  }
                  placeholder="Equipment required"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  Name & Tel/contact no of person supplying equipment
                </Label>
                <Input
                  value={form.equipmentSupplierName}
                  onChange={(e) =>
                    setField('equipmentSupplierName', e.target.value)
                  }
                  placeholder="Name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Tel/contact no</Label>
                <Input
                  value={form.equipmentSupplierTel}
                  onChange={(e) =>
                    setField('equipmentSupplierTel', e.target.value)
                  }
                  placeholder="Tel"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  Date hoist and/or other equipment needs next service & service
                  interval (months)
                </Label>
                <Input
                  value={form.equipmentServiceInterval}
                  onChange={(e) =>
                    setField('equipmentServiceInterval', e.target.value)
                  }
                  placeholder="Every ___ months"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Equipment next service date</Label>
                <CustomDatePicker
                  selected={form.equipmentServiceDate}
                  onChange={(date) => setField('equipmentServiceDate', date)}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Hoist next service date</Label>
                <CustomDatePicker
                  selected={form.hoistServiceDate}
                  onChange={(date) => setField('hoistServiceDate', date)}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Person responsible</Label>
                <Input
                  value={form.personResponsible}
                  onChange={(e) =>
                    setField('personResponsible', e.target.value)
                  }
                  placeholder="Person responsible"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date for completion / review of action</Label>
                <CustomDatePicker
                  selected={form.dateCompletionReview}
                  onChange={(date) => setField('dateCompletionReview', date)}
                  placeholder="Select date"
                />
              </div>
            </div>
          </div>

          {/* Assessor Statement */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">Assessor Statement</h4>
            <p className="text-sm ">
              I certify that I have discussed the risks identified and action to
              minimise and manage the risks with the service user, their carer,
              relative or representative (as appropriate) and Everycare staff.
              Further, a moving & handling assessment has been carried out and
              the highlighted action is required to comply with the Manual
              Handling Regulations (Operations), 1992.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">Assessor Name</Label>
                <Input
                  value={form.assessorName}
                  onChange={(e) => setField('assessorName', e.target.value)}
                  placeholder="Assessor name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date</Label>
                <CustomDatePicker
                  selected={form.assessorDate}
                  onChange={(date) => setField('assessorDate', date)}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <SignatureField
                  label="Assessor Signature"
                  entityId={sid}
                  signatureUrl={form.assessorSignatureUrl}
                  onSaved={(url) => setField('assessorSignatureUrl', url)}
                />
              </div>
            </div>
          </div>

          {/* Service User/Next of Kin Statement */}
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="text-sm text-center font-bold">
              Service User/Next of Kin Statement
            </h4>
            <p className="text-sm ">
              I confirm that I have provided all necessary information to the
              Assessor to support the planning of any necessary risk management.
              I hereby consent to assistance as per the action plan. Including
              medication being given by staff as part of arrangements made for
              my health & social care.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">Service User/Next of Kin Name (block capitals)</Label>
                <Input
                  value={form.serviceUserNameKin}
                  onChange={(e) =>
                    setField('serviceUserNameKin', e.target.value)
                  }
                  placeholder="Name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date</Label>
                <CustomDatePicker
                  selected={form.serviceUserDate}
                  onChange={(date) => setField('serviceUserDate', date)}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <SignatureField
                  label="Service User/Next of Kin Signature"
                  entityId={sid}
                  signatureUrl={form.serviceUserSignatureUrl}
                  onSaved={(url) => setField('serviceUserSignatureUrl', url)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Next review date</Label>
              <CustomDatePicker
                selected={form.nextReviewDate}
                onChange={(date) => setField('nextReviewDate', date)}
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Person responsible</Label>
              <Input
                value={form.personResponsible}
                onChange={(e) => setField('personResponsible', e.target.value)}
                placeholder="Person responsible"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Date for completion / review of action</Label>
              <CustomDatePicker
                selected={form.dateCompletionReview}
                onChange={(date) => setField('dateCompletionReview', date)}
                placeholder="Select date"
              />
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
