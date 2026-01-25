import mongoose from 'mongoose';

const FacultyTrainingOutcomeSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  batch: String,
  students_trained: { type: Number, default: 0 },
  students_placed: { type: Number, default: 0 },
  avg_package_lpa: { type: Number, default: 0 },
  top_package_lpa: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.FacultyTrainingOutcome || mongoose.model('FacultyTrainingOutcome', FacultyTrainingOutcomeSchema);
