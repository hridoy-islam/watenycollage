
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Select from "react-select"; // ✅ Import react-select
import { cn } from "@/lib/utils";

// Your medication options
const medicineOptions = [
  "Advantage Plus testing strips",
  "Contour testing strips",
  "On Call Now testing strips",
  "GlucoMen LX Sensor testing strips",
  "Myglucohealth testing strips",
  "Mylife Pura testing strips",
  "TRUEresult testing strips",
  "IME-DC testing strips",
  "SuperCheck 2 testing strips",
] as const;

// Define type for react-select option
type Option = {
  value: string;
  label: string;
};

interface NameStepProps {
  formData: {
    name?: string;
    medicineType?: string;
  };
  updateFormData: (data: { name?: string; medicineType?: string }) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export default function NameStep({
  formData,
  updateFormData,
}: NameStepProps) {
  // Convert string array to { value, label } objects
  const options: Option[] = medicineOptions.map((name) => ({ value: name, label: name }));

  // Find currently selected option
  const selectedOption = formData.name
    ? { value: formData.name, label: formData.name }
    : null;

  // Handle selection change
  const handleChange = (selected: Option | null) => {
    if (selected) {
      updateFormData({ name: selected.value, medicineType: selected.value });
    } else {
      updateFormData({ name: "", medicineType: "" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="medicine-name" className="text-base font-medium">
          Name of the medication <span className="text-red-500">*</span>
        </Label>

        {/* React Select */}
        <Select
          id="medicine-name"
          instanceId="medicine-name" // Prevents SSR mismatch
          value={selectedOption}
          onChange={handleChange}
          options={options}
          placeholder="Search for medication..."
          isSearchable={true}
          aria-label="Medication name"
          className={cn(
            "w-full text-sm",
            "[&_.react-select__control]:border-theme",
            "[&_.react-select__control]:rounded-lg",
            "[&_.react-select__control]:h-12",
            "[&_.react-select__control]:shadow-none",
            "[&_.react-select__control]:bg-white",
            "[&_.react-select__control]:hover:border-theme",
            "[&_.react-select__control--is-focused]:border-theme",
            "[&_.react-select__control--is-focused]:ring-1",
            "[&_.react-select__control--is-focused]:ring-theme",
            "[&_.react-select__indicator]:text-slate-500"
          )}
          classNames={{
            control: (state) =>
              cn(
                "border-2 hover:border-theme focus:border-theme focus:ring-theme",
                state.isFocused ? "border-theme ring-1 ring-theme" : ""
              ),
            option: (state) =>
              cn(
                "cursor-pointer px-4 py-2",
                state.isSelected ? "bg-theme text-white" : "",
                state.isFocused ? "bg-theme/10" : ""
              ),
            menu: () => "mt-1 z-50",
            menuList: () => "max-h-60 overflow-y-auto",
          }}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#00A5E5", // Your brand color (e.g., theme)
              primary75: "#008ec4",
              primary50: "#0077a3",
              primary25: "#e6f4fc",
            },
          })}
        />
      </div>

      {/* Selected Medication Preview */}
      {formData.name && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Selected Medication</h3>
          <p className="text-blue-800">{formData.name}</p>
        </div>
      )}
    </div>
  );
}