import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  day_of_week: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], 
    required: true 
  },
  period_no: { type: Number, required: true },
  start_time: String,
  end_time: String,
  subject_name: String,
  class_section: String,
  room_no: String
}, {
  timestamps: true
});

export default mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
