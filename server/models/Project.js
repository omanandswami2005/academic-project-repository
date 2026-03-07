const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  studentName: { 
    type: String, 
    required: true 
  },
  studentEmail: { 
    type: String, 
    required: true 
  },
  projectName: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  files: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'needs_revision'], 
    default: 'pending' 
  },
  phases: {
    phase1_idea: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      description: { type: String, default: '' }
    },
    phase2_research_paper: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      description: { type: String, default: '' }
    },
    phase3_building_prototype: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      description: { type: String, default: '' }
    },
    phase4_completing_prototype: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      description: { type: String, default: '' }
    },
    phase5_completing_model: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      description: { type: String, default: '' }
    },
    phase6_final_submission: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      description: { type: String, default: '' }
    }
  },
  stars: {
    type: Number,
    default: 0,
    min: 0,
    max: 6
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Calculate stars based on completed phases before saving
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Count completed phases
  let completedPhases = 0;
  if (this.phases.phase1_idea.completed) completedPhases++;
  if (this.phases.phase2_research_paper.completed) completedPhases++;
  if (this.phases.phase3_building_prototype.completed) completedPhases++;
  if (this.phases.phase4_completing_prototype.completed) completedPhases++;
  if (this.phases.phase5_completing_model.completed) completedPhases++;
  if (this.phases.phase6_final_submission.completed) completedPhases++;
  
  // Set stars equal to completed phases (max 6)
  this.stars = Math.min(completedPhases, 6);
  
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
