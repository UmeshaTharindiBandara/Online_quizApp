import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuiz } from '../context/QuizContext'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'

const EditQuiz = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchQuiz, updateQuiz } = useQuiz()
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    timeLimit: 30,
    isPublished: false,
    attemptsAllowed: 1,
    allowPrevious: true,
    quizPassword: ''
  })
  
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuiz()
  }, [id])

  const loadQuiz = async () => {
    const quiz = await fetchQuiz(id)
    if (quiz) {
      setQuizData({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        timeLimit: quiz.timeLimit,
        
        isPublished: quiz.isPublished,
        attemptsAllowed: quiz.attemptsAllowed || 1,
        allowPrevious: quiz.allowPrevious !== undefined ? quiz.allowPrevious : true,
        quizPassword: ''
      })
      setQuestions(quiz.questions || [])
    }
    setLoading(false)
  }

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'attemptsAllowed' ? parseInt(value || 1) : value)
    }))
  }

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuestions(prev => prev.map((question, index) => 
      index === questionIndex 
        ? { ...question, [field]: value }
        : question
    ))
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions(prev => prev.map((question, index) => 
      index === questionIndex 
        ? {
            ...question,
            options: question.options.map((option, oIndex) => 
              oIndex === optionIndex ? value : option
            )
          }
        : question
    ))
  }

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    }])
  }

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validation
    if (!quizData.title.trim()) {
      setError('Quiz title is required')
      setSaving(false)
      return
    }

    if (questions.some(q => !q.questionText.trim())) {
      setError('All questions must have text')
      setSaving(false)
      return
    }

    if (questions.some(q => q.options.some(opt => !opt.trim()))) {
      setError('All answer options must be filled')
      setSaving(false)
      return
    }

    const result = await updateQuiz(id, {
      ...quizData,
      questions
    })

    if (result.success) {
      navigate('/quizzes')
    } else {
      setError(result.message)
    }

    setSaving(false)
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
            Edit Quiz
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Update your quiz details and questions
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Quiz Details */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <div className="card-header">
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Quiz Details</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Quiz Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={quizData.title}
                    onChange={handleQuizChange}
                    className="form-input"
                    placeholder="Enter quiz title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={quizData.category}
                    onChange={handleQuizChange}
                    className="form-input"
                    placeholder="e.g., Mathematics, Science, History"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={quizData.description}
                  onChange={handleQuizChange}
                  className="form-textarea"
                  placeholder="Describe what this quiz covers"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={quizData.timeLimit}
                    onChange={handleQuizChange}
                    className="form-input"
                    min="1"
                    max="180"
                  />
                </div>
                
                
              </div>
              
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={quizData.isPublished}
                    onChange={handleQuizChange}
                  />
                  Publish quiz
                </label>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Attempts Allowed (per student)</label>
                  <input
                    type="number"
                    name="attemptsAllowed"
                    value={quizData.attemptsAllowed}
                    onChange={handleQuizChange}
                    className="form-input"
                    min="1"
                    max="10"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="allowPrevious"
                      checked={quizData.allowPrevious}
                      onChange={handleQuizChange}
                    />
                    Allow previous navigation during quiz
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quiz Password (leave empty to keep unchanged)</label>
                <input
                  type="password"
                  name="quizPassword"
                  value={quizData.quizPassword}
                  onChange={handleQuizChange}
                  className="form-input"
                  placeholder="Set a password to protect the quiz"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <div className="card-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
                Questions ({questions.length})
              </h2>
              <button 
                type="button" 
                onClick={addQuestion}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>
            <div className="card-body">
              {questions.map((question, questionIndex) => (
                <motion.div
                  key={questionIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card"
                  style={{ 
                    marginBottom: '24px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div className="card-header" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px 20px'
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                      Question {questionIndex + 1}
                    </h3>
                    {questions.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="btn btn-danger"
                        style={{ padding: '8px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="card-body" style={{ padding: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Question Text *</label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                        className="form-textarea"
                        placeholder="Enter your question"
                        rows="2"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Answer Options *</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex)}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            className="form-input"
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            required
                          />
                        </div>
                      ))}
                      <p style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-light)',
                        marginTop: '8px'
                      }}>
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Marks</label>
                      <input
                        type="number"
                        value={question.marks}
                        onChange={(e) => handleQuestionChange(questionIndex, 'marks', parseInt(e.target.value) || 1)}
                        className="form-input"
                        min="1"
                        max="10"
                        style={{ width: '100px' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={() => navigate('/quizzes')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default EditQuiz
