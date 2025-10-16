const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ FIXED: Upload image from buffer (not file path)
const uploadImage = async (fileBuffer, originalname, folder = 'properties') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `house-hunting/${folder}`,
          resource_type: 'image',
          public_id: `img_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload stream error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', result.secure_url);
            resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          }
        }
      );

      // Write the buffer to the upload stream
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};

// ✅ FIXED: Upload multiple images from memory buffers
const uploadMultipleImages = async (files, folder = 'properties') => {
  try {
    console.log(`📤 Starting Cloudinary upload for ${files.length} files...`);
    
    const uploadPromises = files.map((file, index) => {
      console.log(`📄 Processing file ${index + 1}: ${file.originalname}`);
      return uploadImage(file.buffer, file.originalname, folder);
    });
    
    const results = await Promise.all(uploadPromises);
    console.log(`✅ Successfully uploaded ${results.length} files to Cloudinary`);
    return results;
  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    throw error;
  }
};

// ✅ FIXED: Alternative method using base64 (backup option)
const uploadImageBase64 = async (fileBuffer, folder = 'properties') => {
  try {
    // Convert buffer to base64
    const base64Image = fileBuffer.toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64Image}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `house-hunting/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('❌ Cloudinary base64 upload error:', error);
    throw error;
  }
};

// Delete image from cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw error;
  }
};

// Delete multiple images
const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(id => deleteImage(id));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('❌ Multiple delete error:', error);
    throw error;
  }
};

// Get image URL with transformations
const getImageUrl = (publicId, transformations = {}) => {
  const { width, height, crop = 'fill', quality = 'auto' } = transformations;
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: 'auto'
  });
};

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    // Try to upload a small test image
    const testBuffer = Buffer.from('test');
    const result = await uploadImage(testBuffer, 'test.jpg', 'test');
    console.log('✅ Cloudinary connection test successful');
    return result;
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadMultipleImages,
  uploadImageBase64, // Alternative method
  deleteImage,
  deleteMultipleImages,
  getImageUrl,
  testCloudinaryConnection
};