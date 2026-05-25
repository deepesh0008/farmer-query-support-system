/**
 * Officer Profile Model
 * Store profile data for agricultural officers and extension workers
 */

import mongoose from 'mongoose';

const officerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    department: {
      type: String,
      default: 'Agriculture',
    },
    designation: String,
    region: {
      state: String,
      district: String,
      cluster: String,
    },
    assignedVillages: [String],
    phoneNumber: String,
    email: String,
    biography: String,
    experienceYears: Number,
    skills: [String],
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'on-call', 'not-available'],
      default: 'full-time',
    },
    lastAssignedAt: Date,
  },
  {
    timestamps: true,
  }
);

officerProfileSchema.index({ department: 1 });
officerProfileSchema.index({ 'region.state': 1, 'region.district': 1 });
officerProfileSchema.index({ assignedVillages: 1 });

const OfficerProfile = mongoose.model('OfficerProfile', officerProfileSchema);

export default OfficerProfile;
