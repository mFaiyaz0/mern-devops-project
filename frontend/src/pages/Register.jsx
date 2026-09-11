import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name,
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* =========================
          Left Hero
      ========================= */}

      <div className="auth-hero">

        <div className="auth-brand">

          <div className="brand-icon">
            ✓
          </div>

          <div>
            <h1>TaskFlow</h1>
            <span>Task Management</span>
          </div>

        </div>

        <div className="hero-content">

          <div className="hero-badge">
            ✦ Start being productive
          </div>

          <h2>
            Build better
            <br />
            <span>habits.</span>
          </h2>

          <p>
            Create your account and bring all
            your tasks into one simple workspace.
          </p>

          <div className="feature-list">

            <div className="feature-item">
              <div>✓</div>
              <span>Simple task management</span>
            </div>

            <div className="feature-item">
              <div>✓</div>
              <span>Track your daily progress</span>
            </div>

            <div className="feature-item">
              <div>✓</div>
              <span>Secure account authentication</span>
            </div>

          </div>

        </div>

        <div className="hero-decoration decoration-one"></div>
        <div className="hero-decoration decoration-two"></div>

      </div>

      {/* =========================
          Register Form
      ========================= */}

      <div className="auth-form-section">

        <div className="auth-card">

          {/* Mobile brand */}

          <div className="mobile-brand">

            <div className="brand-icon">
              ✓
            </div>

            <h1>TaskFlow</h1>

          </div>

          {/* Heading */}

          <div className="auth-heading">

            <p className="eyebrow">
              GET STARTED
            </p>

            <h2>
              Create your account
            </h2>

            <p>
              Set up your account and start managing
              your tasks.
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="error-message">

              <span>!</span>

              {error}

            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleRegister}
            className="auth-form"
          >

            <div className="input-group">

              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

            </div>

            <div className="input-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}

            </button>

          </form>

          {/* Login link */}

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link
            to="/login"
            className="secondary-auth-button"
          >
            Sign in
          </Link>

          <p className="auth-footer">
            MERN DevOps Project
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;