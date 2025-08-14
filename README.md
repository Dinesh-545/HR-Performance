# HR Performance Management System

A comprehensive enterprise HR performance management system built with Angular frontend and .NET Web API backend.

## 🚀 Features

- **Employee Management**: Complete employee profiles with organizational hierarchy
- **Goal Setting**: Quarterly and annual goal tracking with progress monitoring
- **Performance Reviews**: 360-degree feedback system with customizable templates
- **Skill Assessment**: Track employee skills and development plans
- **Analytics Dashboard**: Comprehensive reporting and performance metrics
- **Role-Based Access**: JWT authentication with Employee, Manager, and HR Admin roles

## 🛠️ Tech Stack

### Backend
- **Framework**: .NET 9.0 Web API
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT with role-based authorization
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Angular 18
- **UI Components**: Angular Material
- **Charts**: Chart.js for analytics
- **State Management**: Angular Services

## 📋 Prerequisites

- .NET 9.0 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB, Express, or full instance)
- Visual Studio 2022 or VS Code

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd L2-Assessment
```

### 2. Backend Setup

#### Database Configuration
1. Update the connection string in `HRPerformance.Api/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=HRPerformanceDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

#### Run the Backend
```bash
cd HRPerformance.Api
dotnet restore
dotnet ef database update
dotnet run
```

The API will be available at `https://localhost:7001` (or the configured port).

#### API Documentation
Access Swagger documentation at: `https://localhost:7001/swagger`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd HRPerformance.Web
npm install
```

#### Run the Frontend
```bash
ng serve
```

The application will be available at `http://localhost:4200`

### 4. Access the Application

1. Navigate to `http://localhost:4200`
2. Login with default credentials (see Sample Data section)
3. Explore the different modules: Employees, Goals, Reviews, Skills, Analytics

## 📊 Sample Data

The application includes sample data for demonstration:

### Default Users
- **HR Admin**: admin@company.com / admin123
- **Manager**: manager@company.com / manager123
- **Employee**: employee@company.com / employee123

### Sample Data Includes
- 10+ employees across different departments
- Sample goals with various statuses
- Performance reviews and ratings
- Skill assessments and development plans

## 🔧 Development

### Backend Development

#### Project Structure
```
HRPerformance.Api/
├── Controllers/          # API endpoints
├── Models/Entities/      # Database entities
├── Data/                # DbContext and migrations
├── Services/            # Business logic (if applicable)
└── Program.cs           # Application entry point
```

#### Adding New Endpoints
1. Create controller in `Controllers/` folder
2. Add XML documentation comments for Swagger
3. Include proper response type attributes
4. Test via Swagger UI

#### Database Migrations
```bash
# Create new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update
```

### Frontend Development

#### Project Structure
```
HRPerformance.Web/src/app/
├── components/          # Angular components
├── services/           # API services
├── models/             # TypeScript interfaces
├── guards/             # Route guards
└── app.routes.ts       # Routing configuration
```

#### Adding New Components
```bash
ng generate component components/feature-name
```

#### API Service Integration
1. Create service in `services/` folder
2. Inject HttpClient for API calls
3. Add error handling and loading states
4. Update components to use the service

## 🧪 Testing

### Backend Testing
```bash
cd HRPerformance.Api
dotnet test
```

### Frontend Testing
```bash
cd HRPerformance.Web
ng test
```

### E2E Testing
```bash
cd HRPerformance.Web
ng e2e
```

## 📚 API Documentation

### Authentication
The API uses JWT Bearer token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Available Endpoints

#### Employees
- `GET /api/Employees` - Get all employees
- `GET /api/Employees/{id}` - Get specific employee
- `POST /api/Employees` - Create new employee
- `PUT /api/Employees/{id}` - Update employee
- `DELETE /api/Employees/{id}` - Delete employee

#### Goals
- `GET /api/Goals` - Get all goals
- `GET /api/Goals/{id}` - Get specific goal
- `POST /api/Goals` - Create new goal
- `PUT /api/Goals/{id}` - Update goal
- `DELETE /api/Goals/{id}` - Delete goal

#### Reviews
- `GET /api/Reviews` - Get all reviews
- `GET /api/Reviews/{id}` - Get specific review
- `POST /api/Reviews` - Create new review
- `PUT /api/Reviews/{id}` - Update review
- `DELETE /api/Reviews/{id}` - Delete review

#### Skills
- `GET /api/Skills` - Get all skills
- `GET /api/Skills/{id}` - Get specific skill
- `POST /api/Skills` - Create new skill
- `PUT /api/Skills/{id}` - Update skill
- `DELETE /api/Skills/{id}` - Delete skill

## 🔐 Security

### JWT Configuration
Update JWT settings in `appsettings.json`:
```json
{
  "Jwt": {
    "Key": "your-super-secret-key-here",
    "Issuer": "HRPerformance"
  }
}
```

### Role-Based Access
- **Employee**: Can view own profile, goals, and reviews
- **Manager**: Can manage team members and their goals/reviews
- **HR Admin**: Full access to all features and data

## 🚀 Deployment

### Backend Deployment
1. Build the application: `dotnet publish -c Release`
2. Deploy to your hosting platform (Azure, AWS, etc.)
3. Configure connection strings and JWT settings
4. Run database migrations

### Frontend Deployment
1. Build the application: `ng build --prod`
2. Deploy the `dist/` folder to your web server
3. Update API base URL in environment files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/swagger`
- Review the code comments and XML documentation
- Create an issue in the repository

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, data validation, and error handling are implemented. 