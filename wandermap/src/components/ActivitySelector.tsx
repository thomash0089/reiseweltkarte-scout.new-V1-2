import React from 'react';

export type ActivityType = 'beach' | 'hike' | 'city';

interface Props {
  value: ActivityType;
  onChange: (v: ActivityType) => void;
}

const ActivitySelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      {([
        { id: 'beach', label: 'Strand & Baden 🏖️' },
        { id: 'hike', label: 'Wandern ⛰️' },
        { id: 'city', label: 'Städte 🏙️' },
      ] as {id: any, label: string}[]).map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-2 py-1 text-xs rounded border ${value===opt.id ? 'bg-blue-600 text-white border-blue-700' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ActivitySelector;
