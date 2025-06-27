

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useNavigate } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const askButtonRef = useRef(null)
  const questionsContainerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuestions()
    createFloatingElements()

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
      element.className = "fixed text-2xl opacity-20 pointer-events-none z-10"
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
      setQuestions(data)
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
      setLoading(false)
    }
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

  const displayQuestions = questions.length > 0 ? questions : mockQuestions

  const navigateTo = (path) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 bg-violet-200 rounded-full opacity-10 -top-36 -left-36 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-purple-200 rounded-full opacity-10 -bottom-48 -right-48 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-violet-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigateTo("/")}
            className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            StudentOverflow
          </button>
          <nav className="flex space-x-6">
            <button
              onClick={() => navigateTo("/past-papers")}
              className="text-gray-600 hover:text-violet-600 transform hover:scale-105 transition-all duration-200"
            >
              Past Papers
            </button>
            <button
              onClick={() => navigateTo("/chat")}
              className="text-gray-600 hover:text-violet-600 transform hover:scale-105 transition-all duration-200"
            >
              AI Chat
            </button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            All Questions ❓
          </h1>
          <button
            ref={askButtonRef}
            onClick={() => navigateTo("/ask-question")}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-semibold transform hover:scale-105"
          >
            Ask Question ✨
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-600 border-t-transparent absolute top-0"></div>
            </div>
          </div>
        ) : (
          <div ref={questionsContainerRef} className="questions-container space-y-6">
            {displayQuestions.map((question, index) => (
              <div
                key={question.id}
                className="question-card bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-l-4 border-violet-500 group hover:border-purple-500 hover:bg-white/90"
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 hover:text-violet-600 cursor-pointer transition-colors duration-300 group-hover:text-violet-600">
                      {question.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags?.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 px-4 py-2 rounded-full text-sm font-medium hover:from-violet-200 hover:to-purple-200 transition-all duration-300 cursor-pointer transform hover:scale-105"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">👤 {question.author}</span>
                      <span className="flex items-center">📅 {question.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-4 ml-8">
                    <div className="text-center group-hover:scale-110 transition-transform duration-300">
                      <div className="text-3xl font-bold text-violet-600">{question.votes}</div>
                      <div className="text-xs text-gray-500 font-medium">votes</div>
                    </div>
                    <div className="text-center group-hover:scale-110 transition-transform duration-300">
                      <div className="text-3xl font-bold text-green-600">{question.answers}</div>
                      <div className="text-xs text-gray-500 font-medium">answers</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
