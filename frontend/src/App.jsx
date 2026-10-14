
import { useCallback, useEffect, useState } from "react";
import "./index.css";
import Login from "./Login";

const API = "http://localhost:8080";

const emptyProductForm = {
  productName: "",
  category: "",
  manufacturer: "",
  countryOfOrigin: "",
  licenseNumber: "",
  status: "Active",
};

const emptyUserForm = {
  username: "",
  password: "",
  role: "OFFICER",
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentPage, setCurrentPage] = useState("Dashboard");

  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [creatingUser, setCreatingUser] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [formData, setFormData] = useState(emptyProductForm);
  const [message, setMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");

  // Check the existing server session.
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const response = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) return;

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

  // Load registered products.
  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/products`, {
        credentials: "include",
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Could not load products.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Product loading failed:", error);
      setMessage(error.message || "Unable to load products.");
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      loadProducts();
    }
  }, [loggedIn, loadProducts]);

  // Load actual user records from MySQL through Spring Boot.
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await fetch(`${API}/api/admin/users`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (response.status === 403) {
        throw new Error("Only administrators can manage users.");
      }

      if (!response.ok) {
        throw new Error("Unable to load users from the database.");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("User loading failed:", error);
      setUsersError(error.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      loggedIn &&
      userRole === "ADMIN" &&
      currentPage === "Users"
    ) {
      loadUsers();
    }
  }, [loggedIn, userRole, currentPage, loadUsers]);

  // Handle product form fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Register a product.
  const addProduct = async (event) => {
    event.preventDefault();
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

      setFormData({ ...emptyProductForm });
      setMessage("Product registered successfully!");
      await loadProducts();
    } catch (error) {
      console.error("Product registration failed:", error);
      setMessage(error.message || "Unable to register product.");
    }
  };

  // Handle user creation form fields.
  const handleUserFormChange = (event) => {
    const { name, value } = event.target;

    setUserForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create a user using the existing POST API.
  const createUser = async (event) => {
    event.preventDefault();
    setUserMessage("");
    setUsersError("");

    const username = userForm.username.trim();

    if (!username) {
      setUserMessage("Please enter a username.");
      return;
    }

    if (userForm.password.length < 8) {
      setUserMessage("Password must contain at least 8 characters.");
      return;
    }

    setCreatingUser(true);

    try {
      const response = await fetch(`${API}/api/admin/users`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password: userForm.password,
          role: userForm.role,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (response.status === 403) {
        throw new Error("Only administrators can create users.");
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            (response.status === 409
              ? "Username already exists."
              : "Unable to create user.")
        );
      }

      setUserForm({ ...emptyUserForm });
      setUserMessage(`User "${data.username}" created successfully!`);

      await loadUsers();
    } catch (error) {
      console.error("User creation failed:", error);
      setUserMessage(error.message || "Unable to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  // Activate or deactivate an account.
  const toggleUserStatus = async (user) => {
    if (user.username === currentUsername) {
      setUserMessage("You cannot change your own account status here.");
      return;
    }

    const nextActiveStatus = !user.active;

    const confirmed = window.confirm(
      `${nextActiveStatus ? "Activate" : "Deactivate"} account "${user.username}"?`
    );

    if (!confirmed) return;

    setUserMessage("");
    setUsersError("");
    setUpdatingUserId(user.id);

    try {
      const response = await fetch(
        `${API}/api/admin/users/${user.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: nextActiveStatus,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (response.status === 403) {
        throw new Error("Only administrators can update user status.");
      }

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Unable to update account status."
        );
      }

      setUserMessage(
        `Account "${user.username}" ${
          nextActiveStatus ? "activated" : "deactivated"
        } successfully.`
      );

      await loadUsers();
    } catch (error) {
      console.error("Account status update failed:", error);
      setUserMessage(error.message || "Unable to update account status.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Invalidate the backend session.
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Server logout could not be completed.");
      }
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
    setUsers([]);
    setMessage("");
    setUserMessage("");
    setUsersError("");
  };

  const handleLogin = (role, username) => {
    setUserRole(role);
    setCurrentUsername(username);
    setCurrentPage("Dashboard");
    setMessage("");
    setLoggedIn(true);
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

  const activeUsers = users.filter((user) => user.active).length;
  const inactiveUsers = users.length - activeUsers;

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
                          product.status === "Active" ? "active" : "inactive"
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
    <>
      <section className="form-section">
        <h2>Create New User</h2>
        <p style={{ color: "#64748b" }}>
          Add an account to the Global ARM database.
        </p>

        <form onSubmit={createUser}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="newUsername">Username</label>
              <input
                id="newUsername"
                name="username"
                value={userForm.username}
                onChange={handleUserFormChange}
                placeholder="Enter username"
                maxLength={50}
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Password</label>
              <input
                id="newPassword"
                type="password"
                name="password"
                value={userForm.password}
                onChange={handleUserFormChange}
                placeholder="At least 8 characters"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newRole">Account Role</label>
              <select
                id="newRole"
                name="role"
                value={userForm.role}
                onChange={handleUserFormChange}
              >
                <option value="OFFICER">Officer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <button className="btn" type="submit" disabled={creatingUser}>
            {creatingUser ? "Creating Account..." : "+ Create User"}
          </button>
        </form>

        {userMessage && (
          <p
            role="status"
            style={{
              marginTop: "16px",
              color: /successfully/i.test(userMessage)
                ? "#15803d"
                : "#b91c1c",
            }}
          >
            {userMessage}
          </p>
        )}
      </section>

      <section className="table-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2>User Accounts</h2>
            <p style={{ color: "#64748b" }}>
              Live records retrieved from MySQL.
            </p>
          </div>

          <button
            className="btn"
            type="button"
            onClick={loadUsers}
            disabled={usersLoading}
          >
            {usersLoading ? "Loading..." : "Refresh Users"}
          </button>
        </div>

        <section className="dashboard">
          <div className="card total">
            <h3>Total Users</h3>
            <div className="number">{users.length}</div>
          </div>

          <div className="card active">
            <h3>Active Users</h3>
            <div className="number">{activeUsers}</div>
          </div>

          <div className="card pending">
            <h3>Inactive Users</h3>
            <div className="number">{inactiveUsers}</div>
          </div>
        </section>

        {usersError && (
          <p role="alert" style={{ color: "#dc2626" }}>
            {usersError}
          </p>
        )}

        {usersLoading ? (
          <p>Loading users from the database...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      {usersError
                        ? "Users could not be loaded."
                        : "No users found."}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>
                        {user.role === "ADMIN"
                          ? "Administrator"
                          : "Officer"}
                      </td>
                      <td>
                        <span
                          className={`status ${
                            user.active ? "active" : "inactive"
                          }`}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={
                            updatingUserId === user.id ||
                            user.username === currentUsername
                          }
                          onClick={() => toggleUserStatus(user)}
                          style={{
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "6px",
                            cursor:
                              updatingUserId === user.id ||
                              user.username === currentUsername
                                ? "not-allowed"
                                : "pointer",
                            color: "white",
                            background: user.active ? "#dc2626" : "#16a34a",
                            opacity:
                              updatingUserId === user.id ||
                              user.username === currentUsername
                                ? 0.55
                                : 1,
                          }}
                        >
                          {updatingUserId === user.id
                            ? "Updating..."
                            : user.active
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ color: "#64748b", marginTop: "16px" }}>
          You cannot change your own account status from this page.
        </p>
      </section>
    </>
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
                    <li>Manage user accounts</li>
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
        return userRole === "ADMIN" ? (
          renderUsers()
        ) : (
          <p>You do not have permission to access this page.</p>
        );

      case "Settings":
        return userRole === "ADMIN" ? (
          <section className="table-section">
            <h2>System Settings</h2>
            <p>Global ARM application configuration.</p>
            <p>
              Advanced settings will be implemented in a later development
              phase.
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
                setUserMessage("");
              }}
            >
              <span style={{ marginRight: "10px" }}>{item.icon}</span>
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
