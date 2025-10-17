const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find existing admin
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
            console.log('❌ No admin user found');
            process.exit(1);
        }

        console.log('🔄 Resetting admin password...');
        console.log(`📧 Existing Admin: ${existingAdmin.email}`);
        
        // ✅ RESET PASSWORD WITH MANUAL HASHING
        const saltRounds = 12;
        const newPassword = 'leadflow@admin25';
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update admin password
        existingAdmin.passwordHash = passwordHash;
        
        // Ensure required fields
        if (!existingAdmin.whatsapp) {
            existingAdmin.whatsapp = '+8801000000000';
        }

        await existingAdmin.save();
        
        console.log('🎉 Admin password reset successfully!');
        console.log('══════════════════════════════════════');
        console.log('📧 Login Email: anisul@programming-hero.com');
        console.log('🔑 NEW Password: leadflow@admin25');
        console.log('══════════════════════════════════════');
        console.log('\n⚠️ Important: Change password after first login!');
        
    } catch (error) {
        console.error('❌ Error resetting admin:', error);
        console.error('🔧 Error details:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed');
        process.exit(0);
    }
}

resetAdmin();