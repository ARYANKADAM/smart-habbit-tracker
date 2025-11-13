import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    displayName: {
      type: String,
      default: '',
    },
    // ✅ NEW: Google Auth fields
    googleUid: {
      type: String,
      default: null,
    },
    photoURL: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    checkInTime: {
      type: String,
      default: '21:00', // Format: "HH:MM" (24-hour)
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for Google UID
UserSchema.index({ googleUid: 1 }, { sparse: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);