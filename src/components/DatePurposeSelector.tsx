// components/DatePurposeSelector.tsx
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import datePurposesData from '../utils/purpose.json';

interface DatePurposeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (purpose: string, category: string, timeType: string) => void; // Added timeType parameter
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

  const handleSelect = (purpose: string, category: string, timeType: string) => {
    onSelect(purpose, category, timeType); // Pass timeType to parent
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] animate-in fade-in duration-200"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal/Bottom Sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-t-2xl md:rounded-xl max-h-[80vh] md:max-h-[600px] md:w-[90%] md:max-w-[500px] lg:max-w-[600px] flex flex-col z-[999] animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-300"
        style={{ background: 'var(--bg-primary)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="date-purpose-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 md:px-6 md:py-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2
            id="date-purpose-title"
            className="text-lg md:text-xl font-semibold m-0"
            style={{ color: 'var(--text-primary)' }}
          >
            Select Date Purpose
          </h2>
          <button
            className="p-1 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'var(--icon-secondary)' }}
            onClick={onClose}
            aria-label="Close date purpose selector"
            onMouseOver={e => (e.currentTarget.style.background = 'var(--border-light)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 py-3 md:py-4">
          {/* Iterate through time groups: past, future, mixed */}
          {Object.entries(datePurposesData.datePurposesOrganizedByTime).map(
            ([timeKey, timeGroup]) => (
              <React.Fragment key={timeKey}>
                {/* Iterate through categories within each time group */}
                {timeGroup.categories.map((categoryGroup) => (
                  <div
                    key={`${timeKey}-${categoryGroup.category}`}
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                  >
                    {/* Category Header */}
                    <button
                      className="w-full flex justify-between items-center px-5 py-4 md:px-6 md:py-3.5 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{ background: 'var(--bg-secondary)' }}
                      onClick={() => toggleCategory(categoryGroup.category)}
                      aria-expanded={expandedCategories.has(
                        categoryGroup.category
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {categoryGroup.category}
                        </span>
                      </div>
                      {expandedCategories.has(categoryGroup.category) ? (
                        <ChevronUp size={20} style={{ color: 'var(--icon-secondary)' }} />
                      ) : (
                        <ChevronDown size={20} style={{ color: 'var(--icon-secondary)' }} />
                      )}
                    </button>

                    {/* Category Purposes */}
                    {expandedCategories.has(categoryGroup.category) && (
                      <div style={{ background: 'var(--bg-primary)' }}>
                        {categoryGroup.purposes.map((purposeObj, index) => (
                          <button
                            key={`${categoryGroup.category}-${purposeObj.label}-${index}`}
                            className="w-full px-5 py-3.5 md:py-3 pl-10 md:pl-12 text-left text-[15px] min-h-[44px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={selectedPurpose === purposeObj.label
                              ? { background: 'var(--primary-50)', color: 'var(--primary-600)', fontWeight: 500 }
                              : { color: 'var(--text-secondary)' }}
                            onClick={() =>
                              handleSelect(
                                purposeObj.label,
                                categoryGroup.category,
                                timeKey // Pass the timeKey (past/future/mixed)
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
              </React.Fragment>
            )
          )}
        </div>
      </div>
    </>
  );
};
