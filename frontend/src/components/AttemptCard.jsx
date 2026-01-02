import React from 'react'
import { motion } from 'framer-motion'

const AttemptCard = ({ attempt, index, quiz, onView, onRetake }) => {
  const pct = Math.round((attempt.percentage || 0))
  let ringColor = 'var(--primary-color)'
  if (pct >= 75) ringColor = 'var(--accent-color)'
  else if (pct >= 50) ringColor = 'var(--warning-color)'
  else ringColor = 'var(--danger-color)'

  const ringStyle = {
    background: `conic-gradient(${ringColor} ${pct * 3.6}deg, var(--border) 0deg)`
  }

  return (
    <motion.div
      className="card attempt-card"
      whileHover={{ y: -6 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="attempt-left">
        <div className="attempt-progress" style={ringStyle}>
          <div className="attempt-progress-inner">
            <div className="attempt-pct">{pct}%</div>
          </div>
        </div>
      </div>

      <div className="attempt-center">
        <div className="attempt-title">Attempt #{index + 1}</div>
        <div className="attempt-sub">{attempt.score}/{attempt.totalMarks} • {new Date(attempt.createdAt).toLocaleString()}</div>

        <div className="attempt-chips">
          <span className="chip">Time: {attempt.timeTaken ?? '—'}s</span>
          <span className="chip">Q: {attempt.questionsAttempted ?? (quiz?.questions?.length ?? 0)}</span>
          <span className="chip">Duration: {quiz?.timeLimit ?? '—'}m</span>
        </div>
      </div>

      <div className="attempt-actions">
        <button
          className="btn btn-primary"
          onClick={() => onView(attempt)}
        >
          View
        </button>
        {onRetake && (
          <button
            className="btn btn-secondary"
            style={{ marginLeft: 8 }}
            onClick={() => onRetake(attempt)}
          >
            Retake
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default AttemptCard
