// import { useState, useEffect } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import axiosInstance from '../../../lib/axios'
// import AsyncSelect from "react-select/async";
// const academicYearOptions = [
//   "2021-2022",
//   "2022-2023",
//   "2023-2024",
//   "2024-2025"
// ]

// export function TermDialog({ 
//   open, 
//   onOpenChange, 
//   onSubmit,
//   initialData 
// }) {
  
//   const [name, setName] = useState(initialData?.term ?? "")
//   const [academicYear, setAcademicYear] = useState(initialData?.academicYear ?? academicYearOptions[0])

//   const loadOptions = async (inputValue) => {
//     try {
//       const response = await axiosInstance.get(`/academic-years?limit=all`);
//       const data = response.data.data.result;

//       return data
//         .filter((year) => year.academic_year.toLowerCase().includes(inputValue.toLowerCase()))
//         .map((year) => ({
//           label: year.academic_year,
//           value: year.id,
//         }));
//     } catch (error) {
//       console.error("Error fetching academic years:", error);
//       return [];
//     }
//   };


//   useEffect(() => {
//     setName(initialData?.term ?? "")
//     setAcademicYear(initialData?.academicYear ?? academicYearOptions[0])
//     console.log(initialData)
//   }, [initialData])

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     onSubmit({ term: name, academic_year_id: academicYear.value.toString() })
//     onOpenChange(false)
//     setName("")
//     setAcademicYear(academicYearOptions[0])
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>{initialData ? "Edit" : "Add"} Term</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-2">
//             <Label htmlFor="name">
//               Term Name <span className="text-red-500">*</span>
//             </Label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="academicYear">
//               Academic Year <span className="text-red-500">*</span>
//             </Label>
//             <AsyncSelect
//               id="academicYear"
//               cacheOptions
//               defaultOptions
//               loadOptions={loadOptions}
//               value={academicYear}
//               onChange={setAcademicYear}
//               placeholder="Select Academic Year"
//               isClearable
//             />
//           </div>
          
//           <div className="flex justify-end space-x-2">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button className="bg-supperagent text-white hover:bg-supperagent/90" type="submit">Submit</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "../../../lib/axios";
import AsyncSelect from "react-select/async";

export function TermDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState(null);

  // Load options for the academic year dropdown
  const loadOptions = async (inputValue) => {
    try {
      const response = await axiosInstance.get(`/academic-years?limit=all`);
      const data = response.data.data.result;

      return data
        .filter((year) =>
          year.academic_year.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((year) => ({
          label: year.academic_year,
          value: year.id,
        }));
    } catch (error) {
      console.error("Error fetching academic years:", error);
      return [];
    }
  };

  // Populate the form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.term || "");
      setAcademicYear(
        initialData.academic_year
          ? { label: initialData.academicYear, value: initialData.academicYearId }
          : null
      );
      console.log(initialData)
    } else {
      setName("");
      setAcademicYear(null);
    }
  }, [initialData]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!academicYear) {
      alert("Please select an academic year.");
      return;
    }

    onSubmit({
      term: name,
      academic_year_id: academicYear.value,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Term</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Term Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Term Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter term name"
            />
          </div>

          {/* Academic Year Field */}
          <div className="space-y-2">
            <Label htmlFor="academicYear">
              Academic Year <span className="text-red-500">*</span>
            </Label>
            <AsyncSelect
              id="academicYear"
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              value={academicYear}
              onChange={setAcademicYear}
              placeholder="Select Academic Year"
              isClearable
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-supperagent text-white hover:bg-supperagent/90"
              type="submit"
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
