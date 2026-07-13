import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, User } from 'lucide-react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'; // ✅ React Router
import {
  mockAssessments,
  type Assessment,
  type Question
} from '@/data/riskAssessment';

export default function RiskAssessmentDetailPage() {
  const { id } = useParams(); // ✅ from react-router-dom
  const [searchParams] = useSearchParams(); // ✅ from react-router-dom
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    const customName = searchParams.get('name');

    if (id === 'custom' && customName) {
      setIsCustom(true);
      setAssessment({
        id: 'custom',
        name: customName,
        description: 'Custom risk assessment',
        badge: 'Custom',
        questions: [
          {
            id: 'custom-risk',
            text: 'What is the risk?',
            type: 'text',
            required: true
          },
          {
            id: 'custom-impact',
            text: 'Who might be harmed?',
            type: 'text',
            required: true
          },
          {
            id: 'custom-likelihood',
            text: 'Likelihood',
            type: 'radio',
            options: ['Low', 'Medium', 'High'],
            required: true
          },
          {
            id: 'custom-actions',
            text: 'Actions to mitigate this risk',
            type: 'text',
            required: false
          }
        ]
      });
    } else {
      const foundAssessment = mockAssessments.find((a) => a.id === id);
      setAssessment(foundAssessment || null);
    }
  }, [id, searchParams]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting assessment:', {
      assessmentId: assessment?.id,
      answers
    });
    alert('Assessment submitted successfully!');
    // Optionally navigate after submit
    // navigate("/");
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.text}
              {question.required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </Label>
            {question.text.toLowerCase().includes('actions') ||
            question.text.toLowerCase().includes('risk') ? (
              <Textarea
                id={question.id}
                placeholder="Describe what could cause harm. In the person at risk of injury through overload use of equipment or poorly maintained equipment"
                value={(answers[question.id] as string) || ''}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                className="min-h-[100px]"
              />
            ) : (
              <Input
                id={question.id}
                value={(answers[question.id] as string) || ''}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
              />
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-sm font-medium">
              {question.text}
              {question.required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </Label>
            <RadioGroup
              value={(answers[question.id] as string) || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${option}`}
                  />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-sm font-medium">
              {question.text}
              {question.required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </Label>
            <div className="space-y-2">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={(
                      (answers[question.id] as string[]) || []
                    ).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentAnswers =
                        (answers[question.id] as string[]) || [];
                      if (checked) {
                        handleAnswerChange(question.id, [
                          ...currentAnswers,
                          option
                        ]);
                      } else {
                        handleAnswerChange(
                          question.id,
                          currentAnswers.filter((a) => a !== option)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Assessment not found</h2>

          <Button
            variant="ghost"
            size="sm"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {assessment.badge || 'CUSTOM'}
          </Badge>
          <h1 className="text-2xl font-bold">{assessment.name}</h1>
        </div>

        {/* Assessment Form */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assessment Questions</CardTitle>
              <div className="text-sm text-muted-foreground">
                Attached to: Support Plans
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {assessment.questions.map(renderQuestion)}
          </CardContent>
        </Card>

        {/* Risk Outcome Score */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                0
              </Badge>
              <CardTitle>Risk Outcome Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 rounded-lg border border-gray-300 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="italic text-muted-foreground">
                  "Fill out the assessment to see my Risk Outcome Score"
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Assessment User • {new Date().toLocaleDateString()} • Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                AC
              </Badge>
              <CardTitle>Actions to mitigate this risk</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any text you include in this field will be copied into the 'Actions' field within the Risk Assessment. To add this text, you must submit to the Risk Assessment."
              className="min-h-[100px] border-gray-300"
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
