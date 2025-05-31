const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const User = require('../backend/src/models/user.model');

// Admin credentials - save these to access the admin panel
const adminCredentials = {
  name: 'Admin User',
  email: 'admin@healthcare.com',
  password: 'Admin@123',
  role: 'admin'
};

const createAdmin = async (resetExisting = false) => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-platform';
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminCredentials.email });
    
    if (existingAdmin) {
      if (resetExisting) {
        console.log('Deleting existing admin user...');
        await User.deleteOne({ email: adminCredentials.email });
        console.log('Existing admin user deleted');
      } else {
        console.log('Admin user already exists');
        await mongoose.disconnect();
        return;
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminCredentials.password, salt);

    // Create admin user
    const admin = new User({
      name: adminCredentials.name,
      email: adminCredentials.email,
      password: hashedPassword,
      role: adminCredentials.role,
      profileImage: 'default.jpg'
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('------------------------');
    console.log('Admin login credentials:');
    console.log(`Email: ${adminCredentials.email}`);
    console.log(`Password: ${adminCredentials.password}`);
    console.log('------------------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
    console.error(error.stack);
  }
};

// Check if reset flag is passed as command line argument
const resetFlag = process.argv.includes('--reset');
createAdmin(resetFlag); 