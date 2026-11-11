import { useState } from 'react';
import FaceCamera from '../components/FaceCamera';
import { registerEmployee } from '../models/api';
import type { Descriptor } from '../type';
import './Pages.css';

type Step = 'form' | 'capture' | 'success';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [descriptor, setDescriptor] = useState<Descriptor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredName, setRegisteredName] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !department.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setStep('capture');
  };

  const handleDescriptor = (d: Descriptor) => {
    setDescriptor(d);
  };

  const handleRegister = async () => {
    if (!descriptor) return;
    setSubmitting(true);
    setError('');
    try {
      await registerEmployee({
        name: name.trim(),
        department: department.trim(),
        descriptor,
      });
      setRegisteredName(name.trim());
      setStep('success');
      // Reset for next registration
      setName('');
      setDepartment('');
      setDescriptor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setDescriptor(null);
    setError('');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Register Employee</h1>
        <p className="page-subtitle">Enroll a new employee with biometric face data</p>
      </div>

      {/* Progress steps */}
      <div className="steps-bar">
        <div className={`step-item ${step === 'form' ? 'active' : step !== 'form' ? 'done' : ''}`}>
          <div className="step-circle">1</div>
          <span>Details</span>
        </div>
        <div className="step-line" />
        <div className={`step-item ${step === 'capture' ? 'active' : step === 'success' ? 'done' : ''}`}>
          <div className="step-circle">2</div>
          <span>Face Capture</span>
        </div>
        <div className="step-line" />
        <div className={`step-item ${step === 'success' ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <span>Done</span>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {/* Step 1: Form */}
      {step === 'form' && (
        <div className="card card--narrow">
          <form onSubmit={handleFormSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="emp-name">Full Name</label>
              <input
                id="emp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter employee name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="emp-dept">Department</label>
              <select
                id="emp-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select department</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <button type="submit" className="btn btn--primary btn--full">
              Continue to Face Capture →
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Face capture */}
      {step === 'capture' && (
        <div className="capture-section">
          <div className="card">
            <h3>Position your face in the camera</h3>
            <p className="text-muted">Make sure your face is clearly visible and well-lit</p>
            <div className="camera-container">
              <FaceCamera onDescriptor={handleDescriptor} />
            </div>
            {descriptor && (
              <div className="capture-confirm">
                <div className="capture-success-indicator">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Face captured successfully
                </div>
              </div>
            )}
          </div>
          <div className="capture-actions">
            <button className="btn btn--ghost" onClick={handleReset}>
              ← Back
            </button>
            <button
              className="btn btn--primary"
              onClick={handleRegister}
              disabled={!descriptor || submitting}
            >
              {submitting ? 'Registering…' : 'Register Employee'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <div className="card card--narrow success-card">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>Registration Complete!</h2>
          <p className="text-muted">
            <strong>{registeredName}</strong> has been successfully registered with biometric data.
          </p>
          <button className="btn btn--primary" onClick={handleReset}>
            Register Another Employee
          </button>
        </div>
      )}
    </div>
  );
}

