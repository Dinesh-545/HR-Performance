#!/bin/bash
echo "Building HR Performance API..."
dotnet restore
dotnet build -c Release
dotnet publish -c Release -o ./publish
echo "Build completed successfully!" 