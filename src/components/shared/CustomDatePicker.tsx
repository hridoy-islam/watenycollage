

import { format, getMonth, getYear } from "date-fns"; 
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
}

export function CustomDatePicker({ selected, onChange }: CustomDatePickerProps) {
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  return (
    <div className="relative w-full z-[1000]">
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        popperClassName="z-[1001]"
        portalId="root-portal"
        className="w-full" 
        wrapperClassName="w-full block"
        customInput={
          <input
            type="text"
            readOnly
            value={selected ? format(selected, "yyyy-MM-dd") : "Select date"}
            className="w-full cursor-pointer border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          />
        }
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled
        }) => (
          <div className="flex justify-center gap-2 m-2">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              {"❮"}
            </button>
            
            <select
              value={getYear(date)}
              onChange={(e) => changeYear(Number(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            
            <select
              value={months[getMonth(date)]}
              onChange={(e) => changeMonth(months.indexOf(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              {"❯"}
            </button>
          </div>
        )}
      />
    </div>
  );
}
