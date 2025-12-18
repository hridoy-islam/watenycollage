import React, { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import Select from "react-select";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import TabSection from "../TabSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { countries, nationalities } from "@/types";
import { useSelector } from "react-redux";
import { ImageUploader } from "../components/userImage-uploader";

interface PersonalDetailsProps {
  userData: any;
  isEditing?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  refreshData?: () => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  userData,
  isEditing,
  onSave,
  onCancel,
  onEdit,
  refreshData,
}) => {
  const [localData, setLocalData] = useState(userData);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof any, value: any) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave?.(localData);
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Dropdown options
  const nationalityOptions = nationalities.map((n) => ({
    label: n,
    value: n.toLowerCase().replace(/\s/g, "-"),
  }));

  const countryOptions = countries.map((c) => ({
    label: c,
    value: c.toLowerCase().replace(/\s/g, "-"),
  }));

  const titleOptions = [
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Miss", label: "Miss" },
    { value: "Ms", label: "Ms" },
    { value: "Dr", label: "Dr" },
    { value: "Prof", label: "Prof" },
  ];

  const findOption = (
    options: { value: string; label: string }[],
    value: string
  ) => options.find((opt) => opt.value === value);

  const handleUploadComplete = () => {
    setUploadOpen(false);
    refreshData?.();
  };

  return (
    <TabSection
      title="Personal Details"
      description="Your basic personal information"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="group relative">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
              {localData?.image ? (
                <img
                  src={localData?.image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {isEditing && (
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-watney p-2 text-white shadow-md transition-colors hover:bg-indigo-700"
              >
                <div onClick={() => setUploadOpen(true)}>
                  <Camera size={16} />
                </div>
              </label>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {capitalizeFirstLetter(localData?.title)}{" "}
              {capitalizeFirstLetter(localData?.firstName)}{" "}
              {capitalizeFirstLetter(localData?.initial)}{" "}
              {capitalizeFirstLetter(localData?.lastName)}
            </h3>
            <p className="text-gray-500">{localData?.email}</p>
            <p className="text-gray-500">{localData?.phone}</p>
            <p className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {localData?.status}
            </p>
          </div>
        </div>

        {/* Personal Info Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label>Title</Label>
              {isEditing ? (
                <Select
                  className="mt-1"
                  options={titleOptions}
                  value={titleOptions.find(
                    (option) => option.value === localData?.title
                  )}
                  onChange={(selected) =>
                    handleInputChange("title", selected?.value)
                  }
                  styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData?.title || "-")}
                </div>
              )}
            </div>

            {/* First Name */}
            <div>
              <Label>First Name</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.firstName || "-")}
                </div>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <Label>Middle Name</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData.initial || ""}
                  onChange={(e) => handleInputChange("initial", e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.initial || "-")}
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <Label>Last Name</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData.lastName || "-")}
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <Label>Country of Residence</Label>
              {isEditing ? (
                <Select
                  options={countryOptions}
                  value={findOption(
                    countryOptions,
                    localData?.countryOfResidence || ""
                  )}
                  onChange={(selected) =>
                    handleInputChange(
                      "countryOfResidence",
                      selected?.value || ""
                    )
                  }
                   classNamePrefix="react-select"
                   styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
                  menuPortalTarget={document.body}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {findOption(
                    countryOptions,
                    localData?.countryOfResidence || ""
                  )?.label || "-"}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {/* DOB */}
            <div>
              <Label>Date of Birth</Label>
              {isEditing ? (
                <CustomDatePicker
                  selected={
                    localData.dateOfBirth
                      ? new Date(localData.dateOfBirth)
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (date) {
                      handleInputChange("dateOfBirth", date.toISOString());
                    }
                  }}
                  placeholder="Use your official birth date"
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData.dateOfBirth
                    ? new Date(localData.dateOfBirth).toLocaleDateString()
                    : "-"}
                </div>
              )}
            </div>

            {/* Share Code */}
            <div>
              <Label>Share Code</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData.shareCode || ""}
                  onChange={(e) =>
                    handleInputChange("shareCode", e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData.shareCode || "-"}
                </div>
              )}
            </div>

            {/* NI Number */}
            <div>
              <Label>National Insurance Number</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={localData.nationalInsuranceNumber || ""}
                  onChange={(e) =>
                    handleInputChange("nationalInsuranceNumber", e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData.nationalInsuranceNumber || "-"}
                </div>
              )}
            </div>

            {/* Nationality */}
            <div>
              <Label>Nationality</Label>
              {isEditing ? (
                <Select
                  options={nationalityOptions}
                  value={findOption(
                    nationalityOptions,
                    localData?.nationality || ""
                  )}
                  onChange={(selected) =>
                    handleInputChange("nationality", selected?.value || "")
                  }
                  classNamePrefix="react-select"
                   styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
                  menuPortalTarget={document.body}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {findOption(nationalityOptions, localData?.nationality || "")
                    ?.label || "-"}
                </div>
              )}
            </div>
          </div>
        </div>

        

        <ImageUploader
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUploadComplete={handleUploadComplete}
          entityId={user?._id}
        />
      </div>
    </TabSection>
  );
};

export default PersonalDetails;
