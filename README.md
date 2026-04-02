# 🌊 SocialWave – Mini Social Post Application

Full-stack social media app .

---
LIVE LINK - https://social-media-navy-eight.vercel.app

## 📸 Features

- ✅ Signup & Login with JWT
- ✅ Create Posts – text, image, or both
- ✅ Images uploaded to **Cloudinary CDN** (permanent, fast, auto-optimized)
- ✅ Public Feed – all posts, newest first
- ✅ Like toggle + comment system
- ✅ Delete post (also removes image from Cloudinary)
- ✅ Pagination (load more)
- ✅ Search by username or content
- ✅ Filter tabs: All / Most Liked / Most Commented
- ✅ Mobile-first, TaskPlanet-inspired UI

---

## 🛠️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18 + Vite + Material UI     |
| Backend  | Node.js + Express.js              |
| Database | MongoDB Atlas                     |
| Storage  | **Cloudinary** (image CDN)        |
| Auth     | JWT + bcryptjs                    |
| Upload   | Multer (memoryStorage) → Cloudinary stream |

---

## ☁️ How Cloudinary Works in This Project

```
User picks image
      ↓
Multer reads file into RAM (memoryStorage — no disk write)
      ↓
Buffer is streamed directly to Cloudinary via upload_stream()
      ↓
Cloudinary returns a secure https:// CDN URL
      ↓
URL is saved in MongoDB  (post.image field)
      ↓
Frontend displays image directly from Cloudinary CDN
```

When a post is **deleted**, the image is also deleted from Cloudinary using `cloudinary.uploader.destroy(publicId)`.

---

## 🚀 Local Setup

### 1. Get Cloudinary Credentials
1. Sign up free at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard** → copy **Cloud Name**, **API Key**, **API Secret**

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/socialapp
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
npm run dev    # http://localhost:5000
```

### 3. Frontend (Vite)
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev            # http://localhost:3000
```

---

## 🌐 Deployment

| Service  | Platform |
|----------|----------|
| Backend  | Render — add all 6 env vars in dashboard |
| Frontend | Vercel — framework: Vite, set VITE_API_URL |
| Database | MongoDB Atlas |
| Images   | Cloudinary (free tier: 25 GB storage, 25 GB bandwidth/month) |

---

## 📡 API Endpoints

| Method | Route                  | Auth | Description              |
|--------|------------------------|------|--------------------------|
| POST   | /api/auth/signup       | No   | Register                 |
| POST   | /api/auth/login        | No   | Login → returns JWT      |
| GET    | /api/auth/me           | Yes  | Get current user         |
| GET    | /api/posts             | No   | Feed with pagination     |
| POST   | /api/posts             | Yes  | Create post + upload img |
| PUT    | /api/posts/:id/like    | Yes  | Toggle like              |
| POST   | /api/posts/:id/comment | Yes  | Add comment              |
| DELETE | /api/posts/:id         | Yes  | Delete post + Cloudinary img |

---

## 🗄️ MongoDB Collections (Only 2)

### `users`
```json
{ "username": "", "email": "", "password": "(hashed)", "avatar": "", "bio": "" }
```

### `posts`
```json
{
  "userId": "ObjectId",
  "username": "",
  "text": "",
  "image": "https://res.cloudinary.com/...",
  "likes": ["username"],
  "likedBy": ["ObjectId"],
  "comments": [{ "username": "", "userId": "ObjectId", "text": "", "createdAt": "" }]
}
```

---


