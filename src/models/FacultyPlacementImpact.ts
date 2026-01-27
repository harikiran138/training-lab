import mongoose from 'mongoose';

const FacultyPlacementImpactSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
  academic_year: { type: String, required: true },
  students_guided: { type: Number, default: 0 },
  internships_secured: { type: Number, default: 0 },
  placements_secured: { type: Number, default: 0 },
  avg_package: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.models.FacultyPlacementImpact || mongoose.model('FacultyPlacementImpact', FacultyPlacementImpactSchema);
