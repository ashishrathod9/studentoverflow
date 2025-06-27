"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Link, useNavigate } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const logoRef = useRef(null)
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"))
    // Create floating mathematical symbols
    createFloatingMathSymbols()
    createFloatingStudyElements()

    // Initial page load animations
    const tl = gsap.timeline()

    // Logo bounce-in with rotation and scale
    tl.fromTo(
      logoRef.current,
      { scale: 0, rotation: -360, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.5)" },
    )

    // Hero text with typewriter effect
    tl.fromTo(
      heroRef.current.children,
      { opacity: 0, scale: 0.5, y: 100, rotationX: 90 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotationX: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "back.out(1.7)",
      },
      "-=0.8",
    )

    // Animated mathematical equation
    animateMathEquation()

    // Feature cards with 3D flip animation
    gsap.fromTo(
      ".feature-card",
      {
        opacity: 0,
        y: 150,
        rotationY: 180,
        scale: 0.8,
      },
      {
        opacity: 1,
        y: 0,
        rotationY: 0,
        scale: 1,
        duration: 1.2,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      },
    )

    // Continuous animations
    startContinuousAnimations()

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const createFloatingMathSymbols = () => {
    const symbols = ["∑", "∫", "π", "√", "∞", "α", "β", "γ", "∂", "∇"]
    const container = document.createElement("div")
    container.className = "floating-container"
    document.body.appendChild(container)

    symbols.forEach((symbol, index) => {
      const element = document.createElement("div")
      element.textContent = symbol
      element.className = "floating-math"
      element.style.left = Math.random() * 100 + "%"
      element.style.top = Math.random() * 100 + "%"
      container.appendChild(element)

      gsap.to(element, {
        y: -100,
        rotation: 360,
        duration: 10 + Math.random() * 10,
        repeat: -1,
        ease: "none",
        delay: index * 0.5,
      })

      gsap.to(element, {
        x: Math.sin(index) * 50,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      })
    })
  }

  const createFloatingStudyElements = () => {
    const elements = ["📚", "✏️", "📐", "🔬", "📊", "💡", "🎓", "📝"]
    const container = document.createElement("div")
    container.className = "floating-container"
    document.body.appendChild(container)

    elements.forEach((emoji, index) => {
      const element = document.createElement("div")
      element.textContent = emoji
      element.className = "floating-study"
      element.style.left = Math.random() * 100 + "%"
      element.style.top = Math.random() * 100 + "%"
      container.appendChild(element)

      gsap.to(element, {
        y: -200,
        rotation: Math.random() * 360,
        duration: 15 + Math.random() * 10,
        repeat: -1,
        ease: "none",
        delay: index * 0.8,
      })
    })
  }

  

 const animateMathEquation = () => {
  const existing = document.querySelector(".floating-equation");
  if (existing) return; // Avoid duplicates

  const container = document.createElement("div");
  container.className = "floating-equation";

  const equation = "E = mc²";
  equation.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.className = "equation-char";
    span.style.setProperty("--index", index);
    container.appendChild(span);
  });

  document.body.appendChild(container);

  const chars = container.querySelectorAll(".equation-char");

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

  // Step 1: Animate chars apart
  tl.to(chars, {
    x: (i) => (i - chars.length / 2) * 40,
    y: () => gsap.utils.random(-30, -10),
    rotation: () => gsap.utils.random(-30, 30),
    opacity: 0.3,
    duration: 1,
    ease: "power2.out",
    stagger: 0.05,
  });

  // Step 2: Floating effect while apart
  tl.to(chars, {
    y: "+=10",
    rotation: "+=10",
    duration: 1.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: 2,
    stagger: {
      each: 0.05,
      yoyo: true,
    },
  });

  // Step 3: Return to center
  tl.to(chars, {
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 0.15,
    duration: 1,
    ease: "power3.inOut",
    stagger: 0.05,
  });
};

  

  const startContinuousAnimations = () => {
    // Pulsing glow effect on logo
    gsap.to(logoRef.current, {
      boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    })

    // Floating animation for feature cards
    gsap.utils.toArray(".feature-card").forEach((card, index) => {
      gsap.to(card, {
        y: -10,
        duration: 2 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: index * 0.3,
      })
    })
  }

  return (
    <div className="page-container">
      {/* Animated background particles */}
      <div className="background-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <div ref={logoRef} className="logo-icon">
              <span className="logo-text">S</span>
            </div>
            <span className="logo-title">StudentOverflow</span>
          </Link>
          <nav className="nav" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <Link to="/questions" className="nav-link">
              Questions
            </Link>
            <Link to="/past-papers" className="nav-link">
              Past Papers
            </Link>
            <Link to="/chat" className="nav-link">
              AI Chat
            </Link>
            {isLoggedIn && (
              <Link to="/profile" className="profile-icon-link" style={{ display: "flex", alignItems: "center", marginLeft: 8 }}>
                <span
                  style={{
                    display: "inline-flex",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#ede9fe",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: "#7c3aed",
                    boxShadow: "0 1px 4px rgba(124,58,237,0.08)",
                  }}
                  title="Profile"
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
                  </svg>
                </span>
              </Link>
            )}
            {!isLoggedIn && (
              <Link to="/login" className="login-nav-button">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div ref={heroRef} className="hero-content">
          <h1 className="hero-title">
            Your Academic <span className="gradient-text">Community</span>
          </h1>
          <p className="hero-subtitle">
            Ask questions, get answers, access past papers, and chat with AI - all in one place for students
          </p>
          <Link to="/ask" className="cta-button">
            Ask Your First Question ✨
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="features-section">
        <h2 className="section-title">Everything You Need</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon feature-icon-violet">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="feature-title">Q&A Community</h3>
            <p className="feature-description">
              Ask questions and get answers from fellow students and experts in your field.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon feature-icon-green">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="feature-title">Past Papers</h3>
            <p className="feature-description">
              Access a comprehensive collection of past examination papers for your studies.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon feature-icon-purple">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="feature-title">AI Chatbot</h3>
            <p className="feature-description">
              Get instant help from our AI assistant for quick answers and study guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 StudentOverflow. Built for students, by students. 🎓</p>
        </div>
      </footer>
    </div>
  )
}
