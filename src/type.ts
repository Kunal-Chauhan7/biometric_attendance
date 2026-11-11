export type Descriptor = number[];

export interface EnrollPayload {
  descriptor: Descriptor;
}

export interface CheckInResponse {
  matched: boolean;
  employeeId?: number;
  employeeName?: string;
  distance?: number;
  timestamp?: string;
}

export interface Employee {
  id: number;
  name: string;
  department: string;
  enrolledAt: string;
  hasDescriptor: boolean;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  date: string;
}

export interface RegisterEmployeePayload {
  name: string;
  department: string;
  descriptor: Descriptor;
}