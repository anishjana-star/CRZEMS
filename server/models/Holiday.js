import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    }
});

holidaySchema.index({ date: 1 });

export default mongoose.model('Holiday', holidaySchema);
