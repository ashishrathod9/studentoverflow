"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Link } from "react-router-dom"

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    initializeChat()
    createFloatingAIElements()

    // Animate chat container with 3D effect
    gsap.fromTo(
      chatContainerRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.9,
        rotationX: 15,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      },
    )

    // Pulsing animation for input field
    gsap.to(inputRef.current, {
      boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
    animateNewMessage()
  }, [messages])

  const createFloatingAIElements = () => {
    const elements = ["🤖", "💭", "🧠", "⚡", "✨", "🔮", "💡", "🎯", "∫", "∑", "AI", "∞", "π", "√"]

    elements.forEach((element, index) => {
      const div = document.createElement("div")
      div.textContent = element
      div.className = "floating-ai"
      div.style.left = Math.random() * 100 + "%"
      div.style.top = Math.random() * 100 + "%"
      div.style.color = index % 3 === 0 ? "#8b5cf6" : index % 3 === 1 ? "#a855f7" : "#6366f1"
      document.body.appendChild(div)

      gsap.to(div, {
        y: -400,
        rotation: 360,
        duration: 20 + Math.random() * 15,
        repeat: -1,
        ease: "none",
        delay: index * 0.5,
      })

      gsap.to(div, {
        x: Math.sin(index * 0.7) * 120,
        duration: 6 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      })
    })
  }

  const animateNewMessage = () => {
    const lastMessage = document.querySelector(".message-bubble:last-child")
    if (lastMessage) {
      gsap.fromTo(
        lastMessage,
        {
          opacity: 0,
          scale: 0.5,
          y: 30,
          rotationX: 45,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
      )
    }
  }

  const initializeChat = async () => {
    try {
      const response = await fetch("http://localhost:5128/api/chat/session")
      const data = await response.json()
      setSessionId(data.sessionId)

      // Add welcome message with animation
      const welcomeMessage = {
        id: 1,
        text: "Hello! I'm your AI study assistant. How can I help you today? 🤖✨",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Error initializing chat:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5128/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: sessionId,
        }),
      })

      const data = await response.json()

      const aiMessage = {
        id: Date.now() + 1,
        text: data.response || "I'm sorry, I couldn't process your request right now.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    try {
      await fetch(`http://localhost:5128/api/chat/history?sessionId=${sessionId}`, {
        method: "DELETE",
      })
      setMessages([
        {
          id: 1,
          text: "Chat cleared! How can I help you?",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
    } catch (error) {
      console.error("Error clearing chat:", error)
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
            <Link to="/questions" className="nav-link">
              Questions
            </Link>
            <Link to="/past-papers" className="nav-link">
              Past Papers
            </Link>
            <button onClick={clearChat} className="nav-link" style={{ color: "#ef4444" }}>
              Clear Chat
            </button>
          </nav>
        </div>
      </header>

      <div className="content-wrapper">
        <h1 className="page-title">AI Study Assistant 🤖</h1>

        <div ref={chatContainerRef} className="chat-container">
          {/* Messages */}
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender === "user" ? "message-user" : "message-ai"}`}>
                <div className="message-bubble">
                  <p className="message-text">{message.text}</p>
                  <p className="message-time">{message.timestamp}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message message-ai">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <form onSubmit={sendMessage} className="chat-form">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="chat-input"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !inputMessage.trim()} className="chat-send-button">
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="quick-questions">
          <h3 className="quick-questions-title">Quick Questions</h3>
          <div className="quick-questions-grid">
            {[
              "Explain the quadratic formula",
              "What is photosynthesis?",
              "How do I write a good essay?",
              "Solve this math problem for me",
            ].map((question, index) => (
              <button key={index} onClick={() => setInputMessage(question)} className="quick-question-button">
                <p>{question}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
