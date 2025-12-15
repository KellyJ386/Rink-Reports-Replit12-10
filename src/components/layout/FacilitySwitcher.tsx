import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useFacility } from '../../contexts/FacilityContext';
import { cn } from '../../lib/utils';

export function FacilitySwitcher() {
  const { facilities, currentFacility, setCurrentFacility } = useFacility();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render if only one facility
  if (facilities.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          'bg-wolf-100 text-navy hover:bg-wolf-200',
          isOpen && 'bg-wolf-200'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Switch facility"
      >
        <Building2 className="h-4 w-4 text-wolf-500" />
        <span className="max-w-[150px] truncate">
          {currentFacility?.name || 'Select Facility'}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-wolf-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-wolf-200 py-1 z-50"
          role="listbox"
        >
          <div className="px-3 py-2 border-b border-wolf-100">
            <p className="text-xs font-semibold text-wolf-500 uppercase tracking-wider">
              Switch Facility
            </p>
          </div>
          {facilities.map((facility) => (
            <button
              key={facility.id}
              onClick={() => {
                setCurrentFacility(facility);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-wolf-50 transition-colors',
                currentFacility?.id === facility.id && 'bg-action-50'
              )}
              role="option"
              aria-selected={currentFacility?.id === facility.id}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy truncate">{facility.name}</p>
                <p className="text-xs text-wolf-500 truncate">
                  {facility.city}, {facility.state}
                </p>
              </div>
              {currentFacility?.id === facility.id && (
                <Check className="h-4 w-4 text-action flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
