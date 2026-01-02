import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  Home,
  RotateCcw
} from 'lucide-react'

const QuizResult = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result)
    } else {
      // Redirect if no result data
      navigate('/quizzes')
    }
  }, [location.state, navigate])

  if (!result) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  const { quiz, score, totalMarks, percentage, answers, timeTaken } = result

  const getScoreClass = () => {
    if (percentage >= 80) return 'score-excellent'
    if (percentage >= 60) return 'score-good'
    return 'score-poor'
  }

  const getScoreMessage = () => {
    if (percentage >= 80) return 'Excellent work!'
    if (percentage >= 60) return 'Good job!'
    return 'Keep practicing!'
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Result Header */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`score-circle ${getScoreClass()}`}
            >
              {percentage}%
            </motion.div>
            
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              {getScoreMessage()}
            </h1>
            
            <p style={{ 
              fontSize: '18px', 
              color: 'var(--text-secondary)',
              marginBottom: '24px'
            }}>
              You scored {score} out of {totalMarks} marks
            </p>
            
            {/* Pass/fail removed — show percentage and score only */}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-3" style={{ marginBottom: '32px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card stats-card"
          >
            <Trophy size={32} color="var(--warning-color)" style={{ marginBottom: '16px' }} />
            <div className="stats-number">{score}/{totalMarks}</div>
            <div className="stats-label">Final Score</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card stats-card"
          >
            <Target size={32} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
            <div className="stats-number">{percentage}%</div>
            <div className="stats-label">Percentage</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card stats-card"
          >
            <Clock size={32} color="var(--accent-color)" style={{ marginBottom: '16px' }} />
            <div className="stats-number">{Math.round(timeTaken / 60)}</div>
            <div className="stats-label">Minutes Taken</div>
          </motion.div>
        </div>

        {/* Answer Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card"
          style={{ marginBottom: '32px' }}
        >
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Answer Review</h2>
          </div>
          <div className="card-body">
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[index]
              const isCorrect = userAnswer === question.correctAnswer
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="card"
                  style={{ 
                    marginBottom: '20px',
                    border: `2px solid ${isCorrect ? 'var(--accent-color)' : 'var(--danger-color)'}`
                  }}
                >
                  <div className="card-body" style={{ padding: '20px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      {isCorrect ? (
                        <CheckCircle size={20} color="var(--accent-color)" />
                      ) : (
                        <XCircle size={20} color="var(--danger-color)" />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}>
                          Question {index + 1}
                        </h3>
                        <p style={{ marginBottom: '16px' }}>
                          {question.questionText}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ paddingLeft: '32px' }}>
                      {question.options.map((option, optionIndex) => {
                        const isUserAnswer = userAnswer === optionIndex
                        const isCorrectAnswer = question.correctAnswer === optionIndex
                        
                        let optionStyle = {
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '8px',
                          border: '1px solid var(--border)'
                        }
                        
                        if (isCorrectAnswer) {
                          optionStyle.background = '#f0fdf4'
                          optionStyle.borderColor = 'var(--accent-color)'
                          optionStyle.color = '#166534'
                        } else if (isUserAnswer && !isCorrect) {
                          optionStyle.background = '#fef2f2'
                          optionStyle.borderColor = 'var(--danger-color)'
                          optionStyle.color = '#991b1b'
                        }
                        
                        return (
                          <div key={optionIndex} style={optionStyle}>
                            <span style={{ fontWeight: '500' }}>
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>{' '}
                            {option}
                            {isCorrectAnswer && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontWeight: '600',
                                color: 'var(--accent-color)'
                              }}>
                                ✓ Correct
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontWeight: '600',
                                color: 'var(--danger-color)'
                              }}>
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        )
                      })}
                      
                      {userAnswer === undefined && (
                        <div style={{
                          padding: '12px 16px',
                          background: '#fef3c7',
                          border: '1px solid var(--warning-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#92400e',
                          fontWeight: '500'
                        }}>
                          No answer provided
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            <Home size={16} />
            Back to Dashboard
          </button>
          
          <button 
            onClick={() => navigate('/quizzes')}
            className="btn btn-primary"
          >
            <RotateCcw size={16} />
            Take Another Quiz
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default QuizResult
