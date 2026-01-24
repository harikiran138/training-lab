import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  address_type: { type: String, enum: ['Permanent', 'Correspondence'], required: true },
  full_address: { type: String, required: true },
  city: { type: String },
  district: { type: String },
  state: { type: String },
  pincode: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);
