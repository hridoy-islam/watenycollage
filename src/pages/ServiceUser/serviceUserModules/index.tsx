import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Button } from '@/components/ui/button';
import {
  MoveLeft,
  User,
  ClipboardList,
  Users,
  FileText,
  ShieldAlert,
  FileSignature,
  Mail,
  Phone,
  ChevronRight
} from 'lucide-react';

const ServiceUserModulePage = () => {
  const { sid:id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Define modules with direct Lucide component references
  const modules = [
    {
      id: 1,
      title: 'Profile',
      link: `/admin/people-planner/general-information/${id}`,
      icon: User,
      description: 'Personal details and demographics'
    },
    {
      id: 2,
      title: 'Needs',
      link: `/admin/people-planner/needs/${id}`,
      icon: ClipboardList,
      description: 'Care needs and assessments'
    },
    {
      id: 3,
      title: 'Important People',
      link: `/admin/people-planner/important-people/${id}`,
      icon: Users,
      description: 'Family, friends and professionals'
    },
    {
      id: 4,
      title: 'About Me',
      link: `/admin/people-planner/about-me/${id}`,
      icon: FileText,
      description: 'Bio and personal preferences'
    },
    {
      id: 5,
      title: 'Contingency Plans',
      link: `/admin/people-planner/contingency-plan/${id}`,
      icon: ShieldAlert,
      description: 'Emergency protocols and safety'
    },
    {
      id: 6,
      title: 'Consents',
      link: `/admin/people-planner/consents/${id}`,
      icon: FileSignature,
      description: 'Signed permissions and agreements'
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        setUser(response.data.data);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleCardClick = (link: string) => {
    navigate(link);
  };

  if (loading) {
    return (
      <div className="flex  w-full items-center justify-center ">
        <BlinkingDots size="large" color="text-theme" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex  flex-col items-center justify-center gap-4 ">
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="text-theme hover:underline"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen  pb-12 animate-in fade-in duration-500">
      <div>
        {/* --- Profile Header Card --- */}
        <div className="relative overflow-hidden rounded-3xl bg-white px-8 pb-10 pt-8 shadow-sm border-b border-gray-200">
          <div className="mx-auto ">
            <div className="flex flex-col items-center gap-8 md:flex-row">
              {/* Avatar Section */}
              <div className="relative">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg ring-1 ring-gray-100">
                  <img
                    src={user?.image || 'https://via.placeholder.com/150'}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Active Status Indicator */}
                <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm"></span>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-sm text-gray-500">Service User Profile</p>
                  </div>
                  
                  <Button
                    onClick={() => navigate(-1)}
                  >
                    <MoveLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start">
                  {user.email && (
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200/50 transition-colors hover:bg-gray-100">
                      <Mail className="h-4 w-4 text-theme" />
                      {user.email}
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200/50 transition-colors hover:bg-gray-100">
                      <Phone className="h-4 w-4 text-theme" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Modules Grid --- */}
        <div className="mx-auto mt-10 ">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {modules.map((module) => {
              const IconComponent = module.icon;
              
              return (
                <div
                  key={module.id}
                  onClick={() => handleCardClick(module.link)}
                  className="group relative flex cursor-pointer flex-col gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-theme/50 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-row items-center gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 text-theme transition-colors duration-300 group-hover:bg-watney group-hover:text-white">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-theme">
                          {module.title}
                        </h3>
                       
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-300 transition-colors duration-300 group-hover:text-theme" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceUserModulePage;