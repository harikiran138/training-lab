import mongoose from 'mongoose';

const HostelDetailsSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true, index: true },
  hostel_name: { type: String, required: true },
  room_no: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.HostelDetails || mongoose.model('HostelDetails', HostelDetailsSchema);
