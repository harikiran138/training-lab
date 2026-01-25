import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  announcement_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Targeting
  target_audience: [{ 
    type: String, 
    enum: ['All', 'Student', 'Faculty', 'Admin', 'Year_1', 'Year_2', 'Year_3', 'Year_4', 'CSE', 'ECE', 'EEE', 'Mech', 'Civil'] 
  }],
  
  type: { type: String, enum: ['General', 'Exam', 'Placement', 'Holiday', 'Emergency'], default: 'General' },
  priority: { type: String, enum: ['Normal', 'High', 'Urgent'], default: 'Normal' },
  
  created_by: { type: String, required: true }, // AdminID
  
  expiry_date: { type: Date },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
