// migrations/addUnitsToProperties.js
// Run this script to add units support to existing properties

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const migrationScript = async () => {
  try {
    console.log('🚀 Starting migration: Add units support to properties...\n');

    const db = mongoose.connection.getClient().db();

    const propertiesCollection = db.collection('properties');

    // Step 1: Add hasUnits and units fields to all properties
    console.log('📝 Step 1: Adding hasUnits and units fields...');
    
    const result1 = await propertiesCollection.updateMany(
      { hasUnits: { $exists: false } },
      {
        $set: {
          hasUnits: false,
          units: []
        }
      }
    );

    console.log(`✅ Updated ${result1.modifiedCount} properties with hasUnits field\n`);

    // Step 2: Create indexes for better performance
    console.log('📝 Step 2: Creating indexes...');
    
    await propertiesCollection.createIndex({ hasUnits: 1 });
    await propertiesCollection.createIndex({ 'units.availability': 1 });
    await propertiesCollection.createIndex({ 'units.tenant': 1 });

    console.log('✅ Indexes created successfully\n');

    // Step 3: Statistics
    console.log('📊 Migration Statistics:');
    const totalProperties = await propertiesCollection.countDocuments();
    const propertiesWithUnits = await propertiesCollection.countDocuments({ hasUnits: true });
    const propertiesWithoutUnits = await propertiesCollection.countDocuments({ hasUnits: false });

    console.log(`   Total Properties: ${totalProperties}`);
    console.log(`   Properties with Units: ${propertiesWithUnits}`);
    console.log(`   Single-unit Properties: ${propertiesWithoutUnits}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Update your Property model with the new schema');
    console.log('   2. Add unit management endpoints to your API');
    console.log('   3. Update frontend to display available units');
    console.log('   4. Test adding units to a property\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Optional: Script to convert an existing property to have units
const convertPropertyToUnits = async (propertyId, unitsData) => {
  try {
    console.log(`🔄 Converting property ${propertyId} to multi-unit...\n`);

    const db = mongoose.connection.db;
    const propertiesCollection = db.collection('properties');

    // Get the property
    const property = await propertiesCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(propertyId) 
    });

    if (!property) {
      console.error('❌ Property not found');
      return;
    }

    // Update property
    await propertiesCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(propertyId) },
      {
        $set: {
          hasUnits: true,
          units: unitsData
        }
      }
    );

    console.log('✅ Property converted successfully!');
    console.log(`   Property: ${property.title}`);
    console.log(`   Units added: ${unitsData.length}\n`);

  } catch (error) {
    console.error('❌ Conversion failed:', error);
  }
};

// Example usage for converting a specific property
const exampleConversion = async () => {
  const propertyId = '68f146858826390bd85772b3'; // Your Greenwood Heights property
  
  const units = [
    {
      unitNumber: '1A',
      floor: 1,
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      rent: 28000,
      deposit: 28000,
      furnished: false,
      features: ['parking', 'security'],
      availability: 'available',
      tenant: null,
      leaseStart: null,
      leaseEnd: null
    },
    {
      unitNumber: '1B',
      floor: 1,
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      rent: 28000,
      deposit: 28000,
      furnished: false,
      features: ['parking', 'security'],
      availability: 'available',
      tenant: null,
      leaseStart: null,
      leaseEnd: null
    },
    {
      unitNumber: '2A',
      floor: 2,
      bedrooms: 2,
      bathrooms: 1,
      area: 90,
      rent: 30000,
      deposit: 30000,
      furnished: false,
      features: ['parking', 'security', 'balcony'],
      availability: 'occupied',
      tenant: new mongoose.Types.ObjectId('your_tenant_id_here'),
      leaseStart: new Date('2025-10-01'),
      leaseEnd: new Date('2026-09-30')
    },
    {
      unitNumber: '2B',
      floor: 2,
      bedrooms: 2,
      bathrooms: 1,
      area: 90,
      rent: 30000,
      deposit: 30000,
      furnished: false,
      features: ['parking', 'security', 'balcony'],
      availability: 'available',
      tenant: null,
      leaseStart: null,
      leaseEnd: null
    }
  ];

  await convertPropertyToUnits(propertyId, units);
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-management')
  .then(async () => {
    console.log('✅ MongoDB Connected');
    await migrationScript();
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('❌ DB Connection Error:', err);
    process.exit(1);
  });


// Export for use in other scripts
module.exports = {
  migrationScript,
  convertPropertyToUnits,
  exampleConversion
};

/* 
 * USAGE INSTRUCTIONS:
 * 
 * 1. Basic Migration (add fields to all properties):
 *    node migrations/addUnitsToProperties.js
 * 
 * 2. Convert specific property to have units:
 *    const { convertPropertyToUnits } = require('./migrations/addUnitsToProperties');
 *    await convertPropertyToUnits('property_id_here', unitsArray);
 * 
 * 3. Example conversion:
 *    Uncomment exampleConversion() call at the bottom
 */