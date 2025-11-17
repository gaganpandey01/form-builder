// components/DatePurposeSelector.tsx
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import datePurposesData from '../utils/purpose.json';

interface DatePurposeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (purpose: string, category: string, time: string) => void; // Added time parameter
  selectedPurpose?: string;
}

export const DatePurposeSelector: React.FC<DatePurposeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedPurpose,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleSelect = (purpose: string, category: string, time: string) => {
    onSelect(purpose, category, time); // Pass time parameter
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[998] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal/Bottom Sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-t-2xl md:rounded-xl max-h-[80vh] md:max-h-[600px] md:w-[90%] md:max-w-[500px] lg:max-w-[600px] flex flex-col z-[999] animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="date-purpose-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 md:px-6 md:py-5 border-b border-gray-200 flex-shrink-0">
          <h2
            id="date-purpose-title"
            className="text-lg md:text-xl font-semibold text-gray-900 m-0"
          >
            Select Date Purpose
          </h2>
          <button
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={onClose}
            aria-label="Close date purpose selector"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 py-3 md:py-4">
          {datePurposesData.datePurposes.map((categoryGroup) => (
            <div
              key={categoryGroup.category}
              className="border-b border-gray-100 last:border-b-0"
            >
              {/* Category Header */}
              <button
                className="w-full flex justify-between items-center px-5 py-4 md:px-6 md:py-3.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                onClick={() => toggleCategory(categoryGroup.category)}
                aria-expanded={expandedCategories.has(categoryGroup.category)}
              >
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-gray-700">
                    {categoryGroup.category}
                  </span>
                  {/* Display time constraint */}
                  <span className="text-xs text-gray-500 mt-1 capitalize">
                    Time: {categoryGroup.time}
                  </span>
                </div>
                {expandedCategories.has(categoryGroup.category) ? (
                  <ChevronUp size={20} className="text-gray-600" />
                ) : (
                  <ChevronDown size={20} className="text-gray-600" />
                )}
              </button>

              {/* Category Purposes */}
              {expandedCategories.has(categoryGroup.category) && (
                <div className="bg-white">
                  {categoryGroup.purposes.map((purposeObj, index) => (
                    <button
                      key={`${categoryGroup.category}-${purposeObj.label}-${index}`}
                      className={`w-full px-5 py-3.5 md:py-3 pl-10 md:pl-12 text-left text-[15px] min-h-[44px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        selectedPurpose === purposeObj.label
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                      onClick={() =>
                        handleSelect(
                          purposeObj.label,
                          categoryGroup.category,
                          categoryGroup.time // Pass time parameter
                        )
                      }
                    >
                      {purposeObj.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
