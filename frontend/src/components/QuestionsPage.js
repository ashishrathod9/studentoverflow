"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Link, useNavigate } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const askButtonRef = useRef(null)
  const questionsContainerRef = useRef(null)
  const [answeringId, setAnsweringId] = useState(null)
  const [answerText, setAnswerText] = useState("")
  const [answerLoading, setAnswerLoading] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())
  const [questionAnswers, setQuestionAnswers] = useState({})
  const [loadingAnswers, setLoadingAnswers] = useState({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuestions()
    createFloatingElements()
    setIsLoggedIn(!!localStorage.getItem("token"))

    // Magical pulsing animation for Ask Question button
    gsap.to(askButtonRef.current, {
      scale: 1.1,
      boxShadow: "0 0 25px rgba(139, 92, 246, 0.6)",
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const createFloatingElements = () => {
    const symbols = ["?", "!", "💡", "🤔", "📚", "✨", "🎯", "🔍"]

    symbols.forEach((symbol, index) => {
      const element = document.createElement("div")
      element.textContent = symbol
      element.className = "floating-question"
      element.style.left = Math.random() * 100 + "%"
      element.style.top = Math.random() * 100 + "%"
      document.body.appendChild(element)

      gsap.to(element, {
        y: -300,
        rotation: 360,
        duration: 12 + Math.random() * 8,
        repeat: -1,
        ease: "none",
        delay: index * 0.5,
      })
    })
  }

  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5128/api/questions")
      const data = await response.json()

      // Ensure data is properly formatted
      const formattedQuestions = Array.isArray(data)
        ? data.map((q) => ({
            id: q.id || Math.random(),
            title: q.title || "No title",
            tags: Array.isArray(q.tags) ? q.tags : [],
            author: q.author || "Anonymous",
            votes: Number(q.votes) || 0,
            answers: Number(q.answers) || 0,
            createdAt: q.createdAt || new Date().toISOString().split("T")[0],
          }))
        : []

      setQuestions(formattedQuestions)
      setLoading(false)

      // Animate question cards with staggered 3D effect
      setTimeout(() => {
        gsap.fromTo(
          ".question-card",
          {
            opacity: 0,
            y: 100,
            rotationX: 45,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: questionsContainerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }, 100)
    } catch (error) {
      console.error("Error fetching questions:", error)
      setQuestions([]) // Set to empty array on error
      setLoading(false)
    }
  }

  const fetchAnswersForQuestion = async (questionId) => {
    if (questionAnswers[questionId] || loadingAnswers[questionId]) return

    setLoadingAnswers((prev) => ({ ...prev, [questionId]: true }))
    try {
      const response = await fetch(`http://localhost:5128/api/answers/question/${questionId}`)
      if (response.ok) {
        const answers = await response.json()
        setQuestionAnswers((prev) => ({ ...prev, [questionId]: answers }))
      } else {
        console.error("Failed to fetch answers")
        setQuestionAnswers((prev) => ({ ...prev, [questionId]: [] }))
      }
    } catch (error) {
      console.error("Error fetching answers:", error)
      setQuestionAnswers((prev) => ({ ...prev, [questionId]: [] }))
    } finally {
      setLoadingAnswers((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  const toggleAnswers = (questionId) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
      fetchAnswersForQuestion(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const mockQuestions = [
    {
      id: 1,
      title: "How to solve quadratic equations using the quadratic formula?",
      tags: ["mathematics", "algebra", "equations"],
      author: "student123",
      votes: 15,
      answers: 3,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "What are the key differences between mitosis and meiosis?",
      tags: ["biology", "cell-division", "genetics"],
      author: "bioStudent",
      votes: 23,
      answers: 5,
      createdAt: "2024-01-14",
    },
    {
      id: 3,
      title: "How to write a proper essay introduction for English literature?",
      tags: ["english", "literature", "essay-writing"],
      author: "englishLover",
      votes: 8,
      answers: 2,
      createdAt: "2024-01-13",
    },
  ]

  const displayQuestions = Array.isArray(questions) && questions.length > 0 ? questions : mockQuestions

  const handleAnswerClick = (questionId) => {
    setAnsweringId(questionId)
    setAnswerText("")
  }

  const handleAnswerSubmit = async (questionId) => {
    if (!answerText.trim()) return
    setAnswerLoading(true)
    try {
      const response = await fetch(`http://localhost:5128/api/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          content: answerText,
        }),
      })
      if (response.ok) {
        setAnswerText("")
        setAnsweringId(null)
        // Refresh answers for this question
        setQuestionAnswers((prev) => ({ ...prev, [questionId]: undefined }))
        if (expandedQuestions.has(questionId)) {
          fetchAnswersForQuestion(questionId)
        }
        // Update answer count
        setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, answers: (q.answers || 0) + 1 } : q)))
      } else {
        alert("Failed to submit answer.")
      }
    } catch (err) {
      alert("Error submitting answer.")
    } finally {
      setAnswerLoading(false)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span className="logo-text">S</span>
            </div>
            <span className="logo-title">StudentOverflow</span>
          </Link>
          <nav className="nav">
            <Link to="/past-papers" className="nav-link">
              Past Papers
            </Link>
            <Link to="/chat" className="nav-link">
              AI Chat
            </Link>
          </nav>
        </div>
      </header>

      <div className="content-wrapper">
        <div className="page-header">
          <h1 className="page-title">All Questions ❓</h1>
          <Link to="/ask" ref={askButtonRef} className="ask-button">
            Ask Question ✨
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring-inner"></div>
            </div>
          </div>
        ) : (
          <div ref={questionsContainerRef} className="questions-container">
            {Array.isArray(displayQuestions) &&
              displayQuestions.map((question, index) => (
                <div
                  key={question.id || index}
                  className="question-card"
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      y: -5,
                      scale: 1.02,
                      duration: 0.3,
                      ease: "power2.out",
                    })
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      y: 0,
                      scale: 1,
                      duration: 0.3,
                      ease: "power2.out",
                    })
                  }}
                >
                  <div className="question-main">
                    <h3 className="question-title">{String(question.title || "No title")}</h3>
                    <div className="question-tags">
                      {Array.isArray(question.tags) &&
                        question.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="tag">
                            #{String(tag)}
                          </span>
                        ))}
                    </div>
                    <div className="question-meta">
                      <span>👤 {typeof question.author === 'object' ? (question.author?.username || question.author?.name || 'Anonymous') : (question.author || 'Anonymous')}</span>
                      <span>📅 {String(question.createdAt || 'Unknown date')}</span>
                    </div>
                  </div>
                  <div className="question-stats">
                    <div className="stat">
                      <div className="stat-number votes">{Number(question.votes) || 0}</div>
                      <div className="stat-label">votes</div>
                    </div>
                    <div className="stat">
                      <div className="stat-number answers">{Number(question.answers) || 0}</div>
                      <div className="stat-label">answers</div>
                    </div>
                  </div>

                  {/* Action buttons and answers only for logged-in users */}
                  {isLoggedIn ? (
                    <>
                      <div
                        className="question-actions"
                        style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}
                      >
                        <button
                          className="action-btn"
                          onClick={() => toggleAnswers(question.id)}
                          style={{
                            background: expandedQuestions.has(question.id) ? "#7c3aed" : "#f3f4f6",
                            color: expandedQuestions.has(question.id) ? "#fff" : "#374151",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {expandedQuestions.has(question.id) ? "Hide Answers" : `View Answers (${question.answers || 0})`}
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleAnswerClick(question.id)}
                          style={{
                            background: answeringId === question.id ? "#10b981" : "#f3f4f6",
                            color: answeringId === question.id ? "#fff" : "#374151",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "14px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {answeringId === question.id ? "Cancel" : "Answer"}
                        </button>
                      </div>

                      {/* Answers section */}
                      {expandedQuestions.has(question.id) && (
                        <div
                          className="answers-section"
                          style={{
                            marginTop: "16px",
                            borderTop: "1px solid #e5e7eb",
                            paddingTop: "16px",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              marginBottom: "12px",
                              color: "#374151",
                            }}
                          >
                            Answers ({questionAnswers[question.id]?.length || 0})
                          </h4>

                          {loadingAnswers[question.id] ? (
                            <div style={{ textAlign: "center", padding: "20px" }}>
                              <div
                                style={{
                                  display: "inline-block",
                                  width: "20px",
                                  height: "20px",
                                  border: "2px solid #f3f3f3",
                                  borderTop: "2px solid #7c3aed",
                                  borderRadius: "50%",
                                  animation: "spin 1s linear infinite",
                                }}
                              ></div>
                              <p style={{ marginTop: "8px", color: "#6b7280" }}>Loading answers...</p>
                            </div>
                          ) : questionAnswers[question.id]?.length > 0 ? (
                            <div className="answers-list">
                              {questionAnswers[question.id].map((answer, answerIndex) => (
                                <div
                                  key={answer.id || answerIndex}
                                  className="answer-item"
                                  style={{
                                    background: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    marginBottom: "8px",
                                    position: "relative",
                                  }}
                                >
                                  {answer.isAccepted && (
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: "8px",
                                        right: "8px",
                                        background: "#10b981",
                                        color: "white",
                                        fontSize: "12px",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      ✓ Accepted
                                    </div>
                                  )}

                                  <div
                                    className="answer-content"
                                    style={{
                                      marginBottom: "8px",
                                      lineHeight: "1.5",
                                      color: "#374151",
                                    }}
                                  >
                                    {String(answer.content || answer.answer || "No content")}
                                  </div>

                                  <div
                                    className="answer-meta"
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      fontSize: "12px",
                                      color: "#6b7280",
                                    }}
                                  >
                                    <div>
                                      <span>👤 {String(answer.author || answer.authorName || "Anonymous")}</span>
                                      <span style={{ marginLeft: "12px" }}>
                                        📅{" "}
                                        {answer.createdAt
                                          ? new Date(answer.createdAt).toLocaleDateString()
                                          : "Unknown date"}
                                      </span>
                                    </div>
                                    <div
                                      className="answer-votes"
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <span>👍 {Number(answer.votes) || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              style={{
                                textAlign: "center",
                                padding: "20px",
                                color: "#6b7280",
                                fontStyle: "italic",
                              }}
                            >
                              No answers yet. Be the first to answer!
                            </div>
                          )}
                        </div>
                      )}

                      {/* Answer form */}
                      {answeringId === question.id && (
                        <div
                          className="answer-form"
                          style={{
                            marginTop: "16px",
                            borderTop: "1px solid #e5e7eb",
                            paddingTop: "16px",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              marginBottom: "8px",
                              color: "#374151",
                            }}
                          >
                            Your Answer
                          </h4>
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            rows={4}
                            placeholder="Write your answer here..."
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid #d1d5db",
                              fontSize: "14px",
                              fontFamily: "inherit",
                              resize: "vertical",
                              minHeight: "100px",
                            }}
                            disabled={answerLoading}
                          />
                          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleAnswerSubmit(question.id)}
                              disabled={answerLoading || !answerText.trim()}
                              style={{
                                background: answerLoading || !answerText.trim() ? "#9ca3af" : "#7c3aed",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 16px",
                                fontSize: "14px",
                                fontWeight: "500",
                                cursor: answerLoading || !answerText.trim() ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              {answerLoading ? "Submitting..." : "Submit Answer"}
                            </button>
                            <button
                              onClick={() => {
                                setAnsweringId(null)
                                setAnswerText("")
                              }}
                              type="button"
                              style={{
                                background: "#f3f4f6",
                                color: "#374151",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 16px",
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ marginTop: "16px", color: "#7c3aed", fontWeight: 500 }}>
                      <span>
                        <Link to="/login" style={{ color: "#7c3aed", textDecoration: "underline" }}>
                          Log in
                        </Link>{" "}
                        to view and answer questions.
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
