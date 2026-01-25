import mongoose from 'mongoose';

const FacultyActivitySchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  activity_type: { 
    type: String, 
    enum: ['Workshop', 'FDP', 'Conference', 'Hackathon'], 
    required: true 
  },
  title: { type: String, required: true },
  role: { type: String, enum: ['Organizer', 'Speaker', 'Mentor'] },
  date: Date,
  outcome: String
}, {
  timestamps: true
});

export default mongoose.models.FacultyActivity || mongoose.model('FacultyActivity', FacultyActivitySchema);
