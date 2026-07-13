import React, { useState } from 'react';
import axiosInstance from '@/lib/axios';

import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  MapPin,
  Phone,
  Briefcase,
  Eye
} from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import {
  ServiceUserFormData,
  serviceUserSchema
} from './components/validation';
import { PersonalInformationStep } from './components/PersonalInformationStep';
import { EqualityStep } from './components/EqualityStep';
import { ContactInformationStep } from './components/ContactInformation';
import { EmploymentServiceStep } from './components/EmploymentServiceStep';
import { ReviewStep } from './components/ReviewStep';
import { useNavigate, useParams } from 'react-router-dom';

const steps = [
  {
    id: 1,
    title: 'Personal Information',
    icon: User,
    component: PersonalInformationStep
  },
  {
    id: 2,
    title: 'Equality',
    icon: MapPin,
    component: EqualityStep
  },
  {
    id: 3,
    title: 'Contact Information',
    icon: Phone,
    component: ContactInformationStep
  },
  {
    id: 4,
    title: 'Employment / Service Details',
    icon: Briefcase,
    component: EmploymentServiceStep
  },
  {
    id: 5,
    title: 'Review Application',
    icon: Eye,
    component: ReviewStep
  }
];

const CreateServiceUserPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const{id} = useParams();
  const navigate = useNavigate()
  const methods = useForm<ServiceUserFormData>({
    resolver: zodResolver(serviceUserSchema),
    mode: 'onChange',
    defaultValues: {
      serviceUserType: undefined,
      title: undefined,
      firstName: '',
      middleInitial: '',
      lastName: '',
      preferredName: '',
      dateOfBirth: '',
      gender: undefined,
      maritalStatus: undefined,
      ethnicOrigin: undefined,
      religion: '',
      address: '',
      city: '',
      country: undefined,
      postCode: '',
      phone: '',
      fax: '',
      mobile: '',
      other: '',
      email: '',
      website: '',
      startDate: undefined,
      lastDutyDate: undefined,
     
      servicePriority: ''
    }
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors }
  } = methods;

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof ServiceUserFormData)[] => {
    switch (step) {
      case 1:
        return [
          'serviceUserType',
          'title',
          'firstName',
          'lastName',
          'dateOfBirth',
          'address',
          'city',
          'country',
          'postCode',
        
          'startDate',
          'lastDutyDate',
          'servicePriority'
        ];
      case 2:
        return ['gender', 'maritalStatus', 'ethnicOrigin', 'religion'];
      case 3:
        return ['email'];
      case 4:
        return [

          'timesheetSignature',
          'timesheetSignatureNote'
        ];
      default:
        return [];
    }
  };

 
const onSubmit = async (data: ServiceUserFormData) => {
  setIsSubmitting(true);
  try {
    // Add the role to the payload
    const payload = { ...data,serviceUserType:data.serviceUserType, role: 'serviceUser',email: data.email.toLowerCase(),companyId:id };

    // Make POST request to /users
    const response = await axiosInstance.post('/auth/signup', payload);

    toast({
      title: 'Success!',
      description: 'Service user has been created successfully.',
      className: 'bg-watney border-none text-white'
    });

    methods.reset();
    navigate(-1)
  } catch (error: any) {
    console.error(error);
    toast({
      title: 'Error',
      description:
        error?.response?.data?.message || 'Failed to create service user. Please try again.',
      className: 'bg-red-500 border-none text-white'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="h-screen ">
      <div className="">
        {/* Header */}
        <div className="mb-2 rounded-xl bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Create Service User
          </h1>
          <p className="text-gray-600">
            Complete all steps to create a new service user profile
          </p>
        </div>

        {/* Form Content */}
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-2 rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-2">
                <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                  {steps[currentStep - 1].title}
                </h2>
                {/* <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div> */}
              </div>

              <CurrentStepComponent />
            </div>

            {/* Navigation Buttons */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="hover:bg-watney/90 flex items-center space-x-2 bg-watney text-white"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-watney text-white hover:bg-watney/90 disabled:cursor-not-allowed disabled:opacity-50 "
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Create Service User</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CreateServiceUserPage;
