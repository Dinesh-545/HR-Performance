export interface Employee {
  id: number;
  Id?: number; // Support both camelCase and PascalCase for compatibility
  // Support both camelCase and PascalCase for compatibility
  FirstName?: string;
  firstName?: string;
  LastName?: string;
  lastName?: string;
  Email?: string;
  email?: string;
  Role?: string;
  role?: string;
  ManagerId?: number;
  managerId?: number;
  DepartmentId?: number;
  departmentId?: number;
  department?: Department;
}

export interface Department {
  id: number;
  Id?: number; // Support both camelCase and PascalCase
  name: string;
  Name?: string; // Support both camelCase and PascalCase
}

export interface Goal {
  id: number;
  Id?: number; // Support both camelCase and PascalCase for compatibility
  title: string;
  Title?: string; // Support both camelCase and PascalCase for compatibility
  description: string;
  Description?: string; // Support both camelCase and PascalCase for compatibility
  startDate: string;
  StartDate?: string; // Support both camelCase and PascalCase for compatibility
  endDate: string;
  EndDate?: string; // Support both camelCase and PascalCase for compatibility
  status: string;
  Status?: string; // Support both camelCase and PascalCase for compatibility
  employeeId: number;
  EmployeeId?: number; // Support both camelCase and PascalCase for compatibility
  managerId?: number;
  ManagerId?: number; // Support both camelCase and PascalCase for compatibility
  notes: string;
  Notes?: string; // Support both camelCase and PascalCase for compatibility
  progress?: number;
  Progress?: number; // Support both camelCase and PascalCase for compatibility
  employee?: Employee;
  Employee?: Employee; // Support both camelCase and PascalCase for compatibility
  manager?: Employee;
  Manager?: Employee; // Support both camelCase and PascalCase for compatibility
}

export interface Skill {
  id: number;
  Id?: number; // Support both camelCase and PascalCase
  name: string;
  Name?: string; // Support both camelCase and PascalCase
  description: string;
  Description?: string; // Support both camelCase and PascalCase
}

export interface EmployeeSkill {
  id: number;
  employeeId: number;
  skillId: number;
  proficiencyLevel: number;
}

export interface Review {
  id: number;
  Id?: number; // Support both camelCase and PascalCase
  cycleId: number;
  CycleId?: number; // Support both camelCase and PascalCase
  reviewerId?: number;
  ReviewerId?: number; // Support both camelCase and PascalCase
  revieweeId?: number;
  RevieweeId?: number; // Support both camelCase and PascalCase
  templateId: number;
  TemplateId?: number; // Support both camelCase and PascalCase
  rating: number;
  Rating?: number; // Support both camelCase and PascalCase
  comments: string;
  Comments?: string; // Support both camelCase and PascalCase
  attachmentPath: string;
  AttachmentPath?: string; // Support both camelCase and PascalCase
  isLocked: boolean;
  IsLocked?: boolean; // Support both camelCase and PascalCase
} 