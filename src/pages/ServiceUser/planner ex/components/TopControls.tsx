import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, MoveLeft, Plus } from 'lucide-react';
import Select, { StylesConfig } from 'react-select';
import { useNavigate } from 'react-router-dom';

interface TopControlsProps {
  zoomLevel: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  onScheduleClick: () => void;
  status: string;
  setStatus: (value: string) => void;
  userData: any;
}

// --- Option Type ---
interface OptionType {
  value: string;
  label: string;
}

// --- React Select Custom Styles ---
const customSelectStyles: StylesConfig<OptionType, false> = {
  control: (provided) => ({
    ...provided,
    minHeight: '36px',
    height: '36px',
    fontSize: '12px',
    borderColor: '#e5e7eb', // tailwind gray-200
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#d1d5db' // tailwind gray-300
    },
    minWidth: '130px'
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '36px',
    padding: '0 8px'
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px'
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '36px'
  }),
  menu: (provided) => ({
    ...provided,
    fontSize: '12px',
    zIndex: 9999
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#0f172a'
      : state.isFocused
        ? '#f1f5f9'
        : 'white',
    color: state.isSelected ? 'white' : '#334155',
    cursor: 'pointer'
  }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 })
};

export function TopControls({
  zoomLevel,
  handleZoomIn,
  handleZoomOut,
  status,
  setStatus,
  onScheduleClick,
  userData
}: TopControlsProps) {
  const statusOptions: OptionType[] = [
    { value: 'all', label: 'All' },
    { value: 'allocated', label: 'Allocated' },
    { value: 'unallocated', label: 'Unallocated' }
  ];

  const navigate = useNavigate()

  // --- Helpers ---
  const getValueObj = (options: OptionType[], value: string) =>
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative z-40 w-full bg-white py-2 shadow-sm">
      <div className="flex w-full flex-wrap items-end justify-between gap-x-4 gap-y-3 ">
        {/* Left Side: Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="p-2">
            <h1 className="text-2xl font-semibold">
              {userData
                ? `${userData.firstName} ${userData.lastName}'s Planner`
                : 'Planner'}
            </h1>
          </div>
          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Status
            </span>
            <Select
              value={getValueObj(statusOptions, status)}
              onChange={(opt) => setStatus(opt?.value || 'all')}
              options={statusOptions}
              styles={customSelectStyles}
              isSearchable={false}
              menuPortalTarget={
                typeof document !== 'undefined' ? document.body : null
              }
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Zoom
            </span>
            <div className="flex h-[36px] flex-row items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="h-6 w-6 p-0 hover:bg-white hover:shadow-sm"
              >
                <Minus className="h-3 w-3 text-gray-600" />
              </Button>
              <div className="relative mx-1 h-1.5 w-16 rounded bg-gray-200">
                <div
                  className="h-1.5 rounded bg-teal-600 transition-all duration-200"
                  style={{ width: `${((zoomLevel - 2) / 6) * 100}%` }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="h-6 w-6 p-0 hover:bg-white hover:shadow-sm"
              >
                <Plus className="h-3 w-3 text-gray-600" />
              </Button>
              <span className="w-6 text-center text-[10px] font-medium text-gray-500">
                {zoomLevel}x
              </span>
            </div>
          </div>

          {/* Add Button */}
          <div>
            <div className="h-[21px]" />
            <Button
              variant="default"
              className="flex h-[36px] items-center gap-1 bg-watney px-6 text-xs font-medium text-white shadow-sm hover:bg-watney/90"
              onClick={() => onScheduleClick()}
            >
              Add Schedule
            </Button>
          </div>

        </div>
          <Button
            onClick={() => navigate(-1)} // Better than window.history.back()
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
      </div>
    </div>
  );
}
