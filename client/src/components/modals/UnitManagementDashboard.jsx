import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon as HeroPlusIcon } from '@heroicons/react/24/outline';

import AddUnitsModal from './AddUnitsModal';
import EditUnitModal from './EditUnitModal';
import CreateTenantForm from '../forms/CreateTenantForm';
import UnitCard from '../cards/UnitCard';


const UnitManagementDashboard = ({ propertyId, property }) => {
  console.log('=== UnitManagementDashboard Debug ===');
  console.log('propertyId:', propertyId);
  console.log('property:', property);
  console.log('property.hasUnits:', property?.hasUnits);
  console.log('property.propertyType:', property?.propertyType);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateTenantForm, setShowCreateTenantForm] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnits();
  }, [propertyId]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/properties/${propertyId}/units`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log('=== fetchUnits response ===');
      console.log('API Response:', data);
      console.log('Units data:', data.data?.units);
      console.log('Stats data:', data.data?.stats);
      if (data.status === 'success') {
        setUnits(data.data.units || []);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setShowEditModal(true);
  };

  const handleOccupy = (unit) => {
    setSelectedUnit(unit);
    setShowCreateTenantForm(true);
  };

  const handleVacate = async (unit) => {
    if (window.confirm(`Are you sure you want to mark unit ${unit.unitNumber} as vacant? This will end the current lease.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/properties/${propertyId}/units/${unit._id}/vacate`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to vacate unit');

        alert('Unit marked as vacant successfully!');
        fetchUnits();
      } catch (error) {
        console.error('Error vacating unit:', error);
        alert('Failed to vacate unit');
      }
    }
  };

  const handleDelete = async (unit) => {
    if (window.confirm(`Are you sure you want to delete unit ${unit.unitNumber}? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/properties/${propertyId}/units/${unit._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to delete unit');

        alert('Unit deleted successfully!');
        fetchUnits();
      } catch (error) {
        console.error('Error deleting unit:', error);
        alert('Failed to delete unit');
      }
    }
  };

  const handleTenantCreated = () => {
    setShowCreateTenantForm(false);
    setSelectedUnit(null);
    fetchUnits();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading units...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics - Only show if we have units */}
      {stats && units.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Units</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalUnits}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Occupied</p>
            <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Occupancy Rate</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.totalUnits > 0 ? ((stats.occupied / stats.totalUnits) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Income</p>
            <p className="text-2xl font-bold text-purple-600">
              KES {(stats.currentMonthlyIncome || 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Units ({units.length})
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <HeroPlusIcon className="w-5 h-5" />
          <span>{units.length === 0 ? 'Add Units' : 'Add More Units'}</span>
        </button>
      </div>

      {/* Units Grid */}
      {units.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">      
          <XMarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Units Added</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first unit</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add First Unit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <UnitCard
              key={unit._id}
              unit={unit}
              onEdit={handleEdit}
              onOccupy={handleOccupy}
              onVacate={handleVacate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddUnitsModal
          propertyId={propertyId}
          onClose={() => setShowAddModal(false)}
          onUnitsAdded={fetchUnits}
        />
      )}

      {showEditModal && selectedUnit && (
        <EditUnitModal
          unit={selectedUnit}
          onClose={() => setShowEditModal(false)}
          onUpdate={fetchUnits}
        />
      )}

      {/* Replace OccupyUnitModal with CreateTenantForm */}
      {showCreateTenantForm && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-4xl my-8">
            <CreateTenantForm
              preSelectedProperty={property}
              preSelectedUnit={selectedUnit}
              onSuccess={handleTenantCreated}
              onCancel={() => {
                setShowCreateTenantForm(false);
                setSelectedUnit(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitManagementDashboard;