# Environment Variables Template
# Copy this to .env in your project root

# ===== Database =====
# For SQLite (default)
DATABASE_URL="file:./prisma/dev.db"

# For PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# For MySQL
# DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# ===== NextAuth Configuration =====
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# For production, use your domain
# NEXTAUTH_URL="https://your-domain.com"

# ===== AWS Configuration (if using S3) =====
NEXT_PUBLIC_AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"

# ===== Email Configuration =====
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# ===== Payment Configuration (if using Razorpay) =====
NEXT_PUBLIC_RAZORPAY_KEY="your-razorpay-key"
RAZORPAY_SECRET="your-razorpay-secret"

# ===== Application Settings =====
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# For production
# NODE_ENV="production"
# NEXT_PUBLIC_APP_URL="https://your-domain.com"

# ===== API Keys =====
# Add any other API keys your app needs here

# ===== Session Configuration =====
SESSION_EXPIRY_DAYS="30"

# ===== Logging =====
LOG_LEVEL="info"
