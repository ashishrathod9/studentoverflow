"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { useNavigate } from "react-router-dom"

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

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
      div.className = "fixed text-2xl opacity-10 pointer-events-none z-10"
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
    <div className="min-h-screen bg-violet-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => navigate("/")} className="text-2xl font-bold text-violet-600">
            StudentOverflow
          </button>
          <nav className="flex space-x-6">
            <button onClick={() => navigate("/questions")} className="text-gray-600 hover:text-violet-600">
              Questions
            </button>
            <button onClick={() => navigate("/past-papers")} className="text-gray-600 hover:text-violet-600">
              Past Papers
            </button>
            <button onClick={clearChat} className="text-red-600 hover:text-red-700 text-sm">
              Clear Chat
            </button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">AI Study Assistant</h1>

        <div ref={chatContainerRef} className="bg-white rounded-lg shadow-sm h-96 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`message-bubble max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user" ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-violet-100" : "text-gray-500"}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Questions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Explain the quadratic formula",
              "What is photosynthesis?",
              "How do I write a good essay?",
              "Solve this math problem for me",
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <p className="text-gray-700">{question}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
