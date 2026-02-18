const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors'); // Import colors to style console output

// Load env vars
dotenv.config({ path: './.env' }); // Adjust path if needed, assuming running from root or check relative path

// Load Models
const User = require('../models/User');
const Department = require('../models/Department');
const Position = require('../models/Position');
const Category = require('../models/Category');
const Application = require('../models/Application');
const Attendance = require('../models/Attendance');
const FAQ = require('../models/FAQ');
const File = require('../models/File');
const Holiday = require('../models/Holiday');
const LeaveRequest = require('../models/LeaveRequest');
const Magazine = require('../models/Magazine');
const News = require('../models/News');
const PhotoAlbum = require('../models/PhotoAlbum');
const Video = require('../models/Video');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const Role = require('../models/Role');

// Connect to DB
mongoose.connect(process.env.DATABASE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/multaqana_db')
    .then(() => console.log('✅ MongoDB Connected...'.green.bold))
    .catch(err => console.log(`❌ DB Connection Error: ${err.message}`.red));

// Read JSON files
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const departments = JSON.parse(fs.readFileSync(`${__dirname}/departments.json`, 'utf-8'));
const positions = JSON.parse(fs.readFileSync(`${__dirname}/positions.json`, 'utf-8'));
const categories = JSON.parse(fs.readFileSync(`${__dirname}/categories.json`, 'utf-8'));
const applications = JSON.parse(fs.readFileSync(`${__dirname}/applications.json`, 'utf-8'));
const attendance = JSON.parse(fs.readFileSync(`${__dirname}/attendance.json`, 'utf-8'));
const faqs = JSON.parse(fs.readFileSync(`${__dirname}/faqs.json`, 'utf-8'));
const files = JSON.parse(fs.readFileSync(`${__dirname}/files.json`, 'utf-8'));
const holidays = JSON.parse(fs.readFileSync(`${__dirname}/holidays.json`, 'utf-8'));
const leaveRequests = JSON.parse(fs.readFileSync(`${__dirname}/leaverequests.json`, 'utf-8'));
const magazines = JSON.parse(fs.readFileSync(`${__dirname}/magazines.json`, 'utf-8'));
const news = JSON.parse(fs.readFileSync(`${__dirname}/news.json`, 'utf-8'));
const photoAlbums = JSON.parse(fs.readFileSync(`${__dirname}/photoalbums.json`, 'utf-8'));
const videos = JSON.parse(fs.readFileSync(`${__dirname}/videos.json`, 'utf-8'));
const settings = JSON.parse(fs.readFileSync(`${__dirname}/settings.json`, 'utf-8'));
const notifications = JSON.parse(fs.readFileSync(`${__dirname}/notifications.json`, 'utf-8'));
const roles = JSON.parse(fs.readFileSync(`${__dirname}/roles.json`, 'utf-8'));

// Import Data
const importData = async () => {
    try {
        // Roles first (no deps); User.role refs Role
        await Role.create(roles);
        await Department.create(departments);
        await Position.create(positions);
        await Category.create(categories); // Categories needed for News, Videos, etc.

        await User.create(users); // Users depend on Dept/Pos

        const defaultRole = await Role.findOne({ isDefault: true });
        if (defaultRole) {
            await User.updateMany(
                { $or: [{ role: null }, { role: { $exists: false } }] },
                { $set: { role: defaultRole._id } }
            );
        }

        // Dependent on Users/Categories
        await Application.create(applications);
        await Attendance.create(attendance);
        await FAQ.create(faqs);
        await File.create(files);
        await Holiday.create(holidays);
        await LeaveRequest.create(leaveRequests);
        await Magazine.create(magazines);
        await News.create(news);
        await PhotoAlbum.create(photoAlbums);
        await Video.create(videos);
        await Settings.create(settings);

        // Fix Notification User IDs if necessary or rely on hardcoded
        // For now, allow potential mismatch if users changed, but assuming seed data aligns
        await Notification.create(notifications);

        console.log('👍 Data Imported Successfully!'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(`❌ Error Importing Data: ${err.message}`.red.inverse);
        process.exit(1);
    }
};

// Delete Data
const destroyData = async () => {
    try {
        await User.deleteMany(); // Users reference Role; delete before Role
        await Role.deleteMany();
        await Application.deleteMany();
        await Attendance.deleteMany();
        await Category.deleteMany();
        await Department.deleteMany();
        await FAQ.deleteMany();
        await File.deleteMany();
        await Holiday.deleteMany();
        await LeaveRequest.deleteMany();
        await Magazine.deleteMany();
        await News.deleteMany();
        await PhotoAlbum.deleteMany();
        await Position.deleteMany();
        await Video.deleteMany();
        await Settings.deleteMany();
        await Notification.deleteMany();

        console.log('🗑️  Data Destroyed Successfully!'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(`❌ Error Destroying Data: ${err.message}`.red.inverse);
        process.exit(1);
    }
};

// Command Line Arguments
// Usage: node seeder.js -i (import) | node seeder.js -d (delete)
if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    destroyData();
} else {
    console.log('Please provide an argument: -i for import, -d for delete'.yellow);
    process.exit();
}