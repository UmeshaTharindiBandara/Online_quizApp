import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { QuizProvider } from './context/QuizContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import QuizList from './pages/QuizList'
import CreateQuiz from './pages/CreateQuiz'
import EditQuiz from './pages/EditQuiz'
import QuizAttempt from './pages/QuizAttempt'
import QuizResult from './pages/QuizResult'
import QuizAnalytics from './pages/QuizAnalytics'
import QuizAttempts from './pages/QuizAttempts'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/quizzes" 
                  element={
                    <ProtectedRoute>
                      <QuizList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create-quiz" 
                  element={
                    <ProtectedRoute adminOnly>
                      <CreateQuiz />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-quiz/:id" 
                  element={
                    <ProtectedRoute adminOnly>
                      <EditQuiz />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/quiz/:id/attempt" 
                  element={
                    <ProtectedRoute>
                      <QuizAttempt />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/quiz/:id/result" 
                  element={
                    <ProtectedRoute>
                      <QuizResult />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/quiz/:id/attempts" 
                  element={
                    <ProtectedRoute>
                      <QuizAttempts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/quiz/:id/analytics" 
                  element={
                    <ProtectedRoute adminOnly>
                      <QuizAnalytics />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </QuizProvider>
    </AuthProvider>
  )
}

export default App
