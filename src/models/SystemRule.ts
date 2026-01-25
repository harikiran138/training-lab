import mongoose from 'mongoose';

const SystemRuleSchema = new mongoose.Schema({
  rule_key: { type: String, unique: true, required: true }, // 'MIN_ATTENDANCE_PERCENT', 'PASS_MARKS_THRESHOLD'
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // 75, 40, "Active"
  
  description: { type: String },
  category: { type: String, enum: ['Academic', 'Placement', 'General', 'Security'], default: 'General' },
  
  last_updated_by: { type: String },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.SystemRule || mongoose.model('SystemRule', SystemRuleSchema);
