import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs'; // Removed for plain text passwords

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'terminated'],
    default: 'active'
  },
  terminationReason: {
    type: String,
    default: ''
  },
  employeeType: {
    type: String,
    enum: ['Intern', 'Full Time', 'Contract'],
    default: 'Full Time'
  },
  designation: {
    type: String,
    default: 'Employee'
  },
  promotionHistory: [{
    designation: String,
    date: {
      type: Date,
      default: Date.now
    },
    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    promotionTitle: {
      type: String
    },
    remarks: {
      type: String,
      default: ''
    }
  }],
  salary: {
    type: Number,
    default: 0
  },
  workHours: {
    type: Number,
    default: 8 // Default 8 hours per day
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving - REMOVED for plain text
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// Compare password method - Plain text comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return candidatePassword === this.password;
};

export default mongoose.model('User', userSchema);
