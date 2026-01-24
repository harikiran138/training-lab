import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  class_id: { type: String, required: true, unique: true }, // e.g., CSE-A-2024
  branch_code: { type: String, required: true },
  section: { type: String, required: true },
  year: { type: Number, required: true },
  batch_name: { type: String }, // e.g. 2022-26
  
  faculty_advisor: { type: String, ref: 'Faculty' },
  
  timetable: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    slots: [{
      start_time: String,
      end_time: String,
      subject_name: String,
      faculty_id: { type: String, ref: 'Faculty' },
      room_no: String
    }]
  }],
  
  total_students: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
