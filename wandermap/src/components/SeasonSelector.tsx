import React from 'react';

export interface SeasonSelection {
  months: number[]; // 0-11
}

interface Props {
  value: SeasonSelection;
  onChange: (v: SeasonSelection) => void;
}

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SeasonSelector: React.FC<Props> = ({ value, onChange }) => {
  const toggleMonth = (m: number) => {
    const set = new Set(value.months);
    if (set.has(m)) set.delete(m); else set.add(m);
    const months = Array.from(set).sort((a,b)=>a-b);
    onChange({ months });
  };

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {monthNames.map((name, i) => (
        <button
          key={i}
          onClick={() => toggleMonth(i)}
          className={`px-2 py-1 text-xs rounded border ${value.months.includes(i) ? 'bg-green-600 text-white border-green-700' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
          title={`Toggle ${name}`}
        >
          {name}
        </button>
      ))}
      {value.months.length === 0 && (
        <span className="ml-2 text-xs text-gray-500">Select months</span>
      )}
    </div>
  );
};

export default SeasonSelector;
