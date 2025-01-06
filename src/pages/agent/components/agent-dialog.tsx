import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function AgentDialog({ open, onOpenChange, onSubmit, initialData, staffOptions }) {
  const [agentName, setAgentName] = useState(initialData?.agentName ?? "")
  const [organization, setOrganization] = useState(initialData?.organization ?? "")
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson ?? "")
  const [phone, setPhone] = useState(initialData?.phone ?? "")
  const [email, setEmail] = useState(initialData?.email ?? "")
  const [addressLine1, setAddressLine1] = useState(initialData?.addressLine1 ?? "")
  const [addressLine2, setAddressLine2] = useState(initialData?.addressLine2 ?? "")
  const [townCity, setTownCity] = useState(initialData?.townCity ?? "")
  const [state, setState] = useState(initialData?.state ?? "")
  const [postCode, setPostCode] = useState(initialData?.postCode ?? "")
  const [country, setCountry] = useState(initialData?.country ?? "")
  const [nominatedStaff, setNominatedStaff] = useState(initialData?.nominatedStaff ?? "")
  const [active, setActive] = useState(initialData?.active ?? true)

  const handleSubmit = () => {
    const data = {
      agentName,
      organization,
      contactPerson,
      phone,
      email,
      addressLine1,
      addressLine2,
      townCity,
      state,
      postCode,
      country,
      nominatedStaff,
      active,
    }

    // Perform validation for required fields
    if (!addressLine1 || !townCity || !postCode) {
      alert("Please fill in all required fields (Address Line 1, Town/City, and Post Code).")
      return
    }

    onSubmit(data)
    onOpenChange(false) // Close the dialog after submission
  }

  useEffect(() => {
    if (initialData) {
      setAgentName(initialData.agentName)
      setOrganization(initialData.organization)
      setContactPerson(initialData.contactPerson)
      setPhone(initialData.phone)
      setEmail(initialData.email)
      setAddressLine1(initialData.addressLine1)
      setAddressLine2(initialData.addressLine2)
      setTownCity(initialData.townCity)
      setState(initialData.state)
      setPostCode(initialData.postCode)
      setCountry(initialData.country)
      setNominatedStaff(initialData.nominatedStaff)
      setActive(initialData.active)
    }
  }, [initialData])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Agent" : "Add New Agent"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Agent Name *</label>
            <Input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Agent Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Organization</label>
            <Input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Organization"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Contact Person *</label>
            <Input
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Contact Person"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Address Line 1 *</label>
            <Input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Address Line 1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Address Line 2</label>
            <Input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Address Line 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Town/City *</label>
            <Input
              value={townCity}
              onChange={(e) => setTownCity(e.target.value)}
              placeholder="Town/City"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">State</label>
            <Input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Post Code *</label>
            <Input
              value={postCode}
              onChange={(e) => setPostCode(e.target.value)}
              placeholder="Post Code"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Country</label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nominated Staff</label>
            <Select value={nominatedStaff} onValueChange={setNominatedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select Staff" />
              </SelectTrigger>
              <SelectContent>
                {staffOptions?.map((staff) => (
                  <SelectItem key={staff} value={staff}>
                    {staff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <Input type="password" />
          </div>

          
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-supperagent text-white hover:bg-supperagent/90">
            {initialData ? "Save Changes" : "Add Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
