import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import { 
  Plus, 
  Play, 
  Edit, 
  Trash2, 
  BarChart3,
  Clock,
  Users,
  BookOpen,
  Search
} from 'lucide-react'

const QuizList = () => {
  const { user } = useAuth()
  const { quizzes, fetchQuizzes, deleteQuiz, loading } = useQuiz()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredQuizzes, setFilteredQuizzes] = useState([])

  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    const filtered = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredQuizzes(filtered)
  }, [quizzes, searchTerm])

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      const result = await deleteQuiz(quizId)
      if (!result.success) {
        alert(result.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
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
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              {isAdmin ? 'Manage Quizzes' : 'Available Quizzes'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isAdmin 
                ? 'Create, edit, and manage your quiz collection'
                : 'Choose a quiz to test your knowledge'
              }
            </p>
          </div>
          
          {isAdmin && (
            <Link to="/create-quiz" className="btn btn-primary">
              <Plus size={16} />
              Create Quiz
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)'
                }} 
              />
              <input
                type="text"
                placeholder="Search quizzes by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-2">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="card"
              >
                <div className="card-body">
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                        {quiz.title}
                      </h3>
                      <span style={{
                        padding: '4px 8px',
                        background: quiz.isPublished ? 'var(--accent-color)' : 'var(--warning-color)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '14px',
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {quiz.description}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '16px',
                      fontSize: '12px',
                      color: 'var(--text-light)',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={12} />
                        {quiz.questions?.length || 0} Questions
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {quiz.timeLimit} mins
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} />
                        {quiz.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {isAdmin ? (
                      <>
                        <Link 
                          to={`/edit-quiz/${quiz._id}`} 
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                        >
                          <Edit size={14} />
                          Edit
                        </Link>
                        <Link 
                          to={`/quiz/${quiz._id}/analytics`} 
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                        >
                          <BarChart3 size={14} />
                          Analytics
                        </Link>
                        <button 
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="btn btn-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      quiz.isPublished && (
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          {quiz.canAttempt !== false && (
                            <button
                              onClick={() => navigate(`/quiz/${quiz._id}/attempt`)}
                              className="btn btn-primary"
                              style={{ flex: 1 }}
                            >
                              <Play size={14} />
                              Start Quiz
                            </button>
                          )}

                          <button
                            onClick={() => navigate(`/quiz/${quiz._id}/attempts`)}
                            className="btn btn-secondary"
                            style={{ minWidth: '140px' }}
                          >
                            View Attempts
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="card-body" style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <BookOpen size={64} style={{ marginBottom: '24px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                {searchTerm ? 'No quizzes found' : 'No quizzes available'}
              </h3>
              <p style={{ marginBottom: '24px' }}>
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : isAdmin 
                    ? 'Create your first quiz to get started'
                    : 'Check back later for new quizzes'
                }
              </p>
              {isAdmin && !searchTerm && (
                <Link to="/create-quiz" className="btn btn-primary">
                  <Plus size={16} />
                  Create Your First Quiz
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default QuizList
