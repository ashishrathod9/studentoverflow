import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "../App.css"; // ✅ Import your CSS file here

export default function ProfilePage() {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const logoutBtnRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.85, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7 }
    );

    if (logoutBtnRef.current) {
      logoutBtnRef.current.addEventListener("mouseenter", () => {
        gsap.to(logoutBtnRef.current, {
          scale: 1.08,
          boxShadow: "0 6px 24px rgba(239,68,68,0.18)",
          duration: 0.25,
        });
      });
      logoutBtnRef.current.addEventListener("mouseleave", () => {
        gsap.to(logoutBtnRef.current, {
          scale: 1,
          boxShadow: "0 2px 8px rgba(239,68,68,0.08)",
          duration: 0.25,
        });
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/login");
  };

  if (!user) {
    return <div className="loading-text">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div ref={cardRef} className="profile-card">
        <h1 className="profile-title">Profile</h1>
        <div className="profile-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Reputation:</strong> {user.reputation}</p>
          <p><strong>Questions:</strong> {user.questionsCount}</p>
          <p><strong>Answers:</strong> {user.answersCount}</p>
        </div>
        <button
          ref={logoutBtnRef}
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
