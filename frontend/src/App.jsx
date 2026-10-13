
import { useEffect, useState } from "react";
import "./index.css";
import Login from "./Login";

const API = "http://localhost:8080";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    manufacturer: "",
    countryOfOrigin: "",
    licenseNumber: "",
    status: "Active",
  });

  // Verify the existing server session when the app opens.
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const response = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setUserRole(data.role);
          setCurrentUsername(data.username);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load products whenever a user is logged in.
  const loadProducts = async () => {
    try {
      const response = await fetch(`${API}/api/products`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : "Could not load products."
        );
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to load products.");
    }
  };

  useEffect(() => {
    if (loggedIn) {
      loadProducts();
    }
  }, [loggedIn]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Register a product in the backend database.
  const addProduct = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/api/products`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Could not register product.");
      }

      setFormData({
        productName: "",
        category: "",
        manufacturer: "",
        countryOfOrigin: "",
        licenseNumber: "",
        status: "Active",
      });

      setMessage("Product registered successfully!");
      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to register product.");
    }
  };

  const handleLogin = (role, username) => {
    setUserRole(role);
    setCurrentUsername(username);
    setCurrentPage("Dashboard");
    setMessage("");
    setLoggedIn(true);
  };

  // Invalidate the backend session before returning to login.
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Server logout could not be completed.");
      }

      setMessage("");
    } catch (error) {
      console.error("Logout failed:", error);
      setMessage("Logout could not be confirmed. Please try again.");
      return;
    }

    setLoggedIn(false);
    setUserRole("");
    setCurrentUsername("");
    setCurrentPage("Dashboard");
    setProducts([]);
  };

  if (checkingSession) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">GLOBAL ARM</div>
          <h2>Checking your session...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const activeProducts = products.filter(
    (product) => product.status === "Active"
  ).length;

  const inactiveProducts = products.length - activeProducts;

  // Demonstration users only; database-backed user management
  // will be implemented separately.
  const demoUsers = [
    {
      id: 1,
      username: "admin",
      role: "Administrator",
      status: "Active",
    },
    {
      id: 2,
      username: "officer",
      role: "Officer",
      status: "Active",
    },
  ];

  const navItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Products", icon: "□" },
    { name: "Reports", icon: "▤" },
    ...(userRole === "ADMIN"
      ? [
          { name: "Users", icon: "♙" },
          { name: "Settings", icon: "⚙" },
        ]
      : []),
  ];

  const renderStats = () => (
    <section className="dashboard">
      <div className="card total">
        <h3>Total Products</h3>
        <div className="number">{products.length}</div>
      </div>

      <div className="card active">
        <h3>Active Products</h3>
        <div className="number">{activeProducts}</div>
      </div>

      <div className="card pending">
        <h3>Inactive Products</h3>
        <div className="number">{inactiveProducts}</div>
      </div>

      <div className="card">
        <h3>System Status</h3>
        <div className="number" style={{ color: "#16a34a" }}>
          Online
        </div>
      </div>
    </section>
  );

  const renderProducts = () => (
    <>
      <section className="form-section">
        <h2>Register New Product</h2>

        <form onSubmit={addProduct}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name</label>
              <input
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
                required
              />
            </div>

            <div className="form-group">
              <label>Manufacturer</label>
              <input
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="Enter manufacturer"
                required
              />
            </div>

            <div className="form-group">
              <label>Country of Origin</label>
              <input
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleChange}
                placeholder="Enter country"
                required
              />
            </div>

            <div className="form-group">
              <label>License Number</label>
              <input
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Enter license number"
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button className="btn" type="submit">
            + Register Product
          </button>
        </form>

        {message && (
          <div className="message" role="status">
            {message}
          </div>
        )}
      </section>

      <section className="table-section">
        <h2>Registered Products</h2>

        {products.length === 0 ? (
          <p>No products registered yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Country</th>
                  <th>License</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.productName}</td>
                    <td>{product.category}</td>
                    <td>{product.manufacturer}</td>
                    <td>{product.countryOfOrigin}</td>
                    <td>{product.licenseNumber}</td>
                    <td>
                      <span
                        className={`status ${
                          product.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  const renderUsers = () => (
    <section className="table-section">
      <h2>User Management</h2>
      <p style={{ color: "#64748b" }}>
        Demonstration account list.
      </p>

      <section className="dashboard">
        <div className="card total">
          <h3>Total Users</h3>
          <div className="number">{demoUsers.length}</div>
        </div>

        <div className="card active">
          <h3>Active Users</h3>
          <div className="number">
            {demoUsers.filter(
              (user) => user.status === "Active"
            ).length}
          </div>
        </div>
      </section>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {demoUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <span className="status active">
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: "#64748b", marginTop: "20px" }}>
        These records are hardcoded examples, not database-backed users.
      </p>
    </section>
  );

  const renderPage = () => {
    switch (currentPage) {
      case "Dashboard":
        return (
          <>
            <h2>
              {userRole === "ADMIN"
                ? "Administrator Dashboard"
                : "Officer Dashboard"}
            </h2>

            <p style={{ color: "#64748b" }}>
              Welcome to Global ARM Management System.
            </p>

            {renderStats()}

            <section className="table-section">
              <h3>
                {userRole === "ADMIN"
                  ? "Administrator Responsibilities"
                  : "Officer Workspace"}
              </h3>

              <ul>
                {userRole === "ADMIN" ? (
                  <>
                    <li>Monitor registered products</li>
                    <li>Review product reports</li>
                    <li>View system account information</li>
                    <li>Configure system settings</li>
                  </>
                ) : (
                  <>
                    <li>View registered products</li>
                    <li>Register product records</li>
                    <li>Review product reports</li>
                  </>
                )}
              </ul>
            </section>
          </>
        );

      case "Products":
        return renderProducts();

      case "Reports":
        return (
          <>
            <h2>Product Reports</h2>
            <p style={{ color: "#64748b" }}>
              Summary of registered product records.
            </p>
            {renderStats()}
          </>
        );

      case "Users":
        return userRole === "ADMIN"
          ? renderUsers()
          : <p>You do not have permission to access this page.</p>;

      case "Settings":
        return userRole === "ADMIN" ? (
          <section className="table-section">
            <h2>System Settings</h2>
            <p>Global ARM application configuration.</p>
            <p>
              Advanced settings will be implemented in a later
              development phase.
            </p>
          </section>
        ) : (
          <p>You do not have permission to access this page.</p>
        );

      default:
        return <p>Select a page from the sidebar.</p>;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Global ARM Management System</h1>
          <p>Global Arms Registration &amp; Management Platform</p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span className="header-badge">
            {currentUsername} ·{" "}
            {userRole === "ADMIN" ? "Administrator" : "Officer"}
          </span>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              background: "#dc2626",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-title">GLOBAL ARM</div>

          {navItems.map((item) => (
            <button
              key={item.name}
              className={`sidebar-item ${
                currentPage === item.name ? "active" : ""
              }`}
              onClick={() => {
                setCurrentPage(item.name);
                setMessage("");
              }}
            >
              <span style={{ marginRight: "10px" }}>
                {item.icon}
              </span>
              {item.name}
            </button>
          ))}
        </aside>

        <main className="dashboard-content">
          <div style={{ marginBottom: "25px" }}>
            <h2>
              Welcome,{" "}
              {userRole === "ADMIN" ? "Administrator" : "Officer"}
            </h2>
            <p style={{ color: "#64748b" }}>
              Manage and monitor your workspace.
            </p>
          </div>

          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
