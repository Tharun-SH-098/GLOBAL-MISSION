
import { useEffect, useState } from "react";
import "./index.css";
import Login from "./Login";
import AdminDashboard from "./admin/AdminDashboard";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
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

  const loadProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/products"
      );

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      setProducts(await response.json());
    } catch (error) {
      console.error("Error loading products:", error);
      setMessage("Unable to load products. Check the backend.");
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

  const addProduct = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      setMessage("Product registered successfully!");

      setFormData({
        productName: "",
        category: "",
        manufacturer: "",
        countryOfOrigin: "",
        licenseNumber: "",
        status: "Active",
      });

      await loadProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Unable to register product.");
    }
  };

  const handleLogin = (role) => {
    setUserRole(role);
    setCurrentPage("Dashboard");
    setLoggedIn(true);
    setMessage("");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserRole("");
    setCurrentPage("Dashboard");
    setMessage("");
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const activeProducts = products.filter(
    (product) => product.status === "Active"
  ).length;

  const inactiveProducts = products.length - activeProducts;

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

        {message && <div className="message">{message}</div>}
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

  const renderPage = () => {
    switch (currentPage) {
      case "Dashboard":
        if (userRole === "ADMIN") {
          return <AdminDashboard products={products} />;
        }

        return (
          <>
            <h2>Officer Dashboard</h2>
            <p>Monitor registered product records.</p>

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
            </section>
          </>
        );

      case "Products":
        return renderProducts();

      case "Reports":
        return (
          <section className="table-section">
            <h2>Product Reports</h2>
            <p>Summary of registered product records.</p>

            <div className="dashboard">
              <div className="card total">
                <h3>Total Records</h3>
                <div className="number">{products.length}</div>
              </div>

              <div className="card active">
                <h3>Active Records</h3>
                <div className="number">{activeProducts}</div>
              </div>

              <div className="card pending">
                <h3>Inactive Records</h3>
                <div className="number">{inactiveProducts}</div>
              </div>
            </div>
          </section>
        );

      case "Users":
        return userRole === "ADMIN" ? (
          <section className="table-section">
            <h2>User Management</h2>
            <p>Administrator access</p>
            <p>
              User account creation and management will be
              connected to the backend in a later step.
            </p>
          </section>
        ) : null;

      case "Settings":
        return userRole === "ADMIN" ? (
          <section className="table-section">
            <h2>System Settings</h2>
            <p>Global ARM application settings.</p>
            <p>
              Configuration options will be implemented
              in a later step.
            </p>
          </section>
        ) : null;

      default:
        return <h2>Page not found</h2>;
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
          }}
        >
          <span className="header-badge">
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
              {currentPage === "Dashboard"
                ? `Welcome, ${
                    userRole === "ADMIN" ? "Administrator" : "Officer"
                  }`
                : currentPage}
            </h2>

            <p style={{ color: "#64748b", marginTop: "5px" }}>
              Manage and monitor registered products from your workspace.
            </p>
          </div>

          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
