# GigFlow Backend

RESTful API backend for the GigFlow freelance marketplace platform built with Node.js, Express, and MongoDB.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time notifications
- **bcryptjs** - Password hashing

## 📋 Features

- 🔐 JWT authentication with HttpOnly cookies + Authorization header fallback
- 💼 Complete CRUD operations for gigs and bids
- ⚡ Real-time notifications and bid status updates using Socket.io
- 🔒 Atomic transactions for hiring process
- 🛡️ Protected routes with middleware
- 🔍 Search functionality
- 🌐 CORS configured for cross-origin requests
- ⚠️ Error handling middleware

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd GigFlow/backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up MongoDB**:

   **Option A: Local MongoDB**

   ```bash
   # Install MongoDB (macOS)
   brew tap mongodb/brew
   brew install mongodb-community

   # Start MongoDB
   brew services start mongodb-community

   # For transactions, set up replica set
   mongod --replSet rs0
   # In mongo shell:
   rs.initiate()
   ```

   **Option B: MongoDB Atlas (Recommended)**

   - Create free account at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a cluster
   - Get connection string
   - Whitelist your IP (or use 0.0.0.0/0 for development)

4. **Create environment file**:

   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables** (`.env`):

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/gigflow
   # Or for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow

   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   # For production, add deployed frontend URL (comma-separated):
   # CLIENT_URL=http://localhost:5173,https://your-app.vercel.app
   ```

6. **Start development server**:

   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

## 📦 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon (auto-restart)
- `npm test` - Run tests (not configured yet)

## 🌐 Deployment

### Deploy to Render (Recommended - Free)

1. **Push code to GitHub**

2. **Create MongoDB Atlas database**:

   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster
   - Get connection string
   - Whitelist all IPs: `0.0.0.0/0`

3. **Deploy on Render**:

   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `gigflow-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

4. **Add Environment Variables** in Render dashboard:

   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow
   JWT_SECRET=your_production_secret_key_min_32_chars
   JWT_EXPIRE=7d
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

5. **Deploy** - Render will automatically deploy

6. **Note**: Free tier spins down after 15 minutes of inactivity (cold start ~30s)

### Deploy to Railway (Free $5/month credit)

1. **Install Railway CLI**:

   ```bash
   npm i -g @railway/cli
   ```

2. **Login and deploy**:

   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Add MongoDB**:

   ```bash
   railway add mongodb
   ```

4. **Set environment variables**:
   ```bash
   railway variables set JWT_SECRET=your_secret_key
   railway variables set CLIENT_URL=https://your-frontend.vercel.app
   ```

### Deploy to Fly.io (Free tier)

1. **Install Fly CLI**:

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and launch**:

   ```bash
   cd backend
   fly auth login
   fly launch
   ```

3. **Set secrets**:

   ```bash
   fly secrets set MONGO_URI=your_mongodb_uri
   fly secrets set JWT_SECRET=your_secret_key
   fly secrets set CLIENT_URL=https://your-frontend.vercel.app
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register` | Register new user | ❌            |
| POST   | `/api/auth/login`    | Login user        | ❌            |
| GET    | `/api/auth/me`       | Get current user  | ✅            |
| POST   | `/api/auth/logout`   | Logout user       | ✅            |

### Gigs

| Method | Endpoint            | Description                     | Auth Required |
| ------ | ------------------- | ------------------------------- | ------------- |
| GET    | `/api/gigs`         | Get all open gigs (with search) | ❌            |
| GET    | `/api/gigs/:id`     | Get single gig                  | ❌            |
| POST   | `/api/gigs`         | Create a gig                    | ✅            |
| PUT    | `/api/gigs/:id`     | Update a gig                    | ✅            |
| DELETE | `/api/gigs/:id`     | Delete a gig                    | ✅            |
| GET    | `/api/gigs/my/gigs` | Get user's gigs                 | ✅            |

### Bids

| Method | Endpoint                | Description        | Auth Required |
| ------ | ----------------------- | ------------------ | ------------- |
| POST   | `/api/bids`             | Create a bid       | ✅            |
| GET    | `/api/bids/gig/:gigId`  | Get bids for a gig | ✅            |
| GET    | `/api/bids/my/bids`     | Get user's bids    | ✅            |
| POST   | `/api/bids/:bidId/hire` | Hire a freelancer  | ✅            |

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── gigController.js      # Gig CRUD operations
│   └── bidController.js      # Bid operations & hiring
├── middleware/
│   ├── auth.js               # JWT verification
│   └── errorHandler.js       # Error handling
├── models/
│   ├── User.js               # User schema
│   ├── Gig.js                # Gig schema
│   └── Bid.js                # Bid schema
├── routes/
│   ├── auth.js               # Auth routes
│   ├── gigs.js               # Gig routes
│   └── bids.js               # Bid routes
├── socket/
│   └── socketHandler.js      # Socket.io events
├── .env                      # Environment variables
├── .env.example              # Example env file
├── server.js                 # Entry point
└── package.json
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Dual authentication method
  - HttpOnly cookies (preferred, more secure)
  - Authorization header (fallback for cross-origin)
- **CORS**: Configured for specific frontend URLs (supports multiple origins)
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Custom error handler middleware

## 🔄 Key Features Explained

### Atomic Hire Operation

The hire functionality uses MongoDB transactions to ensure data consistency:

```javascript
// When a client hires a freelancer:
1. Selected bid status → "hired"
2. Gig status → "assigned"
3. All other bids → "rejected"
4. Real-time notification sent to hired freelancer
```

This prevents race conditions and ensures data integrity.

### Real-time Notifications

Socket.io implementation:

- User connects with their user ID
- Server emits events to specific users
- Notifications for: bid acceptance, hiring, etc.

## 🔧 Environment Variables

| Variable     | Description                              | Example                                             |
| ------------ | ---------------------------------------- | --------------------------------------------------- |
| `PORT`       | Server port                              | `5000`                                              |
| `MONGO_URI`  | MongoDB connection string                | `mongodb://localhost:27017/gigflow`                 |
| `JWT_SECRET` | Secret key for JWT (min 32 chars)        | `your_secret_key`                                   |
| `JWT_EXPIRE` | JWT expiration time                      | `7d`                                                |
| `NODE_ENV`   | Environment                              | `development` or `production`                       |
| `CLIENT_URL` | Frontend URLs for CORS (comma-separated) | `http://localhost:5173,https://your-app.vercel.app` |

## ⚠️ Important Notes

### MongoDB Transactions

MongoDB transactions require a **replica set**:

- ✅ **MongoDB Atlas**: Already configured
- ⚠️ **Local MongoDB**: Requires replica set setup

To set up local replica set:

```bash
mongod --replSet rs0
# In mongo shell:
rs.initiate()
```

### Production Checklist

- [ ] Use strong `JWT_SECRET` (min 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or managed database
- [ ] Update `CLIENT_URL` to production frontend URL
- [ ] Enable MongoDB IP whitelist
- [ ] Set up proper logging
- [ ] Configure rate limiting (optional)

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
mongosh

# For Atlas, verify:
# - Connection string is correct
# - IP is whitelisted
# - Username/password are correct
```

### Transaction Errors

```
MongoServerError: Transaction numbers are only allowed on a replica set member
```

**Solution**: Use MongoDB Atlas or set up local replica set

### CORS Errors

Update `CLIENT_URL` in `.env` to match your frontend URL:

```env
CLIENT_URL=https://your-frontend-domain.com
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

## 📊 Database Schema

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Gig Model

```javascript
{
  title: String,
  description: String,
  budget: Number,
  status: String (open/assigned/completed),
  client: ObjectId (ref: User),
  createdAt: Date
}
```

### Bid Model

```javascript
{
  gig: ObjectId (ref: Gig),
  freelancer: ObjectId (ref: User),
  amount: Number,
  proposal: String,
  status: String (pending/hired/rejected),
  createdAt: Date
}
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ using Node.js + Express + MongoDB
