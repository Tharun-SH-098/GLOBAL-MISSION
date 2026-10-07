import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      username === "admin" &&
      password === "admin123"
    ) {
      onLogin(role);
    } else if (
      username === "officer" &&
      password === "officer123"
    ) {
      onLogin(role);
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          ARM
        </div>

        <h1>Global ARM</h1>

        <p className="login-subtitle">
          Management System
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="ADMIN">
                Administrator
              </option>

              <option value="OFFICER">
                Officer
              </option>
            </select>
          </div>

          <button
            className="login-btn"
            type="submit"
          >
            Login
          </button>

        </form>

        <p className="login-info">
          Authorized Access Only
        </p>

      </div>

    </div>
  );
}

export default Login;