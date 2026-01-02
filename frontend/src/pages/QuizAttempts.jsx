import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuiz } from '../context/QuizContext'
import AttemptCard from '../components/AttemptCard'
import { useMemo } from 'react'

const QuizAttempts = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getUserAttempts, fetchQuiz } = useQuiz()

  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [filter, setFilter] = useState('all') // all | passed | failed
  const [sortBy, setSortBy] = useState('newest') // newest | oldest | highest | lowest
  const [query, setQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const q = await fetchQuiz(id)
      setQuiz(q)
      const res = await getUserAttempts(id)
      if (res.success) {
        setAttempts(res.attempts)
      } else {
        alert(res.message)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="loading"><div className="spinner"/></div>

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 style={{ marginBottom: '16px' }}>My Attempts</h2>

        {/* Quiz details header */}
        {quiz && (
          <div className="card " style={{ marginBottom: '16px' }}>
            <div className="card-body">
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{quiz.title}</h3>
              {quiz.description && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{quiz.description}</p>
              )}
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                <span>{quiz.questions?.length || 0} Questions</span>
                <span>{quiz.timeLimit} mins</span>
                <span>Attempts: {quiz.attemptsMade ?? 0}/{quiz.attemptsAllowed ?? 1}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>

        {attempts.length === 0 ? (
          <div className="card">
            <div className="card-body">No attempts yet.</div>
          </div>
        ) : (
          <AttemptsList
            attempts={attempts}
            quiz={quiz}
            query={query}
            filter={filter}
            sortBy={sortBy}
            onView={(attempt) => {
              const resultObj = {
                quiz,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                percentage: attempt.percentage,
                answers: attempt.answers || {},
                timeTaken: attempt.timeTaken
              }
              navigate(`/quiz/${id}/result`, { state: { result: resultObj } })
            }}
            
          />
        )}
        </div>
      </motion.div>

    </div>
  )
}

export default QuizAttempts

/* Helper list component placed at end to keep file localized. */
function AttemptsList({ attempts, quiz, query, filter, sortBy, onView, onRetake }) {
  const filtered = useMemo(() => {
    let arr = (attempts || []).slice()
    if (filter === 'passed') arr = arr.filter(a => (a.percentage || 0) >= 50)
    if (filter === 'failed') arr = arr.filter(a => (a.percentage || 0) < 50)
    if (query) {
      const q = query.toLowerCase()
      arr = arr.filter(a => {
        const date = new Date(a.createdAt).toLocaleString().toLowerCase()
        const pct = String(Math.round(a.percentage || 0))
        return date.includes(q) || pct.includes(q) || String(a.score).includes(q)
      })
    }

    if (sortBy === 'newest') arr.sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
    if (sortBy === 'oldest') arr.sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt))
    if (sortBy === 'highest') arr.sort((x, y) => (y.percentage || 0) - (x.percentage || 0))
    if (sortBy === 'lowest') arr.sort((x, y) => (x.percentage || 0) - (y.percentage || 0))

    return arr
  }, [attempts, filter, query, sortBy])

  return (
    <div className="grid grid-2">
      {filtered.map((a, idx) => (
        <AttemptCard
          key={a._id || idx}
          index={idx}
          attempt={a}
          quiz={quiz}
          onView={onView}
          onRetake={onRetake}
        />
      ))}
    </div>
  )
}
