"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Link } from "react-router-dom"

gsap.registerPlugin(ScrollTrigger)

export default function PastPapersPage() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    year: "",
    board: "",
    subject: "",
  })
  const searchRef = useRef(null)
  const papersContainerRef = useRef(null)

  useEffect(() => {
    fetchPastPapers()
    createFloatingStudyElements()

    // Animate search bar with magical effect
    gsap.fromTo(
      searchRef.current,
      {
        opacity: 0,
        y: -50,
        scale: 0.9,
        rotationX: 45,
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

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const createFloatingStudyElements = () => {
    const elements = ["📚", "📄", "📊", "📐", "🔬", "⚗️", "🧮", "📝", "💡", "🎓", "∫", "∑", "π", "√"]

    elements.forEach((element, index) => {
      const div = document.createElement("div")
      div.textContent = element
      div.className = "floating-papers"
      div.style.left = Math.random() * 100 + "%"
      div.style.top = Math.random() * 100 + "%"
      document.body.appendChild(div)

      gsap.to(div, {
        y: -350,
        rotation: Math.random() * 360,
        duration: 18 + Math.random() * 12,
        repeat: -1,
        ease: "none",
        delay: index * 0.4,
      })

      gsap.to(div, {
        x: Math.sin(index * 0.5) * 80,
        duration: 5 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      })
    })
  }

  const fetchPastPapers = async () => {
    try {
      const response = await fetch("http://localhost:5128/api/pastpapersscrape/scrape")
      const data = await response.json()
      setPapers(data)
      setLoading(false)

      // Animate paper cards with 3D flip effect
      setTimeout(() => {
        gsap.fromTo(
          ".paper-card",
          {
            opacity: 0,
            scale: 0.7,
            y: 80,
            rotationY: 180,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            rotationY: 0,
            duration: 1,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: papersContainerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }, 100)
    } catch (error) {
      console.error("Error fetching past papers:", error)
      setLoading(false)
    }
  }

  const mockPapers = [
    {
      id: 1,
      title: "Mathematics Paper 1 - Pure Mathematics",
      subject: "Mathematics",
      year: "2023",
      board: "Cambridge",
      level: "A Level",
      downloadUrl: "#",
    },
    {
      id: 2,
      title: "Physics Paper 2 - Electricity and Magnetism",
      subject: "Physics",
      year: "2023",
      board: "Edexcel",
      level: "A Level",
      downloadUrl: "#",
    },
    {
      id: 3,
      title: "Chemistry Paper 1 - Organic Chemistry",
      subject: "Chemistry",
      year: "2022",
      board: "AQA",
      level: "A Level",
      downloadUrl: "#",
    },
    {
      id: 4,
      title: "Biology Paper 3 - Genetics and Evolution",
      subject: "Biology",
      year: "2023",
      board: "Cambridge",
      level: "A Level",
      downloadUrl: "#",
    },
  ]

  const displayPapers = papers.length > 0 ? papers : mockPapers

  const filteredPapers = displayPapers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = !filters.year || paper.year === filters.year
    const matchesBoard = !filters.board || paper.board === filters.board
    const matchesSubject = !filters.subject || paper.subject === filters.subject

    return matchesSearch && matchesYear && matchesBoard && matchesSubject
  })

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
            <Link to="/chat" className="nav-link">
              AI Chat
            </Link>
          </nav>
        </div>
      </header>

      <div className="content-wrapper">
        <h1 className="page-title centered">Past Papers 📚</h1>

        {/* Search and Filters */}
        <div ref={searchRef} className="search-container">
          <div className="search-grid">
            <div className="search-group">
              <input
                type="text"
                placeholder="🔍 Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-group">
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="search-select"
              >
                <option value="">📅 All Years</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
            <div className="search-group">
              <select
                value={filters.board}
                onChange={(e) => setFilters({ ...filters, board: e.target.value })}
                className="search-select"
              >
                <option value="">🏫 All Boards</option>
                <option value="Cambridge">Cambridge</option>
                <option value="Edexcel">Edexcel</option>
                <option value="AQA">AQA</option>
              </select>
            </div>
            <div className="search-group">
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="search-select"
              >
                <option value="">📖 All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring-inner"></div>
              <div className="spinner-icon">📚</div>
            </div>
          </div>
        ) : (
          <div ref={papersContainerRef} className="papers-grid">
            {filteredPapers.map((paper, index) => (
              <div
                key={paper.id}
                className="paper-card"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    y: -10,
                    scale: 1.05,
                    rotationY: 5,
                    duration: 0.3,
                    ease: "power2.out",
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    y: 0,
                    scale: 1,
                    rotationY: 0,
                    duration: 0.3,
                    ease: "power2.out",
                  })
                }}
              >
                <div className="paper-content">
                  <h3 className="paper-title">{paper.title}</h3>
                  <div className="paper-tags">
                    <span className="paper-tag subject">📚 {paper.subject}</span>
                    <span className="paper-tag year">📅 {paper.year}</span>
                    <span className="paper-tag board">🏫 {paper.board}</span>
                  </div>
                </div>
                <div className="paper-actions">
                  <span className="paper-level">🎓 {paper.level}</span>
                  <a href={paper.downloadUrl} className="download-button" download>
                    Download 📥
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPapers.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-title">No papers found matching your criteria.</p>
            <p className="empty-subtitle">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
