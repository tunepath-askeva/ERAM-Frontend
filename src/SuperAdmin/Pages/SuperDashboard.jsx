const SuperDashboard = () => (
  <div style={{ padding: "24px", background: "#fff", borderRadius: "8px" }}>
    <h2>Dashboard Overview</h2>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px",
        marginTop: "24px",
      }}
    >
      <div
        style={{
          padding: "20px",
          background: "#f0f8ff",
          borderRadius: "8px",
          border: "1px solid #e1e8ed",
        }}
      >
        <h3 style={{ margin: 0, color: "#006d75" }}>Total Users</h3>
        <p
          style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0 0 0" }}
        >
          1,234
        </p>
      </div>
      <div
        style={{
          padding: "20px",
          background: "#f6ffed",
          borderRadius: "8px",
          border: "1px solid #d9f7be",
        }}
      >
        <h3 style={{ margin: 0, color: "#52c41a" }}>Active Sessions</h3>
        <p
          style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0 0 0" }}
        >
          89
        </p>
      </div>
      <div
        style={{
          padding: "20px",
          background: "#fff7e6",
          borderRadius: "8px",
          border: "1px solid #ffd591",
        }}
      >
        <h3 style={{ margin: 0, color: "#fa8c16" }}>Revenue</h3>
        <p
          style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0 0 0" }}
        >
          $12,456
        </p>
      </div>
    </div>
  </div>
);

export default SuperDashboard;
