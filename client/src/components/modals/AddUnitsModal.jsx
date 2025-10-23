import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';


const AddUnitsModal = ({ propertyId, onClose, onUnitsAdded }) => {
  const [units, setUnits] = useState([{
    unitNumber: '',
    floor: 0,
    bedrooms: 1,
    bathrooms: 1,
    area: 1,        // Changed from 0 to 1 (min: 0.01 in schema)
    rent: 1,        // Changed from 0 to 1 (required field)
    deposit: 0,
    furnished: false,
    features: []
  }]);
  const [loading, setLoading] = useState(false);

  const addUnitRow = () => {
    setUnits([...units, {
      unitNumber: '',
      floor: 0,
      bedrooms: 1,
      bathrooms: 1,
      area: 1,      // Changed from 0 to 1
      rent: 1,      // Changed from 0 to 1
      deposit: 0,
      furnished: false,
      features: []
    }]);
  };

  const removeUnitRow = (index) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const updateUnit = (index, field, value) => {
    const newUnits = [...units];
    
    // Handle empty values for numeric fields
    if (['floor', 'bedrooms', 'bathrooms', 'area', 'rent', 'deposit'].includes(field)) {
      newUnits[index][field] = value === '' ? 0 : Number(value);
    } else {
      newUnits[index][field] = value;
    }
    
    setUnits(newUnits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields before submitting
    const invalidUnits = units.filter(unit => 
      !unit.unitNumber.trim() || 
      unit.area < 0.01 || 
      unit.rent < 1
    );

    if (invalidUnits.length > 0) {
      alert('Please fill all required fields with valid values:\n\n- Unit Number (required)\n- Area (must be greater than 0)\n- Rent (must be at least 1)');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data with proper number conversion
      const unitsToSend = units.map(unit => ({
        ...unit,
        floor: Number(unit.floor) || 0,
        bedrooms: Number(unit.bedrooms) || 1,
        bathrooms: Number(unit.bathrooms) || 1,
        area: Number(unit.area) || 1,
        rent: Number(unit.rent) || 1,
        deposit: Number(unit.deposit) || 0,
      }));

      const response = await fetch(`http://localhost:5000/api/properties/${propertyId}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ units: unitsToSend })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add units');
      }

      const result = await response.json();
      alert(`${result.data.addedUnits} units added successfully!`);
      onUnitsAdded();
      onClose();
    } catch (error) {
      console.error('Error adding units:', error);
      alert(error.message || 'Failed to add units');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Add Units to Property</h2>
          <p className="text-gray-600 mt-1">Define individual units for this property</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {units.map((unit, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Unit #{index + 1}</h3>
                  {units.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUnitRow(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={unit.unitNumber}
                      onChange={(e) => updateUnit(index, 'unitNumber', e.target.value)}
                      placeholder="e.g., 2F, A101"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor
                    </label>
                    <input
                      type="number"
                      value={unit.floor || ''}
                      onChange={(e) => updateUnit(index, 'floor', e.target.value)}
                      placeholder="Floor number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={unit.bedrooms}
                      onChange={(e) => updateUnit(index, 'bedrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={unit.bathrooms}
                      onChange={(e) => updateUnit(index, 'bathrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (sq ft) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={unit.area}
                      onChange={(e) => updateUnit(index, 'area', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rent *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={unit.rent}
                      onChange={(e) => updateUnit(index, 'rent', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={unit.deposit}
                      onChange={(e) => updateUnit(index, 'deposit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={unit.furnished}
                        onChange={(e) => updateUnit(index, 'furnished', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Furnished</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addUnitRow}
            className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <TrashIcon className="w-5 h-5" />
            <span>Add Another Unit</span>
          </button>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : `Add ${units.length} Unit${units.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnitsModal;