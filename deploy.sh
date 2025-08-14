#!/bin/bash

echo "🚀 HR Performance Management System - Deployment Helper"
echo "======================================================"

echo ""
echo "📋 Prerequisites Check:"
echo "1. Do you have a GitHub account? (y/n)"
read -r has_github

if [ "$has_github" != "y" ]; then
    echo "❌ Please create a GitHub account first at https://github.com"
    exit 1
fi

echo "2. Do you have a Railway account? (y/n)"
read -r has_railway

if [ "$has_railway" != "y" ]; then
    echo "❌ Please create a Railway account first at https://railway.app"
    exit 1
fi

echo ""
echo "✅ Prerequisites met!"
echo ""
echo "📝 Deployment Steps:"
echo "==================="
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy Backend API:"
echo "   - Go to https://railway.app/dashboard"
echo "   - Click 'New Project' → 'Deploy from GitHub repo'"
echo "   - Select your repository"
echo "   - Choose 'HRPerformance.Api' directory"
echo "   - Set environment variables:"
echo "     * ASPNETCORE_ENVIRONMENT = Production"
echo "   - Deploy the service"
echo ""
echo "3. Deploy Frontend:"
echo "   - In the same Railway project, click 'New Service' → 'GitHub Repo'"
echo "   - Select the same repository"
echo "   - Choose 'HRPerformance.Web' directory"
echo "   - Set environment variables:"
echo "     * NODE_ENV = production"
echo "   - Deploy the service"
echo ""
echo "4. Update API URLs:"
echo "   - Get your Railway API URL"
echo "   - Update HRPerformance.Web/src/environments/environment.prod.ts"
echo "   - Redeploy the frontend"
echo ""
echo "🎉 Your application will be live at the provided URLs!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md" 