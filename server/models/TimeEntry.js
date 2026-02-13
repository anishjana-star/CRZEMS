import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  loginTime: {
    type: Date,
    required: true
  },
  logoutTime: {
    type: Date,
    default: null
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
});

// Indexes for efficient queries and to prevent duplicate daily entries
timeEntrySchema.index({ employeeId: 1, month: 1, year: 1 });
timeEntrySchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model('TimeEntry', timeEntrySchema);
