import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  Target,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react'
import axios from 'axios'

const QuizAnalytics = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [id])

  const fetchAnalytics = async () => {
    try {
      const [quizResponse, analyticsResponse] = await Promise.all([
        axios.get(`/api/quiz/${id}`),
        axios.get(`/api/analytics/${id}`)
      ])
      
      setQuiz(quizResponse.data)
      setAnalytics(analyticsResponse.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!quiz || !analytics) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>Analytics not available</h2>
            <button onClick={() => navigate('/quizzes')} className="btn btn-primary">
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const {
    totalAttempts,
    averageScore,
    highestScore,
    lowestScore,
    averageTime,
    recentAttempts,
    questionAnalytics
  } = analytics

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => navigate('/quizzes')}
            className="btn btn-secondary"
            style={{ marginBottom: '16px' }}
          >
            <ArrowLeft size={16} />
            Back to Quizzes
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Quiz Analytics
          </h1>
          <h2 style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {quiz.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Detailed performance insights and statistics
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-3" style={{ marginBottom: '32px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card stats-card"
          >
            <Users size={32} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
            <div className="stats-number">{totalAttempts}</div>
            <div className="stats-label">Total Attempts</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card stats-card"
          >
            <Trophy size={32} color="var(--warning-color)" style={{ marginBottom: '16px' }} />
            <div className="stats-number">{averageScore.toFixed(1)}%</div>
            <div className="stats-label">Average Score</div>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-2" style={{ marginBottom: '32px' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <div className="card-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Performance Metrics</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Highest Score</span>
                  <span style={{ fontWeight: '600', color: 'var(--accent-color)' }}>
                    {highestScore}%
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Lowest Score</span>
                  <span style={{ fontWeight: '600', color: 'var(--danger-color)' }}>
                    {lowestScore}%
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Average Time</span>
                  <span style={{ fontWeight: '600' }}>
                    {Math.round(averageTime / 60)} minutes
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Quiz Duration</span>
                  <span style={{ fontWeight: '600' }}>
                    {quiz.timeLimit} minutes
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card"
          >
            <div className="card-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Quiz Information</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Questions</span>
                  <span style={{ fontWeight: '600' }}>
                    {quiz.questions.length}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Category</span>
                  <span style={{ fontWeight: '600' }}>
                    {quiz.category || 'General'}
                  </span>
                </div>
                
                
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span style={{
                    fontWeight: '600',
                    color: quiz.isPublished ? 'var(--accent-color)' : 'var(--warning-color)'
                  }}>
                    {quiz.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Question Analytics */}
        {questionAnalytics && questionAnalytics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card"
            style={{ marginBottom: '32px' }}
          >
            <div className="card-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Question Performance</h3>
            </div>
            <div className="card-body">
              {questionAnalytics.map((qAnalytics, index) => (
                <div 
                  key={index}
                  style={{ 
                    marginBottom: '24px',
                    padding: '20px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    Question {index + 1}
                  </h4>
                  <p style={{ 
                    color: 'var(--text-secondary)',
                    marginBottom: '16px'
                  }}>
                    {quiz.questions[index]?.questionText}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Correct Answers
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '100px',
                        height: '8px',
                        background: 'var(--border)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${qAnalytics.correctPercentage}%`,
                          height: '100%',
                          background: qAnalytics.correctPercentage >= 70 
                            ? 'var(--accent-color)' 
                            : qAnalytics.correctPercentage >= 50 
                              ? 'var(--warning-color)' 
                              : 'var(--danger-color)'
                        }} />
                      </div>
                      <span style={{ 
                        fontWeight: '600',
                        color: qAnalytics.correctPercentage >= 70 
                          ? 'var(--accent-color)' 
                          : qAnalytics.correctPercentage >= 50 
                            ? 'var(--warning-color)' 
                            : 'var(--danger-color)'
                      }}>
                        {qAnalytics.correctPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Attempts */}
        {recentAttempts && recentAttempts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="card"
          >
            <div className="card-header">
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Attempts</h3>
            </div>
            <div className="card-body">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'left',
                        color: 'var(--text-secondary)',
                        fontWeight: '600'
                      }}>
                        Student
                      </th>
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontWeight: '600'
                      }}>
                        Score
                      </th>
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontWeight: '600'
                      }}>
                        Time Taken
                      </th>
                      
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontWeight: '600'
                      }}>
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttempts.map((attempt, index) => (
                      <tr 
                        key={index}
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <td style={{ padding: '12px' }}>
                          {attempt.userName}
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center',
                          fontWeight: '600'
                        }}>
                          {attempt.percentage.toFixed(1)}%
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center'
                        }}>
                          {Math.round(attempt.timeTaken / 60)} min
                        </td>
                        
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center',
                          color: 'var(--text-secondary)',
                          fontSize: '14px'
                        }}>
                          {new Date(attempt.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default QuizAnalytics
