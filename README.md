# Library Book Issue & Digital Catalog System

## Description

The **Library Book Issue & Digital Catalog System** is a comprehensive full-stack web application designed to manage book inventory, student borrowing, and administrative operations in a college library. This system provides an efficient, digital solution for replacing manual library management processes.

The application features a dual-interface approach: a **student-facing portal** for browsing the digital catalog, issuing books, and tracking borrowed items, and an **admin dashboard** for comprehensive library management including inventory control, issue tracking, and fine management. The system automatically calculates overdue fines at ₹2 per day to encourage timely book returns.

Built with modern web technologies, the system emphasizes security (JWT-based authentication, role-based access control), scalability (MongoDB Atlas cloud database), and user experience (responsive design, real-time feedback). It demonstrates full-stack development best practices including proper API design, middleware usage, and client-side validation.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via MongoDB Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs (password hashing)
- **ODM**: Mongoose
- **API Rate Limiting**: express-rate-limit
- **CORS**: enabled for cross-origin requests
- **Environment Management**: dotenv

## Features

- **User Authentication with Role-Based Access Control**
  - Secure login/registration system
  - Two distinct user roles: Admin and Student
  - JWT token-based session management
  - Password hashing with bcryptjs

- **Student Book Catalog**
  - Browse complete digital library catalog
  - Search functionality (by title or author)
  - Filter by category and availability
  - Sort books by title, author, or date added
  - View detailed book information including cover images

- **Book Issuing and Return Tracking**
  - One-click book issuance for students
  - Automatic tracking of issue and return dates
  - 14-day borrowing period
  - Issue history maintained in the system

- **Automated Overdue Fine Calculation**
  - Automatic computation of fines at ₹2 per day post due date
  - Fine tracking and display in student portal
  - Overdue status monitoring

- **Admin Dashboard**
  - Key statistics: Total books, active students, issued today, overdue count
  - Real-time dashboard with metrics
  - Navigation between different management sections
  - Date and time display for administrative reference

- **Book Inventory Management**
  - CRUD operations for book catalog
  - Track total and available copies
  - Category-based organization
  - Cover image management
  - ISBN uniqueness enforcement

- **Issue History and Overdue Tracking**
  - Complete log of all book issues
  - Filter logs by status (issued, returned, overdue)
  - Dedicated overdue management section
  - Fine calculation and tracking for overdue books

## Project Structure

```
library-system/
├── public/
│   ├── index.html                 # Login & Registration page
│   ├── catalog.html               # Student book catalog portal
│   ├── admin.html                 # Admin dashboard
│   ├── css/
│   │   └── styles.css             # Global styling for all pages
│   └── js/
│       ├── utils.js               # Utility functions (API calls, auth, helpers)
│       ├── auth.js                # Authentication logic
│       ├── catalog.js             # Student portal logic
│       └── admin.js               # Admin dashboard logic
├── server/
│   ├── models/
│   │   ├── User.js                # User schema (admin, student)
│   │   ├── Book.js                # Book schema with inventory tracking
│   │   └── IssuedBook.js          # Issued book tracking & fine calculation
│   ├── routes/
│   │   ├── auth.js                # Authentication endpoints
│   │   ├── books.js               # Book management endpoints
│   │   └── issues.js              # Book issue/return endpoints
│   ├── middleware/
│   │   └── auth.js                # JWT verification & role-based access
│   └── server.js                  # Main Express server configuration
├── seed.js                        # Database seeding script
├── package.json                   # Project dependencies and scripts
├── .env                           # Environment variables (not in git)
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14+) and npm installed
- MongoDB Atlas account (free tier available at mongodb.com)
- Git configured with SSH (for GitHub push)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:ArnavDada14/Collegelibrary_ABACUS1.git
   cd library-system
   ```

2. **Navigate to project directory**
   ```bash
   cd library-system
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **MongoDB Atlas Setup**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user with username and password
   - Whitelist IP addresses (add `0.0.0.0/0` for development)
   - Copy the connection string from "Connect" → "Connect your application"
   - The URI should look like: `mongodb+srv://username:password@cluster.mongodb.net/library?retryWrites=true&w=majority`

5. **Create .env file**
   ```bash
   touch .env
   ```
   
   Add the following variables to `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/library?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here_min_32_chars
   PORT=5000
   NODE_ENV=development
   ```

6. **Run seed script to populate database**
   ```bash
   npm run seed
   ```
   
   Expected output:
   ```
   MongoDB connected successfully!
   Database seeded successfully!
   ✓ Created admin user: admin@library.com
   ✓ Created 3 student users
   ✓ Created 10 books in various categories
   ```

7. **Start the server**
   ```bash
   npm start
   ```
   
   Expected output:
   ```
   MongoDB connected successfully!
   Server running on port 5000
   Visit http://localhost:5000 to access the application
   ```

8. **Access the application**
   - Open browser and navigate to `http://localhost:5000`
   - Use login credentials (see Default Login Credentials section)

## API Endpoints

| HTTP Method | Endpoint | Auth Required | Description |
|-------------|----------|---------------|-------------|
| **POST** | `/api/auth/register` | No | Register new user (student or admin) |
| **POST** | `/api/auth/login` | No | Login and receive JWT token |
| **GET** | `/api/auth/me` | Yes | Get current logged-in user profile |
| **GET** | `/api/books` | No | Retrieve all books (supports search, category, available filters) |
| **GET** | `/api/books/:id` | No | Get specific book by ID |
| **POST** | `/api/books` | Yes (Admin) | Create new book (admin only) |
| **PUT** | `/api/books/:id` | Yes (Admin) | Update book details (admin only) |
| **DELETE** | `/api/books/:id` | Yes (Admin) | Delete book from catalog (admin only) |
| **POST** | `/api/issues` | Yes | Issue a book to student or current user |
| **GET** | `/api/issues` | Yes | Get issued books (all for admin, own for student) |
| **PUT** | `/api/issues/:id/return` | Yes | Mark book as returned and calculate fine |
| **GET** | `/api/issues/overdue` | Yes (Admin) | Get all overdue books (admin only) |

### Request/Response Examples

**Login Endpoint**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"admin123"}'
```

**Issue Book Endpoint**
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"bookId":"<book_id>"}'
```

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@library.com | admin123 |
| **Student 1** | student1@lib.com | student123 |
| **Student 2** | student2@lib.com | student123 |
| **Student 3** | student3@lib.com | student123 |

> **Note**: These credentials are created by the seed script. For production, change these immediately and use secure passwords.

## Usage Guide

### For Students

1. **Login**: Navigate to the application and log in with student credentials
2. **Browse Catalog**: 
   - Use search bar to find books by title or author
   - Filter by category (Fiction, Non-Fiction, Tech, Reference)
   - Check "Available Only" to see in-stock books
3. **Issue Book**: Click "Issue Book" button on any available book
4. **Track Borrowed Books**: 
   - View "My Issued Books" section showing all active borrowings
   - See due dates and any overdue days
   - Check calculated fine amounts for overdue books

### For Admins

1. **Login**: Use admin credentials to access the admin dashboard
2. **Dashboard**: 
   - View key statistics and metrics
   - Current date and time display
3. **Manage Books**:
   - Add new books via form modal
   - Edit existing book information
   - Delete books from catalog
   - View complete inventory
4. **Issue Books**:
   - Manually issue books to students
   - Select student and book from dropdowns
   - System validates availability
5. **Track Issues**:
   - View log of all book issues
   - Filter by status (Issued, Returned, Overdue)
   - Track which students have which books
6. **Manage Overdue**:
   - View all overdue books
   - See calculated fines
   - Mark books as returned and finalize fines

## Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/library` |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 32 chars) | `your_secret_key_here_minimum_32_characters` |
| `PORT` | Server port (default 5000) | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

**Important**: Never commit `.env` to git (it's in .gitignore). Each deployment environment should have its own `.env` file.

## Future Enhancements

- **Email Notifications**: Automated emails for due date reminders and overdue notices
- **SMS Alerts**: Send SMS reminders to students for due dates
- **Advanced Analytics**: Detailed reports on book popularity, student borrowing patterns
- **Mobile App**: React Native or Flutter mobile application for iOS/Android
- **Book Reservations**: Allow students to reserve books before return
- **Fine Payment Integration**: Online payment gateway for fine settlement
- **Barcode/QR Code**: Integration for quick book identification during issue/return
- **Multi-language Support**: Support for regional languages
- **Library Branch Management**: Support for multiple library branches
- **Notification Center**: In-app notification system for announcements
- **Document Management**: Upload and manage course materials in addition to books
- **Advanced Search**: Full-text search and recommendation system

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB URI in `.env` is correct
- Check if IP is whitelisted in MongoDB Atlas (use 0.0.0.0/0 for development)
- Verify username and password are URL-encoded if they contain special characters (@, #, $, etc.)

### Port Already in Use
- Change PORT in `.env` to an available port
- Or kill the process using port 5000: `lsof -ti:5000 | xargs kill -9`

### Seed Script Fails
- Ensure MongoDB is connected before running seed
- Check .env MONGO_URI is valid
- Verify database user has proper permissions

### CORS Errors
- CORS is enabled in server.js for all origins in development
- For production, configure specific origins in the cors middleware

## License

MIT License - See LICENSE file for details.

---

**Created**: April 2026  
**Author**: Library Management Team  
**Repository**: [GitHub](https://github.com/ArnavDada14/Collegelibrary_ABACUS1)
