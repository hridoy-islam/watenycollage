import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AddressForm({ student, onSave }: PersonalDetailsFormProps) {
    const methods = useForm({
        defaultValues: {
            addressLine1: student?.disabilities || "",
            addressLine2: student?.addressLine2 || "",
            genderIdentity: student?.genderIdentity || "",
            sexualOrientation: student?.sexualOrientation || "",
            religion: student?.religion || "",
        },
    });

    // const onSubmit = (data: any) => {
    //     onSave(data);
    // };

    return (
        <div className="space-y-4 p-4 shadow-md rounded-md">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Address</h2>
            </div>
            <FormProvider {...methods}>
                    <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="addressLine1">Address Line 1*</Label>
          <Input id="addressLine1" defaultValue={student.addressLine1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressLine2">Address Line 2*</Label>
          <Input id="addressLine2" defaultValue={student.addressLine2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="townCity">Town / City</Label>
          <Input id="townCity" defaultValue={student.townCity} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" defaultValue={student.state} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postCode">Post Code</Label>
          <Input id="postCode" defaultValue={student.postCode} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" defaultValue={student.country} />
        </div>

                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" className="bg-supperagent hover:bg-supperagent/90 text-white">
                            Save Changes
                        </Button>
                    </div>
            </FormProvider>
        </div>
    );
}
