// // File: client/src/pages/employee/EmployeePropertyView.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import { 
//   ArrowLeftIcon,
//   HomeIcon,
//   MapPinIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon,
//   ExclamationTriangleIcon
// } from '@heroicons/react/24/outline';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const EmployeePropertyView = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [property, setProperty] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     const fetchProperty = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (!response.ok) {
//           if (response.status === 404) {
//             throw new Error('Property not found');
//           }
//           if (response.status === 403) {
//             throw new Error('You do not have permission to view this property');
//           }
//           throw new Error('Failed to fetch property');
//         }

//         const data = await response.json();
        
//         if (data.status === 'success') {
//           setProperty(data.data.property);
//         } else {
//           throw new Error(data.message || 'Failed to load property');
//         }
//       } catch (error) {
//         console.error('Error fetching property:', error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchProperty();
//     }
//   }, [id]);

//   const formatPrice = (price) => {
//     if (!price) return 'N/A';
//     return new Intl.NumberFormat('en-KE', {
//       style: 'currency',
//       currency: 'KES',
//       minimumFractionDigits: 0
//     }).format(price);
//   };

//   const formatFeature = (feature) => {
//     return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       pending: {
//         color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//         icon: ClockIcon,
//         text: 'Pending Approval'
//       },
//       approved: {
//         color: 'bg-green-100 text-green-800 border-green-200',
//         icon: CheckCircleIcon,
//         text: 'Approved'
//       },
//       rejected: {
//         color: 'bg-red-100 text-red-800 border-red-200',
//         icon: XCircleIcon,
//         text: 'Rejected'
//       }
//     };
//     return badges[status] || badges.pending;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="large" text="Loading property..." />
//       </div>
//     );
//   }

//   if (error || !property) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto p-6">
//           <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
//             <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
//             <p className="text-red-700">{error || "Unable to load property."}</p>
//           </div>
//           <button
//             onClick={() => navigate('/employee/properties')}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Back to Properties
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusBadge = getStatusBadge(property.approvalStatus);
//   const StatusIcon = statusBadge.icon;
//   const displayImages = property.images && property.images.length > 0 
//     ? property.images 
//     : ['/api/placeholder/800/600'];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <button
//             onClick={() => navigate('/employee/properties')}
//             className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
//           >
//             <ArrowLeftIcon className="h-4 w-4 mr-2" />
//             Back to My Properties
//           </button>

//           <div className="flex items-start justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
//               <div className="flex items-center gap-2 mt-2">
//                 <MapPinIcon className="h-5 w-5 text-gray-400" />
//                 <span className="text-gray-600">{property.location?.address || 'N/A'}</span>
//               </div>
//             </div>

//             <div className={`px-4 py-2 rounded-lg border-2 ${statusBadge.color} flex items-center gap-2`}>
//               <StatusIcon className="h-5 w-5" />
//               <span className="font-semibold">{statusBadge.text}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Notice Banners */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
//         {/* Read-only Notice */}
//         <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//           <div className="flex items-start space-x-3">
//             <ExclamationTriangleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
//             <div>
//               <h3 className="text-sm font-semibold text-blue-900">View Only Mode</h3>
//               <p className="text-blue-700 text-sm mt-1">
//                 You can view property details but cannot edit. Contact an agent if changes are needed.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Rejection Notice */}
//         {property.approvalStatus === 'rejected' && property.rejectionReason && (
//           <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//             <div className="flex items-start space-x-3">
//               <XCircleIcon className="h-6 w-6 text-red-600 mt-0.5" />
//               <div>
//                 <h3 className="text-sm font-semibold text-red-900">Property Rejected</h3>
//                 <p className="text-red-700 text-sm mt-1">
//                   <strong>Reason:</strong> {property.rejectionReason}
//                 </p>
//                 <p className="text-red-600 text-xs mt-2">
//                   Please contact an agent to discuss revisions.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Pending Notice */}
//         {property.approvalStatus === 'pending' && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
//             <div className="flex items-start space-x-3">
//               <ClockIcon className="h-6 w-6 text-yellow-600 mt-0.5" />
//               <div>
//                 <h3 className="text-sm font-semibold text-yellow-900">Awaiting Approval</h3>
//                 <p className="text-yellow-700 text-sm mt-1">
//                   This property is pending review by an agent. You'll be notified once it's approved.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Images */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//               <div className="relative h-96">
//                 <img
//                   src={displayImages[currentImageIndex]}
//                   alt={property.title}
//                   className="w-full h-full object-cover"
//                   onError={(e) => {