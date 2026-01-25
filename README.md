# College CRT & Placement Intelligence System

## Overview

This platform is a full-scale academic, CRT, and placement management system
powered by AI-driven analytics and strict role-based access control.

## Roles

- Student
- Faculty
- CRT Trainer
- HOD
- Placement Officer
- Admin

## Core Features

- Student 360° profile
- Faculty performance analytics
- Training & placement tracking
- AI-based readiness prediction
- Automated reports (NAAC/NBA)
- Secure document & certificate handling
- Notification & event system

## Technology Stack

Frontend: React + TypeScript + Tailwind  
Backend: FastAPI / NestJS  
Database: PostgreSQL  
Auth: JWT + RBAC  
AI: Gemini / GPT (backend-only)  
Infra: Docker + AWS

## AI Safety

- AI never directly accesses database
- AI works only on validated JSON
- All outputs are reviewed before persistence

## Testing

- Automated UI & API tests
- AI-based full system audit
- Staging-only execution

## Deployment

- Dockerized services
- Environment-based configs
- Secure secret management

## Status

Production-ready after audit score ≥ 8/10
