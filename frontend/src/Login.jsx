
import { useState } from "react";
import "./index.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid username or password."
        );
      }

      if (data.role !== "ADMIN" && data.role !== "OFFICER") {
        throw new Error("Your account role is not supported.");
      }

      onLogin(data.role);
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to connect to the server. Check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">GLOBAL ARM</div>

        <h1>Welcome Back</h1>
        <p>Sign in to Global ARM Management System</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {message && (
            <div className="message" role="alert">
              {message}
            </div>
          )}

          <button
            className="btn login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-info">
          <strong>Development accounts</strong>
          <p>Admin: admin / admin123</p>
          <p>Officer: officer / officer123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
