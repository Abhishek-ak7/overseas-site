# BN Overseas - Study Abroad Platform

A comprehensive study abroad platform built with Next.js 14, providing students with course management, appointment booking, test preparation, and counselling services.

## 🌟 Features

### 🎓 Student Features
- **Course Management**: Browse and enroll in courses for various countries
- **Appointment Booking**: Schedule counselling sessions with expert advisors
- **Test Preparation**: Take practice tests and track progress
- **Country Information**: Detailed guides for study destinations
- **Blog & Resources**: Educational content and study tips
- **User Dashboard**: Track enrollments, appointments, and test results

### 👨‍💼 Admin Features
- **Complete Admin Panel**: Comprehensive management dashboard
- **User Management**: Manage students, instructors, and admin users
- **Content Management**:
  - Blog posts with rich editor
  - Service management
  - Statistics tracking
  - Hero slides for homepage
  - Menu management
  - Journey steps
  - Testimonials & partners
- **Appointment Management**: View and manage all appointments
- **Course Management**: Create and manage courses
- **Test Management**: Create tests and view results
- **Payment Management**: Track transactions and payments
- **Advanced Features**:
  - Role-based access control
  - Real-time statistics
  - Image upload system
  - SEO optimization
  - Responsive design

### 🔐 Authentication & Security
- **NextAuth Integration**: Secure authentication system
- **Role-Based Access**: STUDENT, INSTRUCTOR, ADMIN, SUPER_ADMIN roles
- **Session Management**: Secure HTTP-only cookies
- **Protected Routes**: Middleware-based route protection
- **API Security**: All admin endpoints protected with authentication

## 🚀 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: Modern component library
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Lucide React**: Icon system

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **NextAuth.js**: Authentication system
- **Prisma ORM**: Database management
- **PostgreSQL**: Primary database
- **Zod Validation**: Request/response validation
- **bcrypt**: Password hashing

### Development Tools
- **ESLint & Prettier**: Code formatting and linting
- **TypeScript**: Static type checking
- **Git**: Version control
- **VS Code**: Recommended editor

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** (v12 or higher)
- **Git**

## ⚙️ Installation & Setup

Nodejs should installed in your system to run this project.

### 1. Open project in vs code

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bnoverseas"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Email (Optional - for email verification)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@bnoverseas.com"

# File Upload (Optional)
UPLOAD_DIR="uploads"
MAX_FILE_SIZE="5242880" # 5MB

# External APIs (Optional)
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_SECRET="your-razorpay-secret"

AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="your-aws-region"
AWS_BUCKET_NAME="your-s3-bucket"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Create Admin User
Run the seed script to create an admin user:
```bash
npx tsx prisma/seed-admin.ts
```

Default admin credentials:
- **Email**: admin@bnoverseas.com
- **Password**: admin123

### 6. Start Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
bnoverseas/
├── app/                      # Next.js 14 App Router
│   ├── admin/               # Admin panel pages
│   │   ├── appointments/    # Appointment management
│   │   ├── content/         # Content management
│   │   ├── courses/         # Course management
│   │   ├── payments/        # Payment management
│   │   ├── tests/          # Test management
│   │   └── users/          # User management
│   ├── api/                 # API routes
│   │   ├── admin/          # Admin API endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── blog/           # Blog API
│   │   ├── courses/        # Course API
│   │   └── ...             # Other API endpoints
│   ├── auth/               # Authentication pages
│   ├── blog/               # Blog pages
│   ├── courses/            # Course pages
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── admin/             # Admin-specific components
│   ├── layout/            # Layout components
│   ├── sections/          # Homepage sections
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Database client
│   └── utils.ts          # General utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Database seeding
├── public/              # Static assets
└── middleware.ts        # Route protection middleware
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with roles and authentication
- **user_profiles**: Extended user information and preferences
- **courses**: Available courses and programs
- **course_enrollments**: Student course enrollments
- **appointments**: Counselling appointments
- **tests & test_attempts**: Assessment system
- **blog_posts**: Blog content management
- **transactions**: Payment tracking

### Content Management
- **categories**: Content categorization
- **tags**: Content tagging system
- **statistics**: Dynamic homepage statistics
- **hero_slides**: Homepage carousel management
- **menus**: Dynamic navigation system
- **testimonials**: Customer testimonials
- **partners**: Partner organizations

## 🎯 Key Features Breakdown

### Admin Panel Features

#### 📊 Dashboard
- Real-time statistics and analytics
- Quick actions for common tasks
- Recent activity overview
- System status monitoring

#### 👥 User Management
- **User Listing**: Paginated user list with search and filtering
- **Role Management**: Assign and modify user roles
- **User Statistics**: Enrollment and activity tracking
- **Account Actions**: Suspend/verify users, send messages

#### 📚 Content Management
- **Blog System**:
  - Rich text editor with media support
  - SEO optimization (meta titles, descriptions)
  - Category and tag management
  - Draft/publish workflow
- **Service Management**: Create and manage offered services
- **Statistics Management**: Dynamic homepage statistics
- **Hero Slides**: Homepage carousel with image upload
- **Menu Management**: Dynamic navigation with drag-and-drop ordering

#### 📅 Appointment System
- **Booking Management**: View and manage all appointments
- **Calendar Integration**: Schedule and reschedule appointments
- **Status Tracking**: Pending, confirmed, completed, cancelled
- **Notification System**: Email reminders and confirmations

#### 🎓 Course Management
- **Course Creation**: Detailed course information with media
- **Enrollment Tracking**: Monitor student enrollments
- **Category Organization**: Organize courses by country/field
- **Pricing Management**: Set course fees and payment options

### Frontend Features

#### 🏠 Homepage
- **Dynamic Hero Section**: Admin-managed carousel slides
- **Statistics Display**: Real-time statistics
- **Featured Courses**: Highlighted course offerings
- **Testimonials**: Customer success stories
- **Blog Preview**: Latest blog posts
- **Partner Showcase**: Partner organizations

#### 📖 Blog System
- **Article Listing**: Paginated blog posts with categories
- **Individual Posts**: Full article pages with related posts
- **Search Functionality**: Find articles by keywords
- **Category Filtering**: Browse by topic
- **SEO Optimized**: Meta tags and structured data

#### 🎓 Course Pages
- **Course Catalog**: Browse all available courses
- **Detailed Pages**: Comprehensive course information
- **Enrollment System**: Secure course registration
- **Prerequisites**: Course requirements and recommendations

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checking

# Database
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npx prisma migrate   # Run migrations
```

### Code Style & Standards
- **ESLint**: Code linting with custom rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking enabled
- **Component Structure**: Organized by feature and reusability
- **API Design**: RESTful endpoints with proper error handling

### Testing
```bash
# Run tests (when configured)
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Configuration
Ensure all environment variables are set in your production environment:
- Database connection string
- NextAuth configuration
- Email service credentials
- File upload settings
- External API keys

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Reset database
npx prisma db push --force-reset
```

#### Authentication Issues
```bash
# Clear NextAuth session
# Delete .next folder and restart
rm -rf .next
npm run dev
```

#### Permission Errors
```bash
# Fix file permissions
chmod -R 755 public/uploads
```

### Development Tips
- Use **Prisma Studio** for database inspection
- Check **Network tab** in dev tools for API errors
- Enable **TypeScript strict mode** for better type safety
- Use **React DevTools** for component debugging

## 📞 Support

### Getting Help
- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests (if applicable)
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Shadcn**: For the beautiful component library
- **Prisma Team**: For the excellent ORM
- **Vercel**: For the deployment platform

---

**Built with ❤️ for students pursuing their dreams abroad**

For more information, visit [BN Overseas](https://bnoverseas.com)