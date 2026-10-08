import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          onClick={() => navigate('/dashboard/recruitment')}
          className="cursor-pointer transition-all hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Recruitment</CardTitle>
            <Briefcase className="h-8 w-8 text-watney" />
          </CardHeader>
          <CardContent>
            <p>
              Manage job postings, applications, interviews, and candidate forms
            </p>
          </CardContent>
        </Card>
        <Card
          onClick={() => navigate('/dashboard/people-planner')}
          className="cursor-pointer transition-all hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">People Planner</CardTitle>
            <Users className="h-8 w-8 text-watney" />
          </CardHeader>
          <CardContent>
            <p>
              Plan and manage staff scheduling, rotas, and resource allocation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
