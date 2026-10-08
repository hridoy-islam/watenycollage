import { ScheduleForm } from "./components/ScheduleForm";

interface ExtraCallComponentDialogProps {

  isOpen: boolean;
  onClose: () => void;
  onScheduleCreated: (newSchedule: any) => void;
}


export function ExtraCallComponent({
  isOpen,
  onClose,
  onScheduleCreated
}: ExtraCallComponentDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 p-4 bg-white">
          <h2 className="text-lg font-semibold">Create Schedule</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="p-6">
          <ScheduleForm onClose={onClose} onScheduleCreated={onScheduleCreated} />
        </div>
      </div>
    </div>
  )
}
