# Fichaje App - Project Master Task List

This is the comprehensive roadmap to build the "Fichaje" labor tracking application.

## 1. Project Initialization & Architecture <!-- id: 1 -->
- [ ] Define Project Structure and Tech Stack <!-- id: 1.1 -->
- [ ] Create Master Implementation Plan <!-- id: 1.2 -->
- [ ] Initialize Git Repositories (Local) <!-- id: 1.3 -->

## 2. Backend API (FastAPI + PostgreSQL) <!-- id: 2 -->
- [x] **Setup**: Project scaffolding, virtualenv, dependencies (fastapi, uvicorn, sqlalchemy, pydantic) <!-- id: 2.1 -->
- [ ] **Database**: Define models (`User`, `Shift`, `LocationLog`, `Consent`) <!-- id: 2.2 -->
- [ ] **Auth Module**: Implement JWT Login/Register/Refresh <!-- id: 2.3 -->
- [ ] **Shift Module**: Start/Stop/Pause Shift endpoints with Logic Checks <!-- id: 2.4 -->
- [ ] **Geolocation Module**: Secure endpoint to receive location pings (only if shift active) <!-- id: 2.5 -->
- [ ] **Admin Module**: Endpoints for worker stats and live view <!-- id: 2.6 -->
- [ ] **Reporting**: Data export for inspections (PDF/CSV) <!-- id: 2.7 -->

## 3. Mobile App (Flutter - Android/iOS) <!-- id: 3 -->
- [x] **Environment**: Install Flutter SDK, Android Studio, Java <!-- id: 3.0 -->
- [x] **Setup**: Flutter `create`, project configuration, assets import <!-- id: 3.1 -->
- [ ] **UI/UX Implementation**:
    - [x] `Login Screen` (matches *inicio_de_sesión*) <!-- id: 3.2.1 -->
    - [x] `Privacy/Onboarding` (matches *privacy_onboarding*) <!-- id: 3.2.2 -->
    - [x] `Home/Start Shift` (matches *inicio_de_jornada*) <!-- id: 3.2.3 -->
    - [x] `Active Dashboard` (matches *active_shift*) <!-- id: 3.2.4 -->
    - [ ] `History & Profile` <!-- id: 3.2.5 -->
- [x] **Logic Integration**:
    - [x] State Management (Provider/Riverpod) <!-- id: 3.3.1 -->
    - [x] API Client (Dio/Http) <!-- id: 3.3.2 -->
    - [x] **Geolocation Service**: Background location tracking logic (start on shift, stop on finish) <!-- id: 3.3.3 -->
    - [x] Local Storage (Tokens, offline sync) <!-- id: 3.3.4 -->

## 4. Admin Panel (React Web) <!-- id: 4 -->
- [x] **Setup**: Vite + React + TailwindCSS <!-- id: 4.1 -->
- [x] **Auth**: Admin Login <!-- id: 4.2 -->
- [x] **Dashboard**: Live map view of active workers <!-- id: 4.3 -->
- [ ] **Worker Management**: CRUD workers, view history <!-- id: 4.4 -->
- [ ] **Inspection Mode**: "Panic button" / Quick export for labor inspections <!-- id: 4.5 -->

## 5. Verification & Delivery <!-- id: 5 -->
- [/] End-to-End Test (Worker Login -> Start Shift -> Move -> Stop Shift -> Admin Check) <!-- id: 5.1 -->
- [x] Build Android APK <!-- id: 5.2 -->
    - [x] Configure Dependencies
    - [x] Setup Android SDK & Licenses
- [x] Package Source Code for Delivery <!-- id: 5.3 -->
