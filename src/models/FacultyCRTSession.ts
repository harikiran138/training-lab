import mongoose from 'mongoose';

const FacultyCRTSessionSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  session_topic: { type: String, required: true },
  session_type: { 
    type: String, 
    enum: ['Aptitude', 'Coding', 'Soft Skills', 'Placement'], 
    required: true 
  },
  date: { type: Date, default: Date.now },
  duration: Number, // in minutes
  students_attended: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.FacultyCRTSession || mongoose.model('FacultyCRTSession', FacultyCRTSessionSchema);
