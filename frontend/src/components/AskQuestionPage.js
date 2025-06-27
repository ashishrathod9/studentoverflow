"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Link, useNavigate } from "react-router-dom"

export default function AskQuestionPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const formRef = useRef(null)
  const submitButtonRef = useRef(null)
  const toastRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    createFloatingMathElements()

    // Staggered 3D animation for form fields
    gsap.fromTo(
      formRef.current.children,
      {
        opacity: 0,
        y: 50,
        rotationX: 45,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
      },
    )

    // Submit button magical hover animation
    const button = submitButtonRef.current
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        scale: 1.1,
        boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)",
        duration: 0.3,
        ease: "power2.out",
      })
    })
    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        scale: 1,
        boxShadow: "0 4px 15px rgba(139, 92, 246, 0.2)",
        duration: 0.3,
        ease: "power2.out",
      })
    })
  }, [])

  const createFloatingMathElements = () => {
    const elements = ["∫", "∑", "√", "π", "∞", "∂", "∇", "α", "β", "γ", "📝", "💡", "🤔", "❓"]

    elements.forEach((element, index) => {
      const div = document.createElement("div")
      div.textContent = element
      div.className = "floating-math-ask"
      div.style.left = Math.random() * 100 + "%"
      div.style.top = Math.random() * 100 + "%"
      div.style.color = index % 2 === 0 ? "#8b5cf6" : "#a855f7"
      document.body.appendChild(div)

      gsap.to(div, {
        y: -400,
        rotation: 360,
        duration: 15 + Math.random() * 10,
        repeat: -1,
        ease: "none",
        delay: index * 0.3,
      })

      gsap.to(div, {
        x: Math.sin(index) * 100,
        duration: 4 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      })
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Animate submit button during submission
    gsap.to(submitButtonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    })

    try {
      const response = await fetch("http://localhost:5128/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.description,
          tags: formData.tags.split(",").map((tag) => tag.trim()),
        }),
      })

      if (response.ok) {
        // Show success toast with magical animation
        setShowToast(true)
        gsap.fromTo(
          toastRef.current,
          {
            opacity: 0,
            y: -100,
            scale: 0.5,
            rotation: -10,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
          },
        )

        // Sparkle effect
        createSparkleEffect()

        // Hide toast and redirect after 3 seconds
        setTimeout(() => {
          gsap.to(toastRef.current, {
            opacity: 0,
            y: -100,
            scale: 0.5,
            rotation: 10,
            duration: 0.5,
            ease: "back.in(1.7)",
            onComplete: () => {
              navigate("/questions")
            },
          })
        }, 3000)
      }
    } catch (error) {
      console.error("Error submitting question:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const createSparkleEffect = () => {
    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement("div")
      sparkle.textContent = "✨"
      sparkle.className = "sparkle"
      sparkle.style.left = Math.random() * 100 + "%"
      sparkle.style.top = Math.random() * 100 + "%"
      document.body.appendChild(sparkle)

      gsap.to(sparkle, {
        y: -200,
        x: (Math.random() - 0.5) * 400,
        rotation: 360,
        scale: 0,
        duration: 2,
        ease: "power2.out",
        onComplete: () => sparkle.remove(),
      })
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    // Animate input on change
    gsap.to(e.target, {
      scale: 1.02,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    })
  }

  return (
    <div className="page-container">
      {/* Toast Notification */}
      {showToast && (
        <div ref={toastRef} className="toast">
          <div className="toast-content">
            <span className="toast-icon">🎉</span>
            <span className="toast-text">Question submitted successfully!</span>
          </div>
        </div>
      )}

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
            <Link to="/questions" className="nav-link">
              Questions
            </Link>
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
        <h1 className="page-title centered">Ask a Question 🤔</h1>

        <div className="form-container">
          <form ref={formRef} onSubmit={handleSubmit} className="ask-form">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Question Title ✨
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="What's your question? Be specific and clear..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description 📝
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={10}
                className="form-textarea"
                placeholder="Provide detailed information about your question. Include what you've tried, what you expect, and any relevant context..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags" className="form-label">
                Tags 🏷️
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="form-input"
                placeholder="mathematics, physics, chemistry, biology (comma separated)"
              />
            </div>

            <div className="form-actions">
              <Link to="/questions" className="back-button">
                <span>←</span>
                <span>Back to Questions</span>
              </Link>
              <button ref={submitButtonRef} type="submit" disabled={isSubmitting} className="submit-button">
                {isSubmitting ? (
                  <div className="button-loading">
                    <div className="button-spinner"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="button-content">
                    <span>Post Question</span>
                    <span>🚀</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
