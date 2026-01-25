import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  notification_id: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true, index: true }, // Can be StudentID or FacultyID
  user_type: { type: String, enum: ['Student', 'Faculty', 'Admin'], required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Alert', 'Reminder', 'Announcement', 'Achievement'], 
    default: 'Alert' 
  },
  is_read: { type: Boolean, default: false },
  related_link: String // Optional URL to redirect
}, {
  timestamps: true
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
