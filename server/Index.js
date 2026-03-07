require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./models/User'); // Ensure this path is correct
const Project = require('./models/Project'); // Import Project model
const connectDB = require('./db'); // Import database connection

const app = express();

// Middleware
app.use(cors()); // Allows your React app to talk to this server
app.use(express.json()); // Essential to read the email/password sent from React

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Use absolute path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true);
  }
});

// Verify Project model is loaded
try {
  require('./models/Project');
  console.log("✅ Project model loaded successfully");
} catch (error) {
  console.error("❌ Error loading Project model:", error.message);
}

// Connect to MongoDB
connectDB().then(connected => {
  if (!connected) {
    console.error("⚠️  Server will start but database operations may fail!");
    console.error("💡 To start MongoDB on Windows, run: net start MongoDB");
    console.error("💡 Or if installed as service: mongod --dbpath <your-data-path>");
  } else {
    console.log("✅ Database connection verified");
  }
});

// Middleware to check database connection before handling requests
const checkDBConnection = (req, res, next) => {
  // Check if mongoose is connected (readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: "Database not connected. Please ensure MongoDB is running on port 27017." 
    });
  }
  next();
};

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// SIGNUP ROUTE
app.post('/signup', checkDBConnection, async (req, res) => {
  try {
    const { username, email, password, role, branch } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'student', // Default to student if not provided
      branch: branch || null // Include branch if provided
    });

    await newUser.save();

    res.status(201).json({ 
      message: "Account created successfully!",
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role, branch: newUser.branch }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists." });
    }
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// LOGIN ROUTE
app.post('/login', checkDBConnection, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please check your Email/ID." });
    }

    // 2. Verify role if provided (optional check for security)
    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied. This account is registered as ${user.role}, not ${role}.` });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Password. Please try again." });
    }

    // 4. Success - Send back the user object
    res.status(200).json({ 
      message: "Login Successful!", 
      user: { id: user._id, username: user.username, email: user.email, role: user.role } 
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error. Is MongoDB running?" });
  }
});

// UPDATE PASSWORD ROUTE (for authenticated users)
app.post('/update-password', checkDBConnection, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });

  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// FORGOT PASSWORD ROUTE (send reset email)
app.post('/forgot-password', checkDBConnection, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide your email address." });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL (use environment variable for production)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Configure nodemailer (using Gmail as example - you should use environment variables)
    // For production, use environment variables for email credentials
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    // Check if email credentials are configured
    if (!emailUser || emailUser === 'your-email@gmail.com' || !emailPass || emailPass === 'your-app-password') {
      console.error("❌ Email credentials not configured properly!");
      console.error("   Please set EMAIL_USER and EMAIL_PASS in server/.env file");
      console.error("   See server/SETUP_EMAIL.md for instructions");
      return res.status(500).json({ 
        message: "Email service is not configured. Please contact administrator." 
      });
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.username},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4169E1; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>RSCOE Project Management System</p>
      `
    };

    // Send email
    try {
      console.log(`📧 Attempting to send password reset email to: ${user.email}`);
      console.log(`📧 Using email account: ${process.env.EMAIL_USER || 'default'}`);
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent successfully!`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   To: ${user.email}`);
      
      res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    } catch (emailError) {
      console.error("❌ Email Error Details:");
      console.error(`   Error Code: ${emailError.code}`);
      console.error(`   Error Message: ${emailError.message}`);
      console.error(`   Full Error:`, emailError);
      
      if (emailError.code === 'EAUTH') {
        console.error("   ⚠️  Authentication failed - check your EMAIL_USER and EMAIL_PASS in .env");
      } else if (emailError.code === 'ECONNECTION') {
        console.error("   ⚠️  Connection failed - check your internet connection");
      }
      
      // Still return success to user for security, but log the error
      res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    }

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// RESET PASSWORD ROUTE (with token from email)
app.post('/reset-password/:token', checkDBConnection, async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Please provide a new password." });
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully!" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// Multer middleware wrapper with proper error handling
const multerUpload = (req, res, next) => {
  const uploadMiddleware = upload.array('files', 10);
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File size too large. Maximum size is 50MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    // No error, proceed to next middleware
    next();
  });
};

// PROJECT UPLOAD ROUTE
app.post('/api/projects', checkDBConnection, multerUpload, async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, projectName, description } = req.body;
    
    console.log('Project Upload Request:', {
      studentId,
      studentName,
      studentEmail,
      projectName,
      description,
      filesCount: req.files ? req.files.length : 0
    });

    // Validation
    if (!studentId || !studentName || !studentEmail || !projectName || !description) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Check if user exists
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Process uploaded files (handle case when no files are uploaded)
    const files = (req.files && Array.isArray(req.files) && req.files.length > 0) 
      ? req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          filePath: `/uploads/${file.filename}`,
          fileSize: file.size,
          fileType: file.mimetype
        }))
      : [];

    // Create new project
    const newProject = new Project({
      studentId: mongoose.Types.ObjectId.isValid(studentId) ? studentId : new mongoose.Types.ObjectId(studentId),
      studentName,
      studentEmail,
      projectName,
      description,
      files,
      status: 'pending'
    });

    await newProject.save();

    res.status(201).json({
      message: "Project uploaded successfully!",
      project: newProject
    });

  } catch (error) {
    console.error("Project Upload Error:", error);
    console.error("Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error messages
    let errorMessage = "Internal Server Error. Please try again.";
    if (error.name === 'ValidationError') {
      errorMessage = `Validation Error: ${error.message}`;
    } else if (error.name === 'CastError') {
      errorMessage = "Invalid student ID format.";
    } else if (error.code === 11000) {
      errorMessage = "Project with this name already exists.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET ALL PROJECTS (for teachers)
app.get('/api/projects', checkDBConnection, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('studentId', 'username email')
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      message: "Projects retrieved successfully",
      projects
    });

  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// GET PROJECTS BY STUDENT ID
app.get('/api/projects/student/:studentId', checkDBConnection, async (req, res) => {
  try {
    const { studentId } = req.params;

    const projects = await Project.find({ studentId })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      message: "Projects retrieved successfully",
      projects
    });

  } catch (error) {
    console.error("Get Student Projects Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// GET SINGLE PROJECT BY ID
app.get('/api/projects/:projectId', checkDBConnection, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('studentId', 'username email');

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({
      message: "Project retrieved successfully",
      project
    });

  } catch (error) {
    console.error("Get Project Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// UPDATE PROJECT STATUS (for teachers)
app.patch('/api/projects/:projectId/status', checkDBConnection, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'under_review', 'approved', 'needs_revision'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const project = await Project.findByIdAndUpdate(
      projectId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    res.status(200).json({
      message: "Project status updated successfully",
      project
    });

  } catch (error) {
    console.error("Update Project Status Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// GET STUDENTS BY BRANCH (for teachers)
app.get('/api/students/branch/:branch', checkDBConnection, async (req, res) => {
  try {
    const { branch } = req.params;

    const students = await User.find({ 
      role: 'student',
      branch: branch 
    }).select('username email branch _id');

    // Get projects for each student
    const studentsWithProjects = await Promise.all(
      students.map(async (student) => {
        const projects = await Project.find({ studentId: student._id })
          .sort({ uploadedAt: -1 })
          .limit(1); // Get latest project
        
        const latestProject = projects[0];
        
        return {
          id: student._id.toString(), // Ensure ID is a string for comparison
          name: student.username,
          email: student.email,
          branch: student.branch,
          roll: student.email.split('@')[0] || student._id.toString(), // Use email prefix as roll
          projectTitle: latestProject ? latestProject.projectName : 'No project uploaded',
          progress: latestProject ? 50 : 0, // Default progress
          status: latestProject ? latestProject.status.replace('_', ' ') : 'No Project',
          latestUpdate: latestProject ? latestProject.description.substring(0, 50) + '...' : 'No updates',
          projectId: latestProject ? latestProject._id.toString() : null
        };
      })
    );

    res.status(200).json({
      message: "Students retrieved successfully",
      students: studentsWithProjects
    });

  } catch (error) {
    console.error("Get Students by Branch Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// GET ALL STUDENTS (for teachers)
app.get('/api/students', checkDBConnection, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('username email branch _id');

    res.status(200).json({
      message: "Students retrieved successfully",
      students
    });

  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// UPDATE PROJECT PHASE
app.patch('/api/projects/:projectId/phase', checkDBConnection, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { phase, completed, description } = req.body;

    // Validate phase name
    const validPhases = [
      'phase1_idea',
      'phase2_research_paper',
      'phase3_building_prototype',
      'phase4_completing_prototype',
      'phase5_completing_model',
      'phase6_final_submission'
    ];

    if (!phase || !validPhases.includes(phase)) {
      return res.status(400).json({ 
        message: `Invalid phase. Must be one of: ${validPhases.join(', ')}` 
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Update phase
    project.phases[phase].completed = completed !== undefined ? completed : project.phases[phase].completed;
    if (completed) {
      project.phases[phase].completedAt = new Date();
    }
    if (description !== undefined) {
      project.phases[phase].description = description;
    }

    // Save project (this will trigger the pre-save hook to calculate stars)
    await project.save();

    res.status(200).json({
      message: "Project phase updated successfully",
      project
    });

  } catch (error) {
    console.error("Update Project Phase Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

// UPDATE MULTIPLE PROJECT PHASES
app.patch('/api/projects/:projectId/phases', checkDBConnection, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { phases } = req.body; // { phase1_idea: { completed: true, description: '...' }, ... }

    if (!phases || typeof phases !== 'object') {
      return res.status(400).json({ message: "Invalid phases data." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Update each phase provided
    Object.keys(phases).forEach(phaseKey => {
      if (project.phases[phaseKey]) {
        if (phases[phaseKey].completed !== undefined) {
          project.phases[phaseKey].completed = phases[phaseKey].completed;
          if (phases[phaseKey].completed) {
            project.phases[phaseKey].completedAt = new Date();
          }
        }
        if (phases[phaseKey].description !== undefined) {
          project.phases[phaseKey].description = phases[phaseKey].description;
        }
      }
    });

    await project.save();

    res.status(200).json({
      message: "Project phases updated successfully",
      project
    });

  } catch (error) {
    console.error("Update Project Phases Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again." });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));