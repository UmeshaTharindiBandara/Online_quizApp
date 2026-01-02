import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import { 
  Plus, 
  BookOpen, 
  Users, 
  Trophy, 
  Clock,
  BarChart3,
  Play
} from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const { user } = useAuth()
  const { fetchQuizzes, quizzes } = useQuiz()
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    completedQuizzes: 0
  })
  const [recentQuizzes, setRecentQuizzes] = useState([])

  useEffect(() => {
    fetchQuizzes()
    fetchStats()
    fetchRecentQuizzes()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentQuizzes = async () => {
    try {
      const response = await axios.get('/api/quiz/recent')
      setRecentQuizzes(response.data)
    } catch (error) {
      console.error('Error fetching recent quizzes:', error)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            {isAdmin 
              ? 'Manage your quizzes and track student performance'
              : 'Continue your learning journey with available quizzes'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-3" style={{ marginBottom: '40px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card stats-card"
          >
            <BookOpen size={32} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
            <div className="stats-number">{stats.totalQuizzes}</div>
            <div className="stats-label">
              {isAdmin ? 'Total Quizzes' : 'Available Quizzes'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card stats-card"
          >
            <Users size={32} color="var(--accent-color)" style={{ marginBottom: '16px' }} />
            <div className="stats-number">{stats.totalAttempts}</div>
            <div className="stats-label">
              {isAdmin ? 'Total Attempts' : 'Quiz Attempts'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card stats-card"
          >
            <Trophy size={32} color="var(--warning-color)" style={{ marginBottom: '16px' }} />
            <div className="stats-number">{stats.averageScore}%</div>
            <div className="stats-label">Average Score</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-2" style={{ marginBottom: '40px' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card"
          >
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Quick Actions</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isAdmin ? (
                  <>
                    <Link to="/create-quiz" className="btn btn-primary">
                      <Plus size={16} />
                      Create New Quiz
                    </Link>
                    <Link to="/quizzes" className="btn btn-secondary">
                      <BookOpen size={16} />
                      Manage Quizzes
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/quizzes" className="btn btn-primary">
                      <Play size={16} />
                      Browse Quizzes
                    </Link>
                    <Link to="/quizzes" className="btn btn-secondary">
                      <Clock size={16} />
                      Continue Learning
                    </Link>
                  </>
                )}
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
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
                {isAdmin ? 'Recent Activity' : 'Your Progress'}
              </h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <BarChart3 size={48} color="var(--primary-color)" />
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)' }}>
                    {stats.completedQuizzes}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {isAdmin ? 'Active Quizzes' : 'Completed Quizzes'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card"
        >
          <div className="card-header">
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
              {isAdmin ? 'Recent Quizzes' : 'Available Quizzes'}
            </h2>
          </div>
          <div className="card-body">
            {recentQuizzes.length > 0 ? (
              <div className="grid grid-2">
                {recentQuizzes.slice(0, 4).map((quiz, index) => (
                  <motion.div
                    key={quiz._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="card"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div className="card-body" style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                        {quiz.title}
                      </h3>
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '14px',
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {quiz.description}
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontSize: '12px',
                        color: 'var(--text-light)',
                        marginBottom: '16px'
                      }}>
                        <span>{quiz.questions?.length || 0} Questions</span>
                        <span>{quiz.timeLimit} mins</span>
                      </div>
                      {isAdmin ? (
                        <Link 
                          to={`/quiz/${quiz._id}/analytics`} 
                          className="btn btn-secondary"
                          style={{ width: '100%' }}
                        >
                          <BarChart3 size={14} />
                          View Analytics
                        </Link>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {quiz.canAttempt === false ? (
                            <Link
                              to={`/quiz/${quiz._id}/attempts`}
                              className="btn btn-secondary"
                              style={{ width: '100%' }}
                            >
                              View Attempts
                            </Link>
                          ) : (
                            <>
                              <Link 
                                to={`/quiz/${quiz._id}/attempt`} 
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                              >
                                <Play size={14} />
                                Start Quiz
                              </Link>
                              <Link
                                to={`/quiz/${quiz._id}/attempts`}
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                              >
                                View Attempts
                              </Link>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: 'var(--text-secondary)'
              }}>
                <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No quizzes available yet.</p>
                {isAdmin && (
                  <Link to="/create-quiz" className="btn btn-primary" style={{ marginTop: '16px' }}>
                    Create Your First Quiz
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Dashboard
