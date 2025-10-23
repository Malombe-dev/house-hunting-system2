import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ArrowsPointingOutIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const UnitCard = ({ unit, onEdit, onOccupy, onVacate, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      {/* header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{unit.unitNumber}</h3>
          {unit.floor && <p className="text-sm text-gray-600">Floor {unit.floor}</p>}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(unit.availability)}`}>
          {unit.availability}
        </span>
      </div>

      {/* details grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <HomeIcon className="w-4 h-4 text-gray-500" />
          <span>{unit.bedrooms} BR, {unit.bathrooms} BA</span>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowsPointingOutIcon className="w-4 h-4 text-gray-500" />
          <span>{unit.area} sq ft</span>
        </div>
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
          <span className="font-semibold">{formatCurrency(unit.rent)}/mo</span>
        </div>
        {unit.furnished && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Furnished</span>
        )}
      </div>

      {/* tenant block */}
      {unit.tenant && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          <div className="flex items-center space-x-2 mb-1">
            <UserIcon className="w-4 h-4 text-gray-500" />
            <p className="font-medium">{unit.tenant.firstName} {unit.tenant.lastName}</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <PhoneIcon className="w-3 h-3" />
            <span>{unit.tenant.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
            <CalendarIcon className="w-3 h-3" />
            <span>
              Lease: {new Date(unit.leaseStart).toLocaleDateString()} - {new Date(unit.leaseEnd).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(unit)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"
        >
          <PencilIcon className="w-4 h-4 mr-1" />
          Edit
        </button>

        {unit.availability === 'available' ? (
          <button
            onClick={() => onOccupy(unit)}
            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Occupy
          </button>
        ) : unit.availability === 'occupied' ? (
          <button
            onClick={() => onVacate(unit)}
            className="flex-1 px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Vacate
          </button>
        ) : null}

        <button
          onClick={() => onDelete(unit)}
          className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 flex items-center justify-center"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UnitCard;