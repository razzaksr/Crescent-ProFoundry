import React from "react";
import { Building, GraduationCap, User, Users } from "lucide-react";

export default function CourseInfoCards({ orgName, moduleName, expertName, coordinatorName, styles }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: 
          window.innerWidth < 480 ? "1fr" :
          window.innerWidth < 768 ? "repeat(2, 1fr)" :
          "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          ...styles.statCard,
          backgroundColor: "rgba(56, 182, 255, 0.1)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            ...styles.iconWrapper,
            backgroundColor: "rgba(56, 182, 255, 0.2)",
            color: "#38b6ff",
          }}
        >
          <Building size={20} />
        </div>
        <div>
          <div style={styles.statTitle}>ORGANIZATION</div>
          <div style={styles.statValue}>{orgName}</div>
        </div>
      </div>

      <div
        style={{
          ...styles.statCard,
          backgroundColor: "rgba(255, 102, 196, 0.1)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            ...styles.iconWrapper,
            backgroundColor: "rgba(255, 102, 196, 0.2)",
            color: "#ff66c4",
          }}
        >
          <GraduationCap size={20} />
        </div>
        <div>
          <div style={styles.statTitle}>MODULE</div>
          <div style={styles.statValue}>{moduleName}</div>
        </div>
      </div>

      <div
        style={{
          ...styles.statCard,
          backgroundColor: "rgba(64, 196, 255, 0.1)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            ...styles.iconWrapper,
            backgroundColor: "rgba(64, 196, 255, 0.2)",
            color: "#40c4ff",
          }}
        >
          <User size={20} />
        </div>
        <div>
          <div style={styles.statTitle}>EXPERT</div>
          <div style={styles.statValue}>{expertName}</div>
        </div>
      </div>

      <div
        style={{
          ...styles.statCard,
          backgroundColor: "rgba(240, 98, 146, 0.1)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div
          style={{
            ...styles.iconWrapper,
            backgroundColor: "rgba(240, 98, 146, 0.2)",
            color: "#f06292",
          }}
        >
          <Users size={20} />
        </div>
        <div>
          <div style={styles.statTitle}>COORDINATOR</div>
          <div style={styles.statValue}>{coordinatorName}</div>
        </div>
      </div>
    </div>
  );
}