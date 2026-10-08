import React from 'react';
import { EditableField } from '../components/EditableField';
import { countries } from '@/types';

interface Expense {
  expenseType: string;
  distance: string;
  payEmployee: boolean;
  invoiceCustomer: boolean;
  payAmount: number | null;
  invoiceAmount: number | null;
  notes: string;
}

// 1. Define Validation Interface
interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

interface ExpenseTabProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
  // 2. Add validateTab to props
  validateTab: (tabId: string) => ValidationResult;
}

const ExpenseTab: React.FC<ExpenseTabProps> = ({
  formData,
  onUpdate,
  isFieldSaving,
  validateTab // 3. Destructure here
}) => {
  const expenses: Expense[] = formData.expenses || [];

  // 4. Get current validation errors for the 'expense' tab
  const validationResult = validateTab('expense');
  const missingFields = validationResult.missingFields;

  // 5. Helper to check if a specific field at a specific index is missing
  const isFieldMissing = (index: number, fieldName: string) => {
    return missingFields.includes(`${fieldName}[${index}]`);
  };

  // Define options
  const booleanOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  const expenseTypeOptions = [
    { value: 'Mileage', label: 'Mileage' },
    { value: 'Lodging', label: 'Lodging' },
    { value: 'Meals', label: 'Meals' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Other', label: 'Other' }
  ];

  const updateExpenseField = <K extends keyof Expense>(
    index: number,
    field: K,
    value: Expense[K]
  ) => {
    const updated = [...expenses];
    updated[index][field] = value;
    onUpdate('expenses', updated);
  };

  const addNewExpense = () => {
    const updated = [
      ...expenses,
      {
        expenseType: '',
        distance: '',
        payEmployee: false,
        invoiceCustomer: false,
        payAmount: null,
        invoiceAmount: null,
        notes: ''
      }
    ];
    onUpdate('expenses', updated);
  };

  const removeExpense = (index: number) => {
    const updated = [...expenses];
    updated.splice(index, 1);
    onUpdate('expenses', updated);
  };

  return (
    <div className="space-y-3">
      {expenses.map((expense, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Expense #{index + 1}
            </h3>
            <button
              onClick={() => removeExpense(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <EditableField
              id={`expenseType-${index}`}
              label="Expense"
              value={expense.expenseType}
              type="select"
              options={expenseTypeOptions}
              onUpdate={(val) => updateExpenseField(index, 'expenseType', val)}
              isSaving={isFieldSaving[`expenseType-${index}`]}
              required
              // 6. Pass validation status
              isMissing={isFieldMissing(index, 'expenseType')}
            />

            <EditableField
              id={`distance-${index}`}
              label="Distance"
              value={expense.distance}
              type="number"
              onUpdate={(val) => updateExpenseField(index, 'distance', val)}
              isSaving={isFieldSaving[`distance-${index}`]}
              // Optional: Add required here if needed
              // required
              // isMissing={isFieldMissing(index, 'distance')}
            />

            <EditableField
              id={`payEmployee-${index}`}
              label="Pay Employee"
              value={expense.payEmployee}
              type="select"
              options={booleanOptions}
              onUpdate={(val) => updateExpenseField(index, 'payEmployee', val)}
              isSaving={isFieldSaving[`payEmployee-${index}`]}
            />

            <EditableField
              id={`invoiceCustomer-${index}`}
              label="Invoice Customer"
              value={expense.invoiceCustomer}
              type="select"
              options={booleanOptions}
              onUpdate={(val) =>
                updateExpenseField(index, 'invoiceCustomer', val)
              }
              isSaving={isFieldSaving[`invoiceCustomer-${index}`]}
            />

            <EditableField
              id={`payAmount-${index}`}
              label="Pay Amount"
              value={expense.payAmount}
              type="number"
              onUpdate={(val) =>
                updateExpenseField(index, 'payAmount', Number(val) || null)
              }
              isSaving={isFieldSaving[`payAmount-${index}`]}
              required
              // 6. Pass validation status
              isMissing={isFieldMissing(index, 'payAmount')}
            />

            <EditableField
              id={`invoiceAmount-${index}`}
              label="Invoice Amount"
              value={expense.invoiceAmount}
              type="number"
              onUpdate={(val) =>
                updateExpenseField(index, 'invoiceAmount', Number(val) || null)
              }
              isSaving={isFieldSaving[`invoiceAmount-${index}`]}
              // Optional: Add isMissing if Invoice Amount becomes required
            />

            <div className="md:col-span-2">
              <EditableField
                id={`notes-${index}`}
                label="Notes"
                value={expense.notes}
                type="textarea"
                onUpdate={(val) => updateExpenseField(index, 'notes', val)}
                isSaving={isFieldSaving[`notes-${index}`]}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={addNewExpense}
          className="hover:bg-watney/90 rounded bg-watney px-4 py-1 text-white"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default ExpenseTab;