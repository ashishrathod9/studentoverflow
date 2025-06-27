import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom";
import "../App.css"; // ✅ Importing your App.css

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);
  const cardRef = useRef(null);
  const submitBtnRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.85, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.7 });
    gsap.fromTo(formRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2 });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { username: formData.username, password: formData.password }
        : {
            username: formData.username,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            email: formData.email,
          };

      const response = await fetch(`http://localhost:5128${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("username", user.username);
        navigate("/profile");
      } else {
        alert("Authentication failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container">
      <div ref={cardRef} className="login-form">
        <div className="login-header">
          <Link to="/" className="login-title">StudentOverflow</Link>
          <p className="login-subtitle">{isLogin ? "Welcome back!" : "Join our community"}</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </>
          )}

          <button
            ref={submitBtnRef}
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="auth-switch">
          <button
            className="switch-button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
