import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MoveLeft } from 'lucide-react';

// Map each ID to its questions and answers
const assessmentData = {
  'living-safely': {
    title: 'Living Safely & Taking Risks',
    sections: [
      {
        title: 'Health and Safety',
        questions: [
          { q: 'Do I have any health and safety needs?', a: 'No' },
          { q: 'How much am I aware of how to keep safe in my surroundings and take positive risks?', a: 'Able to understand risks and make decisions. Needs support during high-risk situations.' },
          { q: 'Which SPAM do I require support for?', a: 'Other' }
        ]
      },
      {
        title: 'Assistive Technology and Adaptations',
        questions: [
          { q: 'Do I have any need for Assistive Technology and Adaptations?', a: 'No' }
        ]
      },
      {
        title: 'Deprivation of Liberty Safeguards (DoLS)',
        questions: [
          { q: 'Do I need any DoLS application in place?', a: 'No' }
        ]
      },
      {
        title: 'Vulnerability',
        questions: [
          { q: 'Do I have any vulnerability needs?', a: 'Yes' },
          { q: 'How much am I aware of my own vulnerability?', a: 'Limited awareness due to cognitive decline. Needs regular monitoring.' },
          { q: 'Which SPAM do I need to support due to vulnerability?', a: 'Other' }
        ]
      }
    ]
  },
  // Add more entries as needed
};

export default function InitialAssessmentDetailPage() {
  const { id } = useParams();
  const data = assessmentData[id] || assessmentData['living-safely']; // fallback
const navigate = useNavigate();
  return (
    <div className="space-y-6 ">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{data.title}</h1>
        <Button variant="default" className='bg-watney text-white hover:bg-watney/90 flex gap-2' size="sm" onClick={()=> navigate(-1)}><MoveLeft className='w-4 h-4'/>Back</Button>
      </div>

      {data.sections.map((section, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {section.questions.map((q, qIdx) => (
              <div key={qIdx} className="mb-6">
                <p className="font-medium text-sm mb-2">{q.q}</p>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <Textarea
                    value={q.a}
                    readOnly
                    placeholder="Answer..."
                    className="w-full resize-none bg-transparent border-none focus:ring-0"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}