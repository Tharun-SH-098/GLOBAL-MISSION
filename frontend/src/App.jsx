import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    manufacturer: "",
    countryOfOrigin: "",
    licenseNumber: "",
    status: "Active",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Product added successfully!");

        setFormData({
          productName: "",
          category: "",
          manufacturer: "",
          countryOfOrigin: "",
          licenseNumber: "",
          status: "Active",
        });

        loadProducts();
      }
    } catch (error) {
      setMessage("Backend connection failed.");
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const activeProducts = products.filter(
    (product) => product.status === "Active"
  ).length;

  const inactiveProducts = products.filter(
    (product) => product.status !== "Active"
  ).length;

  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>Global ARM Management System</h1>
          <p>Global Arms Registration & Management Platform</p>
        </div>

        <div className="header-badge">
          Admin Dashboard
        </div>
      </header>

      <main className="container">

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
            <div className="number">Online</div>
          </div>

        </section>

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

        </section>

      </main>

    </div>
  );
}

export default App;