const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function setupAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { email: "leadflow@admin.com" },
                { role: "admin" }
            ]
        });
        
        if (existingAdmin) {
            console.log('ℹ️ Admin user already exists:');
            console.log(`📧 Email: ${existingAdmin.email}`);
            console.log(`👤 Role: ${existingAdmin.role}`);
            console.log('🔑 You can use the existing admin account.');
            process.exit(0);
        }

        console.log('🔄 Creating new admin user...');
        
        // ✅ CREATE NEW ADMIN WITH NEW CREDENTIALS
        const saltRounds = 12;
        const plainPassword = 'LeadFlow@2024!'; // New strong password
        const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

        // Create admin with new credentials
        const admin = new User({
            name: 'LeadFlow System Admin',
            email: 'leadflow@admin.com', // New professional email
            passwordHash: passwordHash,
            role: 'admin',
            whatsapp: '+8801000000000'
        });

        await admin.save();
        
        console.log('🎉 New admin user created successfully!');
        console.log('══════════════════════════════════════');
        console.log('📧 Login Email: leadflow@admin.com');
        console.log('🔑 Login Password: LeadFlow@2024!');
        console.log('══════════════════════════════════════');
        console.log('\n⚠️ Important: Keep these credentials secure!');
        
    } catch (error) {
        console.error('❌ Error setting up admin:', error);
        
        if (error.code === 11000) {
            console.error('📧 Duplicate email error - admin already exists');
        }
        console.error('🔧 Error details:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed');
        process.exit(0);
    }
}

setupAdmin();