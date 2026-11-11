import { useEffect, useState } from 'react';
import { getEmployees, getAttendance } from '../models/api';
import type { Employee, AttendanceRecord } from '../type';
import './Pages.css';

export default function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEmployees(), getAttendance()]).then(([emps, att]) => {
      setEmployees(emps);
      setAttendance(att);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.date === today);
  const presentCount = todayRecords.filter((a) => a.status === 'PRESENT').length;
  const lateCount = todayRecords.filter((a) => a.status === 'LATE').length;
  const enrolledCount = employees.filter((e) => e.hasDescriptor).length;

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Overview of today's attendance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{employees.length}</span>
            <span className="stat-label">Total Employees</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{presentCount}</span>
            <span className="stat-label">Present Today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{lateCount}</span>
            <span className="stat-label">Late Today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0-6 0" />
              <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{enrolledCount}</span>
            <span className="stat-label">Face Enrolled</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Recent Attendance</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.slice(0, 5).map((record) => (
                <tr key={record.id}>
                  <td className="cell-name">{record.employeeName}</td>
                  <td>{record.department}</td>
                  <td>{formatTime(record.checkInTime)}</td>
                  <td>{record.checkOutTime ? formatTime(record.checkOutTime) : '—'}</td>
                  <td><StatusBadge status={record.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className = `badge badge--${status.toLowerCase()}`;
  return <span className={className}>{status}</span>;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

