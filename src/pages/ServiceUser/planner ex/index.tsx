import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

import type { SidebarState } from '@/types/planner';
// CHANGED: Import moment-timezone
import moment from 'moment-timezone';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';


// --- DnD Imports ---
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams } from 'react-router-dom';
import { TopControls } from './components/TopControls';
import { Timeline } from './components/Timeline';
import { RightSidebar } from './components/RightSidebar';
import { ScheduleDetailComponent } from './components/ScheduleDetail';
import { ExtraCallComponent } from './components/ExtraCall';

// CHANGED: Define UK Timezone Constant
const UK_TZ = "Europe/London";

// 👇 Interfaces
interface User {
  _id: string; 
  id?: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  email?: string;
  role: string;
  title?: string;
  image?: string;
  [key: string]: any;
}

export interface TSchedule {
  _id: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  serviceUser: User | string; 
  employee?: User | string; 
  serviceType?: string;
  status?: string; 
  [key: string]: any;
}

export default function ServicePlannerPage() {
  const { id, sid } = useParams(); // This is the Service User ID
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Only Status filter remains
  const [status, setStatus] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(2);
  
  const [sidebarOpen, setSidebarOpen] = useState<SidebarState>({
    left: true,
    right: true
  });

  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<TSchedule[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<TSchedule | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isExtraCallOpen, setIsExtraCallOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(1000); 

  // 1. Fetch Specific Service User Details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!sid) return;
      try {
        setLoadingUser(true);
        // Assuming endpoint to get single user is /users/detail/{id} or similar. 
        // Adjusting based on common patterns, or filtering from the list if no single endpoint exists.
        // For now, attempting a direct fetch.
        const res = await axiosInstance.get(`/users/${sid}`);
        // Adjust response structure based on your actual API
        const user = res?.data?.data || res?.data; 
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        toast({ title: 'Failed to load user details', variant: 'destructive' });
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserDetails();
  }, [sid]);

  // 2. Fetch Schedules (Past 7 Days -> End of Week)
  const fetchSchedules = async (
    page: number,
    entriesPerPage: number
  ) => {
    try {
      setLoadingSchedules(true);

      let apiParams: any = {
        page,
        limit: entriesPerPage,
      };
      
      // CHANGED: Use UK Timezone for Start/End calculations
      // Fetch data for the surrounding date range
      const startRange = moment(selectedDate).tz(UK_TZ).subtract(7, 'days').startOf('day').toISOString();
      const endRange = moment(selectedDate).tz(UK_TZ).add(7, 'days').endOf('day').toISOString();

      apiParams.startDate = startRange;
      apiParams.endDate = endRange;
      apiParams.completeSchedule = false
      
      // We can also filter by serviceUser at API level if supported:
      if (sid) apiParams.serviceUser = sid;

      const res = await axiosInstance.get(`/schedules?companyId=${id}`, {
        params: apiParams
      });

      const fetchedSchedules = res?.data?.data?.result || res?.data?.data || [];
      setSchedules(fetchedSchedules);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast({ title: 'Failed to load schedules', variant: 'destructive' });
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    fetchSchedules(currentPage, entriesPerPage);
  }, [selectedDate, currentPage, entriesPerPage, sid]); 

  // Handle Drag and Drop Updates
  const handleScheduleUpdate = useCallback(
    async (
      scheduleId: string,
      newStartTime: string,
      newEndTime: string,
      newResourceId: string
    ) => {
      // 1. Optimistic Update
      setSchedules((prevSchedules) =>
        prevSchedules.map((sched) => {
          if (sched._id === scheduleId) {
            // In single user view, we are likely just updating time, 
            // but the function signature expects a resource ID.
            return {
              ...sched,
              startTime: newStartTime,
              endTime: newEndTime,
            };
          }
          return sched;
        })
      );

      // 2. API Update
      try {
        const payload: any = { startTime: newStartTime, endTime: newEndTime };
        // We aren't changing the user assignment in this view, just time.
        await axiosInstance.patch(`/schedules/${scheduleId}`, payload);
        toast({ title: 'Schedule Updated', description: 'Time updated.' });
      } catch (error) {
        console.error('Failed to update schedule:', error);
        toast({ title: 'Update Failed', description: 'Reverting changes...', variant: 'destructive' });
        fetchSchedules(currentPage, entriesPerPage);
      }
    },
    [currentPage, entriesPerPage, selectedDate]
  );

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 1, 8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 1, 2));

  const handleScheduleClick = (schedule: TSchedule) => {
    setSelectedSchedule(schedule);
  };

  const handleExtraScheduleClick = () => {
    setIsExtraCallOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
  };

  // 4. Filter Schedules Client-Side
  const filteredSchedules = useMemo(() => {
    let result = schedules;

    // Filter by ID if API didn't do it
    if (sid) {
       result = result.filter(s => {
         const sId = typeof s.serviceUser === 'object' ? s.serviceUser?._id : s.serviceUser;
         return sId === sid;
       });
    }

    // Filter by Status
    if (status === 'allocated') {
      result = result.filter((s) => s.employee);
    } else if (status === 'unallocated') {
      result = result.filter((s) => !s.employee);
    }

    return result;
  }, [schedules, status, sid]);

  // CHANGED: Format using UK Timezone
  const selectedDateString = moment(selectedDate).tz(UK_TZ).format('YYYY-MM-DD');

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  // 6. Calculate Stats (kept for RightSidebar)
  const dayStats = useMemo(() => {
    // CHANGED: Use UK Timezone for day comparison
    const startDay = moment(selectedDate).tz(UK_TZ).subtract(6, 'days');
    return Array.from({ length: 7 }).map((_, i) => {
      const currentDay = startDay.clone().add(i, 'days');
      const dayString = currentDay.format('YYYY-MM-DD');
      const daySchedules = schedules.filter(
        (s) => moment(s.date).tz(UK_TZ).format('YYYY-MM-DD') === dayString
      );
      const allocatedCount = daySchedules.filter((t) => t.employee).length;

      return {
        date: currentDay.format('DD/MM'),
        day: currentDay.format('dddd'),
        allocated: allocatedCount,
        unallocated: daySchedules.length - allocatedCount,
        total: daySchedules.length
      };
    });
  }, [selectedDate, schedules]);

  const handleNewSchedule = () => fetchSchedules(currentPage, entriesPerPage);
  const handleLocalScheduleUpdate = () => fetchSchedules(currentPage, entriesPerPage);

  if (loadingUser && !currentUser) {
    return (
      <div className="flex h-[calc(100vh-14vh)] w-full items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className=" rounded-lg bg-white shadow-sm pt-4">
        {/* <div className="p-2">
            <h1 className="text-3xl font-semibold">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Planner'}
            </h1>
            {currentUser && <p className="text-sm text-gray-500">Service User Schedule</p>}
        </div> */}
        <TooltipProvider>
          <div className="flex flex-col justify-between p-2 -mt-5 lg:flex-row">
            <div className="flex h-[calc(100vh-14vh)] w-full flex-col overflow-hidden lg:w-[86%]">
              <TopControls
                zoomLevel={zoomLevel}
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
                status={status}
                setStatus={setStatus}
                onScheduleClick={handleExtraScheduleClick}
                userData={currentUser}
              />

              <Timeline
                schedules={filteredSchedules}
                zoomLevel={zoomLevel}
                selectedDate={selectedDateString}
                contentRef={contentRef}
                onScheduleClick={handleScheduleClick}
                onScheduleUpdate={handleScheduleUpdate}
              />
            </div>

            <RightSidebar
              isOpen={sidebarOpen.right}
              selectedDate={selectedDate}
              setSelectedDate={handleDateChange}
              currentData={[]} // Not needed for single user view logic in sidebar
              dayStats={dayStats}
            />

            <ScheduleDetailComponent
              schedule={selectedSchedule as any}
              isOpen={!!selectedSchedule}
              onClose={handleCloseScheduleModal}
              onScheduleUpdate={handleLocalScheduleUpdate}
            />

            <ExtraCallComponent
              isOpen={isExtraCallOpen}
              onClose={() => setIsExtraCallOpen(false)}
              onScheduleCreated={handleNewSchedule}
            />
          </div>
        </TooltipProvider>
      </div>
    </DndProvider>
  );
}