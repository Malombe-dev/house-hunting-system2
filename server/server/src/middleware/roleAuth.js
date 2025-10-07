// Check if user owns the resource or is admin
exports.checkOwnership = (Model, resourceParam = 'id', ownerField = 'user') => {
    return async (req, res, next) => {
      try {
        const resourceId = req.params[resourceParam];
        const resource = await Model.findById(resourceId);
  
        if (!resource) {
          return res.status(404).json({
            status: 'error',
            message: 'Resource not found'
          });
        }
  
        // Admin can access everything
        if (req.user.role === 'admin') {
          req.resource = resource;
          return next();
        }
  
        // Check if user owns the resource
        const ownerId = resource[ownerField]?.toString() || resource[ownerField];
        const userId = req.user._id.toString();
  
        if (ownerId !== userId) {
          return res.status(403).json({
            status: 'error',
            message: 'Not authorized to access this resource'
          });
        }
  
        req.resource = resource;
        next();
      } catch (error) {
        next(error);
      }
    };
  };
  
  // Check if user is agent/landlord of property
  exports.checkPropertyOwnership = async (req, res, next) => {
    try {
      const Property = require('../models/Property');
      const propertyId = req.params.id || req.params.propertyId;
      const property = await Property.findById(propertyId);
  
      if (!property) {
        return res.status(404).json({
          status: 'error',
          message: 'Property not found'
        });
      }
  
      // Admin can access everything
      if (req.user.role === 'admin') {
        req.property = property;
        return next();
      }
  
      // Check if user is the agent/landlord of the property
      if (property.agent.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to manage this property'
        });
      }
  
      req.property = property;
      next();
    } catch (error) {
      next(error);
    }
  };
  
  // Check if user is tenant of property
  exports.checkTenantAccess = async (req, res, next) => {
    try {
      const Tenant = require('../models/Tenant');
      const propertyId = req.params.propertyId || req.body.property;
  
      const tenant = await Tenant.findOne({
        property: propertyId,
        user: req.user._id,
        status: 'active'
      });
  
      if (!tenant && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to access this property'
        });
      }
  
      req.tenant = tenant;
      next();
    } catch (error) {
      next(error);
    }
  };