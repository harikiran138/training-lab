import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema({
  target_id: { type: String, required: true }, // student_id, class_id, or department_code
  target_type: { type: String, enum: ['Student', 'Class', 'Department', 'College'], required: true },
  
  category: { 
    type: String, 
    enum: ['Academic', 'Career', 'Discipline', 'Resource_Allocation'],
    required: true
  },
  
  insight_text: { type: String, required: true },
  action_plan: [{
    task: String,
    priority: { type: String, enum: ['Low', 'Medium', 'High'] },
    is_completed: { type: Boolean, default: false }
  }],
  
  risk_level: { type: String, enum: ['None', 'Low', 'Medium', 'High'], default: 'None' },
  confidence_score: { type: Number, min: 0, max: 1 },
  
  raw_data_snapshot: mongoose.Schema.Types.Mixed, // The data used to generate this
  
  valid_until: Date,
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);
