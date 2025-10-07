import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const SortOptions = ({ currentSort, currentOrder, onSortChange }) => {
  const sortOptions = [
    { value: 'createdAt', label: 'Newest First', order: 'desc' },
    { value: 'createdAt', label: 'Oldest First', order: 'asc' },
    { value: 'rent', label: 'Price: Low to High', order: 'asc' },
    { value: 'rent', label: 'Price: High to Low', order: 'desc' },
    { value: 'bedrooms', label: 'Most Bedrooms', order: 'desc' },
    { value: 'bedrooms', label: 'Least Bedrooms', order: 'asc' },
    { value: 'area', label: 'Largest First', order: 'desc' },
    { value: 'area', label: 'Smallest First', order: 'asc' }
  ];

  const getCurrentLabel = () => {
    const current = sortOptions.find(
      option => option.value === currentSort && option.order === currentOrder
    );
    return current ? current.label : 'Sort by';
  };

  const handleSortChange = (sortBy, sortOrder) => {
    onSortChange(sortBy, sortOrder);
  };

  return (
    <div className="relative group">
      <select
        value={`${currentSort}-${currentOrder}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split('-');
          handleSortChange(sortBy, sortOrder);
        }}
        className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer min-w-[180px]"
      >
        {sortOptions.map((option, index) => (
          <option 
            key={index} 
            value={`${option.value}-${option.order}`}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

export default SortOptions;