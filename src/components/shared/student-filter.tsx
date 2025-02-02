import { Input } from "@/components/ui/input"
import { Button } from "../ui/button"
import { Printer, Search } from "lucide-react"
import { useEffect, useState } from "react";
import axiosInstance from '../../lib/axios'

export default function StudentFilter({ onSubmit }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [institutes, setInstitutes] = useState<any>([]);
  const [terms, setTerms] = useState<any>([]);
  const [academicYear, setAcademicYear] = useState<any>([]);
  const [agents, setAgents] = useState<any>([]);
  const [staffs, setStaffs] = useState<any>([]);
  const [dob, setDob] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedInstitute, setSelectedInstitute] = useState<any>(null);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [instituteResponse, termsResponse, academicYearResponse, agentResponse, staffResponse] = await Promise.all([
        axiosInstance.get('/institutions?limit=all&status=1'),
        axiosInstance.get('/terms?limit=all&status=1'),
        axiosInstance.get('/academic-years?limit=all&status=1'),
        axiosInstance.get('/agents?where=with:user,status,1&limit=all'),
        axiosInstance.get('/staffs?where=with:user,status,1&limit=all'),
      ]);
      setInstitutes(instituteResponse.data.data.result);
      setTerms(termsResponse.data.data.result);
      setAcademicYear(academicYearResponse.data.data.result);
      setAgents(agentResponse.data.data.result);
      setStaffs(staffResponse.data.data.result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      searchTerm,
      status,
      dob,
      agent: selectedAgent || null,
      staffId: selectedStaff || null,
      institute: selectedInstitute || null, // Include the selected institute
      term: selectedTerm || null,
      academic_year_id: selectedAcademicYear || null,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4 shadow-2xl p-4 rounded-md">
        <div>
          <label className="mb-2 block text-sm font-medium">Search</label>
          <Input
            placeholder="Ref No, Name, Email, Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">DOB</label>
          <Input placeholder="DOB" type="date" value={dob}
            onChange={(e) => setDob(e.target.value)}/>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Academic Year</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onChange={(e) => setSelectedAcademicYear(e.target.value)}>
            <option value="">Select Academic Year</option>
            {academicYear.map((year) => (
              <option key={year.id} value={year.id}>
                {year.academic_year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Select Terms</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onChange={(e) => setSelectedTerm(e.target.value)}>
            <option value="">Select Term</option>
            {terms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.term}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Institute</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onChange={(e) => setSelectedInstitute(e.target.value)} >
            <option value="">Select Institute</option>
            {institutes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Agent</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onChange={(e) => setSelectedAgent(e.target.value)}>
            <option value="">Select Agent</option>
            {agents.map((item) => (
              <option key={item.id} value={item.id}>
                {item.agentName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Staffs</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onChange={(e) => setSelectedStaff(e.target.value)}>
            <option value="">Select Staff</option>
            {staffs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.firstName} {item.lastName}
              </option>
            ))}
          </select>
        </div>
        <div></div>
        <div></div>
        <div></div>
        <div className="flex gap-4 justify-end">
          <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent/90">
            <Search className="h-4 w-4 mr-3" /> Search
          </Button>
          <Button className="bg-secondary text-white hover:bg-secondary/90">
            <Printer className="h-4 w-4 mr-3" /> Export
          </Button>
        </div>
      </form>
    </div>
  );
}
