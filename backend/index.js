const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp', {
})


// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  timeLimit: { type: Number, default: 30 },
  isPublished: { type: Boolean, default: false },
  // Number of attempts allowed per student (default 1)
  attemptsAllowed: { type: Number, default: 1 },
  // Whether students can navigate to previous questions
  allowPrevious: { type: Boolean, default: true },
  // Optional password (hashed) required to take the quiz; not returned by default
  quizPassword: { type: String, select: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    marks: { type: Number, default: 1 }
  }]
}, { timestamps: true })

const Quiz = mongoose.model('Quiz', quizSchema)

// Attempt Schema
const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: { type: Map, of: Number },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  // 'passed' removed — pass/fail status handled on client if needed
}, { timestamps: true })

const Attempt = mongoose.model('Attempt', attemptSchema)

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Admin Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    })

    await user.save()

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Quiz Routes
app.get('/api/quiz', authenticateToken, async (req, res) => {
  try {
    let query = {}
    
    if (req.user.role === 'student') {
      query.isPublished = true
    } else {
      query.createdBy = req.user.userId
    }

    const quizzes = await Quiz.find(query)
      .select('+quizPassword')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
    
    // strip password and add requiresPassword flag
    const out = await Promise.all(quizzes.map(async q => {
      const obj = q.toObject()
      obj.requiresPassword = !!obj.quizPassword
      delete obj.quizPassword
      // include current user's attempt info when possible
      try {
        const attemptsMade = await Attempt.countDocuments({ userId: req.user.userId, quizId: q._id })
        obj.attemptsMade = attemptsMade
        obj.attemptsAllowed = q.attemptsAllowed || 1
        obj.canAttempt = attemptsMade < obj.attemptsAllowed
      } catch (e) {
        obj.attemptsMade = 0
        obj.attemptsAllowed = q.attemptsAllowed || 1
        obj.canAttempt = true
      }
      return obj
    }))

    res.json(out)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.get('/api/quiz/recent', authenticateToken, async (req, res) => {
  try {
    let query = {}
    
    if (req.user.role === 'student') {
      query.isPublished = true
    } else {
      query.createdBy = req.user.userId
    }

    const quizzes = await Quiz.find(query)
      .select('+quizPassword')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(6)

    // strip password and add requiresPassword flag
    const out = await Promise.all(quizzes.map(async q => {
      const obj = q.toObject()
      obj.requiresPassword = !!obj.quizPassword
      delete obj.quizPassword
      try {
        const attemptsMade = await Attempt.countDocuments({ userId: req.user.userId, quizId: q._id })
        obj.attemptsMade = attemptsMade
        obj.attemptsAllowed = q.attemptsAllowed || 1
        obj.canAttempt = attemptsMade < obj.attemptsAllowed
      } catch (e) {
        obj.attemptsMade = 0
        obj.attemptsAllowed = q.attemptsAllowed || 1
        obj.canAttempt = true
      }
      return obj
    }))

    res.json(out)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.get('/api/quiz/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('+quizPassword').populate('createdBy', 'name')
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' })
    }

    // Students can only access published quizzes
    if (req.user.role === 'student' && !quiz.isPublished) {
      return res.status(403).json({ message: 'Quiz not available' })
    }

    // Admins can only access their own quizzes
    if (req.user.role === 'admin' && quiz.createdBy._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const quizObj = quiz.toObject()
    quizObj.requiresPassword = !!quizObj.quizPassword
    delete quizObj.quizPassword

    // include current user's attempt info when requesting a quiz
    try {
      const attemptsMade = await Attempt.countDocuments({ userId: req.user.userId, quizId: quiz._id })
      quizObj.attemptsMade = attemptsMade
      quizObj.attemptsAllowed = quiz.attemptsAllowed || 1
      quizObj.canAttempt = attemptsMade < quizObj.attemptsAllowed
    } catch (err) {
      // ignore attempt count errors, default to allowing attempt
      quizObj.attemptsMade = 0
      quizObj.attemptsAllowed = quiz.attemptsAllowed || 1
      quizObj.canAttempt = true
    }

    res.json(quizObj)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.post('/api/quiz', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user.userId }
    // normalize fields
    payload.attemptsAllowed = parseInt(payload.attemptsAllowed) || 1
    payload.allowPrevious = payload.allowPrevious === false ? false : !!payload.allowPrevious

    // Hash quiz password if provided
    if (payload.quizPassword) {
      const salt = await bcrypt.genSalt(10)
      payload.quizPassword = await bcrypt.hash(payload.quizPassword, salt)
    }

    const quiz = new Quiz(payload)
    await quiz.save()
    const populated = await Quiz.findById(quiz._id).select('+quizPassword').populate('createdBy', 'name')
    // add flag whether quiz requires password
    const quizObj = populated.toObject()
    quizObj.requiresPassword = !!quizObj.quizPassword
    delete quizObj.quizPassword
    res.status(201).json(quizObj)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.put('/api/quiz/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' })
    }

    if (quiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const payload = { ...req.body }
    // normalize fields
    payload.attemptsAllowed = parseInt(payload.attemptsAllowed) || 1
    payload.allowPrevious = payload.allowPrevious === false ? false : !!payload.allowPrevious

    if (payload.quizPassword) {
      const salt = await bcrypt.genSalt(10)
      payload.quizPassword = await bcrypt.hash(payload.quizPassword, salt)
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    ).select('+quizPassword').populate('createdBy', 'name')

    // Add an endpoint to verify a quiz password without submitting an attempt
    // (frontend calls this to check password before starting)
    

    const quizObj = updatedQuiz.toObject()
    quizObj.requiresPassword = !!quizObj.quizPassword
    delete quizObj.quizPassword
    res.json(quizObj)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.delete('/api/quiz/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' })
    }

    if (quiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    await Quiz.findByIdAndDelete(req.params.id)
    await Attempt.deleteMany({ quizId: req.params.id })

    res.json({ message: 'Quiz deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Verify quiz password (used by frontend before starting a quiz)
app.post('/api/quiz/:id/verify-password', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body
    const quiz = await Quiz.findById(req.params.id).select('+quizPassword')
    if (!quiz || (req.user.role === 'student' && !quiz.isPublished)) {
      return res.status(404).json({ message: 'Quiz not found or not available' })
    }

    if (!quiz.quizPassword) {
      return res.status(400).json({ message: 'Quiz does not require a password' })
    }

    const match = await bcrypt.compare(password, quiz.quizPassword)
    if (!match) {
      return res.status(403).json({ message: 'Incorrect quiz password' })
    }

    res.json({ message: 'Verified' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Attempt Routes
app.post('/api/attempt/submit', authenticateToken, async (req, res) => {
  try {
    const { quizId, answers, password } = req.body

    // fetch quiz including password hash for verification
    const quiz = await Quiz.findById(quizId).populate('createdBy', 'name').select('+quizPassword')
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({ message: 'Quiz not found or not available' })
    }

    // Check attempt limits
    const userAttemptsCount = await Attempt.countDocuments({ userId: req.user.userId, quizId })
    if (userAttemptsCount >= (quiz.attemptsAllowed || 1)) {
      return res.status(403).json({ message: 'Attempt limit reached for this quiz' })
    }

    // If quiz has password, verify it
    if (quiz.quizPassword) {
      if (!password) {
        return res.status(401).json({ message: 'Quiz password required' })
      }
      const passMatch = await bcrypt.compare(password, quiz.quizPassword)
      if (!passMatch) {
        return res.status(403).json({ message: 'Incorrect quiz password' })
      }
    }

    // Calculate score
    let score = 0
    let totalMarks = 0

    quiz.questions.forEach((question, index) => {
      totalMarks += question.marks
      if (answers[index] === question.correctAnswer) {
        score += question.marks
      }
    })

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0

    // Save attempt (no pass/fail stored)
    const attempt = new Attempt({
      userId: req.user.userId,
      quizId,
      answers: new Map(Object.entries(answers)),
      score,
      totalMarks,
      percentage,
      timeTaken: quiz.timeLimit * 60 // Default to full time for now
    })

    await attempt.save()

    // Return result with quiz data
    // remove password hash before returning
    const quizObj = quiz.toObject()
    quizObj.requiresPassword = !!quizObj.quizPassword
    delete quizObj.quizPassword

    res.json({
      quiz: quizObj,
      score,
      totalMarks,
      percentage,
      answers,
      timeTaken: quiz.timeLimit * 60
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get attempts for current user for a quiz
app.get('/api/attempt/user/:quizId', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params
    const attempts = await Attempt.find({ userId: req.user.userId, quizId })
      .sort({ createdAt: -1 })
      .lean()

    // Convert Map answers to plain object for each attempt
    const result = attempts.map(a => {
      const obj = { ...a }
      if (obj.answers && typeof obj.answers === 'object') {
        try {
          obj.answers = Object.fromEntries(Object.entries(obj.answers))
        } catch (e) {
          // fallback: leave as-is
        }
      }
      return obj
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Stats Routes
app.get('/api/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    let stats = {}

    if (req.user.role === 'admin') {
      const totalQuizzes = await Quiz.countDocuments({ createdBy: req.user.userId })
      const totalAttempts = await Attempt.countDocuments({
        quizId: { $in: await Quiz.find({ createdBy: req.user.userId }).distinct('_id') }
      })
      
      const attempts = await Attempt.find({
        quizId: { $in: await Quiz.find({ createdBy: req.user.userId }).distinct('_id') }
      })
      
      const averageScore = attempts.length > 0 
        ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length 
        : 0

      stats = {
        totalQuizzes,
        totalAttempts,
        averageScore: Math.round(averageScore),
        completedQuizzes: await Quiz.countDocuments({ 
          createdBy: req.user.userId, 
          isPublished: true 
        })
      }
    } else {
      const totalQuizzes = await Quiz.countDocuments({ isPublished: true })
      const userAttempts = await Attempt.find({ userId: req.user.userId })
      
      const averageScore = userAttempts.length > 0 
        ? userAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / userAttempts.length 
        : 0

      stats = {
        totalQuizzes,
        totalAttempts: userAttempts.length,
        averageScore: Math.round(averageScore),
        completedQuizzes: userAttempts.length
      }
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Analytics Routes
app.get('/api/analytics/:quizId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { quizId } = req.params

    const quiz = await Quiz.findById(quizId)
    if (!quiz || quiz.createdBy.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Quiz not found' })
    }

    const attempts = await Attempt.find({ quizId }).populate('userId', 'name')

    if (attempts.length === 0) {
      return res.json({
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTime: 0,
        recentAttempts: [],
        questionAnalytics: []
      })
    }

    const totalAttempts = attempts.length
    const averageScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts
    const highestScore = Math.max(...attempts.map(a => a.percentage))
    const lowestScore = Math.min(...attempts.map(a => a.percentage))
    const averageTime = attempts.reduce((sum, attempt) => sum + attempt.timeTaken, 0) / totalAttempts

    const recentAttempts = attempts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(attempt => ({
        userName: attempt.userId.name,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.createdAt
      }))

    // Question analytics
    const questionAnalytics = quiz.questions.map((question, questionIndex) => {
      const correctAnswers = attempts.filter(attempt => {
        const userAnswer = attempt.answers.get(questionIndex.toString())
        return userAnswer === question.correctAnswer
      }).length

      return {
        questionIndex,
        correctAnswers,
        totalAnswers: totalAttempts,
        correctPercentage: totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0
      }
    })

    res.json({
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore,
      averageTime,
      recentAttempts,
      questionAnalytics
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Verify quiz password before starting (returns 200 if ok)
app.post('/api/quiz/:id/verify-password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { password } = req.body
    const quiz = await Quiz.findById(id).select('+quizPassword')
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' })
    if (!quiz.quizPassword) return res.json({ success: true })
    if (!password) return res.status(400).json({ message: 'Password required' })
    const match = await bcrypt.compare(password, quiz.quizPassword)
    if (!match) return res.status(403).json({ message: 'Incorrect password' })
    return res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
