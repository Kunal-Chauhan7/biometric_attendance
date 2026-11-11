import { useEffect, useState } from 'react';
import { getAttendance } from '../models/api';
import type { AttendanceRecord } from '../type';
import './Pages.css';

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    getAttendance(dateFilter || undefined).then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, [dateFilter]);

  const filtered = records.filter((r) => {
    const matchesSearch =
      !searchTerm || r.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Attendance Records</h1>
        <p className="page-subtitle">View and filter employee attendance history</p>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <label htmlFor="date-filter">Date</label>
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="search-filter">Search</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Search employee…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
        <button
          className="btn btn--ghost"
          onClick={() => {
            setDateFilter('');
            setSearchTerm('');
            setStatusFilter('ALL');
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Summary chips */}
      <div className="summary-chips">
        <span className="chip chip--total">{records.length} records</span>
        <span className="chip chip--present">{presentCount} present</span>
        <span className="chip chip--late">{lateCount} late</span>
      </div>

      {loading ? (
        <div className="page-loading">
          <div className="spinner" />
          <p>Loading records…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3>No records found</h3>
          <p className="text-muted">Try adjusting your filters or select a different date.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record, idx) => (
                <tr key={record.id}>
                  <td className="cell-num">{idx + 1}</td>
                  <td className="cell-name">{record.employeeName}</td>
                  <td>{record.department}</td>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatTime(record.checkInTime)}</td>
                  <td>{record.checkOutTime ? formatTime(record.checkOutTime) : '—'}</td>
                  <td><StatusBadge status={record.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

