export type UserRole = "admin" | "employee";

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: Date;
  status: "active" | "inactive" | "terminated";
  manager?: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type LeaveType =
  | "vacation"
  | "sick"
  | "personal"
  | "maternity"
  | "paternity";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  overtime: number;
  bonus: number;
  grossPay: number;
  netPay: number;
  taxDeductions: number;
  status: "pending" | "processed" | "paid";
  payDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours: number;
  status: "present" | "absent" | "late" | "half-day";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  overallRating: number;
  goals: string;
  achievements: string;
  areasForImprovement: string;
  feedback: string;
  status: "draft" | "submitted" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

// Dashboard Stats Interfaces
export interface AdminDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  pendingPayroll: number;
  departmentCount: number;
  averageRating: number;
}

export interface EmployeeDashboardStats {
  leaveBalance: {
    vacation: number;
    sick: number;
    personal: number;
  };
  attendanceThisMonth: {
    present: number;
    absent: number;
    late: number;
  };
  pendingRequests: number;
  lastPayslip?: PayrollRecord;
}