
function AdminDashboard({ products = [] }) {
  const activeProducts = products.filter(
    (product) => product.status === "Active"
  ).length;

  const inactiveProducts = products.length - activeProducts;

  return (
    <div>
      <h2>Administrator Dashboard</h2>
      <p>Welcome to Global ARM Management System.</p>

      <div className="dashboard">
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
      </div>

      <section className="table-section">
        <h3>Administrator Responsibilities</h3>
        <ul>
          <li>Monitor registered products</li>
          <li>Manage officer access</li>
          <li>Review system reports</li>
          <li>Configure system settings</li>
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
