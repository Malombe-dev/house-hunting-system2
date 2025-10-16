// services/properties.js
export const createProperty = async (formData) => {
    const token = localStorage.getItem('token');
    const data = new FormData();
    
    // Helper to append nested objects
    const appendNested = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const fieldName = prefix ? `${prefix}[${key}]` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
          appendNested(value, fieldName);
        } else if (Array.isArray(value) && value[0] instanceof File) {
          value.forEach(file => data.append(fieldName, file));
        } else if (Array.isArray(value)) {
          data.append(fieldName, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          data.append(fieldName, value);
        }
      });
    };
    
    appendNested(formData);
    
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: data
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create property');
    }
    
    return await response.json();
  };
  
  export const updateProperty = async (id, formData) => {
    // Same as createProperty but with PATCH method
    const token = localStorage.getItem('token');
    const data = new FormData();
    
    // ... same appendNested logic
    
    const response = await fetch(`/api/properties/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: data
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update property');
    }
    
    return await response.json();
  };