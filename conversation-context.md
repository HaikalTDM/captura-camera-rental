# CAPTURA Camera Rental Project - Conversation Context

## Project Overview
**CAPTURA** is a professional camera rental website with comprehensive admin management system built with Next.js 15.5.3, TypeScript, Supabase PostgreSQL, and Tailwind CSS.

## Current Status & Recent Work

### 1. **Image Management System Reversal (Completed)**
- **REMOVED** complex camera image upload system per user preference
- **REVERTED** to simple static image management using `/public/images/` folder
- **UPDATED** image filenames to use `osmo-pocket-31.jpg` and `dji-action-5-pro1.jpg`
- **CLEANED UP** database schemas, components, and configuration files

### 2. **GitHub Repository Setup (Completed)**
- **UPLOADED** project to: https://github.com/HaikalTDM/captura-camera-rental
- **CONFIGURED** professional README with comprehensive documentation
- **ESTABLISHED** proper git workflow for version control

### 3. **Serial Number Constraint Fix (Completed)**
- **RESOLVED** unique constraint violation error: `duplicate key value violates unique constraint "cameras_serial_number_key"`
- **ROOT CAUSE**: Multiple cameras with empty serial numbers violating PostgreSQL unique constraint
- **SOLUTION**: Convert empty serial numbers to NULL values in API functions
- **CREATED** database fix script: `database-fix-serial-numbers.sql`

### 4. **Local Development Setup (Just Completed)**
- **CONFIRMED** `.env.local` is properly configured with Supabase credentials
- **ESTABLISHED** local development workflow using `npm run dev`
- **CLARIFIED** deployment strategy: develop locally, deploy only when ready

## Technical Architecture

### **Frontend Stack:**
- Next.js 15.5.3 with App Router
- TypeScript for type safety
- Tailwind CSS with glass morphism effects
- React hooks for state management

### **Backend & Database:**
- Supabase PostgreSQL with real-time features
- Comprehensive database schema with cameras, bookings, accessories
- Row Level Security policies
- Database triggers and functions

### **Key Features:**
- **Customer Website**: Modern landing page, camera catalog, booking system
- **Admin Panel**: Complete CRUD for cameras, bookings, accessories, customers
- **Real-time Sync**: Admin changes instantly reflect on main website
- **Static Images**: Simple file-based image management in `/public/images/`

## Current Environment Setup

### **Database Connection:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://mqpzbzkdtfebzcfoqgta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHpiemtkdGZlYnpjZm9xZ3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMTI4NDQsImV4cCI6MjA3Mzg4ODg0NH0.NI3QZ7p2FNxy2nBVqgx8z_jhjx68bh15Bf3fFI4pan4
```

### **Development Workflow:**
- **Local Development**: `npm run dev` on `http://localhost:3000`
- **Production Deployment**: `vercel --prod` when ready to update live site
- **Version Control**: Git commits to GitHub repository

## Pending Tasks

### **IMMEDIATE ACTION REQUIRED:**
1. **Run Database Fix Script**: Execute `database-fix-serial-numbers.sql` in Supabase SQL Editor to resolve serial number constraint issues
2. **Test Camera Editing**: Verify that Osmo Pocket 3 price editing now works without errors

### **Optional Improvements:**
- Add actual camera image files (`osmo-pocket-31.jpg`, `dji-action-5-pro1.jpg`) to `/public/images/`
- Remove old image files once new ones are confirmed working
- Test all admin panel functionality with local development setup

## Key File Locations

### **Important Files:**
- **Environment**: `.env.local` (configured)
- **Database Schemas**: `database-camera-management-schema.sql`, `database-fix-serial-numbers.sql`
- **Main Components**: `src/components/CameraCatalog.tsx`, `src/app/admin/cameras/[id]/edit/page.tsx`
- **API Functions**: `src/lib/api/bookings.ts`
- **Image Assets**: `public/images/` folder

### **Live URLs:**
- **GitHub Repository**: https://github.com/HaikalTDM/captura-camera-rental
- **Live Website**: https://captura-camera-rental-quhb0czeb-haikaltdms-projects.vercel.app
- **Local Development**: http://localhost:3000 (when running `npm run dev`)

## User Preferences & Context
- **Prefers simplicity** over complex features (chose static images over upload system)
- **Professional camera rental business** owner
- **Wants local development** without constant deployments
- **Values clean, maintainable code** and proper documentation
- **Uses Windows PowerShell** for command line operations

## Recent Error Resolution
**Fixed**: Serial number unique constraint violation when editing camera prices
**Status**: Code deployed, database script ready to run
**Next**: User needs to execute database fix script to complete resolution

---
*This context file captures the current state of the CAPTURA project and conversation. Use this to continue seamlessly in a new chat thread.*
