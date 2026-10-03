import "./index.css";

function App() {
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">G</div>

          <div>
            <h2>GLOBAL ARM</h2>
            <span>Management System</span>
          </div>
        </div>

        <nav className="navigation">

          <a href="#" className="nav-item active">
            <span>▣</span>
            Dashboard
          </a>

          <a href="#" className="nav-item">
            <span>↓</span>
            Import Management
          </a>

          <a href="#" className="nav-item">
            <span>↑</span>
            Export Management
          </a>

          <a href="#" className="nav-item">
            <span>◈</span>
            Products
          </a>

          <a href="#" className="nav-item">
            <span>▤</span>
            Documents
          </a>

          <a href="#" className="nav-item">
            <span>✓</span>
            Compliance
          </a>

          <a href="#" className="nav-item">
            <span>▥</span>
            Reports
          </a>

        </nav>

        <div className="sidebar-bottom">

          <a href="#" className="nav-item">
            <span>⚙</span>
            Settings
          </a>

          <a href="#" className="nav-item">
            <span>?</span>
            Help & Support
          </a>

        </div>

      </aside>


      {/* Main Content */}
      <main className="main-content">

        {/* Header */}
        <header className="top-header">

          <div>
            <h1>Dashboard</h1>
            <p>Welcome to Global ARM Management System</p>
          </div>

          <div className="header-right">

            <button className="notification">
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">

              <div className="user-avatar">
                TS
              </div>

              <div>
                <strong>Administrator</strong>
                <small>System Admin</small>
              </div>

            </div>

          </div>

        </header>


        {/* Statistics */}
        <section className="statistics">

          <div className="stat-card">

            <div className="stat-icon import-icon">
              ↓
            </div>

            <div>
              <p>Total Imports</p>
              <h2>124</h2>
              <span className="positive">+12% this month</span>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon export-icon">
              ↑
            </div>

            <div>
              <p>Total Exports</p>
              <h2>98</h2>
              <span className="positive">+8% this month</span>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon pending-icon">
              !
            </div>

            <div>
              <p>Pending Requests</p>
              <h2>17</h2>
              <span className="warning">Requires attention</span>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon license-icon">
              ✓
            </div>

            <div>
              <p>Active Licenses</p>
              <h2>32</h2>
              <span className="positive">All up to date</span>
            </div>

          </div>

        </section>


        {/* Main Dashboard Grid */}
        <section className="dashboard-grid">

          {/* Recent Transactions */}
          <div className="dashboard-card transactions-card">

            <div className="card-header">

              <div>
                <h2>Recent Transactions</h2>
                <p>Latest import and export records</p>
              </div>

              <button className="view-button">
                View All
              </button>

            </div>


            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td>IMP-2026-001</td>
                    <td>Import</td>
                    <td>03 Oct 2026</td>
                    <td>
                      <span className="status approved">
                        Approved
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td>EXP-2026-014</td>
                    <td>Export</td>
                    <td>02 Oct 2026</td>
                    <td>
                      <span className="status pending">
                        Pending
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td>IMP-2026-002</td>
                    <td>Import</td>
                    <td>01 Oct 2026</td>
                    <td>
                      <span className="status review">
                        Under Review
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td>EXP-2026-013</td>
                    <td>Export</td>
                    <td>30 Sep 2026</td>
                    <td>
                      <span className="status approved">
                        Approved
                      </span>
                    </td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>


          {/* Quick Actions */}
          <div className="dashboard-card quick-card">

            <div className="card-header">

              <div>
                <h2>Quick Actions</h2>
                <p>Frequently used functions</p>
              </div>

            </div>


            <div className="quick-actions">

              <button className="action-button">
                <span>＋</span>
                <div>
                  <strong>New Import Request</strong>
                  <small>Create a new import record</small>
                </div>
              </button>


              <button className="action-button">
                <span>＋</span>
                <div>
                  <strong>New Export Request</strong>
                  <small>Create a new export record</small>
                </div>
              </button>


              <button className="action-button">
                <span>▤</span>
                <div>
                  <strong>Upload Document</strong>
                  <small>Add compliance documentation</small>
                </div>
              </button>


              <button className="action-button">
                <span>▥</span>
                <div>
                  <strong>Generate Report</strong>
                  <small>Create management reports</small>
                </div>
              </button>

            </div>

          </div>

        </section>


        {/* Footer */}
        <footer className="footer">

          <span>
            © 2026 Global ARM Management System
          </span>

          <span>
            System Status: <strong>Operational</strong>
          </span>

        </footer>

      </main>

    </div>
  );
}

export default App;