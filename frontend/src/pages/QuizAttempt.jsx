import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuiz } from '../context/QuizContext'
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react'

const QuizAttempt = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchQuiz, submitQuizAttempt, verifyQuizPassword, getUserAttempts } = useQuiz()
  
  const [quiz, setQuiz] = useState(null)
  const [canAttempt, setCanAttempt] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [attempts, setAttempts] = useState([])
  const [showAttempts, setShowAttempts] = useState(false)

  useEffect(() => {
    loadQuiz()
  }, [id])

  useEffect(() => {
    let timer
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [quizStarted, timeLeft])

  const loadQuiz = async () => {
    const quizData = await fetchQuiz(id)
    if (quizData) {
      setQuiz(quizData)
      setTimeLeft(quizData.timeLimit * 60) // Convert minutes to seconds
      setCanAttempt(quizData.canAttempt !== undefined ? quizData.canAttempt : true)
    }
    setLoading(false)
  }

  const loadAttempts = async () => {
    if (!getUserAttempts) {
      alert('Attempt viewing is not available right now.')
      return
    }
    const token = localStorage.getItem('token')
    if (!token) {
      alert('You must be logged in to view your attempts')
      return
    }
    const res = await getUserAttempts(id)
    if (res.success) {
      setAttempts(res.attempts)
      setShowAttempts(true)
    } else {
      console.error('Failed to load attempts:', res)
      alert(res.message || 'Failed to load attempts')
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
  }

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0 && quiz.allowPrevious) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return
    
    setSubmitting(true)
    const result = await submitQuizAttempt(id, answers, password)
    
    if (result.success) {
      navigate(`/quiz/${id}/result`, { 
        state: { result: result.result } 
      })
    } else {
      alert(result.message)
      setSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / quiz.questions.length) * 100
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Quiz not found</h2>
            <button onClick={() => navigate('/quizzes')} className="btn btn-primary">
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          <div className="card-header" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              {quiz.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {quiz.description}
            </p>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Quiz Instructions
              </h3>
              <ul style={{ 
                color: 'var(--text-secondary)', 
                lineHeight: '1.8',
                paddingLeft: '20px'
              }}>
                <li>This quiz contains {quiz.questions.length} questions</li>
                <li>Time limit: {quiz.timeLimit} minutes</li>
                
                <li>{quiz.allowPrevious ? 'You can navigate between questions using the Previous/Next buttons' : 'Previous navigation is disabled for this quiz'}</li>
                <li>Your answers are automatically saved as you progress</li>
                <li>The quiz will auto-submit when time expires</li>
                <li>Make sure you have a stable internet connection</li>
              </ul>
            </div>
            {quiz.requiresPassword && (
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Quiz Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter quiz password"
                />
                {passwordError && (
                  <div className="alert alert-error" style={{ marginTop: '8px' }}>{passwordError}</div>
                )}
              </div>
            )}
            {!canAttempt && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                You have reached the maximum number of attempts for this quiz.
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => navigate('/quizzes')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!canAttempt) return
                  if (quiz.requiresPassword) {
                    setPasswordError('')
                    const res = await verifyQuizPassword(id, password)
                    if (!res.success) {
                      setPasswordError(res.message || 'Incorrect password')
                      return
                    }
                  }
                  startQuiz()
                }}
                className="btn btn-primary"
                disabled={!canAttempt}
              >
                Start Quiz
              </button>

              <button
                onClick={loadAttempts}
                className="btn btn-secondary"
              >
                View My Attempts
              </button>
            </div>
          </div>
        </motion.div>
        {showAttempts && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>My Attempts</h3>
            {attempts.length === 0 ? (
              <div className="card">
                <div className="card-body">No attempts yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {attempts.map((a, idx) => (
                  <div key={idx} className="card" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '18px' }}>{a.percentage.toFixed(1)}%</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>{a.score}/{a.totalMarks} — {new Date(a.createdAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            const resultObj = {
                              quiz,
                              score: a.score,
                              totalMarks: a.totalMarks,
                              percentage: a.percentage,
                              answers: a.answers || {},
                              timeTaken: a.timeTaken
                            }
                            navigate(`/quiz/${id}/result`, { state: { result: resultObj } })
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const currentQ = quiz.questions[currentQuestion]

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700' }}>
              {quiz.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          
          <div className="timer">
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar" style={{ marginBottom: '32px' }}>
          <div 
            className="progress-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Question */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <div className="card-body">
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              {currentQ.questionText}
            </h2>
            
            <div className="radio-group">
              {currentQ.options.map((option, index) => (
                <motion.label
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className={`radio-option ${answers[currentQuestion] === index ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerChange(currentQuestion, index)}
                  />
                  <span style={{ fontSize: '16px' }}>
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </motion.label>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '16px'
        }}>
          <button 
            onClick={prevQuestion}
            disabled={currentQuestion === 0 || !quiz.allowPrevious}
            className="btn btn-secondary"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index < currentQuestion && !quiz.allowPrevious) return
                  setCurrentQuestion(index)
                }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: answers[index] !== undefined 
                    ? 'var(--accent-color)' 
                    : currentQuestion === index 
                      ? 'var(--primary-color)' 
                      : 'var(--border)',
                  background: answers[index] !== undefined 
                    ? 'var(--accent-color)' 
                    : currentQuestion === index 
                      ? 'var(--primary-color)' 
                      : 'transparent',
                  color: answers[index] !== undefined || currentQuestion === index 
                    ? 'white' 
                    : 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentQuestion === quiz.questions.length - 1 ? (
              <button 
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="btn btn-primary"
              >
                <Flag size={16} />
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button 
                onClick={nextQuestion}
                className="btn btn-primary"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
      {/* Attempts moved to separate page `/quiz/:id/attempts` */}
    </div>
  )
}

export default QuizAttempt
