# servia-frontend

## About ServiaAI

ServiaAI is an AI-powered hotel recruitment platform that transforms 
the way hotels attract, screen, and hire talent. Instead of spending 
hours manually reviewing CVs and coordinating interviews, ServiaAI 
automates the entire hiring process — from the moment a candidate 
applies to the final hiring decision.

This repository contains the frontend of the ServiaAI platform built 
with Next.js. It serves two separate portals — a candidate-facing 
portal where applicants register, upload their CV, submit a video 
introduction, and track their application status in real time, and a 
recruiter-facing dashboard where hotel HR teams manage candidates, 
review AI scores, watch video introductions, and conduct AI-assisted 
Google Meet interviews.

## Prerequisites
- Node.js 18 or higher
- npm
- Git

## Setup Steps

### 1. Clone the repository
git clone https://github.com/sororatech/servia-frontend
cd servia-frontend

### 2. Install dependencies
npm install

### 3. Start the development server
npm run dev

## Test Command
Open your browser and go to:
http://localhost:3000

Expected result: Page shows "Hello Sorora Tech"

## Tech Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- Lexend Font (via next/font/google)
- App Router
- src/ directory structure

## Branch Strategy
- main — production only
- staging — pre-production testing
- develop — integration branch
- feature/xxx — one branch per task

## Team
Sorora Tech — ServiaAI Project