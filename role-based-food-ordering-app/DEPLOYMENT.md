# Deployment Guide

This guide covers deploying the Food Ordering System to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Change `JWT_SECRET` in `.env` to a secure random string
- [ ] Update CORS settings in `server.js` for production domain
- [ ] Test the application locally
- [ ] Commit all changes to Git
- [ ] Create a GitHub repository

## 🚀 Deployment Options

### Option 1: Deploy to Render (Recommended - Free Tier Available)

#### Backend Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: food-ordering-backend
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Add Environment Variables**
   - `JWT_SECRET`: your_secure_secret_key
   - `NODE_ENV`: production
   - `PORT`: 5000 (Render will override this)

5. **Deploy** - Click "Create Web Service"

#### Frontend Deployment

1. **Update API URL in Frontend**
   - In `client/src/context/AuthContext.js` and `client/src/components/Dashboard.js`
   - Replace `/api` with your Render backend URL: `https://food-ordering-backend.onrender.com/api`

2. **Build React App**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy to Render (Static Site)**
   - Click "New +" → "Static Site"
   - Connect repository
   - Configure:
     - **Build Command**: `cd client && npm install && npm run build`
     - **Publish Directory**: `client/build`
   - Deploy

---

### Option 2: Deploy to Vercel (Frontend) + Render (Backend)

#### Backend on Render
Follow steps from Option 1 for backend.

#### Frontend on Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Update API URLs** (use Render backend URL)

3. **Deploy**
   ```bash
   cd client
   vercel
   ```

4. **Follow prompts** and deploy

---

### Option 3: Deploy to Railway

1. **Push to GitHub**

2. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

3. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

4. **Add Environment Variables**
   - JWT_SECRET
   - NODE_ENV=production

5. **Deploy** - Railway auto-detects Node.js

---

### Option 4: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create food-ordering-app
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_secure_secret
   heroku config:set NODE_ENV=production
   ```

5. **Create Procfile** (already should be present)
   ```
   web: node server.js
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 🔧 Production Configuration Changes

### 1. Update CORS in `server.js`
```javascript
// Replace
app.use(cors());

// With
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

### 2. Update Frontend API URLs
In `client/src/context/AuthContext.js` and `client/src/components/Dashboard.js`:
```javascript
// Replace
const response = await fetch('/api/auth/login', {

// With
const response = await fetch('https://your-backend-url.com/api/auth/login', {
```

### 3. Environment Variables for Production
Create `.env.production` in root:
```
PORT=5000
JWT_SECRET=your_very_secure_random_string_here
NODE_ENV=production
DATABASE_PATH=./foodorder.db
```

### 4. Add Production Scripts to `package.json`
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "cd client && npm install && npm run build",
    "heroku-postbuild": "cd client && npm install && npm run build"
  }
}
```

---

## 🗄️ Database Considerations

### SQLite in Production
- SQLite works for small applications
- Database file persists on disk
- Good for < 100 concurrent users

### Upgrade to PostgreSQL (for scale)
If you need to scale, consider PostgreSQL:

1. **Add PostgreSQL dependency**
   ```bash
   npm install pg
   ```

2. **Update database.js** to use PostgreSQL
3. **Use managed PostgreSQL** (Render, Railway, or Heroku provide free tiers)

---

## 📊 Monitoring & Logs

### Check Logs
- **Render**: Dashboard → Logs tab
- **Heroku**: `heroku logs --tail`
- **Railway**: Dashboard → Deployments → Logs

### Health Check Endpoint
The root endpoint `/` serves as a health check:
```
GET https://your-backend-url.com/
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` to Git** (already in .gitignore)
2. **Use strong JWT_SECRET** (min 32 characters)
3. **Enable HTTPS** (most platforms provide this by default)
4. **Rate limiting** (consider adding express-rate-limit)
5. **Helmet.js** for security headers
   ```bash
   npm install helmet
   ```
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

---

## 🧪 Testing Production

After deployment:

1. **Test Authentication**
   - Login with demo users
   - Verify JWT token generation

2. **Test Role-Based Access**
   - Login as different roles
   - Verify access restrictions

3. **Test Location Restrictions**
   - Login as Members from different locations
   - Verify cart/payment restrictions

4. **Test Order Flow**
   - Create orders
   - View order history
   - Update payment methods

---

## 📱 Mobile Responsiveness

The application is already mobile-responsive. Test on:
- Desktop browsers
- Mobile browsers (Chrome, Safari)
- Different screen sizes

---

## 🔄 CI/CD (Optional)

### GitHub Actions for Auto-Deploy
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl https://api.render.com/deploy/srv-xxx?key=${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## 🆘 Troubleshooting

### Backend Issues
- Check environment variables are set
- Verify database file permissions
- Check logs for errors

### Frontend Issues
- Verify API URL is correct
- Check CORS configuration
- Test API endpoints with Postman

### Database Issues
- Ensure write permissions for SQLite
- Check database file exists
- Verify schema is created

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Railway Docs](https://docs.railway.app)

---

## ✅ Post-Deployment

After successful deployment:
1. Update README with live URLs
2. Test all functionality
3. Share demo links
4. Monitor logs for errors
5. Set up uptime monitoring (e.g., UptimeRobot)
