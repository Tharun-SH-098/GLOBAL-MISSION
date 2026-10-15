
import { useCallback, useEffect, useState } from "react";
import "./index.css";
import Login from "./Login";

const API = "http://localhost:8080";

const EMPTY_IMPORT = {
  reference: "",
  supplier: "",
  country: "",
  status: "Pending",
};

const IMPORT_STATUSES = [
  "Pending",
  "In Transit",
  "Completed",
  "Rejected",
];

const EMPTY_EXPORT = {
  reference: "",
  productName: "",
  destinationCountry: "",
  quantity: "",
  status: "Pending",
};

const EXPORT_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Rejected",
];

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
  const [userMessage, setUserMessage] = useState("");
  const [userActionId, setUserActionId] = useState(null);

  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    role: "OFFICER",
  });

  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    manufacturer: "",
    countryOfOrigin: "",
    licenseNumber: "",
    status: "Active",
  });

  // Import Management state
  const [imports, setImports] = useState([]);
  const [importsLoading, setImportsLoading] = useState(false);
  const [importSaving, setImportSaving] = useState(false);
  const [importActionId, setImportActionId] = useState(null);
  const [importError, setImportError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [importForm, setImportForm] = useState({ ...EMPTY_IMPORT });

  // Export Management state
  const [exports, setExports] = useState([]);
  const [exportsLoading, setExportsLoading] = useState(false);
  const [exportSaving, setExportSaving] = useState(false);
  const [exportActionId, setExportActionId] = useState(null);
  const [exportError, setExportError] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [exportForm, setExportForm] = useState({ ...EMPTY_EXPORT });

  const [documentReference, setDocumentReference] = useState("");
  const [complianceStatus, setComplianceStatus] =
    useState("Pending Review");

  // Check login session.
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled && data.username && data.role) {
          setUserRole(data.role);
          setCurrentUsername(data.username);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load products.
  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/products`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Session expired. Please log in again."
            : `Could not load products (HTTP ${response.status}).`
        );
      }

      setProducts(await response.json());
    } catch (error) {
      console.error("Product loading failed:", error);
      setMessage(error.message);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) loadProducts();
  }, [loggedIn, loadProducts]);

  // Load imports.
  const loadImports = useCallback(async () => {
    setImportsLoading(true);
    setImportError("");

    try {
      const response = await fetch(`${API}/api/imports`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Session expired. Please log in again."
            : response.status === 403
              ? "Access denied. Check your account permissions."
              : `Could not load imports (HTTP ${response.status}).`
        );
      }

      const data = await response.json();
      setImports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Import loading failed:", error);
      setImportError(error.message || "Could not load imports.");
    } finally {
      setImportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn && currentPage === "Import Management") {
      loadImports();
    }
  }, [loggedIn, currentPage, loadImports]);

  // Register an import.
  const addImport = async (event) => {
    event.preventDefault();
    setImportError("");
    setImportMessage("");
    setImportSaving(true);

    try {
      const response = await fetch(`${API}/api/imports`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importForm),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Import registration failed (HTTP ${response.status}).`
        );
      }

      const saved = await response.json();
      setImportForm({ ...EMPTY_IMPORT });
      setImportMessage(`Import ${saved.reference} saved successfully.`);
      await loadImports();
    } catch (error) {
      console.error("Import registration failed:", error);
      setImportError(error.message || "Could not save import.");
    } finally {
      setImportSaving(false);
    }
  };

  // Update import status.
  const updateImportStatus = async (record, status) => {
    if (importActionId !== null) return;

    setImportActionId(record.id);
    setImportError("");
    setImportMessage("");

    try {
      const response = await fetch(
        `${API}/api/imports/${record.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.text()) ||
            `Status update failed (HTTP ${response.status}).`
        );
      }

      setImportMessage(`Import ${record.reference} updated to ${status}.`);
      await loadImports();
    } catch (error) {
      console.error("Import status update failed:", error);
      setImportError(error.message || "Could not update import status.");
    } finally {
      setImportActionId(null);
    }
  };

  // Delete import.
  const deleteImport = async (record) => {
    if (importActionId !== null) return;

    if (!window.confirm(`Delete import ${record.reference}?`)) return;

    setImportActionId(record.id);
    setImportError("");
    setImportMessage("");

    try {
      const response = await fetch(
        `${API}/api/imports/${record.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.text()) ||
            `Delete failed (HTTP ${response.status}).`
        );
      }

      setImportMessage(`Import ${record.reference} deleted successfully.`);
      await loadImports();
    } catch (error) {
      console.error("Import deletion failed:", error);
      setImportError(error.message || "Could not delete import.");
    } finally {
      setImportActionId(null);
    }
  };

  // Load exports from the database.
  const loadExports = useCallback(async () => {
    setExportsLoading(true);
    setExportError("");

    try {
      const response = await fetch(`${API}/api/exports`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Session expired. Please log in again."
            : response.status === 403
              ? "Access denied. Check your account permissions."
              : `Could not load exports (HTTP ${response.status}).`
        );
      }

      const data = await response.json();
      setExports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Export loading failed:", error);
      setExportError(error.message || "Could not load exports.");
    } finally {
      setExportsLoading(false);
    }
  }, []);

  // Load exports when Export Management opens.
  useEffect(() => {
    if (loggedIn && currentPage === "Export Management") {
      loadExports();
    }
  }, [loggedIn, currentPage, loadExports]);

  // Register an export in MySQL.
  const addExport = async (event) => {
    event.preventDefault();
    setExportError("");
    setExportMessage("");
    setExportSaving(true);

    try {
      const payload = {
        ...exportForm,
        reference: exportForm.reference.trim(),
        productName: exportForm.productName.trim(),
        destinationCountry: exportForm.destinationCountry.trim(),
        quantity: Number(exportForm.quantity),
      };

      const response = await fetch(`${API}/api/exports`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let details = "";
        try {
          const body = await response.json();
          details = body.message || JSON.stringify(body);
        } catch {
          details = await response.text();
        }

        throw new Error(
          details || `Export registration failed (HTTP ${response.status}).`
        );
      }

      const saved = await response.json();

      setExportForm({ ...EMPTY_EXPORT });
      setExportMessage(`Export ${saved.reference} saved successfully.`);
      await loadExports();
    } catch (error) {
      console.error("Export registration failed:", error);
      setExportError(error.message || "Could not save export.");
    } finally {
      setExportSaving(false);
    }
  };

  // Update export shipment status.
  const updateExportStatus = async (record, status) => {
    if (exportActionId !== null) return;

    setExportActionId(record.id);
    setExportError("");
    setExportMessage("");

    try {
      const response = await fetch(
        `${API}/api/exports/${record.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.text()) ||
            `Status update failed (HTTP ${response.status}).`
        );
      }

      setExportMessage(`Export ${record.reference} updated to ${status}.`);
      await loadExports();
    } catch (error) {
      console.error("Export status update failed:", error);
      setExportError(error.message || "Could not update export status.");
    } finally {
      setExportActionId(null);
    }
  };

  // Delete export.
  const deleteExport = async (record) => {
    if (exportActionId !== null) return;

    if (!window.confirm(`Delete export ${record.reference}?`)) return;

    setExportActionId(record.id);
    setExportError("");
    setExportMessage("");

    try {
      const response = await fetch(
        `${API}/api/exports/${record.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.text()) ||
            `Delete failed (HTTP ${response.status}).`
        );
      }

      setExportMessage(`Export ${record.reference} deleted successfully.`);
      await loadExports();
    } catch (error) {
      console.error("Export deletion failed:", error);
      setExportError(error.message || "Could not delete export.");
    } finally {
      setExportActionId(null);
    }
  };

  // Load user accounts.
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await fetch(`${API}/api/admin/users`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Log in again."
            : response.status === 403
              ? "Only administrators can manage users."
              : `Could not load users (HTTP ${response.status}).`
        );
      }

      setUsers(await response.json());
    } catch (error) {
      console.error("Loading users failed:", error);
      setUsersError(error.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn && userRole === "ADMIN" && currentPage === "Users") {
      loadUsers();
    }
  }, [loggedIn, userRole, currentPage, loadUsers]);

  // Product form input.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  // Register a product.
  const addProduct = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/api/products`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(
          `Product registration failed (HTTP ${response.status}).`
        );
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
      console.error("Product registration failed:", error);
      setMessage(error.message);
    }
  };

  // Create a user account.
  const createUser = async (event) => {
    event.preventDefault();
    setUsersError("");
    setUserMessage("");

    try {
      const response = await fetch(`${API}/api/admin/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (!response.ok) {
        throw new Error(
          (await response.text()) ||
            `User creation failed (HTTP ${response.status}).`
        );
      }

      const created = await response.json();
      setUserMessage(`Account "${created.username}" created successfully.`);
      setUserForm({ username: "", password: "", role: "OFFICER" });
      await loadUsers();
    } catch (error) {
      console.error("User creation failed:", error);
      setUsersError(error.message);
    }
  };

  // Activate or deactivate a user.
  const toggleUserStatus = async (user) => {
    if (userActionId !== null) return;

    if (user.username === currentUsername) {
      setUsersError("You cannot change your own account status here.");
      return;
    }

    const newStatus = !user.active;

    if (
      user.active &&
      user.role === "ADMIN" &&
      users.filter((item) => item.role === "ADMIN" && item.active).length <= 1
    ) {
      setUsersError("You cannot deactivate the last active administrator.");
      return;
    }

    setUserActionId(user.id);
    setUsersError("");
    setUserMessage("");

    try {
      const response = await fetch(
        `${API}/api/admin/users/${user.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(
          (await response.text()) ||
            `Status update failed (HTTP ${response.status}).`
        );
      }

      const updatedUser = await response.json();

      setUsers((previous) =>
        previous.map((item) =>
          item.id === updatedUser.id ? updatedUser : item
        )
      );

      setUserMessage(
        `${updatedUser.username} is now ${
          updatedUser.active ? "Active" : "Inactive"
        }.`
      );

      await loadUsers();
    } catch (error) {
      console.error("User status update failed:", error);
      setUsersError(error.message || "Could not update user status.");
    } finally {
      setUserActionId(null);
    }
  };

  // Login callback.
  const handleLogin = (role, username) => {
    setUserRole(role);
    setCurrentUsername(username);
    setCurrentPage("Dashboard");
    setMessage("");
    setLoggedIn(true);
  };

  // Log out.
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Server logout failed.");
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
    setImports([]);
    setExports([]);
    setUsersError("");
    setUserMessage("");
    setImportError("");
    setImportMessage("");
    setExportError("");
    setExportMessage("");
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

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  const activeProducts = products.filter(
    (product) => product.status === "Active"
  ).length;

  const inactiveProducts = products.length - activeProducts;

  const navItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Products", icon: "□" },
    { name: "Import Management", icon: "⇩" },
    { name: "Export Management", icon: "⇧" },
    { name: "Documents", icon: "▤" },
    { name: "Compliance", icon: "✓" },
    { name: "Reports", icon: "▧" },
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
        <div className="number" style={{ color: "#16a34a" }}>Online</div>
      </div>
    </section>
  );

  const renderProducts = () => (
    <>
      <section className="form-section">
        <h2>Register New Product</h2>
        <form onSubmit={addProduct}>
          <div className="form-grid">
            {[
              ["productName", "Product Name"],
              ["category", "Category"],
              ["manufacturer", "Manufacturer"],
              ["countryOfOrigin", "Country of Origin"],
              ["licenseNumber", "License Number"],
            ].map(([name, label]) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <button className="btn" type="submit">+ Register Product</button>
        </form>
        {message && <p role="status">{message}</p>}
      </section>

      <section className="table-section">
        <h2>Registered Products</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Product Name</th><th>Category</th>
                <th>Manufacturer</th><th>Country</th><th>License</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="7">No products registered yet.</td></tr>
              ) : products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.productName}</td>
                  <td>{product.category}</td>
                  <td>{product.manufacturer}</td>
                  <td>{product.countryOfOrigin}</td>
                  <td>{product.licenseNumber}</td>
                  <td>
                    <span className={`status ${
                      product.status === "Active" ? "active" : "inactive"
                    }`}>{product.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderImports = () => (
    <>
      <section className="form-section">
        <h2>Register Import</h2>
        <p>Enter incoming goods and supplier details.</p>

        <form onSubmit={addImport}>
          <div className="form-grid">
            <div className="form-group">
              <label>Import Reference</label>
              <input
                value={importForm.reference}
                onChange={(e) => setImportForm((p) => ({ ...p, reference: e.target.value }))}
                placeholder="IMP-1002"
                required
              />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <input
                value={importForm.supplier}
                onChange={(e) => setImportForm((p) => ({ ...p, supplier: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Country of Origin</label>
              <input
                value={importForm.country}
                onChange={(e) => setImportForm((p) => ({ ...p, country: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Import Status</label>
              <select
                value={importForm.status}
                onChange={(e) => setImportForm((p) => ({ ...p, status: e.target.value }))}
              >
                {IMPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button className="btn" type="submit" disabled={importSaving}>
            {importSaving ? "Saving Import..." : "+ Save Import"}
          </button>
        </form>

        {importMessage && <p role="status" style={{ color: "#15803d" }}>{importMessage}</p>}
        {importError && <p role="alert" style={{ color: "#dc2626" }}>{importError}</p>}
      </section>

      <section className="table-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div><h2>Import Records</h2><p>Records saved in the database.</p></div>
          <button className="btn" onClick={loadImports} disabled={importsLoading}>
            {importsLoading ? "Loading..." : "Refresh Imports"}
          </button>
        </div>

        <section className="dashboard">
          <div className="card total"><h3>Total Imports</h3><div className="number">{imports.length}</div></div>
          <div className="card pending"><h3>Pending</h3><div className="number">{imports.filter((r) => r.status === "Pending").length}</div></div>
          <div className="card active"><h3>Completed</h3><div className="number">{imports.filter((r) => r.status === "Completed").length}</div></div>
        </section>

        {importsLoading && imports.length === 0 ? <p>Loading imports...</p> : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>ID</th><th>Reference</th><th>Supplier</th><th>Country</th><th>Created</th><th>Status</th><th>Update Status</th><th>Action</th></tr></thead>
              <tbody>
                {imports.length === 0 ? <tr><td colSpan="8">No import records yet.</td></tr> : imports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td><td>{r.reference}</td><td>{r.supplier}</td><td>{r.country}</td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                    <td><span className={`status ${r.status === "Completed" ? "active" : r.status === "Rejected" ? "inactive" : "pending"}`}>{r.status}</span></td>
                    <td>
                      <select value={r.status} disabled={importActionId === r.id} onChange={(e) => updateImportStatus(r, e.target.value)}>
                        {IMPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button type="button" disabled={importActionId === r.id} onClick={() => deleteImport(r)} style={{ background: "#dc2626", color: "#fff", border: 0, borderRadius: "6px", padding: "8px 12px", cursor: "pointer" }}>{importActionId === r.id ? "Please wait..." : "Delete"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  // Export Management UI connected to /api/exports.
  const renderExports = () => (
    <>
      <section className="form-section">
        <h2>Register Export</h2>
        <p>Register outgoing goods and track their shipment status.</p>

        <form onSubmit={addExport}>
          <div className="form-grid">
            <div className="form-group">
              <label>Export Reference</label>
              <input
                value={exportForm.reference}
                onChange={(e) => setExportForm((p) => ({ ...p, reference: e.target.value }))}
                placeholder="EXP-1001"
                required
              />
            </div>

            <div className="form-group">
              <label>Product Name</label>
              <input
                value={exportForm.productName}
                onChange={(e) => setExportForm((p) => ({ ...p, productName: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label>Destination Country</label>
              <input
                value={exportForm.destinationCountry}
                onChange={(e) => setExportForm((p) => ({ ...p, destinationCountry: e.target.value }))}
                placeholder="Enter destination country"
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={exportForm.quantity}
                onChange={(e) => setExportForm((p) => ({ ...p, quantity: e.target.value }))}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="form-group">
              <label>Shipment Status</label>
              <select
                value={exportForm.status}
                onChange={(e) => setExportForm((p) => ({ ...p, status: e.target.value }))}
              >
                {EXPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button className="btn" type="submit" disabled={exportSaving}>
            {exportSaving ? "Saving Export..." : "+ Register Export"}
          </button>
        </form>

        {exportMessage && <p role="status" style={{ color: "#15803d" }}>{exportMessage}</p>}
        {exportError && <p role="alert" style={{ color: "#dc2626" }}>{exportError}</p>}
      </section>

      <section className="table-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div><h2>Export Records</h2><p>Shipment records saved in the Global ARM database.</p></div>
          <button className="btn" type="button" onClick={loadExports} disabled={exportsLoading}>
            {exportsLoading ? "Loading..." : "Refresh Exports"}
          </button>
        </div>

        <section className="dashboard">
          <div className="card total"><h3>Total Exports</h3><div className="number">{exports.length}</div></div>
          <div className="card pending"><h3>Pending</h3><div className="number">{exports.filter((r) => r.status === "Pending").length}</div></div>
          <div className="card active"><h3>Delivered</h3><div className="number">{exports.filter((r) => r.status === "Delivered").length}</div></div>
          <div className="card"><h3>Shipped</h3><div className="number">{exports.filter((r) => r.status === "Shipped").length}</div></div>
        </section>

        {exportsLoading && exports.length === 0 ? <p>Loading export records...</p> : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr><th>ID</th><th>Reference</th><th>Product</th><th>Destination</th><th>Quantity</th><th>Created</th><th>Status</th><th>Update Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {exports.length === 0 ? (
                  <tr><td colSpan="9">No export records yet. Register your first export above.</td></tr>
                ) : exports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.reference}</td>
                    <td>{r.productName}</td>
                    <td>{r.destinationCountry}</td>
                    <td>{r.quantity}</td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</td>
                    <td>
                      <span className={`status ${r.status === "Delivered" ? "active" : r.status === "Rejected" ? "inactive" : "pending"}`}>{r.status}</span>
                    </td>
                    <td>
                      <select
                        aria-label={`Status for ${r.reference}`}
                        value={r.status}
                        disabled={exportActionId === r.id}
                        onChange={(e) => updateExportStatus(r, e.target.value)}
                      >
                        {EXPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={exportActionId === r.id}
                        onClick={() => deleteExport(r)}
                        style={{ background: "#dc2626", color: "#fff", border: 0, borderRadius: "6px", padding: "8px 12px", cursor: "pointer", opacity: exportActionId === r.id ? 0.5 : 1 }}
                      >
                        {exportActionId === r.id ? "Please wait..." : "Delete"}
                      </button>
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
        <h2>Create User Account</h2>
        <form onSubmit={createUser}>
          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input value={userForm.username} onChange={(e) => setUserForm((p) => ({ ...p, username: e.target.value }))} maxLength={50} required />
            </div>
            <div className="form-group">
              <label>Password (minimum 8 characters)</label>
              <input type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} minLength={8} maxLength={72} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}>
                <option value="OFFICER">Officer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>
          <button className="btn" type="submit">+ Create User</button>
        </form>
        {userMessage && <p role="status" style={{ color: "#15803d" }}>{userMessage}</p>}
        {usersError && <p role="alert" style={{ color: "#dc2626" }}>{usersError}</p>}
      </section>

      <section className="table-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div><h2>User Management</h2><p>Manage accounts stored in the database.</p></div>
          <button className="btn" type="button" disabled={usersLoading} onClick={loadUsers}>{usersLoading ? "Loading..." : "Refresh Users"}</button>
        </div>

        <section className="dashboard">
          <div className="card total"><h3>Total Users</h3><div className="number">{users.length}</div></div>
          <div className="card active"><h3>Active Users</h3><div className="number">{users.filter((u) => u.active).length}</div></div>
          <div className="card pending"><h3>Inactive Users</h3><div className="number">{users.filter((u) => !u.active).length}</div></div>
        </section>

        {usersLoading ? <p>Loading users...</p> : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>ID</th><th>Username</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {users.length === 0 ? <tr><td colSpan="5">No users found.</td></tr> : users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td><td>{user.username}</td><td>{user.role}</td>
                    <td><span className={`status ${user.active ? "active" : "inactive"}`}>{user.active ? "Active" : "Inactive"}</span></td>
                    <td>
                      <button
                        type="button"
                        disabled={userActionId !== null || user.username === currentUsername}
                        onClick={() => toggleUserStatus(user)}
                        style={{ padding: "8px 12px", border: "none", borderRadius: "6px", cursor: "pointer", color: "#fff", background: user.active ? "#dc2626" : "#16a34a" }}
                      >
                        {userActionId === user.id ? "Updating..." : user.active ? "Deactivate" : "Activate"}
                      </button>
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
        return (
          <>
            <h2>{userRole === "ADMIN" ? "Administrator Dashboard" : "Officer Dashboard"}</h2>
            <p>Welcome to Global ARM Management System.</p>
            {renderStats()}
            <section className="table-section">
              <h3>{userRole === "ADMIN" ? "Administrator Responsibilities" : "Officer Workspace"}</h3>
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
                    <li>Manage assigned import/export work</li>
                  </>
                )}
              </ul>
            </section>
          </>
        );

      case "Products":
        return renderProducts();

      case "Import Management":
        return renderImports();

      case "Export Management":
        return renderExports();

      case "Documents":
        return (
          <section className="form-section">
            <h2>Documents</h2>
            <p>Track licenses, permits, and shipment documents.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              setMessage("Document reference entered. Upload and database storage are not connected yet.");
            }}>
              <div className="form-group">
                <label>Document Reference</label>
                <input value={documentReference} onChange={(e) => setDocumentReference(e.target.value)} required />
              </div>
              <button className="btn" type="submit">Submit Document Preview</button>
            </form>
            {message && <p role="status">{message}</p>}
            <p>File upload and secure document storage will be added later.</p>
          </section>
        );

      case "Compliance":
        return (
          <section className="form-section">
            <h2>Compliance</h2>
            <p>Review compliance requirements and status.</p>
            <div className="form-group">
              <label>Compliance Status</label>
              <select value={complianceStatus} onChange={(e) => setComplianceStatus(e.target.value)}>
                <option>Pending Review</option>
                <option>Compliant</option>
                <option>Requires Attention</option>
              </select>
            </div>
            <p>Selected status: <strong>{complianceStatus}</strong></p>
            <p>Compliance records are not saved to the database yet.</p>
          </section>
        );

      case "Reports":
        return <><h2>Product Reports</h2><p>Summary of registered product records.</p>{renderStats()}</>;

      case "Users":
        return userRole === "ADMIN" ? renderUsers() : <p>You do not have permission to access this page.</p>;

      case "Settings":
        return userRole === "ADMIN" ? (
          <section className="table-section">
            <h2>System Settings</h2>
            <p>Global ARM application configuration.</p>
            <p>Advanced settings can be added later.</p>
          </section>
        ) : <p>You do not have permission to access this page.</p>;

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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span className="header-badge">{currentUsername} · {userRole === "ADMIN" ? "Administrator" : "Officer"}</span>
          <button type="button" onClick={handleLogout} style={{ padding: "10px 16px", border: "none", borderRadius: "8px", background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-title">GLOBAL ARM</div>
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`sidebar-item ${currentPage === item.name ? "active" : ""}`}
              onClick={() => {
                setCurrentPage(item.name);
                setMessage("");
                setUsersError("");
                setUserMessage("");
                setImportError("");
                setImportMessage("");
                setExportError("");
                setExportMessage("");
              }}
            >
              <span style={{ marginRight: "10px" }}>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </aside>

        <main className="dashboard-content">
          <div style={{ marginBottom: "25px" }}>
            <h2>Welcome, {userRole === "ADMIN" ? "Administrator" : "Officer"}</h2>
            <p>Manage and monitor your workspace.</p>
          </div>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
