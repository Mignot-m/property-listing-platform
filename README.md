# 🏠 Property Listing Platform

**Live Demo:** [https://property-listing-platform-silk.vercel.app/](https://property-listing-platform-silk.vercel.app/)  
**Backend API:** [https://property-listing-platform-1y3u.onrender.com/api/health](https://property-listing-platform-1y3u.onrender.com/api/health)  
**GitHub:** [https://github.com/Mignot-m/property-listing-platform](https://github.com/Mignot-m/property-listing-platform)

---

## 📋 Project Overview

A full-stack property listing platform where users can browse, list, and manage properties with role-based access control. Built as a mini multi-tenant system with three user roles: Admin, Property Owner, and Regular User.

---

## 🎯 Features

### Authentication & Authorization
- JWT-based authentication with 7-day expiration
- Role-based access control (Admin, Owner, User)
- Protected routes with token verification
- Persistent login across sessions

### Property Management
- Full CRUD operations (Create, Read, Update, Delete)
- Publish/Unpublish properties (owners only)
- Soft delete with restore functionality
- Image upload with Cloudinary (max 10 images)
- Pagination and filtering (location, price range, status)
- View counter for properties

### User Features
- Browse published properties
- Save/remove favorites (synced across tabs)
- Role-specific dashboards
- Profile management

### Admin Features
- View all properties including deleted ones
- Delete/restore any property
- Platform oversight

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Properties
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/properties` | List properties (paginated/filtered) | Public |
| GET | `/api/properties/:id` | Get single property | Public |
| POST | `/api/properties` | Create property | Owner/Admin |
| PUT | `/api/properties/:id` | Update property (draft only) | Owner/Admin |
| POST | `/api/properties/:id/publish` | Publish property | Owner/Admin |
| DELETE | `/api/properties/:id` | Soft delete property | Owner/Admin |
| POST | `/api/properties/:id/restore` | Restore deleted property | Admin/Owner |

### Favorites
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/favorites/:id` | Add to favorites | User |
| DELETE | `/api/favorites/:id` | Remove from favorites | User |
| GET | `/api/favorites` | Get all favorites | User |
| GET | `/api/favorites/check/:id` | Check favorite status | User |

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud)
- **ODM:** Mongoose
- **Authentication:** JWT + bcryptjs
- **Image Storage:** Cloudinary
- **Deployment:** Render

### Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Bootstrap + Custom CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form
- **Routing:** React Router v6
- **Deployment:** Vercel

---

## 🔑 Sample Users

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password123` |
| Owner | `owner@example.com` | `password123` |
| User | `user@example.com` | `password123` |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v20+)
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Mignot-m/property-listing-platform.git
cd property-listing-platform/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials
# - MONGODB_URI
# - JWT_SECRET
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET

# Start the server
npm run dev