import type {
  AttendanceRecord,
  CheckInResponse,
  Descriptor,
  Employee,
  EnrollPayload,
  RegisterEmployeePayload,
} from '../type';

const API_BASE = '/api';

// ── generic helpers ─────────────────────────────────────────────────
async function post<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const ct = res.headers.get('content-type');
  if (!ct || !ct.includes('application/json')) {
    throw new Error(`Expected JSON from ${url}, got ${ct || 'non-JSON'}`);
  }
  return res.json() as Promise<TResponse>;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// ── flag: use mock data while backend isn't ready ───────────────────
const USE_MOCK = true;

// ── mock data store (in-memory, resets on reload) ───────────────────
let mockEmployees: Employee[] = [
  { id: 1, name: 'Arjun Patel',     department: 'Engineering', enrolledAt: '2026-11-01T09:00:00', hasDescriptor: true },
  { id: 2, name: 'Priya Sharma',    department: 'Design',      enrolledAt: '2026-11-02T10:30:00', hasDescriptor: true },
  { id: 3, name: 'Rahul Verma',     department: 'Marketing',   enrolledAt: '2026-11-03T08:15:00', hasDescriptor: false },
  { id: 4, name: 'Sneha Gupta',     department: 'Engineering', enrolledAt: '2026-11-04T11:00:00', hasDescriptor: true },
  { id: 5, name: 'Vikram Singh',    department: 'HR',          enrolledAt: '2026-11-05T09:45:00', hasDescriptor: true },
];

let mockAttendance: AttendanceRecord[] = [
  { id: 1, employeeId: 1, employeeName: 'Arjun Patel',   department: 'Engineering', checkInTime: '2026-11-11T08:55:00', checkOutTime: '2026-11-11T17:05:00', status: 'PRESENT', date: '2026-11-11' },
  { id: 2, employeeId: 2, employeeName: 'Priya Sharma',  department: 'Design',      checkInTime: '2026-11-11T09:12:00', checkOutTime: '2026-11-11T18:00:00', status: 'LATE',    date: '2026-11-11' },
  { id: 3, employeeId: 4, employeeName: 'Sneha Gupta',   department: 'Engineering', checkInTime: '2026-11-11T08:30:00', checkOutTime: null,                  status: 'PRESENT', date: '2026-11-11' },
  { id: 4, employeeId: 5, employeeName: 'Vikram Singh',  department: 'HR',          checkInTime: '2026-11-11T08:58:00', checkOutTime: '2026-11-11T17:30:00', status: 'PRESENT', date: '2026-11-11' },
  { id: 5, employeeId: 1, employeeName: 'Arjun Patel',   department: 'Engineering', checkInTime: '2026-11-10T09:00:00', checkOutTime: '2026-11-10T17:15:00', status: 'PRESENT', date: '2026-11-10' },
  { id: 6, employeeId: 2, employeeName: 'Priya Sharma',  department: 'Design',      checkInTime: '2026-11-10T08:45:00', checkOutTime: '2026-11-10T17:00:00', status: 'PRESENT', date: '2026-11-10' },
  { id: 7, employeeId: 3, employeeName: 'Rahul Verma',   department: 'Marketing',   checkInTime: '2026-11-10T10:05:00', checkOutTime: '2026-11-10T18:30:00', status: 'LATE',    date: '2026-11-10' },
];

let nextEmployeeId = 6;
let nextAttendanceId = 8;

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── employees ───────────────────────────────────────────────────────
export async function registerEmployee(payload: RegisterEmployeePayload): Promise<Employee> {
  if (USE_MOCK) {
    await delay();
    const emp: Employee = {
      id: nextEmployeeId++,
      name: payload.name,
      department: payload.department,
      enrolledAt: new Date().toISOString(),
      hasDescriptor: payload.descriptor.length > 0,
    };
    mockEmployees = [emp, ...mockEmployees];
    return emp;
  }
  return post<RegisterEmployeePayload, Employee>(`${API_BASE}/employees/register`, payload);
}

export async function getEmployees(): Promise<Employee[]> {
  if (USE_MOCK) {
    await delay(200);
    return [...mockEmployees];
  }
  return get<Employee[]>(`${API_BASE}/employees`);
}

// ── enroll face descriptor for existing employee ────────────────────
export async function enroll(employeeId: number, descriptor: Descriptor): Promise<void> {
  if (USE_MOCK) {
    await delay();
    mockEmployees = mockEmployees.map((e) =>
      e.id === employeeId ? { ...e, hasDescriptor: true } : e,
    );
    return;
  }
  await post<EnrollPayload, void>(`${API_BASE}/employees/${employeeId}/descriptors`, { descriptor });
}

// ── check-in ────────────────────────────────────────────────────────
export async function checkIn(descriptor: Descriptor): Promise<CheckInResponse> {
  if (USE_MOCK) {
    await delay(600);
    // Simulate a match with the first enrolled employee
    const enrolled = mockEmployees.find((e) => e.hasDescriptor);
    if (!enrolled) return { matched: false };

    const now = new Date();
    const record: AttendanceRecord = {
      id: nextAttendanceId++,
      employeeId: enrolled.id,
      employeeName: enrolled.name,
      department: enrolled.department,
      checkInTime: now.toISOString(),
      checkOutTime: null,
      status: now.getHours() >= 9 ? 'LATE' : 'PRESENT',
      date: now.toISOString().split('T')[0],
    };
    mockAttendance = [record, ...mockAttendance];

    return {
      matched: true,
      employeeId: enrolled.id,
      employeeName: enrolled.name,
      distance: 0.35,
      timestamp: now.toISOString(),
    };
  }
  return post<EnrollPayload, CheckInResponse>(`${API_BASE}/attendance/check-in`, { descriptor });
}

// ── attendance records ──────────────────────────────────────────────
export async function getAttendance(date?: string): Promise<AttendanceRecord[]> {
  if (USE_MOCK) {
    await delay(200);
    if (date) return mockAttendance.filter((a) => a.date === date);
    return [...mockAttendance];
  }
  const query = date ? `?date=${date}` : '';
  return get<AttendanceRecord[]>(`${API_BASE}/attendance${query}`);
}

export async function checkOut(employeeId: number): Promise<void> {
  if (USE_MOCK) {
    await delay();
    const today = new Date().toISOString().split('T')[0];
    mockAttendance = mockAttendance.map((a) =>
      a.employeeId === employeeId && a.date === today && !a.checkOutTime
        ? { ...a, checkOutTime: new Date().toISOString() }
        : a,
    );
    return;
  }
  await post<{ employeeId: number }, void>(`${API_BASE}/attendance/check-out`, { employeeId });
}
