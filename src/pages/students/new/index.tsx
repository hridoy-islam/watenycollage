// import { useState } from 'react'
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Stepper } from "@/components/shared/stepper"
// import { PersonalInfo } from "../components/personal-info"
// import { ContactInfo } from "../components/contact-info"
// import { AddressInfo } from "../components/address-info"
// import { AdditionalInfo } from "../components/additional-info"
// import { StudentFormData, initialFormData } from "@/types/index"
// import { ArrowLeft } from 'lucide-react'
// import { useRouter } from '@/routes/hooks'
// import { Link } from 'react-router-dom'
// import { WorkDetails } from '../components/work-details'

// const steps = [
//   {
//     title: "Personal Info",
//     description: "Basic details",
//   },
//   {
//     title: "Address",
//     description: "Your location",
//   },
//   {
//     title: "Contact",
//     description: "How to reach you",
//   },
//   {
//     title: "Work Details",
//     description: "Describe Experience",
//   },
//   {
//     title: "Additional",
//     description: "Extra details",
//   },
// ]

// export default function NewStudentPage() {
//   const [currentStep, setCurrentStep] = useState(0)
//   const [formData, setFormData] = useState<StudentFormData>(initialFormData)
//   const router = useRouter()

//   const updateFields = (fields: Partial<StudentFormData>) => {
//     setFormData(prev => ({ ...prev, ...fields }))
//   }

//   const next = () => {
//     if (currentStep < steps.length - 1) {
//       setCurrentStep(prev => prev + 1)
//     }
//   }

//   const back = () => {
//     if (currentStep > 0) {
//       setCurrentStep(prev => prev - 1)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     // Here you would typically submit the form data to your backend
//     console.log('Form submitted:', formData)
//     router.push('/students')
//   }

//   return (
//     <div className="px-4 mx-auto py-6">
//       <div className="mb-6 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Link to='/admin/students'>
//             <Button
//               variant="outline"
//               size="icon"
//               className="bg-supperagent border-none hover:bg-supperagent/90"
//             >

//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-semibold">Add New Student</h1>
//         </div>
//       </div>

//       <Card className="mx-auto px-4 p-6">
//         <Stepper currentStep={currentStep} steps={steps} />

//         <form onSubmit={handleSubmit} className="mt-8">
//           {currentStep === 0 && (
//             <PersonalInfo data={formData} updateFields={updateFields} />
//           )}
//           {currentStep === 1 && (
//             <AddressInfo data={formData} updateFields={updateFields} />
//           )}
//           {currentStep === 2 && (
//             <ContactInfo data={formData} updateFields={updateFields} />
//           )}
//           {currentStep === 3 && (
//             <WorkDetails data={formData} updateFields={updateFields} />
//           )}
//           {currentStep === 4 && (
//             <AdditionalInfo data={formData} updateFields={updateFields} />
//           )}

//           <div className="mt-6 flex justify-between">
//             <Button
//               type="button"
//               variant="secondary"
//               onClick={back}
//               disabled={currentStep === 0}
//             >
//               Previous
//             </Button>
//             {currentStep === steps.length - 1 ? (
//               <Button type="submit" className="bg-[#1e40af]">
//                 Save Data
//               </Button>
//             ) : (
//               <Button
//                 type="button"
//                 className="bg-supperagent text-white border-none hover:bg-supperagent/90"
//                 onClick={next}
//               >
//                 Next
//               </Button>
//             )}
//           </div>
//         </form>
//       </Card>
//     </div>
//   )
// }

import { useForm, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { countries, mockData } from "@/types";
import ErrorMessage from "@/components/shared/error-message";
import axiosInstance from '../../../lib/axios';
import moment from "moment";
import { useToast } from "@/components/ui/use-toast";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewStudentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, register, formState: { errors }, } = useForm();
  const { toast } = useToast();
  const navigate = useNavigate();



  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        dob: moment(data.dob).format("DD-MM-YYYY"),
        title: data.title,
        gender: data.gender,
        maritualStatus: data.maritalStatus,
        country: data.country,
      };
      await axiosInstance.post(`/students`, formattedData);
      toast({ title: "Student Created successfully", className: "bg-supperagent border-none text-white", });
      navigate('/admin/students');

    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/students">
            <Button variant="outline" size="icon" className="bg-supperagent border-none hover:bg-supperagent/90">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Add New Student</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 p-4 shadow-xl rounded-md">
        <h2 className="text-md font-semibold">Personal Details</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Controller
              name="title"
              control={control}
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.titles.map((title, index) => (
                      <SelectItem key={index} value={title}>{title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />


            <ErrorMessage message={errors.title?.message?.toString()} />
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register("firstName", { required: "First Name is required" })}
            />
            <ErrorMessage message={errors.firstName?.message?.toString()} />

          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" {...register("lastName", { required: "Last Name is required" })} />
            <ErrorMessage message={errors.lastName?.message?.toString()} />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })} />
            <ErrorMessage message={errors.email?.message?.toString()} />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" type="tel" {...register("phone", { required: "Phone is required" })} />
            <ErrorMessage message={errors.phone?.message?.toString()} />
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input id="dob" type="date" {...register("dob", { required: "Date of Birth Requried" })} />
            <ErrorMessage message={errors.dob?.message?.toString()} />
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender *</Label>
            <Controller
              name="gender"
              control={control}
              rules={{ required: "Gender is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.gender.map((gender, index) => (
                      <SelectItem key={index} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <ErrorMessage message={errors.gender?.message?.toString()} />
          </div>

          {/* Marital Status */}
          <div>
            <Label htmlFor="maritualStatus">Maritual Status *</Label>
            <Controller
              name="maritalStatus"
              control={control}
              rules={{ required: "Marital Status is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.maritalStatuses.map((status, index) => (
                      <SelectItem key={index} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <ErrorMessage message={errors.maritalStatus?.message?.toString()} />

          </div>
        </div>

        <h2 className="text-md font-semibold">Address</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Address Line 1 *</Label>
            <Input id="addressLine1" {...register("addressLine1", { required: 'Address Line 1 Required' })} />
            <ErrorMessage message={errors.addressLine1?.message?.toString()} />
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input id="addressLine2" {...register("addressLine2", { required: 'Address Line 2 Required' })} />
            <ErrorMessage message={errors.addressLine2?.message?.toString()} />
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="townCity">Town / City *</Label>
            <Input id="townCity" {...register("townCity", { required: 'Town / City is Required' })} />
            <ErrorMessage message={errors.townCity?.message?.toString()} />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="state">State *</Label>
            <Input id="state" {...register("state", { required: 'State is Required' })} />
            <ErrorMessage message={errors.state?.message?.toString()} />

          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="postCode">Post Code *</Label>
            <Input id="postCode" {...register("postCode", { required: 'Post Code is Required' })} />
            <ErrorMessage message={errors.postCode?.message?.toString()} />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="country">Country</Label>
            <Controller
              name="country"
              control={control}
              rules={{ required: "Country is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                  {countries.map((country, index) => (
                  <SelectItem key={index} value={country}>{country}</SelectItem>
                ))}
                  </SelectContent>
                </Select>
              )}
            />
            <ErrorMessage message={errors.country?.message?.toString()} />
          </div>

        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-supperagent text-white hover:bg-supperagent/90">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form >
    </>
  );
}
