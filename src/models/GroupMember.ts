import mongoose from 'mongoose';

const GroupMemberSchema = new mongoose.Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentGroup', required: true, index: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  added_on: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index to prevent duplicates
GroupMemberSchema.index({ group_id: 1, student_id: 1 }, { unique: true });

export default mongoose.models.GroupMember || mongoose.model('GroupMember', GroupMemberSchema);
