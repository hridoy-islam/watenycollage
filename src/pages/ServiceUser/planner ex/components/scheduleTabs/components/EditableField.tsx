import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  id: string;
  label: string;
  value: string | number | boolean | string[];
  type?:
    | 'text'
    | 'number'
    | 'date'
    | 'email'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'time';
  options?: { value: string; label: string }[];
  isSaving?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  onUpdate: (value: any) => void;
  maxLength?: number;
  max?: string;
  rows?: number;
  multiple?: boolean;
  isMissing?: boolean;
  compact?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  id,
  label,
  value,
  type = 'text',
  options = [],
  isSaving = false,
  required = false,
  placeholder = '',
  className = '',
  onUpdate,
  maxLength,
  max,
  rows = 2,
  multiple = false,
  isMissing = false,
  compact = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setFieldValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type !== 'time') {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const formatDate = (dateStr: string | number) => {
    if (!dateStr) return '';
    const m = moment(dateStr);
    return m.isValid() ? m.format('DD-MM-YYYY') : dateStr.toString();
  };

const handleTimeChange = (newValue: string) => {
  if (!newValue) {
    setFieldValue('');
    return;
  }

  const digits = newValue.replace(/\D/g, '').slice(0, 4);

  let formatted = '';

  if (digits.length <= 2) {
    formatted = digits;
  } else {
    const h = digits.slice(0, 2);
    const m = digits.slice(2);

    const hhNum = Math.min(23, parseInt(h, 10) || 0);
    const hhStr = hhNum.toString().padStart(2, '0');

    let mmStr = '';
    if (m.length === 1) {
      mmStr = m;
    } else if (m.length === 2) {
      const mmNum = Math.min(59, parseInt(m, 10) || 0);
      mmStr = mmNum.toString().padStart(2, '0');
    }

    formatted = `${hhStr}${mmStr ? ':' + mmStr : ''}`;
  }

  setFieldValue(formatted);

  // keep caret at end
  setTimeout(() => {
    const el = inputRef.current as HTMLInputElement | null;
    if (el && typeof el.setSelectionRange === 'function') {
      const pos = formatted.length;
      el.setSelectionRange(pos, pos);
    }
  }, 0);
};

const handleBlur = () => {
  if (type === 'time') {
    if (fieldValue !== value) {
      onUpdate(fieldValue);
    }
  } else {
    if (fieldValue !== value) {
      onUpdate(fieldValue);
    }
  }
  setIsEditing(false);
};


  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setFieldValue(value);
      setIsEditing(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;

    if (type === 'time') {
      handleTimeChange(newValue);
    } else {
      setFieldValue(newValue);
    }
  };
  const handleSelectChange = (value: string) => {
    setFieldValue(value);
    onUpdate(value);
    setIsEditing(false);
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFieldValue(checked);
    onUpdate(checked);
  };

  const getBorderColor = () => {
    if (isMissing) return 'border-red-500';
    if (isEditing) return 'border-blue-500';
    return 'border-transparent';
  };

  if (type === 'checkbox') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Checkbox
          id={id}
          checked={fieldValue as boolean}
          onCheckedChange={handleCheckboxChange}
          disabled={isSaving}
          className={`h-4 w-4 ${isMissing ? 'border-red-500' : ''}`}
        />
        <Label
          htmlFor={id}
          className={`text-xs ${isSaving ? 'opacity-70' : ''} ${isMissing ? 'text-red-600' : ''}`}
        >
          {label}
          {isSaving && <Loader2 className="ml-1 inline h-3 w-3 animate-spin" />}
          {isMissing && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
      </div>
    );
  }

  if (type === 'select') {
    const isMulti = !!multiple;

    const formattedOptions = options.map((opt) => ({
      label: opt.label,
      value: opt.value
    }));

    const selectValue = isMulti
      ? formattedOptions.filter(
          (opt) => Array.isArray(fieldValue) && fieldValue.includes(opt.value)
        )
      : formattedOptions.find((opt) => opt.value === fieldValue) || null;

    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between">
          <Label
            htmlFor={id}
            className={`text-xs ${isMissing ? 'text-red-600' : ''}`}
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </Label>
          {isSaving && (
            <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
          )}
        </div>

        {isEditing ? (
          <Select
            inputId={id}
            isMulti={isMulti}
            isDisabled={isSaving}
            value={selectValue}
            onChange={(selected) => {
              if (isMulti) {
                const values = (selected as any[]).map((s) => s.value);
                handleSelectChange(values);
              } else {
                handleSelectChange((selected as any)?.value || '');
              }
            }}
            options={formattedOptions}
            placeholder={placeholder || `Select ${label}`}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '48px',
                borderRadius: '0.5rem',
                borderColor: isMissing ? '#ef4444' : '#e2e8f0',
                fontSize: '0.75rem',
                '&:hover': {
                  borderColor: isMissing ? '#ef4444' : '#cbd5e1'
                }
              }),
              option: (base) => ({
                ...base,
                fontSize: '0.75rem',
                padding: '4px 8px'
              }),
              menu: (base) => ({
                ...base,
                fontSize: '0.75rem'
              }),
              singleValue: (base) => ({
                ...base,
                fontSize: '0.75rem'
              }),
              multiValue: (base) => ({
                ...base,
                fontSize: '0.75rem'
              }),
              input: (base) => ({
                ...base,
                fontSize: '0.75rem',
                margin: 0,
                padding: 0
              }),
              valueContainer: (base) => ({
                ...base,
                padding: '2px 12px'
              })
            }}
          />
        ) : (
          <div
            className={`flex min-h-[32px] cursor-pointer items-center rounded-md border ${getBorderColor()} p-1.5 text-xs transition-all hover:border-gray-200 hover:bg-gray-50`}
            onClick={() => setIsEditing(true)}
          >
            <span
              className={`${!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0) ? 'italic text-gray-400' : ''} ${isMissing ? 'text-red-600' : ''}`}
            >
              {Array.isArray(fieldValue)
                ? fieldValue.length === 0
                  ? 'Click to select'
                  : fieldValue
                      .map(
                        (val) =>
                          options.find((opt) => opt.value === val)?.label || val
                      )
                      .join(', ')
                : options.find((opt) => opt.value === fieldValue)?.label ||
                  'Click to select'}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className={`text-xs ${isMissing ? 'text-red-600' : ''}`}
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
        {isSaving && <Loader2 className="h-3 w-3 animate-spin text-gray-500" />}
      </div>

      {isEditing ? (
        type === 'textarea' ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            id={id}
            value={fieldValue as string}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSaving}
            required={required}
            maxLength={maxLength}
            rows={rows}
            className={`w-full text-xs ${isMissing ? 'border-red-500' : 'border-gray-300'}`}
          />
        ) : type === 'date' ? (
          <DatePicker
            selected={fieldValue ? new Date(fieldValue as string) : null}
            onChange={(date: Date | null) => {
              const iso = date ? date.toISOString().split('T')[0] : '';
              setFieldValue(iso);
              onUpdate(iso);
              setIsEditing(false);
            }}
            onBlur={handleBlur}
            placeholderText={placeholder || 'Select date'}
            disabled={isSaving}
            className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
            dateFormat="MM-dd-yyyy"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            id={id}
            type="text" // Always text for time — we handle formatting
            value={fieldValue as string}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={type === 'time' ? 'HH:mm' : placeholder}
            disabled={isSaving}
            required={required}
            maxLength={type === 'time' ? 5 : maxLength}
            className={`w-full text-xs ${isMissing ? 'border-red-500' : ''}`}
          />
        )
      ) : (
        <div
          className={`flex min-h-[32px] cursor-pointer items-center rounded-md border ${getBorderColor()} p-1.5 text-xs transition-all hover:border-gray-200 hover:bg-gray-50`}
          onClick={() => setIsEditing(true)}
        >
          {type === 'checkbox' ? (
            <span>{(fieldValue as boolean) ? 'Yes' : 'No'}</span>
          ) : (
            <span
              className={`${!fieldValue ? 'italic text-gray-400' : ''} ${isMissing ? 'text-red-600' : ''}`}
            >
              {type === 'date'
                ? fieldValue
                  ? formatDate(fieldValue)
                  : 'Click to select'
                : type === 'time'
                  ? fieldValue || 'Click to edit'
                  : fieldValue || 'Click to edit'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
