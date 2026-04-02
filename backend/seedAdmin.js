require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Check if an admin already exists
    const adminExists = await User.findOne({ email: 'jigar@gmail.com' });

    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit();
    }

    await User.create({
      name: 'Jigar',
      email: 'jigar@gmail.com',
      password: 'jigar@0709',
      role: 'admin'
    });

    console.log('Admin user successfully created!');
    console.log('Email: jigar@gmail.com\nPassword: jigar@0709');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
