# Railway Deployment Setup Guide

## Step 1: Add MySQL Database

1. In Railway dashboard, click **"New"** → **"Database"** → **"Add MySQL"**
2. Railway will automatically provision a MySQL database

## Step 2: Link Database to Your Service

**IMPORTANT:** You need to reference the MySQL service variables in your backend service.

Railway provides these variables from the MySQL service:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`

To use them in your backend service, you need to **reference** them:

1. Go to your backend service → Variables tab
2. Add these variable references (use the format `${{MySQL.VARIABLE_NAME}}`):

```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```

Replace `MySQL` with your actual MySQL service name in Railway (check the service name in your project).

## Step 3: Set Environment Variables

Go to your backend service → **Variables** tab → **Raw Editor** and paste:

```bash
# App Configuration
APP_NAME=Laravel
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:Tg3NIeUsYJBoV6HLyoR2GfKeCkMio7ZGrTXsmdW0pK0=
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Database (Railway auto-injects these)
DB_CONNECTION=mysql
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_DATABASE=${{MYSQLDATABASE}}
DB_USERNAME=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}

# Session & Cache
SESSION_DRIVER=database
SESSION_LIFETIME=120
QUEUE_CONNECTION=database
CACHE_STORE=database

# CORS - Update with your Vercel frontend URL
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email@gmail.com

# JWT Secret (generate with: php artisan jwt:secret)
JWT_SECRET=your_jwt_secret_here

# Flask Services (internal)
FLASK_SERVICE_URL=http://localhost:5000

# HuggingFace (add your actual key)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

## Step 4: Update CORS After Deployment

Once your Railway service is deployed:
1. Copy the Railway public URL (e.g., `https://clever-curiosity-production.up.railway.app`)
2. Update your Vercel frontend to use this URL as the API endpoint
3. Update the CORS variables in Railway with your Vercel URL

## Step 5: Redeploy

After setting variables, Railway will automatically redeploy. Check the logs to ensure:
- Database connection succeeds
- Migrations run successfully
- All three services start (Laravel, Flask PDF, Flask ECG)

## Troubleshooting

### Database Connection Failed
- Ensure MySQL database is added and linked to your service
- Check that `MYSQLHOST`, `MYSQLPORT`, etc. are available in your service variables

### Migrations Fail
- Check database credentials
- Ensure database is accessible from your service

### 500 Errors
- Check Deploy Logs for PHP errors
- Ensure `APP_KEY` is set
- Verify all required environment variables are present
