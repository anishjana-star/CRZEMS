import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decisionAt: { type: Date }
});

export default mongoose.model('Leave', leaveSchema);
