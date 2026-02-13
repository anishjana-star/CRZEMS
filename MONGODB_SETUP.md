# MongoDB Setup Guide

## The Problem
You're getting `ECONNREFUSED` error because MongoDB is not running on your system.

## Solution Options

### Option 1: Use MongoDB Atlas (Cloud - RECOMMENDED - Easiest)

MongoDB Atlas is a free cloud database. No installation needed!

#### Steps:
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a free cluster (M0 - Free tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Username: `admin` (or any name)
   - Password: Create a strong password (save it!)
   - Database User Privileges: "Atlas admin"
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
6. Get your connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7. Update your `server/.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your database user credentials!

### Option 2: Install MongoDB Locally

#### Windows:
1. Download MongoDB Community Server:
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Download and install
2. During installation:
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Check "Install MongoDB Compass" (GUI tool)
3. Start MongoDB Service:
   - Open Services (Win + R → services.msc)
   - Find "MongoDB" service
   - Right-click → Start (if not running)
   - Or set it to "Automatic" startup

#### Verify MongoDB is Running:
```bash
# Open a new terminal and run:
mongod --version
```

If you see version info, MongoDB is installed!

### Option 3: Use Docker (If you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

This starts MongoDB in a Docker container.

## After Setting Up MongoDB

1. **Update your `.env` file** in the `server` folder:
   - For local MongoDB: `MONGODB_URI=mongodb://localhost:27017/employee_management`
   - For Atlas: Use the connection string from Atlas

2. **Restart your server:**
   - Stop the current server (Ctrl + C)
   - Run `npm run dev` again

3. **Create admin user:**
   ```bash
   npm run create-admin
   ```

## Quick Test

Once MongoDB is connected, you should see:
```
MongoDB Connected
Server running on port 5000
```

Instead of the connection error!

## Need Help?

- MongoDB Atlas: https://www.mongodb.com/docs/atlas/getting-started/
- Local MongoDB: https://www.mongodb.com/docs/manual/installation/
