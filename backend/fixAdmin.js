const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/user.model');

// Admin credentials
const adminCredentials = {
  name: 'Admin User',
  email: 'admin@healthcare.com',
  password: 'Admin@123',
  role: 'admin'
};

async function fixAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-platform';
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin user
    console.log('Deleting existing admin user...');
    await User.deleteOne({ email: adminCredentials.email });
    console.log('Admin user deleted (if existed)');

    // Hash the password manually with bcryptjs
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminCredentials.password, salt);
    console.log('Password hashed successfully');

    // Create new admin user
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

    // Find the admin user to verify it was created
    const createdAdmin = await User.findOne({ email: adminCredentials.email });
    console.log('Created admin user ID:', createdAdmin._id);

    console.log('Done! You should now be able to log in with the admin credentials.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin user:', error);
    process.exit(1);
  }
}

fixAdmin(); 