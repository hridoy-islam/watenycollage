import ErrorMessage from "@/components/shared/error-message";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockData } from "@/types";
import { useEffect } from "react";

export function PersonalDetailsForm({ student, onSave }) {

  const { handleSubmit, register, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      dob: "",
      email: "",
      gender: "",
      maritualStatus: "",
      nationality: "",
      countryResidence: "",
      countryBirth: "",
      nativeLanguage: "",
      passportName: "",
      passportIssueLocation: "",
      passportNumber: "",
      passportIssueDate: "",
      passportExpiryDate: "",
    },
  });

  // Populate form fields when `student` data is available
  useEffect(() => {
    if (student) {
      reset({
        title: student.title || "",
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        dob: student.dob || "",
        email: student.email || "",
        gender: student.gender || "",
        maritualStatus: student.maritualStatus || "",
        nationality: student.nationality || "",
        countryResidence: student.countryResidence || '',
        countryBirth: student.countryBirth || '',
        nativeLanguage: student.nativeLanguage || '',
        passportName: student.passportName || '', // Corrected to use `student.passportName`
        passportIssueLocation: student.passportIssueLocation || '',
        passportNumber: student.passportNumber || '', // Corrected to use `student.passportNumber`
        passportIssueDate: student.passportIssueDate || '',
        passportExpiryDate: student.passportExpiryDate || '',
      });
    }
  }, [student, reset]);

  const onSubmit = (data) => {
    console.log("on submit", data);
    onSave(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 shadow-md rounded-md mb-2"  >
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.titles.map((title, index) => (
                      <SelectItem key={index} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register("firstName", { required: "First Name is required" })} />
            <ErrorMessage message={errors.firstName?.message?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register("lastName", { required: "Last Name is required" })} />
            <ErrorMessage message={errors.lastName?.message?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" defaultValue={student.phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" {...register("dob")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maritualStatus">Maritual Status *</Label>

            <Controller
              name="maritualStatus"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.maritalStatuses.map((title, index) => (
                      <SelectItem key={index} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.gender.map((title, index) => (
                      <SelectItem key={index} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input id="nationality" {...register("nationality")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryResidence">Country of Residence</Label>
            <Input id="countryResidence" {...register("countryResidence")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryBirth">Country of Birth</Label>
            <Input id="countryBirth" {...register("countryBirth")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nativeLanguage">Native Language</Label>
            <Input id="nativeLanguage" {...register("nativeLanguage")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passportName">Name as it appear in Passport:</Label>
            <Input id="passportName" type="text" {...register("passportName")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportIssueLocation">Passport issue Location:</Label>
            <Input id="passportIssueLocation" {...register("passportIssueLocation")} />

          </div>
          <div className="space-y-2">
            <Label htmlFor="passportNumber">Passport Number</Label>
            <Input id="passportNumber" type="text" {...register("passportNumber")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passportIssueDate">Passport Issue Date</Label>
            <Input id="passportIssueDate" type="date" {...register("passportIssueDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passportExpiryDate">Passport Expiry Date</Label>
            <Input id="passportExpiryDate" type="date" {...register("passportExpiryDate")} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant={'outline'} className="bg-supperagent text-white hover:bg-supperagent/90 border-none">Save Changes</Button>
        </div>
      </form>
    </div>
  )
}

