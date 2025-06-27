"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()

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
      div.className = "fixed text-2xl opacity-15 pointer-events-none z-10"
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

  const navigateTo = (path) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-80 h-80 bg-violet-200 rounded-full opacity-10 -top-40 -left-40 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-purple-200 rounded-full opacity-10 -bottom-48 -right-48 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute w-64 h-64 bg-indigo-200 rounded-full opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ animationDelay: "1s" }}
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
              onClick={() => navigateTo("/questions")}
              className="text-gray-600 hover:text-violet-600 transform hover:scale-105 transition-all duration-200"
            >
              Questions
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">
          Past Papers 📚
        </h1>

        {/* Search and Filters */}
        <div
          ref={searchRef}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-8 border border-violet-100"
        >
          <div className="grid md:grid-cols-4 gap-6">
            <div className="group">
              <input
                type="text"
                placeholder="🔍 Search papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-violet-300"
              />
            </div>
            <div className="group">
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-6 py-4 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-violet-300"
              >
                <option value="">📅 All Years</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
            <div className="group">
              <select
                value={filters.board}
                onChange={(e) => setFilters({ ...filters, board: e.target.value })}
                className="w-full px-6 py-4 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-violet-300"
              >
                <option value="">🏫 All Boards</option>
                <option value="Cambridge">Cambridge</option>
                <option value="Edexcel">Edexcel</option>
                <option value="AQA">AQA</option>
              </select>
            </div>
            <div className="group">
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="w-full px-6 py-4 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-violet-300"
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
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-violet-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-violet-600 border-t-transparent absolute top-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>
        ) : (
          <div ref={papersContainerRef} className="papers-container grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPapers.map((paper, index) => (
              <div
                key={paper.id}
                className="paper-card bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-violet-100 group hover:border-violet-300"
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
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 group-hover:text-violet-600 transition-colors duration-300">
                    {paper.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 px-3 py-2 rounded-full text-sm font-medium">
                      📚 {paper.subject}
                    </span>
                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
                      📅 {paper.year}
                    </span>
                    <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                      🏫 {paper.board}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">🎓 {paper.level}</span>
                  <a
                    href={paper.downloadUrl}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 text-sm font-bold transform hover:scale-105 shadow-lg"
                    download
                  >
                    Download 📥
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPapers.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-xl font-medium">No papers found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
