const mongoose = require('mongoose'); // Import mongoose to interact with MongoDB
const Schema = mongoose.Schema; // Get the Schema constructor from mongoose

// Define the User Schema
// Why? This defines the structure of a 'User' document in our MongoDB database.
// Mongoose forces this structure (Schema) on every user we try to save.
// What if not exist? MongoDB is "schemaless", meaning you could save anything. But without this, your code would catch fire trying to access 'email' on a user that only has 'username'.
const userSchema = new Schema({
  username: {
    type: String, // Expect text
    required: true // Why? We must have a name to address the user. Without this, we get nameless ghosts.
  },
  email: {
    type: String, // Expect text
    required: true, // Why? Email is used for login. It MUST exist.
    unique: true // Why? No two users can have the same email. Prevents identity confusion.
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  roles: {
    // Legacy: kept for JWT compatibility; can be derived from role.slug
    User: { type: Number, default: 2001 },
    Editor: Number,
    Admin: Number
  },
  password: {
    type: String,
    required: true // Why? Needed for authentication.
  },
  phoneNumber: {
    type: String,
    // Regex for EG, UAE, KSA phones
    // EG: +201xxxxxxxxx (10-11 digits)
    // UAE: +9715xxxxxxxx (9 digits)
    // KSA: +9665xxxxxxxx (9 digits)
    // General: allow optional +, then country code, then number
    validate: {
      validator: function (v) {
        // Simplified Regex for EG, SA, UAE mobile numbers
        // EG: ^(?:\+20|0)?1[0125]\d{8}$
        // UAE: ^(?:\+971|0)?5[024568]\d{7}$
        // SA: ^(?:\+966|0)?5\d{8}$
        // We combine them or allow a broader check if stricter validation is tricky
        return /^(?:\+20|0)?1[0125]\d{8}$|^(?:\+971|0)?5[024568]\d{7}$|^(?:\+966|0)?5\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number for EG, UAE, or KSA!`
    }
  },
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  address: {
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    street: { type: String, trim: true }
  },
  emiratesId: {
    type: String,
    trim: true
  },
  employeeCode: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls if not provided
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  },
  active: {
    type: Boolean,
    default: true // Why? Allows us to "ban" or deactivate users without deleting their data.
  },
  image: {
    type: String, // Stores the URL/path to the image file, NOT the image binary data itself.
    default: "" // Default to empty string if no image uploaded.
  },
  // Attendance & Leave Management
  leaveBalance: {
    annual: { type: Number, default: 21 },
    sick: { type: Number, default: 15 }
  },
  workSchedule: {
    startTime: { type: String, default: "09:00" }, // HH:mm
    endTime: { type: String, default: "17:00" },   // HH:mm
    gracePeriodMinutes: { type: Number, default: 15 }
  },
  // HR & Employment Details
  joiningDate: { type: Date },
  jobTitle: { type: String, trim: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contractType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract'],
    default: 'Full-time'
  },

  // Personal Info
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female'] },
  nationality: { type: String, trim: true },

  // Contact & Emergency
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },
  personalEmail: { type: String, trim: true },

  // System/Preferences
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  language: { type: String, default: 'en', enum: ['en', 'ar'] },

  // Password reset (token stored hashed; expires in 10 min)
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },

  // Email verification (token stored hashed; expires in 24h)
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },

  // Chat Settings
  mutedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  refreshToken: [String] // Why an array? This allows a user to be logged in on multiple devices (phone, laptop) simultaneously. Each device gets its own refresh token.
}, {
  timestamps: true // Why? Automatically manages 'createdAt' and 'updatedAt' fields. Very useful for auditing.
});

module.exports = mongoose.model('User', userSchema);
// Exports 'User' model. We can now use `User.find()`, `User.create()`, etc. in our controllers.
