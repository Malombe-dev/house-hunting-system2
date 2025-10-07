// Check if user owns the resource
exports.checkOwnership = (model) => {
    return async (req, res, next) => {
      try {
        const resourceId = req.params.id;
        const Resource = require(`../models/${model}`);
        
        const resource = await Resource.findById(resourceId);
        
        if (!resource) {
          return res.status(404).json({
            status: 'error',
            message: `${model} not found`
          });
        }
  
        // Admin can access anything
        if (req.user.role === 'admin') {
          return next();
        }
  
        // Check ownership based on model
        let isOwner = false;
        
        if (model === 'Property') {
          isOwner = resource.agent.toString() === req.user._id.toString();
        } else if (model === 'Tenant') {
          isOwner = resource.user.toString() === req.user._id.toString() || 
                    resource.agent.toString() === req.user._id.toString();
        } else if (model === 'Payment' || model === 'Maintenance') {
          isOwner = resource.tenant.toString() === req.user._id.toString() || 
                    resource.agent.toString() === req.user._id.toString();
        }
  
        if (!isOwner) {
          return res.status(403).json({
            status: 'error',
            message: 'Not authorized to access this resource'
          });
        }
  
        req.resource = resource;
        next();
      } catch (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Server error',
          error: error.message
        });
      }
    };
  };
  
  // Check if user is agent/landlord managing property
  exports.isPropertyManager = async (req, res, next) => {
    try {
      const propertyId = req.params.propertyId || req.body.property;
      const Property = require('../models/Property');
      
      const property = await Property.findById(propertyId);
      
      if (!property) {
        return res.status(404).json({
          status: 'error',
          message: 'Property not found'
        });
      }
  
      // Admin can manage any property
      if (req.user.role === 'admin') {
        req.property = property;
        return next();
      }
  
      // Check if user is the property agent
      if (property.agent.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to manage this property'
        });
      }
  
      req.property = property;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Server error',
        error: error.message
      });
    }
  };
  
  // Check if user is tenant of property
  exports.isTenantOfProperty = async (req, res, next) => {
    try {
      const propertyId = req.params.propertyId || req.body.property;
      const Tenant = require('../models/Tenant');
      
      const tenant = await Tenant.findOne({
        user: req.user._id,
        property: propertyId,
        status: 'active'
      });
      
      if (!tenant) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a tenant of this property'
        });
      }
  
      req.tenant = tenant;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Server error',
        error: error.message
      });
    }
  };