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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { mockData } from "@/types";

interface StudentFormData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  addressLine1: string;
  addressLine2: string;
  townCity: string;
  state: string;
  postCode: string;
  country: string;
}



export default function NewStudentPage() {
  const { control, handleSubmit, register, formState: { errors }, } = useForm<StudentFormData>({
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      addressLine1: '',
      addressLine2: '',
      townCity: '',
      state: '',
      postCode: '',
      country: ''
    },
  });

  const onSubmit = (data: StudentFormData) => {
    console.log(data);
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
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.titles.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register("firstName", { required: true })} />
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" {...register("lastName", { required: true })} />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email", { required: true })} />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" type="tel" {...register("phone", { required: true })} />
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input id="dateOfBirth" type="date" {...register("dateOfBirth", { required: true })} />
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender *</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.gender.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Marital Status */}
          <div>
            <Label htmlFor="maritalStatus">Marital Status *</Label>
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.maritalStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <h2 className="text-md font-semibold">Address</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Address Line 1 *</Label>
            <Input id="addressLine1" {...register("addressLine1", { required: true })} />
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input id="addressLine2" {...register("addressLine2", { required: true })} />
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="townCity">Town / City *</Label>
            <Input id="townCity" {...register("townCity", { required: true })} />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="state">State *</Label>
            <Input id="state" type="email" {...register("state", { required: true })} />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="postCode">Post Code *</Label>
            <Input id="postCode" type="tel" {...register("postCode", { required: true })} />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" type="tel" {...register("country", { required: true })} />
          </div>

        </div>
        <div className="flex justify-end">
          <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent/90">
            Submit
          </Button>
        </div>
      </form>
    </>
  );
}
