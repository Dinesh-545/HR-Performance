# HR Performance Management System - Deployment Guide

This guide will help you deploy the HR Performance Management System to free hosting platforms.

## 🚀 Quick Deploy Options

### Option 1: Railway (Recommended - Free Tier)

Railway offers a generous free tier and supports both .NET and Node.js applications.

#### Prerequisites
1. Create a GitHub account
2. Create a Railway account at [railway.app](https://railway.app)
3. Connect your GitHub account to Railway

#### Deployment Steps

##### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure all files are committed

##### Step 2: Deploy Backend API
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose the `HRPerformance.Api` directory
5. Set environment variables:
   - `ASPNETCORE_ENVIRONMENT` = `Production`
   - `PORT` = `5055` (Railway will set this automatically)
6. Deploy the service

##### Step 3: Deploy Frontend
1. In the same Railway project, click "New Service" → "GitHub Repo"
2. Select the same repository
3. Choose the `HRPerformance.Web` directory
4. Set environment variables:
   - `NODE_ENV` = `production`
5. Deploy the service

##### Step 4: Update API URLs
1. Get your Railway API URL (e.g., `https://hr-performance-api.railway.app`)
2. Update `HRPerformance.Web/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-api-url.railway.app/api'
   };
   ```
3. Redeploy the frontend

### Option 2: Render (Alternative - Free Tier)

Render also offers a free tier with good support for .NET and Node.js.

#### Deployment Steps

##### Backend API
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `hr-performance-api`
   - **Environment**: `Docker`
   - **Build Command**: `dotnet publish -c Release -o ./publish`
   - **Start Command**: `dotnet HRPerformance.Api.dll`
   - **Environment Variables**:
     - `ASPNETCORE_ENVIRONMENT` = `Production`

##### Frontend
1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hr-performance-frontend`
   - **Build Command**: `cd HRPerformance.Web && npm install && npm run build`
   - **Publish Directory**: `HRPerformance.Web/dist/hrperformance.web`

## 🔧 Configuration Files

The following configuration files have been created for deployment:

### Backend (API)
- `HRPerformance.Api/railway.toml` - Railway configuration
- `HRPerformance.Api/build.sh` - Build script
- `HRPerformance.Api/appsettings.Production.json` - Production settings

### Frontend (Angular)
- `HRPerformance.Web/railway.toml` - Railway configuration
- `HRPerformance.Web/build.sh` - Build script
- `HRPerformance.Web/src/environments/environment.prod.ts` - Production environment

## 🌐 Environment Variables

### Backend Environment Variables
```bash
ASPNETCORE_ENVIRONMENT=Production
JWT__KEY=your-secret-jwt-key-here
JWT__ISSUER=HRPerformance
```

### Frontend Environment Variables
```bash
NODE_ENV=production
```

## 📊 Database

The application uses SQLite for the database, which is perfect for deployment as it's a single file that gets created automatically.

## 🔒 Security Considerations

1. **JWT Key**: Change the default JWT key in production
2. **CORS**: Configure allowed origins for your domain
3. **HTTPS**: Both Railway and Render provide HTTPS by default

## 🧪 Testing Your Deployment

### Test API Endpoints
```bash
# Health check
curl https://your-api-url.railway.app/swagger

# Login test
curl -X POST https://your-api-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jane.smith","password":"password123"}'
```

### Test Frontend
1. Open your frontend URL in a browser
2. Try logging in with the seeded credentials:
   - Username: `jane.smith`
   - Password: `password123`

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are properly installed
   - Verify Node.js and .NET versions are compatible

2. **Database Issues**
   - Ensure the application has write permissions
   - Check that SQLite is supported on your platform

3. **CORS Errors**
   - Verify the frontend URL is in the allowed origins list
   - Check that the API URL is correctly configured in the frontend

4. **Authentication Issues**
   - Verify JWT configuration
   - Check that the database was seeded properly

### Logs
- Railway: Check logs in the Railway dashboard
- Render: Check logs in the Render dashboard

## 📈 Scaling

Both Railway and Render offer paid plans for scaling:
- Railway: $5/month for additional resources
- Render: $7/month for dedicated instances

## 🔄 Continuous Deployment

Both platforms support automatic deployments:
- Push to your main branch triggers automatic deployment
- Configure branch protection rules for production deployments

## 📞 Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- GitHub Issues: Create issues in your repository for application-specific problems

---

**Happy Deploying! 🎉** 