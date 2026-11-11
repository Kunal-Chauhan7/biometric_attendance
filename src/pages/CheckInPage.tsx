import { useState } from 'react';
import FaceCamera from '../components/FaceCamera';
import { checkIn } from '../models/api';
import type { CheckInResponse, Descriptor } from '../type';
import './Pages.css';

type Status = 'idle' | 'scanning' | 'success' | 'not-found' | 'error';

export default function CheckInPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<CheckInResponse | null>(null);
  const [error, setError] = useState('');

  const handleDescriptor = async (d: Descriptor) => {
    setStatus('scanning');
    setError('');
    try {
      const res = await checkIn(d);
      setResult(res);
      setStatus(res.matched ? 'success' : 'not-found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setError('');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Check In</h1>
        <p className="page-subtitle">Scan your face to record attendance</p>
      </div>

      <div className="checkin-layout">
        <div className="card">
          <div className="camera-container">
            <FaceCamera onDescriptor={handleDescriptor} />
          </div>
          {status === 'idle' && (
            <p className="camera-hint">
              Position your face in the frame and press <strong>Capture</strong>
            </p>
          )}
          {status === 'scanning' && (
            <div className="scanning-indicator">
              <div className="spinner spinner--small" />
              <span>Identifying face…</span>
            </div>
          )}
        </div>

        <div className="checkin-result-panel">
          {status === 'success' && result && (
            <div className="result-card result-card--success">
              <div className="result-icon result-icon--success">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>Welcome!</h2>
              <p className="result-name">{result.employeeName}</p>
              <p className="text-muted">
                Checked in at {result.timestamp ? new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
              </p>
              {result.distance !== undefined && (
                <p className="result-confidence">
                  Match confidence: {((1 - result.distance) * 100).toFixed(1)}%
                </p>
              )}
              <button className="btn btn--primary" onClick={handleReset}>
                Next Person
              </button>
            </div>
          )}

          {status === 'not-found' && (
            <div className="result-card result-card--warning">
              <div className="result-icon result-icon--warning">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2>Face Not Recognized</h2>
              <p className="text-muted">No matching employee found. Please try again or register first.</p>
              <button className="btn btn--primary" onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="result-card result-card--error">
              <div className="result-icon result-icon--error">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2>Error</h2>
              <p className="text-muted">{error}</p>
              <button className="btn btn--primary" onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}

          {status === 'idle' && (
            <div className="result-card result-card--placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="placeholder-icon">
                <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0-6 0" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" />
              </svg>
              <p>Capture your face to check in</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

