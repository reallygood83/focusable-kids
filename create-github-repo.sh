#!/bin/bash

# Create a new public repository on GitHub
echo "Creating GitHub repository: focusable-kids"

# Create the repository using GitHub CLI
gh repo create reallygood83/focusable-kids \
  --public \
  --description "ADHD attention training game platform for elementary students" \
  --clone

# Check if repository was created successfully
if [ $? -eq 0 ]; then
    echo "✅ Repository created successfully!"
    echo "📍 Repository URL: https://github.com/reallygood83/focusable-kids"
    
    # Initialize the repository with a basic README if cloned
    if [ -d "focusable-kids" ]; then
        cd focusable-kids
        
        # Create initial README
        cat > README.md << 'EOF'
# Focusable Kids

ADHD attention training game platform for elementary students.

## Overview

Focusable Kids is an interactive web platform designed to help elementary school students with ADHD improve their focus and attention through engaging, game-based activities.

## Features

- Age-appropriate attention training games
- Progress tracking for students and teachers
- Adaptive difficulty levels
- Engaging visual and audio feedback
- Safe, child-friendly interface

## Getting Started

This project is currently under development.

## Technology Stack

- Frontend: Next.js + TypeScript
- Styling: Tailwind CSS
- Deployment: Vercel

## License

This project is licensed under the MIT License.
EOF
        
        # Create .gitignore
        cat > .gitignore << 'EOF'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF
        
        # Commit initial files
        git add .
        git commit -m "Initial commit: Setup focusable-kids repository"
        git push origin main
        
        echo "✅ Initial files committed and pushed!"
    fi
else
    echo "❌ Failed to create repository. Please check your GitHub CLI authentication."
    echo "Run 'gh auth login' if you need to authenticate."
fi