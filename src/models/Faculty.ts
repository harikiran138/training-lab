import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
  faculty_id: { type: String, required: true, unique: true }, // Employee ID
  full_name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  date_of_birth: Date,
  email: { type: String, required: true, unique: true },
  mobile_no: String,
  alternate_mobile: String,
  designation: { 
    type: String, 
    enum: ['Assistant Professor', 'Associate Professor', 'Professor', 'CRT Trainer', 'HOD'],
    required: true 
  },
  department: { type: String, required: true },
  highest_qualification: String,
  specialization: String,
  experience_years: { type: Number, default: 0 },
  employment_type: { 
    type: String, 
    enum: ['Permanent', 'Contract', 'Guest'], 
    default: 'Permanent' 
  },
  joining_date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Active', 'On Leave', 'Resigned'], 
    default: 'Active' 
  }
}, {
  timestamps: true
});

export default mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema);
