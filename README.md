# LitterLift - A Smart Waste Management System

A comprehensive waste management system that enables users to report garbage and request recycling services with location tracking, automated notifications, and admin management capabilities.

## Features

### User Features
- 🗑️ **Garbage Reporting** - Upload images of garbage with automatic location detection
- ♻️ **Recycling Requests** - Request pickup for recyclable items
- 📍 **Location Tracking** - Automatic geolocation to find nearest service centers
- 📧 **Email Notifications** - Automated emails to service centers and users
- 👤 **User Dashboard** - Track all your requests and their status
- 💳 **Donation System** - Support the initiative via Stripe payments

### Admin Features
- 📊 **Admin Dashboard** - Manage all garbage and recycling requests
- ✅ **Request Management** - Update status of requests (pending/processed/completed)
- 👥 **User Management** - View all user requests

### Technical Features
- 🌍 **OpenCage Geocoding API** - Convert coordinates to human-readable addresses
- 🗺️ **Google Maps Integration** - Direct map links for locations
- 📧 **Nodemailer** - Email notification system
- 🔐 **JWT Authentication** - Secure user and admin sessions
- 💾 **MongoDB Database** - Store users, requests, and admin data
- 📤 **Multer File Upload** - Handle image uploads
- 🤖 **AI Chatbot** (Optional) - Flask-based chatbot with NLP


### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Python 3.x (for chatbot - optional)


### For Users

1. **Create Admin Account**
   - Go to `/adminCreate`
   - Use the admin passkey from `.env`

2. **Login**
   - Go to `/adminLogin`
   - Enter credentials and passkey

3. **Manage Requests**
   - View all garbage and recycling requests
   - Update request status
   - Monitor system activity

## API Endpoints

### User Routes
- `GET /` - Homepage
- `GET /userCreate` - User registration page
- `POST /userCreate` - Register new user
- `GET /userLogin` - User login page
- `POST /userLogin` - Authenticate user
- `GET /userProfile` - User dashboard (protected)
- `GET /logout` - Logout user

### Upload Routes
- `GET /garbageImage` - Garbage upload page (protected)
- `POST /uploadGarbageImg` - Submit garbage report (protected)
- `GET /recycleImage` - Recycling upload page (protected)
- `POST /uploadRecycleImg` - Submit recycling request (protected)

### Admin Routes
- `GET /adminCreate` - Admin registration page
- `POST /adminCreate` - Register new admin
- `GET /adminLogin` - Admin login page
- `POST /adminLogin` - Authenticate admin
- `GET /adminProfile` - Admin dashboard (protected)
- `GET /admin/garbage-requests` - Get all garbage requests (protected)
- `POST /admin/update-garbage-status` - Update garbage request status (protected)
- `GET /admin/recycling-requests` - Get all recycling requests (protected)
- `POST /admin/update-recycling-status` - Update recycling status (protected)

### Other Routes
- `GET /map` - Map view
- `GET /payment` - Payment page
- `POST /checkout` - Stripe checkout
- `GET /complete` - Payment success
- `GET /chatbot` - Chatbot interface

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_USER` | Gmail address for sending notifications | Yes |
| `EMAIL_PASS` | Gmail app password | Yes |
| `ADMIN_PASSKEY` | Secret key for admin registration | Yes |
| `OPENCAGE_API_KEY` | API key for geocoding | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | Yes |
| `BASE_URL` | Application base URL | Yes |

## Project Structure


## Acknowledgments

- OpenCage for geocoding services
- Stripe for payment processing
- MongoDB for database solutions
