import React, { useState } from 'react';

const EditUnitModal = ({ unit, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    unitNumber: unit.unitNumber,
    floor: unit.floor,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    area: unit.area,
    rent: unit.rent,
    deposit: unit.deposit,
    furnished: unit.furnished,
    features: unit.features || []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/properties/${unit.propertyId}/units/${unit._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update unit');

      alert('Unit updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating unit:', error);
      alert('Failed to update unit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Edit Unit {unit.unitNumber}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Number *
              </label>
              <input
                type="text"
                required
                value={formData.unitNumber}
                onChange={(e) => handleChange('unitNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => handleChange('floor', parseInt(e.target.value))}
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
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', parseInt(e.target.value))}
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
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', parseInt(e.target.value))}
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
                min="1"
                value={formData.area}
                onChange={(e) => handleChange('area', parseFloat(e.target.value))}
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
                min="0"
                value={formData.rent}
                onChange={(e) => handleChange('rent', parseFloat(e.target.value))}
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
                value={formData.deposit}
                onChange={(e) => handleChange('deposit', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.furnished}
                  onChange={(e) => handleChange('furnished', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Furnished</span>
              </label>
            </div>
          </div>

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
              {loading ? 'Updating...' : 'Update Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUnitModal;