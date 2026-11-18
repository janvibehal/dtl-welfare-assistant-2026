
import { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard, FileText, Clock, AlertTriangle,
  BarChart3, Bell, Search, Menu, X, CheckCircle2,
  XCircle, Eye, ChevronRight, Building2, CalendarDays,
  IndianRupee, ArrowUpRight, RefreshCw, ShieldCheck,
  CircleUserRound, Filter, Activity
} from "lucide-react";

import { initialClaims } from "./data/mockData";
import "./App.css";

const stages = [
  "HR Verification",
  "Department Head",
  "Final Authority",
  "Finance"
];

const roles = [
  "Admin",
  "HR / LWO Officer",
  "Approving Authority",
  "Finance Officer",
  "Senior Management",
  "Employee"
];

const employeeAccounts = [
  { id: "DTL-E001", name: "Amit Sharma" },
  { id: "DTL-E002", name: "Priya Verma" },
  { id: "DTL-E003", name: "Rahul Gupta" },
  { id: "DTL-E004", name: "Neha Singh" },
  { id: "DTL-E005", name: "Karan Mehta" },
  { id: "DTL-E006", name: "Anjali Rao" },
  { id: "DTL-E007", name: "Rohit Malhotra" },
  { id: "DTL-E008", name: "Simran Kaur" }
];

function canRoleAct(role, claim) {
  if (!claim || claim.status !== "Pending") return false;
  if (role === "Admin") return true;
  if (role === "HR / LWO Officer") return claim.currentStage === "HR Verification";
  if (role === "Approving Authority") {
    return ["Department Head", "Final Authority"].includes(claim.currentStage);
  }
  if (role === "Finance Officer") return claim.currentStage === "Finance";
  return false;
}

function canEmployeeResubmit(role, claim, employeeId) {
  return role === "Employee" && claim?.employeeId === employeeId && claim?.status === "Needs Correction";
}

function getStageDurations(claims) {
  const durations = stages.map(stage => ({ stage, total: 0, count: 0 }));
  const completedActions = ["Approved", "Payment Processed", "Rejected", "Returned for Correction"];

  claims.forEach(claim => {
    const history = [...(claim.history || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    history.forEach((entry, index) => {
      if (!stages.includes(entry.stage)) return;
      const hasExplicitStart = history.some(item => item.stage === entry.stage && item.action === "Pending");

      // New workflow records have a Pending event followed by a completion event at the same stage.
      if (hasExplicitStart && entry.action !== "Pending") return;

      let completion = hasExplicitStart
        ? history.slice(index + 1).find(item => item.stage === entry.stage && completedActions.includes(item.action))
        : null;

      // Older sample records only contain one event per stage; use the next timeline event as an estimate.
      if (!hasExplicitStart) {
        completion = history.slice(index + 1).find(item => new Date(item.date) > new Date(entry.date));
      }

      if (!completion) return;
      const days = Math.max(0, (new Date(completion.date) - new Date(entry.date)) / 86400000);
      const target = durations.find(item => item.stage === entry.stage);
      target.total += days;
      target.count += 1;
    });
  });

  return durations.map(item => ({
    ...item,
    average: item.count ? (item.total / item.count).toFixed(1) : "—"
  }));
}

function getAllowedPages(role) {
  if (role === "Admin") return ["Overview", "All Claims", "Pending Approvals", "Overdue Claims", "Analytics"];
  if (role === "HR / LWO Officer") return ["Overview", "All Claims", "Pending Approvals", "Overdue Claims", "Analytics"];
  if (role === "Approving Authority" || role === "Finance Officer") {
    return ["Overview", "Pending Approvals", "Overdue Claims"];
  }
  if (role === "Senior Management") return ["Overview", "All Claims", "Overdue Claims", "Analytics"];
  return ["Overview", "All Claims"];
}

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const daysPending = (date) =>
  Math.max(0, Math.floor(
    (Date.now() - new Date(date).getTime()) /
    (1000 * 60 * 60 * 24)
  ));

function getOverdue(claim) {
  return claim.status === "Pending" &&
    daysPending(claim.stageStartedAt) > claim.slaDays;
}

function StatusBadge({ claim }) {
  if (claim.status === "Approved") {
    return <span className="badge approved">Approved</span>;
  }

  if (claim.status === "Rejected") {
    return <span className="badge rejected">Rejected</span>;
  }

  if (claim.status === "Needs Correction") {
    return <span className="badge pending">Needs Correction</span>;
  }

  if (getOverdue(claim)) {
    return <span className="badge overdue">Overdue</span>;
  }

  return <span className="badge pending">Pending</span>;
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={19} />
        </div>
      </div>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function App() {
  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem("dtl_claims");
    return saved ? JSON.parse(saved) : initialClaims;
  });

  const [role, setRole] = useState(() => localStorage.getItem("dtl_demo_role") || "HR / LWO Officer");
  const [employeeId, setEmployeeId] = useState(() => localStorage.getItem("dtl_demo_employee") || "DTL-E001");
  const [activePage, setActivePage] = useState("Overview");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("dtl_claims", JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem("dtl_demo_role", role);
    localStorage.setItem("dtl_demo_employee", employeeId);
    const allowed = getAllowedPages(role);
    if (!allowed.includes(activePage)) setActivePage("Overview");
    setSelectedClaim(null);
  }, [role, employeeId]);

  const visibleClaims = useMemo(() => {
    if (role === "Employee") return claims.filter(c => c.employeeId === employeeId);
    if (role === "Approving Authority") {
      return claims.filter(c => ["Department Head", "Final Authority"].includes(c.currentStage) || c.status !== "Pending");
    }
    if (role === "Finance Officer") {
      return claims.filter(c => c.currentStage === "Finance" || c.status !== "Pending");
    }
    return claims;
  }, [claims, role, employeeId]);

  const pending = visibleClaims.filter(c => c.status === "Pending");
  const approved = visibleClaims.filter(c => c.status === "Approved");
  const rejected = visibleClaims.filter(c => c.status === "Rejected");
  const overdue = pending.filter(getOverdue);

  const totalAmount = visibleClaims.reduce((sum, c) => sum + c.amount, 0);

  const recentActivity = visibleClaims.flatMap(claim =>
    (claim.history || []).slice(-2).map((item, index) => ({
      id: `${claim.id}-${item.date}-${index}`,
      claimId: claim.id,
      message: `${claim.id}: ${item.action}${item.actor ? ` by ${item.actor}` : ""}`,
      date: item.date,
      action: item.action
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const notifications = [
    ...overdue.map(c => ({
      id: `overdue-${c.id}`,
      claimId: c.id,
      message: `${c.id} is overdue at ${c.currentStage}`,
      date: c.stageStartedAt,
      action: "Overdue"
    })),
    ...recentActivity
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12);

  const filteredClaims = useMemo(() => {
    return visibleClaims.filter(c => {
      const matchesSearch =
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.employee.toLowerCase().includes(search.toLowerCase()) ||
        c.employeeId.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" || c.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Overdue"
          ? getOverdue(c)
          : c.status === statusFilter);

      const matchesPage =
        activePage === "Overview" ||
        activePage === "All Claims" ||
        (activePage === "Pending Approvals" && ["Pending", "Needs Correction"].includes(c.status)) ||
        (activePage === "Overdue Claims" && getOverdue(c));

      return matchesSearch && matchesType && matchesStatus && matchesPage;
    });
  }, [visibleClaims, search, typeFilter, statusFilter, activePage]);

  const stageStats = stages.map(stage => ({
    name: stage,
    count: pending.filter(c => c.currentStage === stage).length
  }));

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function updateClaim(id, action, remarks = "") {
    const targetClaim = claims.find(c => c.id === id);
    const employeeResubmission = action === "resubmit" && canEmployeeResubmit(role, targetClaim, employeeId);
    const authorizedAction = canRoleAct(role, targetClaim) && ["approve", "reject", "return", "paid"].includes(action);

    if (!targetClaim || (!authorizedAction && !employeeResubmission)) {
      showToast("You do not have permission to perform this action.");
      return;
    }
    if (["reject", "return"].includes(action) && !remarks.trim()) {
      showToast("Please enter remarks before continuing.");
      return;
    }

    const now = new Date().toISOString();
    const actor = role === "Employee"
      ? employeeAccounts.find(person => person.id === employeeId)?.name || employeeId
      : role;

    setClaims(previous => previous.map(claim => {
      if (claim.id !== id) return claim;
      const addHistory = (stage, actionLabel) => ({
        stage,
        date: now,
        action: actionLabel,
        actor,
        role,
        remarks: remarks.trim()
      });

      if (action === "resubmit") {
        return {
          ...claim,
          status: "Pending",
          currentStage: "HR Verification",
          stageStartedAt: now,
          history: [...claim.history, addHistory("Employee", "Resubmitted")]
        };
      }

      if (action === "return") {
        return {
          ...claim,
          status: "Needs Correction",
          currentStage: "HR Verification",
          stageStartedAt: now,
          returnedFromStage: claim.currentStage,
          history: [...claim.history, addHistory(claim.currentStage, "Returned for Correction")]
        };
      }

      if (action === "reject") {
        return {
          ...claim,
          status: "Rejected",
          history: [...claim.history, addHistory(claim.currentStage, "Rejected")]
        };
      }

      if (action === "paid") {
        return {
          ...claim,
          status: "Approved",
          currentStage: "Completed",
          paymentProcessedAt: now,
          history: [...claim.history, addHistory("Finance", "Payment Processed")]
        };
      }

      const currentIndex = stages.indexOf(claim.currentStage);
      const nextStage = stages[currentIndex + 1];
      const approvedHistory = [...claim.history, addHistory(claim.currentStage, "Approved")];

      if (!nextStage) {
        return {
          ...claim,
          status: "Approved",
          currentStage: "Completed",
          history: approvedHistory
        };
      }

      return {
        ...claim,
        currentStage: nextStage,
        stageStartedAt: now,
        history: [...approvedHistory, addHistory(nextStage, "Pending")]
      };
    }));

    setSelectedClaim(null);
    const messages = {
      approve: "Claim approved and forwarded to the next stage.",
      reject: "Claim rejected. Remarks recorded.",
      return: "Claim returned for correction. Employee can now resubmit.",
      paid: "Payment marked as processed successfully.",
      resubmit: "Corrected claim resubmitted to HR for verification."
    };
    showToast(messages[action] || "Claim updated.");
  }

  function resetDemo() {
    setClaims(initialClaims);
    localStorage.removeItem("dtl_claims");
    showToast("Demo data has been reset.");
  }

  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "All Claims", icon: FileText },
    { name: "Pending Approvals", icon: Clock },
    { name: "Overdue Claims", icon: AlertTriangle },
    { name: "Analytics", icon: BarChart3 }
  ].filter(item => getAllowedPages(role).includes(item.name));

  return (
    <div className="app-shell">

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">
            <img src="./dtl-logo.png" alt="DTL Logo" />
          </div>
          <div>
            <h3>Delhi Transco Limited</h3>
            <span>Welfare Monitoring</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20}/>
          </button>
        </div>

        <div className="sidebar-section">MAIN MENU</div>

        <nav>
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${activePage === item.name ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item.name);
                  setSidebarOpen(false);
                  setSearch("");
                  setTypeFilter("All");
                  setStatusFilter("All");
                  
                }}
              >
                <Icon size={19}/>
                <span>{item.name}</span>
                {item.name === "Overdue Claims" && overdue.length > 0 &&
                  <span className="nav-count">{overdue.length}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="secure-label">
            <ShieldCheck size={17}/>
            <span>Prototype Demo System</span>
          </div>
          <p>DTL Welfare Management<br/>Prototype v1.0</p>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}/>
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="top-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21}/>
            </button>
            <div>
              <div className="breadcrumb">DTL / Welfare Management</div>
              <h2>{activePage}</h2>
            </div>
          </div>

          <div className="top-actions">
            <button
              className="icon-button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              title="Notifications"
            >
              <Bell size={20}/>
              {notifications.length > 0 &&
                <span className="notification-dot"/>
              }
            </button>

            {role === "Admin" && (
              <button className="icon-button" onClick={resetDemo} title="Reset demo">
                <RefreshCw size={18}/>
              </button>
            )}

            <div className="profile" style={{ gap: 10 }}>
              <div className="avatar">{role === "Employee" ? "EM" : role === "Admin" ? "AD" : "DTL"}</div>
              <div className="profile-info">
                <strong>{role}</strong>
                <span>Demo access</span>
              </div>
              <select
                aria-label="Switch demo role"
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{ maxWidth: 180, padding: "7px 9px", border: "1px solid #d9e0e8", borderRadius: 7, background: "white" }}
              >
                {roles.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            {role === "Employee" && (
              <select
                aria-label="Select demo employee"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                style={{ maxWidth: 170, padding: "7px 9px", border: "1px solid #d9e0e8", borderRadius: 7, background: "white" }}
              >
                {employeeAccounts.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
            )}
          </div>

          {notificationOpen && (
            <div className="notification-panel">
              <h3>Notifications</h3>
              {notifications.length === 0
                ? <p>No overdue notifications.</p>
                : notifications.map(n => (
                  <div
                    className="notification-item"
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const matchingClaim = visibleClaims.find(claim => claim.id === n.claimId);
                      if (matchingClaim) setSelectedClaim(matchingClaim);
                      setNotificationOpen(false);
                    }}
                  >
                    <AlertTriangle size={17}/>
                    <div>
                      <strong>{n.message}</strong>
                      <small>{formatDate(n.date)} · {n.action}</small>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </header>

        <div className="content">
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "#eef4fb", border: "1px solid #d9e5f2", borderRadius: 8, color: "#34516f", fontSize: 13 }}>
            Signed in as <strong>{role}</strong> · {role === "Employee" ? `Showing claims for ${employeeAccounts.find(p => p.id === employeeId)?.name || employeeId}` : role === "Approving Authority" ? "Showing claims awaiting department-head or final-authority review" : role === "Finance Officer" ? "Showing finance-stage claims" : "Role-based demo access is active"}
          </div>

          {activePage === "Overview" && (
            <>
              <div className="welcome-row">
                <div>
                  <h1>Welfare Overview</h1>
                  <p>Monitor employee welfare applications and approval progress.</p>
                </div>
                <span className="date-label">
                  <CalendarDays size={16}/>
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit", month: "long", year: "numeric"
                  })}
                </span>
              </div>

              <div className="stats-grid">
                <StatCard title="Total Applications" value={visibleClaims.length}
                  subtitle="Applications visible to this role" icon={FileText} color="blue"/>
                <StatCard title="Pending Applications" value={pending.length}
                  subtitle="Awaiting approval" icon={Clock} color="orange"/>
                <StatCard title="Overdue Applications" value={overdue.length}
                  subtitle="Exceeding configured SLA" icon={AlertTriangle} color="red"/>
                <StatCard title="Approved Applications" value={approved.length}
                  subtitle="Successfully processed" icon={CheckCircle2} color="green"/>
              </div>

              <div className="dashboard-grid">
                <div className="panel stage-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Approval Stage Overview</h3>
                      <p>Distribution of pending applications</p>
                    </div>
                    <Activity size={20}/>
                  </div>

                  {stageStats.map(stage => (
                    <div className="stage-row" key={stage.name}>
                      <div className="stage-info">
                        <span>{stage.name}</span>
                        <strong>{stage.count}</strong>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pending.length
                              ? stage.count / pending.length * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel summary-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Application Summary</h3>
                      <p>Current application distribution</p>
                    </div>
                    <BarChart3 size={20}/>
                  </div>

                  <div className="summary-row">
                    <span className="summary-dot green-dot"/>
                    <span>Approved</span>
                    <strong>{approved.length}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-dot orange-dot"/>
                    <span>Pending</span>
                    <strong>{pending.length}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="summary-dot red-dot"/>
                    <span>Rejected</span>
                    <strong>{rejected.length}</strong>
                  </div>

                  <div className="summary-total">
                    <span>Total claim value</span>
                    <strong>{money(totalAmount)}</strong>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Priority Applications</h3>
                    <p>Claims requiring attention</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("Overdue Claims")}
                  >
                    View overdue <ChevronRight size={16}/>
                  </button>
                </div>

                <ClaimTable
                  claims={overdue.slice(0, 5)}
                  onSelect={setSelectedClaim}
                />
              </div>
            </>
          )}

          {activePage !== "Overview" && activePage !== "Analytics" && (
            <>
              <div className="welcome-row">
                <div>
                  <h1>{activePage}</h1>
                  <p>Search, monitor and manage employee welfare applications.</p>
                </div>
              </div>

              <div className="panel">
                <div className="filter-bar">
                  <div className="search-box">
                    <Search size={18}/>
                    <input
                      placeholder="Search claim ID, employee..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <option value="All">All claim types</option>
                    <option>Medical Reimbursement</option>
                    <option>LTC</option>
                    <option>Children Education Fund</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Needs Correction">Needs Correction</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <ClaimTable
                  claims={filteredClaims}
                  onSelect={setSelectedClaim}
                />
                <div className="table-footer">
                  Showing {filteredClaims.length} of {visibleClaims.length} applications
                </div>
              </div>
            </>
          )}

          {activePage === "Analytics" && (
            <>
              <div className="welcome-row">
                <div>
                  <h1>Approval Analytics</h1>
                  <p>Identify stages with the highest pending workload.</p>
                </div>
              </div>

              <div className="stats-grid">
                <StatCard title="Total Pending" value={pending.length}
                  subtitle="Active applications" icon={Clock} color="orange"/>
                <StatCard title="Overdue" value={overdue.length}
                  subtitle="Beyond configured SLA" icon={AlertTriangle} color="red"/>
                <StatCard title="Approved" value={approved.length}
                  subtitle="Completed claims" icon={CheckCircle2} color="green"/>
                <StatCard title="Rejected" value={rejected.length}
                  subtitle="Rejected claims" icon={XCircle} color="blue"/>
              </div>

              <div className="panel analytics-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Pending Applications by Stage</h3>
                    <p>Current backlog distribution</p>
                  </div>
                  <BarChart3 size={20}/>
                </div>

                {stageStats.map(stage => (
                  <div className="analytics-row" key={stage.name}>
                    <span>{stage.name}</span>
                    <div className="analytics-track">
                      <div
                        className="analytics-fill"
                        style={{
                          width: `${pending.length
                            ? stage.count / pending.length * 100
                            : 0}%`
                        }}
                      />
                    </div>
                    <strong>{stage.count}</strong>
                  </div>
                ))}
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Average Processing Time by Stage</h3>
                    <p>Calculated from recorded approval history; values are based on available demo events.</p>
                  </div>
                  <Clock size={20}/>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>Approval Stage</th><th>Completed Records</th><th>Average Time (days)</th></tr></thead>
                    <tbody>
                      {getStageDurations(visibleClaims).map(item => (
                        <tr key={item.stage}>
                          <td><strong>{item.stage}</strong></td>
                          <td>{item.count}</td>
                          <td>{item.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Overdue Claims</h3>
                    <p>Applications currently exceeding their SLA</p>
                  </div>
                </div>
                <ClaimTable claims={overdue} onSelect={setSelectedClaim}/>
              </div>
            </>
          )}

          <footer className="footer">
            Delhi Transco Limited | Welfare Approval Monitoring Prototype
            <span>Demonstration data only · Not connected to SAP ERP</span>
          </footer>
        </div>
      </main>

      {selectedClaim && (
        <ClaimModal
          claim={claims.find(c => c.id === selectedClaim.id) || selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onAction={updateClaim}
          canAct={canRoleAct(role, claims.find(c => c.id === selectedClaim.id) || selectedClaim)}
          canResubmit={canEmployeeResubmit(role, claims.find(c => c.id === selectedClaim.id) || selectedClaim, employeeId)}
          role={role}
        />
      )}

      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  );
}

function ClaimTable({ claims, onSelect }) {
  if (!claims.length) {
    return (
      <div className="empty-state">
        <CheckCircle2 size={32}/>
        <h3>No applications found</h3>
        <p>There are no claims matching this selection.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Claim ID</th>
            <th>Employee</th>
            <th>Claim Type</th>
            <th>Amount</th>
            <th>Current Stage</th>
            <th>Pending Days</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {claims.map(c => (
            <tr key={c.id}>
              <td><strong>{c.id}</strong></td>
              <td>
                <div className="employee-cell">
                  <div className="small-avatar">
                    {c.employee.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <strong>{c.employee}</strong>
                    <small>{c.employeeId}</small>
                  </div>
                </div>
              </td>
              <td>{c.type}</td>
              <td>{money(c.amount)}</td>
              <td>{c.currentStage}</td>
              <td>
                <strong className={getOverdue(c) ? "red-text" : ""}>
                  {c.status === "Pending" ? daysPending(c.stageStartedAt) : "—"}
                </strong>
              </td>
              <td><StatusBadge claim={c}/></td>
              <td>
                <button className="view-button" onClick={() => onSelect(c)}>
                  <Eye size={16}/> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClaimModal({ claim, onClose, onAction, canAct, canResubmit, role }) {
  const [remarks, setRemarks] = useState("");
  const days = daysPending(claim.stageStartedAt);
  const isFinance = role === "Finance Officer" && claim.currentStage === "Finance";

  function submitAction(action) {
    onAction(claim.id, action, remarks);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="breadcrumb">CLAIM DETAILS</span>
            <h2>{claim.id}</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X/></button>
        </div>

        <div className="modal-body">
          <div className="claim-person">
            <div className="avatar large-avatar">
              {claim.employee.split(" ").map(n => n[0]).join("").slice(0,2)}
            </div>
            <div>
              <h3>{claim.employee}</h3>
              <p>{claim.employeeId} · {claim.department}</p>
            </div>
            <StatusBadge claim={claim}/>
          </div>

          <div className="details-grid">
            <div><span>Claim type</span><strong>{claim.type}</strong></div>
            <div><span>Claim amount</span><strong>{money(claim.amount)}</strong></div>
            <div><span>Submitted on</span><strong>{formatDate(claim.submittedAt)}</strong></div>
            <div><span>Current stage</span><strong>{claim.currentStage}</strong></div>
            <div><span>Pending duration</span><strong>{claim.status === "Pending" ? `${days} days` : "—"}</strong></div>
            <div><span>Configured SLA</span><strong>{claim.slaDays} days</strong></div>
          </div>

          {claim.status === "Needs Correction" && (
            <div className="sla-notice sla-danger">
              <AlertTriangle size={19}/>
              <div>
                <strong>Correction required</strong>
                <p>Returned from {claim.returnedFromStage || "the approval process"}. Review the remarks in the timeline and resubmit after correction.</p>
              </div>
            </div>
          )}

          {claim.status === "Pending" && (
            <div className={`sla-notice ${getOverdue(claim) ? "sla-danger" : ""}`}>
              <AlertTriangle size={19}/>
              <div>
                <strong>{getOverdue(claim) ? "Approval SLA exceeded" : "Within configured SLA"}</strong>
                <p>
                  {getOverdue(claim)
                    ? `${days - claim.slaDays} days beyond the configured timeline.`
                    : `${Math.max(0, claim.slaDays - days)} days remaining before the SLA is exceeded.`}
                </p>
              </div>
            </div>
          )}

          <h3 className="timeline-title">Approval & Audit Timeline</h3>
          <div className="timeline">
            {[...(claim.history || [])].slice().reverse().map((item, index) => (
              <div className="timeline-item" key={`${item.date}-${index}`}>
                <div className={`timeline-dot ${
                  ["Approved", "Completed", "Payment Processed", "Resubmitted"].includes(item.action)
                    ? "done" : ["Rejected", "Returned for Correction"].includes(item.action) ? "failed" : "waiting"
                }`}>
                  {["Rejected", "Returned for Correction"].includes(item.action) ? <XCircle size={14}/> :
                    item.action === "Pending" ? <Clock size={14}/> : <CheckCircle2 size={14}/>}
                </div>
                <div className="timeline-content">
                  <strong>{item.stage} · {item.action}</strong>
                  {item.actor && <span>{item.actor} ({item.role || "User"})</span>}
                  {item.remarks && <p style={{ margin: "4px 0", color: "#5b6472", fontSize: 12 }}>Remarks: {item.remarks}</p>}
                  <small>{formatDate(item.date)} · {new Date(item.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small>
                </div>
              </div>
            ))}
          </div>

          {(canAct || canResubmit) && (
            <div style={{ marginTop: 20 }}>
              <label htmlFor="claim-remarks" style={{ display: "block", fontWeight: 600, marginBottom: 7, fontSize: 13 }}>
                Remarks {canResubmit ? "(optional)" : "(required for rejection or return)"}
              </label>
              <textarea
                id="claim-remarks"
                rows="3"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder={canResubmit ? "Add a note about the corrections made..." : "Enter verification notes or reason for return/rejection..."}
                style={{ width: "100%", padding: 11, border: "1px solid #d9e0e8", borderRadius: 8, resize: "vertical", font: "inherit" }}
              />
            </div>
          )}
        </div>

        {canAct && (
          <div className="modal-actions" style={{ flexWrap: "wrap" }}>
            <button className="reject-button" onClick={() => submitAction("reject")}>
              <XCircle size={17}/> Reject
            </button>
            <button className="reject-button" onClick={() => submitAction("return")}>
              <RefreshCw size={16}/> Return for Correction
            </button>
            {isFinance ? (
              <button className="approve-button" onClick={() => submitAction("paid")}>
                <CheckCircle2 size={17}/> Mark Payment Processed
              </button>
            ) : (
              <button className="approve-button" onClick={() => submitAction("approve")}>
                <CheckCircle2 size={17}/> {role === "HR / LWO Officer" ? "Verify & Forward" : "Approve & Forward"}
              </button>
            )}
          </div>
        )}

        {canResubmit && (
          <div className="modal-actions">
            <button className="approve-button" onClick={() => submitAction("resubmit")}>
              <CheckCircle2 size={17}/> Resubmit Corrected Claim
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
