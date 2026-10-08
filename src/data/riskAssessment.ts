export interface Question {
  id: string
  text: string
  type: "text" | "radio" | "checkbox"
  options?: string[]
  required?: boolean
}

export interface Assessment {
  id: string
  name: string
  description?: string
  questions: Question[]
  category?: string
  badge?: string
}

export const mockAssessments: Assessment[] = [
  {
    id: "at-adaptations-risk",
    name: "AT and Adaptations Risk",
    description: "Assessment for assistive technology and adaptations risk evaluation",
    category: "Risk Assessment",
    badge: "AT",
    questions: [
      {
        id: "what-is-risk",
        text: "What is the risk?",
        type: "text",
        required: true,
      },
      {
        id: "who-harmed",
        text: "Who might be harmed?",
        type: "text",
        required: true,
      },
      {
        id: "likelihood",
        text: "Likelihood",
        type: "radio",
        options: ["Very Low", "Low", "Medium", "High", "Very High"],
        required: true,
      },
      {
        id: "severity",
        text: "Severity",
        type: "radio",
        options: ["Minimal", "Minor", "Moderate", "Major", "Catastrophic"],
        required: true,
      },
      {
        id: "risk-factors",
        text: "Select applicable risk factors:",
        type: "checkbox",
        options: [
          "Equipment failure",
          "User error",
          "Environmental factors",
          "Maintenance issues",
          "Training inadequacy",
        ],
      },
    ],
  },
  {
    id: "generic-assessment",
    name: "Generic Assessment",
    description: "General purpose risk assessment template",
    category: "General",
    badge: "GA",
    questions: [
      {
        id: "assessment-purpose",
        text: "What is the purpose of this assessment?",
        type: "text",
        required: true,
      },
      {
        id: "risk-level",
        text: "Overall risk level",
        type: "radio",
        options: ["Low", "Medium", "High", "Critical"],
        required: true,
      },
      {
        id: "mitigation-actions",
        text: "What mitigation actions are needed?",
        type: "text",
        required: true,
      },
      {
        id: "review-frequency",
        text: "Review frequency",
        type: "radio",
        options: ["Weekly", "Monthly", "Quarterly", "Annually"],
        required: true,
      },
      {
        id: "stakeholders",
        text: "Select involved stakeholders:",
        type: "checkbox",
        options: ["Management", "Staff", "Clients", "External partners", "Regulatory bodies"],
      },
    ],
  },
  {
    id: "mental-capacity-assessment",
    name: "Mental Capacity Assessment",
    description: "Assessment for mental capacity evaluation",
    category: "Clinical",
    badge: "MC",
    questions: [
      {
        id: "decision-context",
        text: "What decision needs to be made?",
        type: "text",
        required: true,
      },
      {
        id: "capacity-level",
        text: "Current capacity level",
        type: "radio",
        options: ["Full capacity", "Partial capacity", "No capacity", "Fluctuating capacity"],
        required: true,
      },
      {
        id: "support-needed",
        text: "What support is needed for decision making?",
        type: "text",
        required: true,
      },
    ],
  },
]

export const predefinedAssessmentTemplates = [
  { id: "generic-assessment", name: "Generic Assessment", badge: "GA" },
  { id: "mental-capacity-assessment", name: "Mental Capacity Assessment", badge: "MC" },
  { id: "at-adaptations-risk", name: "AT and Adaptations Risk", badge: "AT" },
  { id: "abbey-pain-scale", name: "Abbey Pain Scale", badge: "APS" },
  { id: "accessing-community-risk", name: "Accessing the Community Risk", badge: "ACR" },
  { id: "advance-care-planning", name: "Advance Care Planning", badge: "ACP" },
  { id: "bed-rails", name: "Bed Rails", badge: "BR" },
  { id: "behaviour-risk", name: "Behaviour Risk", badge: "BER" },
  { id: "body-mass-index", name: "Body Mass Index (BMI)", badge: "BMI" },
  { id: "braden", name: "Braden", badge: "BRA" },
  { id: "call-bell", name: "Call Bell", badge: "CB" },
  { id: "choking-risk", name: "Choking Risk", badge: "CHR" },
  { id: "communication-risk", name: "Communication Risk", badge: "COR" },
  { id: "continence-risk", name: "Continence Risk", badge: "CON" },
]
