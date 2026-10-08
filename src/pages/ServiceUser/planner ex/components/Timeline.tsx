import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useDrag, useDrop } from 'react-dnd'; 
import {
  ContextMenu,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  User as UserIcon,
  Briefcase,
  MapPin,
} from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils'; 

// --- Constants ---
const HEADER_HEIGHT_CLASS = "h-12"; 
const ROW_HEIGHT_CLASS = "h-16";
const ITEM_TYPE = 'SCHEDULE'; 

// --- Types ---
interface TimelineProps {
  schedules: any[];
  zoomLevel: number;
  selectedDate: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onScheduleClick: (schedule: any) => void;
  onScheduleUpdate: (id: string, newStart: string, newEnd: string, newResourceId: string) => void;
}

interface DragItem {
  id: string;
  originalStartTime: string;
  originalEndTime: string;
  durationMinutes: number;
  type: string;
  resourceId: string; // Used here to track DateString
}

// --- Helper: Time Calculation ---
const minutesToTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  const roundedMins = Math.round(mins / 5) * 5;
  const h = hours.toString().padStart(2, '0');
  const m = roundedMins.toString().padStart(2, '0');
  return `${h}:${m}`;
};

export function Timeline({
  schedules,
  zoomLevel,
  contentRef,
  selectedDate,
  onScheduleClick,
  onScheduleUpdate,
}: TimelineProps) {

  const SLOT_WIDTH = zoomLevel * 2.5; 
  
  const userListRef = useRef<HTMLDivElement>(null);
  const isUserScroll = useRef(false);
  const isContentScroll = useRef(false);

  // --- Data Preparation ---
  // Day Mode: 24 Hours
  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({ 
      label: `${i.toString().padStart(2, '0')}:00`,
      val: i 
    }));
  }, []);

  // Generate 7 Days Row Data
  const rowDays = useMemo(() => {
    const days = [];
   const baseDate = selectedDate ? moment(selectedDate) : moment();
      for (let i = 6; i >= 0; i--) {
        const date = baseDate.clone().subtract(i, 'days');
        days.push({
          date: date.format('YYYY-MM-DD'),
          displayDate: date.format('ddd, MMM DD'),
          isToday: date.isSame(moment(), 'day')
        });
      }
      return days;
  }, [selectedDate]);

   

  // --- Scroll Sync Logic ---
  useEffect(() => {
    const userList = userListRef.current;
    const content = contentRef.current;
    if (!userList || !content) return;

    const handleUserListScroll = () => {
      if (!isContentScroll.current) {
        isUserScroll.current = true;
        content.scrollTop = userList.scrollTop;
        setTimeout(() => (isUserScroll.current = false), 50);
      }
    };
    const handleContentScroll = () => {
      if (!isUserScroll.current) {
        isContentScroll.current = true;
        userList.scrollTop = content.scrollTop;
        setTimeout(() => (isContentScroll.current = false), 50);
      }
    };

    userList.addEventListener('scroll', handleUserListScroll);
    content.addEventListener('scroll', handleContentScroll);

    return () => {
      userList.removeEventListener('scroll', handleUserListScroll);
      content.removeEventListener('scroll', handleContentScroll);
    };
  }, [contentRef]);

  // --- Logic Helpers ---
  const getSchedulePosition = (schedule: any) => {
    const { startTime, endTime } = schedule;
    if (!startTime || !endTime) return { left: '0', width: '0' };
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    const startPos = (startMins / 60) * SLOT_WIDTH;
    const duration = ((endMins - startMins) / 60) * SLOT_WIDTH;
    return { left: `${startPos}rem`, width: `${duration}rem` };
  };

  const displayDate = selectedDate ? moment(selectedDate).format('MMMM Do, YYYY') : moment().format('MMMM Do, YYYY');

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm relative z-0">
      
      {/* 1. Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200  px-4 py-3 z-30 relative shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Calendar className="h-4 w-4 text-slate-500" />
                {displayDate}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div><span className="text-slate-600">Allocated</span></div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div><span className="text-slate-600">Unallocated</span></div>
        </div>
      </div>

      {/* 2. Body */}
      <div className="flex flex-1 overflow-hidden relative isolate">
        
        {/* Left Sidebar: Dates */}
        <div className="flex w-40 flex-shrink-0 flex-col border-r border-slate-200  z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] relative">
          <div className={cn("flex flex-shrink-0 items-center border-b border-slate-200 bg-slate-50 px-4", HEADER_HEIGHT_CLASS)}>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Date
            </span>
          </div>

          <div ref={userListRef} className="overflow-y-auto scrollbar-hide">
              {rowDays.map((day) => (
                <div 
                    key={day.date} 
                    className={cn(
                        "flex items-center px-4 border-b border-slate-200",  
                        ROW_HEIGHT_CLASS,
                        day.isTarget ? "bg-blue-50/50" : ""
                    )}
                >
                  <div className="flex flex-col">
                    <span className={cn("text-sm font-medium", day.isToday ? "text-theme" : "text-slate-700")}>
                        {day.displayDate}
                    </span>
                    {day.isToday && <span className="text-[10px] text-theme font-medium">Today</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right Content (Timeline Grid) */}
        <div className="flex-1 overflow-auto bg-slate-50/50 z-0" ref={contentRef}>
          
          <div 
            className={cn("sticky top-0 z-30 flex border-b border-slate-200 bg-white shadow-sm", HEADER_HEIGHT_CLASS)}
            style={{ width: `${timeSlots.length * SLOT_WIDTH}rem` }}
          >
            {timeSlots.map((slot: any, index) => (
              <div key={index} 
                className="flex-shrink-0 flex items-center justify-center border-r border-slate-200 text-xs font-medium text-slate-500"
                style={{ width: `${SLOT_WIDTH}rem` }}>
                {slot.label}
              </div>
            ))}
          </div>

          <div className="relative" style={{ width: `${timeSlots.length * SLOT_WIDTH}rem` }}>
            <div className="absolute inset-0 flex pointer-events-none z-0">
                {timeSlots.map((_, i) => (
                  <div key={i} className="h-full border-r border-slate-200 border-dashed" style={{ width: `${SLOT_WIDTH}rem` }} />
                ))}
            </div>

            <div className="relative z-0">
              {rowDays.map((day) => {
                const daySchedules = schedules.filter(s => moment(s.date).format('YYYY-MM-DD') === day.date);
                
                return (
                  <DroppableRow 
                    key={day.date}
                    dateKey={day.date} // This acts as the resourceId for the row
                    schedules={daySchedules}
                    slotWidth={SLOT_WIDTH}
                    onScheduleUpdate={onScheduleUpdate}
                    onScheduleClick={onScheduleClick}
                    getSchedulePosition={getSchedulePosition}
                    isTarget={day.isTarget}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: Droppable Row ---
const DroppableRow = ({ 
  dateKey, 
  schedules, 
  slotWidth, 
  onScheduleUpdate, 
  onScheduleClick,
  getSchedulePosition,
  isTarget
}: any) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const canDrop = true;

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    // Only allow drop if it's the same date (Preventing Date change via drag for now unless backend supports it)
    canDrop: (item: DragItem) => item.resourceId === dateKey, 
    drop: (item: DragItem, monitor) => {
      const offset = monitor.getClientOffset();
      const rowRect = rowRef.current?.getBoundingClientRect();
      
      if (rowRect && offset) {
        const xPos = offset.x - rowRect.left; 
        const PIXELS_PER_REM = 16;
        const pixelsPerHour = (slotWidth * PIXELS_PER_REM);
        
        const delta = monitor.getDifferenceFromInitialOffset();
        if(!delta) return;

        const minutesDelta = (delta.x / pixelsPerHour) * 60;
        const [startH, startM] = item.originalStartTime.split(':').map(Number);
        const originalStartMins = startH * 60 + startM;
        
        let newStartMins = originalStartMins + minutesDelta;
        let newEndMins = newStartMins + item.durationMinutes;

        if(newStartMins < 0) { newStartMins = 0; newEndMins = item.durationMinutes; }
        if(newEndMins > 1440) { newEndMins = 1440; newStartMins = 1440 - item.durationMinutes; }

        const newStartStr = minutesToTime(newStartMins);
        const newEndStr = minutesToTime(newEndMins);

        onScheduleUpdate(item.id, newStartStr, newEndStr, dateKey);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  drop(rowRef);

  return (
    <div 
      ref={rowRef}
      className={cn(
        "relative border-b border-slate-200 transition-colors",
        ROW_HEIGHT_CLASS,
        isTarget ? "bg-blue-50/20" : "",
        (isOver && canDrop) && "bg-blue-50/80 ring-2 ring-inset ring-blue-200"
      )}
    >
      {schedules.map((schedule: any) => {
        const posStyle = getSchedulePosition(schedule);
        if (posStyle.display === 'none') return null;

        return (
          <DraggableScheduleBlock
            key={schedule._id}
            schedule={schedule}
            position={posStyle}
            onClick={onScheduleClick}
            canDrag={canDrop}
            resourceId={dateKey} // Passing Date as resourceId
          />
        );
      })}
    </div>
  );
}

// --- SUB-COMPONENT: Draggable Schedule Block ---
const DraggableScheduleBlock = ({ schedule, position, onClick, canDrag, resourceId }: any) => {
  const startTime = moment(schedule.startTime, 'HH:mm');
  const endTime = moment(schedule.endTime, 'HH:mm');
  const duration = moment.duration(endTime.diff(startTime));
  const durationString = `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
  const formattedDate = moment(schedule.date).format('DD-MM-yyyy');
  
  const employeeName = schedule.employee ? `${schedule.employee.firstName} ${schedule.employee.lastName}` : 'Unallocated';
  const clientName = schedule.serviceUser ? `${schedule.serviceUser.firstName} ${schedule.serviceUser.lastName}` : 'Unknown Client';
  const title = employeeName; // Since we are on Client Page, showing Employee name on block is more useful
  const isAllocated = !!schedule.employee;

  let statusStyle = 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 shadow-sm';
  if (schedule.cancellation) statusStyle = 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200';
  else if (schedule.employee) statusStyle = 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200 shadow-sm';

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { 
      id: schedule._id, 
      originalStartTime: schedule.startTime,
      originalEndTime: schedule.endTime,
      durationMinutes: duration.asMinutes(),
      type: ITEM_TYPE,
      resourceId: resourceId 
    },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [schedule._id, schedule.startTime, schedule.endTime, canDrag, resourceId]);

  if (isDragging) {
    return <div ref={drag} style={position} className="absolute top-3 h-10 opacity-50 bg-gray-300 rounded-md border-dashed border-2 border-gray-400" />;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          ref={drag}
          className={cn(
            "absolute top-3 h-10 rounded-md border-l-4 text-xs font-medium transition-all hover:scale-[1.02] hover:shadow-md z-10 hover:z-20",
            statusStyle,
            canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
          )}
          style={position}
        >
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div 
                  className="w-full h-full px-2 py-1 flex flex-col justify-center overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onClick(schedule);
                  }}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="truncate font-bold">{title}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 w-full">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate text-[10px]">{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                </div>
              </TooltipTrigger>
              
              <TooltipPrimitive.Portal>
                <TooltipContent 
                  side="top" 
                  align="center" 
                  className="z-[99999] w-80 p-0 border-slate-200 shadow-xl rounded-xl overflow-hidden "
                  avoidCollisions={true} 
                  sideOffset={8}
                >
                  <div className="flex flex-col">
                    <div className={cn("px-4 py-3 flex items-start justify-between border-b border-slate-100", 
                      isAllocated ? "bg-emerald-50/50" : "bg-amber-50/50"
                    )}>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {schedule.serviceType || 'General Visit'}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            <span>{formattedDate}</span>
                        </div>

                        <span className="text-xs text-slate-500 font-medium">
                          {durationString} ({schedule.startTime} - {schedule.endTime})
                        </span>
                      </div>
                      <Badge variant={isAllocated ? "default" : "secondary"} className={cn(
                        "mt-1",
                        isAllocated ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-amber-400 hover:bg-amber-500 text-amber-900"
                      )}>
                        {isAllocated ? 'Allocated' : 'Unallocated'}
                      </Badge>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Service User</p>
                          <p className="text-sm font-medium text-slate-900">{clientName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", 
                          isAllocated ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-400"
                        )}>
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Assigned Staff</p>
                          <p className={cn("text-sm font-medium", isAllocated ? "text-slate-900" : "text-slate-400 italic")}>
                            {employeeName}
                          </p>
                        </div>
                      </div>

                      <div className="h-px w-full bg-slate-100"></div>

                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Location Details</p>
                          <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-900">
                               {schedule.branch || 'No Branch'}
                             </span>
                             <span className="text-xs text-slate-500">
                               {schedule.area || 'No Area'}
                             </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </TooltipContent>
              </TooltipPrimitive.Portal>
            </Tooltip>
          </TooltipProvider>
        </div>
      </ContextMenuTrigger>
    </ContextMenu>
  );
};