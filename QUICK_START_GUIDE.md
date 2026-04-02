# 🚀 Library Management System - Quick Start Guide

## ⚡ Current Status

### ✅ What's Ready
- ✅ All code files prepared and committed locally
- ✅ Git configured (Arnav Reddy / basketballarms@gmail.com)
- ✅ Dependencies installed
- ✅ Server configured for port 5000
- ✅ Environment variables set up

### ⏳ What Needs Your Action

#### 🔴 CRITICAL: MongoDB Atlas IP Whitelisting

**Your Server IP:** `198.212.42.22`

**Steps:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **Network Access** → **IP Whitelist**
3. Click **Add IP Address**
4. Either:
   - Quick: Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
   - Secure: Enter `198.212.42.22`
5. Click **Confirm**
6. Wait 1-2 minutes

#### 🟡 OPTIONAL: GitHub Push

The code is ready but couldn't be pushed due to permissions.

**Fix:**
1. Visit [GitHub App Settings](https://github.com/apps/abacusai/installations/select_target)
2. Select repository: `Collegelibrary_ABACUS1`
3. Grant access to Abacus.AI GitHub App

**Or manually push:**
```bash
# On your local machine
git clone https://github.com/ArnavDada14/Collegelibrary_ABACUS1.git
cd Collegelibrary_ABACUS1
# Copy files from /home/ubuntu/library-system
git add .
git commit -m "Add complete library management system"
git push origin main
```

---

## 🚀 Deploy Your Application

### After MongoDB IP Whitelisting

**Option 1: Automated (Recommended)**
```bash
cd /home/ubuntu/library-system
./deploy_after_whitelist.sh
```

**Option 2: Manual**
```bash
cd /home/ubuntu/library-system

# Seed database
npm run seed

# Start server in background
nohup npm start > /tmp/server.log 2>&1 &

# Check logs
tail -f /tmp/server.log
```

---

## 🌐 Access Your Application

**Public URL:** https://11a8ddaba7-5000.na104.preview.abacusai.app

⚠️ **Note:** This URL works while the VM is running. The VM auto-shuts down after inactivity.

---

## 👤 Login Credentials

### Admin Account
- **Email:** admin@library.com
- **Password:** admin123
- **Access:** Full admin dashboard, manage users, manage books

### Student Accounts
- **Email:** student1@library.com
- **Password:** student123
- **Access:** Browse catalog, issue/return books

Additional students: student2@library.com, student3@library.com (same password)

---

## 📊 What Gets Created

When you run the seed script:
- **4 Users:** 1 admin + 3 students
- **10 Books:** Sample library catalog including:
  - To Kill a Mockingbird
  - 1984
  - The Great Gatsby
  - Pride and Prejudice
  - The Catcher in the Rye
  - And 5 more classics

---

## 🔧 Useful Commands

```bash
# View server logs
tail -f /tmp/server.log

# Check if server is running
curl http://localhost:5000

# Stop server
pkill -f "node server/server.js"

# Restart server
pkill -f "node server/server.js"
cd /home/ubuntu/library-system
nohup npm start > /tmp/server.log 2>&1 &

# Test MongoDB connection
cd /home/ubuntu/library-system
node -e "require('dotenv').config(); const m=require('mongoose'); m.connect(process.env.MONGODB_URI).then(()=>console.log('✅ Connected')).catch(e=>console.log('❌ Failed:', e.message))"
```

---

## 🎯 Features Overview

### For Students
- Browse complete book catalog
- Search by title, author, or ISBN
- Filter by genre and availability
- Issue books (max 3 per student)
- Return books
- View your issued books

### For Admins
- Everything students can do, plus:
- Add new books to catalog
- Update book information
- Delete books
- View all users
- View all issued books
- Manage book availability

---

## 📞 Troubleshooting

### Server won't start
```bash
# Check if port is in use
lsof -i :5000

# Kill existing process
pkill -f "node server/server.js"

# Check logs
tail -f /tmp/server.log
```

### MongoDB connection fails
1. Verify IP is whitelisted in Atlas
2. Check `.env` has correct `MONGODB_URI`
3. Wait 1-2 minutes after whitelisting
4. Test connection with command above

### Can't access public URL
1. Ensure server is running: `curl http://localhost:5000`
2. Check server logs for errors
3. Verify VM is active

---

## 📁 Project Info

- **Repository:** https://github.com/ArnavDada14/Collegelibrary_ABACUS1
- **Local Path:** /home/ubuntu/library-system
- **Latest Commit:** a3c206764653ef7015d461efa7d8315de9960fc3
- **Branch:** main

---

## ✅ Next Steps

1. **Whitelist IP** in MongoDB Atlas → https://cloud.mongodb.com/
2. **Run deployment script:** `./deploy_after_whitelist.sh`
3. **Access app:** https://11a8ddaba7-5000.na104.preview.abacusai.app
4. **Login as admin:** admin@library.com / admin123
5. **Test features:** Add books, manage users, issue/return books

---

**Need help?** Check the detailed documentation:
- `/home/ubuntu/library-system/README.md`
- `/home/ubuntu/library-system/DEPLOYMENT_SUMMARY.md`
- `/tmp/deployment_status.md`
- `/tmp/final_deployment_summary.txt`
