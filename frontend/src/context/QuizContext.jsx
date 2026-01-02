import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

const QuizContext = createContext()

export const useQuiz = () => {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}

export const QuizProvider = ({ children }) => {
  const [quizzes, setQuizzes] = useState([])
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/quiz')
      setQuizzes(response.data)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuiz = async (id) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/quiz/${id}`)
      setCurrentQuiz(response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching quiz:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createQuiz = async (quizData) => {
    try {
      const response = await axios.post('/api/quiz', quizData)
      setQuizzes(prev => [...prev, response.data])
      return { success: true, quiz: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create quiz' 
      }
    }
  }

  const verifyQuizPassword = async (quizId, password) => {
    try {
      const response = await axios.post(`/api/quiz/${quizId}/verify-password`, { password })
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Password verification failed' }
    }
  }

  const updateQuiz = async (id, quizData) => {
    try {
      const response = await axios.put(`/api/quiz/${id}`, quizData)
      setQuizzes(prev => prev.map(quiz => 
        quiz._id === id ? response.data : quiz
      ))
      return { success: true, quiz: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update quiz' 
      }
    }
  }

  const deleteQuiz = async (id) => {
    try {
      await axios.delete(`/api/quiz/${id}`)
      setQuizzes(prev => prev.filter(quiz => quiz._id !== id))
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete quiz' 
      }
    }
  }

  const submitQuizAttempt = async (quizId, answers, password) => {
    try {
      const response = await axios.post('/api/attempt/submit', {
        quizId,
        answers,
        password
      })
      return { success: true, result: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to submit quiz' 
      }
    }
  }

  const getUserAttempts = async (quizId) => {
    try {
      // Try relative URL first (should be proxied by Vite). In dev, if proxy isn't working,
      // fall back to direct backend URL on localhost:5000.
      const base = import.meta.env.DEV ? 'http://localhost:5000' : ''
      const url = `${base}/api/attempt/user/${quizId}`
      const response = await axios.get(url)
      return { success: true, attempts: response.data }
    } catch (error) {
      const status = error.response?.status
      const serverMsg = error.response?.data?.message || JSON.stringify(error.response?.data)
      return { success: false, message: `Failed to fetch attempts${status ? ` (status ${status})` : ''}: ${serverMsg}` }
    }
  }

  const value = {
    quizzes,
    currentQuiz,
    loading,
    fetchQuizzes,
    fetchQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    verifyQuizPassword,
    getUserAttempts,
    setCurrentQuiz
  }

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  )
}
