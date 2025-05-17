import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { TabSectionProps } from './types';

const TabSection: React.FC<TabSectionProps> = ({ 
  title, 
  description, 
  userData, 
  children 
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // In a real application, you would save the data to the server here
    setIsEditing(false);
    // Show success notification
    alert('Changes saved successfully!');
  };

  return (
    <section className="animate-fadeIn">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Save size={16} className="mr-1" />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <X size={16} className="mr-1" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Edit2 size={16} className="mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className={`bg-white rounded-lg overflow-hidden transition-all duration-300 ${isEditing ? 'ring-2 ring-indigo-500' : 'border border-gray-200'}`}>
        <div className="px-6 py-5">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement, { 
                isEditing,
                userData 
              });
            }
            return child;
          })}
        </div>
      </div>
    </section>
  );
};

export default TabSection;