import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "../ui/button"
import { Printer, Search } from "lucide-react"
export default function StudentFilter(){
    return(
        
        <div className="mb-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4 shadow-2xl p-4 rounded-md">
          <div>
            <label className="mb-2 block text-sm font-medium">Search</label>
            <Input placeholder="Ref No, Name, Email, Phone" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">DOB</label>
            <Input placeholder="DOB" />
         
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium">Academic Year</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Select Terms</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Institue</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Agent</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="omniscient">Omniscient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Staffs</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="omniscient">Omniscient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div></div>
          <div></div>
          <div></div>

          <div className="flex gap-4 justify-end">
            <Button className="bg-supperagent text-white hover:bg-supperagent/90"> <Search className="h-4 w-4 mr-3" /> Search</Button>
            <Button className="bg-secondary text-white hover:bg-secondary/90"> <Printer className="h-4 w-4 mr-3" /> Export</Button>
          
          </div>

        </div>
    )
}