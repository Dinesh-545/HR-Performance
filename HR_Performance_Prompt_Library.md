
# 🎯 AI Prompt Library: HR Performance Management System

## 📦 Tech Stack
- Frontend: Angular
- Backend: .NET 7+ Web API (C#)
- Database: SQL Server
- Auth: JWT with Role-based access
- AI Tool: Cursor

---


## 0. 🚀 Initial Architecture & Roadmap Prompt

Paste this first into **Cursor’s AI Chat** (`Ctrl+Shift+P → Cursor: New AI Chat`) to establish the overall architecture and development plan.

```
I need to design an enterprise HR performance management system using Angular frontend, .NET Web API backend, and SQL Server.

## Business Context:
The HR department wants to digitize employee performance reviews, goal tracking, and skill assessments.

## Core Functional Requirements:
1. Employee Profiles with org hierarchy
2. Goal Setting (quarterly/annual)
3. 360-Degree Performance Reviews
4. Skill Assessment and Development Plans
5. Reports & Analytics (goal trends, skill gaps)

## Technical Stack:
- Frontend: Angular (modular)
- Backend: .NET 7+ Web API (modular or microservices)
- Database: SQL Server (EF Core)
- Auth: JWT with role-based access (Employee, Manager, HR Admin)

## Deliverables:
- Full architecture design (services, components, data models)
- Development roadmap (phased)
- Project folder structure (backend & frontend)
- Tech stack justification

Start by:
1. Analyzing the domain and functional boundaries
2. Suggesting a service breakdown
3. Providing a phased implementation plan
4. Proposing backend and frontend structure
5. Outlining core entities and database relationships

Make the output clean, modular, and developer-friendly.
```

---
## 1. 🧑‍💼 Employee Profile Service (Backend)

```
Generate a .NET Web API (C#, .NET 7+) for managing employee profiles.

## Features:
- Create, update, delete employee
- Store personal info, role/title, department
- Store reporting manager (self-referencing)
- List organizational hierarchy (recursive)

## Requirements:
- SQL Server database
- Use Entity Framework Core
- Use DTOs and AutoMapper
- Input validation with DataAnnotations
- JWT-based authorization (Admin, Manager roles)
- RESTful endpoints

Return:
- Models, DTOs
- Controllers
- DbContext and Migrations
- Role-based access
```

---

## 2. 🎯 Goal Management Module (Backend + Frontend)

```
Design a goal-setting module for an HR app.

## Backend (C#, .NET Web API):
- Create quarterly/annual goals
- Associate goals with employees
- Support progress updates by employee & manager
- Track completion status and notes
- Fetch goals by quarter/year/employee
- SQL Server + EF Core

## Frontend (Angular):
- Component: Goal list, create/edit form
- Bind to API endpoints
- Use reactive forms
- Display progress as percentage bar

Generate:
- API structure, Angular components
- Models, DTOs, services
```

---

## 3. 📝 Performance Review Module (360° Feedback)

```
Create a 360-degree feedback system for employee performance reviews.

## Features:
- Create performance cycles (quarterly, annual)
- Allow peer, self, and manager feedback
- Generate custom evaluation forms per cycle
- Support ratings, comments, and file attachments
- Submit and lock once completed
- Admin/Manager can view summaries

## Backend:
- .NET API with SQL Server
- Use EF Core for relational structure (employee ↔ feedbacks)

## Frontend:
- Angular components to submit feedback
- Dynamic form rendering (per review template)
- Show progress/status per review

Generate models, controllers, and Angular form logic.
```

---

## 4. 📊 Skill Assessment & Development

```
Design a skill/competency tracking module.

## Features:
- Track employee skills and proficiency levels
- Manager can rate team members
- Suggest development plans (training, mentorship, etc.)
- View skill gaps by role/team

## Backend:
- .NET API (EF Core, SQL Server)
- Entities: Skill, EmployeeSkill, SkillRating, DevelopmentPlan
- Allow tagging skills to job roles

## Frontend:
- Angular table view with rating sliders
- Show recommended actions (training links, notes)
```

---

## 5. 📈 Reports & Analytics Module

```
Generate a reporting service for the HR system.

## Reports to include:
- Goal achievement trends by employee/team/department
- Performance review status and scores
- Skill gap matrix per department
- Average rating per competency

## Backend:
- .NET API endpoints for reporting
- Use raw SQL or LINQ for optimized queries
- Paginated, filterable, grouped by date/team

## Frontend:
- Angular dashboard with charts (ng2-charts or ApexCharts)
- Filters for date range, department, etc.

Generate:
- Backend reporting endpoints
- Angular dashboard page with dynamic charts
```

---

## 6. 🔐 Authentication & Role-Based Access

```
Set up JWT-based authentication in .NET Web API.

## Requirements:
- Roles: Employee, Manager, HR Admin
- Login, Register, Refresh Token
- Use ASP.NET Identity or custom user table
- Secure endpoints with [Authorize(Roles = "...")]

Also generate Angular AuthService with login/register and route guards.
```

---

## 📁 Usage Instructions
Paste each prompt into **Cursor's AI Chat** (`Ctrl+Shift+P → Cursor: New AI Chat`) during:
- Architecture phase
- API/service implementation
- Angular UI generation
- Integration and testing

---

## 📌 Step-by-Step Implementation Roadmap

### Phase 1: System Design & Architecture
- [ ] Use initial architecture prompt in Cursor
- [ ] Define services: Employee, Goals, Reviews, Skills, Reports
- [ ] Design database schema (ERD)
- [ ] Finalize backend folder structure and frontend modules

### Phase 2: Backend Service Development (using .NET)
- [ ] Implement Employee Service
- [ ] Implement Goal Management Service
- [ ] Implement Performance Review Service
- [ ] Implement Skill Assessment Service
- [ ] Implement Reporting Service
- [ ] Implement Authentication & Role Management

### Phase 3: Frontend Development (using Angular)
- [ ] Build Authentication Module with route guards
- [ ] Create Employee Profile UI (hierarchy view)
- [ ] Create Goal Setting UI with progress tracking
- [ ] Create Review Forms with 360 feedback logic
- [ ] Create Skill Assessment forms and dashboards
- [ ] Build Analytics Dashboard with charts

### Phase 4: Integration & API Binding
- [ ] Connect Angular services to .NET APIs
- [ ] Handle auth tokens and role-based routing
- [ ] Test communication between frontend and backend

### Phase 5: Testing Strategy
- [ ] Unit tests for backend services using xUnit
- [ ] Unit tests for Angular components/services
- [ ] Integration tests (e.g., auth flow, goal workflow)
- [ ] E2E tests using Cypress or Playwright
- [ ] Load test for backend endpoints (Postman/Newman)

---

## 🧪 Testing Plan

### Backend (C# / xUnit)
- [ ] Unit tests for each controller and service
- [ ] Validation and edge case handling
- [ ] Integration tests for workflows (login → goal setting → review)

### Frontend (Angular / Jasmine + Karma)
- [ ] Component unit tests
- [ ] API service tests with HttpClientTestingModule
- [ ] Form validation and error handling

### E2E Testing (Optional)
- [ ] Use Cypress or Playwright
- [ ] Test login flow, goal tracking, review submission, analytics dashboard

---

## 🐳 Deployment Setup & Dockerization

### Backend
- [ ] Create `Dockerfile` for .NET Web API
- [ ] Use `docker-compose.yml` to run SQL Server + API

### Frontend
- [ ] Create Angular `Dockerfile`
- [ ] Serve Angular app via Nginx or directly in container

### Deployment Guide
- [ ] Include `.env` support for environment config
- [ ] Document setup: build → run → test → deploy

---

## 📦 Final Deliverable Checklist

- [ ] ✅ Working Angular + .NET application
- [ ] ✅ SQL Server schema + migration scripts
- [ ] ✅ README with setup instructions
- [ ] ✅ Swagger/OpenAPI documentation
- [ ] ✅ Feature-wise prompts used (Prompt Library)
- [ ] ✅ Docker setup (backend, frontend, db)
- [ ] ✅ Sample data for demo
- [ ] ✅ Diagrams: architecture, ERD, module map
- [ ] ✅ Unit & Integration tests
- [ ] ✅ E2E test (optional)

---

## 📁 Recommended Folder Structure

### Backend (.NET 7+ Web API)

```
backend/
  Controllers/
    EmployeeController.cs
    GoalController.cs
    ReviewController.cs
    SkillController.cs
    ReportingController.cs
    AuthController.cs
  Services/
    EmployeeService.cs
    GoalService.cs
    ReviewService.cs
    SkillService.cs
    ReportingService.cs
    AuthService.cs
  Models/
    Entities/
      Employee.cs
      Goal.cs
      Review.cs
      Skill.cs
      DevelopmentPlan.cs
      User.cs
    DTOs/
      EmployeeDto.cs
      GoalDto.cs
      ReviewDto.cs
      SkillDto.cs
      DevelopmentPlanDto.cs
      UserDto.cs
  Data/
    ApplicationDbContext.cs
    Migrations/
  Helpers/
  Program.cs
  appsettings.json
```

### Frontend (Angular)

```
frontend/
  src/
    app/
      auth/
        auth.module.ts
        login/
        register/
        auth.service.ts
        auth.guard.ts
      employee/
        employee.module.ts
        profile/
        hierarchy/
        employee.service.ts
      goals/
        goals.module.ts
        goal-list/
        goal-form/
        goals.service.ts
      reviews/
        reviews.module.ts
        review-list/
        review-form/
        reviews.service.ts
      skills/
        skills.module.ts
        skill-list/
        skill-form/
        skills.service.ts
      analytics/
        analytics.module.ts
        dashboard/
        analytics.service.ts
      core/
        interceptors/
        models/
        shared/
      app.module.ts
      app-routing.module.ts
    environments/
    assets/
  angular.json
  package.json
```
