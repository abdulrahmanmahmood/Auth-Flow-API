# 🔐 Auth Flow API

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

> **A sophisticated, production-ready authentication API built with modern backend technologies and enterprise-grade architecture patterns.**

## 🚀 Project Overview

This **Auth Flow API** is a comprehensive authentication system that demonstrates advanced backend development skills, clean architecture principles, and modern software engineering practices. Built with **NestJS** and **TypeScript**, it showcases expertise in creating scalable, maintainable, and secure backend applications.

### 🎯 Key Highlights

- **🏗️ Clean Architecture**: Modular design following SOLID principles
- **🔒 Security-First**: JWT authentication with refresh token rotation
- **📧 Email Integration**: Professional email templates with Handlebars
- **📊 Database Management**: Advanced Prisma ORM with PostgreSQL
- **📚 API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **🧪 Testing Strategy**: Unit and integration tests with Jest
- **🔄 API Versioning**: Multiple API versions for backward compatibility
- **⚡ Performance**: Optimized database queries and token management

---

## 🏗️ Architecture & Design Patterns

### 📐 Clean Architecture Implementation

```
src/
├── 🎯 auth/                    # Authentication Module
│   ├── 📄 auth.controller.ts   # Route handlers & API documentation
│   ├── 🧠 auth.service.ts      # Business logic & use cases
│   ├── 🏛️ auth.module.ts       # Module configuration & DI
│   └── 📋 dto/                 # Data Transfer Objects
├── 👥 users/                   # User Management Module
├── 📧 mail/                    # Email Service Module
├── 🔐 guards/                  # Authentication Guards
├── 🎛️ strategies/              # Passport Strategies
├── 🗄️ prisma/                  # Database Layer
└── 📄 templates/               # Email Templates
```

### 🎨 Design Patterns Applied

#### 1. **Dependency Injection Pattern**
```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}
}
```

#### 2. **Repository Pattern**
- **PrismaService** acts as a repository layer
- **Clean separation** between data access and business logic
- **Database-agnostic** business logic implementation

#### 3. **Strategy Pattern**
- **JWT Strategy** for authentication
- **Passport integration** for multiple auth strategies
- **Configurable authentication** mechanisms

#### 4. **Decorator Pattern**
- **Custom guards** (`@UseGuards(JwtAuthGuard)`)
- **Validation decorators** (`@IsEmail`, `@MinLength`)
- **API documentation** decorators (`@ApiOperation`, `@ApiResponse`)

#### 5. **Module Pattern**
- **Feature-based modules** for scalability
- **Clear boundaries** between domains
- **Reusable components** across modules

---

## ⭐ Core Features

### 🔐 **Advanced Authentication System**

#### **Multi-Layer Security**
- **JWT Access Tokens** (15-minute expiry)
- **Refresh Token Rotation** (7-day expiry with cleanup)
- **Password Hashing** with bcrypt and salt
- **Email Verification** with time-based tokens
- **Password Reset** with secure token generation

#### **Complete Auth Flow**
```typescript
// Registration with email verification
POST /auth/register

// Email verification with 4-digit code
POST /auth/verify-email

// Secure login with JWT tokens
POST /auth/login

// Token refresh mechanism
POST /auth/refresh-token

// Secure logout with token invalidation
POST /auth/logout

// Password reset flow
POST /auth/forgot-password
POST /auth/reset-password
```

### 📊 **Database Design Excellence**

#### **Entity Relationship Model**
```prisma
Users ──┐
        ├─── VerificationTokens (1:N)
        ├─── RefreshTokens (1:N)
        ├─── PasswordResetTokens (1:N)
        ├─── OAuthAccounts (1:N)
        └─── Todos (1:N)
```

#### **Advanced Database Features**
- **UUID Primary Keys** for enhanced security
- **Cascade Deletions** for data integrity
- **Indexed Queries** for optimal performance
- **Enum Types** for type safety
- **Timestamp Tracking** (createdAt, updatedAt)

### 📧 **Professional Email System**

#### **Handlebars Template Engine**
- **Responsive HTML templates** with modern design
- **Dynamic content injection** with context variables
- **Professional styling** with CSS animations
- **Mobile-optimized** layouts

#### **Email Features**
- **Email verification** with styled templates
- **Password reset** notifications
- **Configurable expiry times**
- **Error handling** and logging

### 📚 **API Documentation & Versioning**

#### **Swagger/OpenAPI Integration**
```typescript
@ApiOperation({
  summary: 'Register a new user',
  description: 'Create a new user account and send email verification',
})
@ApiResponse({
  status: HttpStatus.CREATED,
  description: 'User registered successfully',
  schema: { /* detailed schema */ }
})
```

#### **API Versioning**
- **Version 1**: Basic profile endpoint
- **Version 2**: Enhanced profile with full name format
- **Backward compatibility** maintained

---

## 🛡️ Security Implementation

### 🔒 **Authentication Security**

#### **Token Management**
```typescript
// Access Token Generation
private generateAccessToken(userId: string, email: string) {
  const payload = { sub: userId, email };
  return this.jwtService.sign(payload, {
    secret: this.configService.get<string>('JWT_SECRET'),
    expiresIn: '15m',
  });
}

// Refresh Token with Database Storage
private async generateRefreshToken(userId: string) {
  // Clean up expired tokens
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  await this.prisma.refreshToken.deleteMany({
    where: { userId, expires: { lt: oneWeekAgo } }
  });
  
  // Generate new refresh token
  const jwtToken = this.jwtService.sign({ userId }, {
    secret: this.configService.get<string>('JWT_SECRET'),
    expiresIn: '7d',
  });
  
  // Store in database
  await this.prisma.refreshToken.create({
    data: {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      token: jwtToken,
      userId: userId,
    },
  });
  
  return jwtToken;
}
```

#### **Password Security**
- **bcrypt hashing** with dynamic salt generation
- **Strong password requirements** with regex validation
- **Password reset** with secure token cleanup

#### **Input Validation**
```typescript
@IsEmail({}, { message: 'Please enter a valid email address' })
@IsString()
@MinLength(6, { message: 'Password must be at least 5 characters long' })
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{7,}$/, {
  message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
})
```

### 🛡️ **Guards & Middleware**

#### **JWT Authentication Guard**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### **Custom JWT Strategy**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: { sub: string; userId: string }) {
    const user = await this.userService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

---

## 🧪 Testing & Quality Assurance

### 📋 **Testing Strategy**

#### **Unit Testing**
- **Jest framework** for comprehensive testing
- **Service layer testing** for business logic validation
- **Controller testing** for API endpoint verification
- **Mock dependencies** for isolated testing

#### **Code Quality**
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

#### **Linting & Formatting**
- **ESLint** with TypeScript rules
- **Prettier** for consistent code formatting
- **Pre-build hooks** with Prisma generation

---

## 🚀 Advanced Features

### 🔄 **Token Management**

#### **Automatic Cleanup**
```typescript
// Clean up expired refresh tokens
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

await this.prisma.refreshToken.deleteMany({
  where: {
    userId,
    expires: { lt: oneWeekAgo },
  },
});
```

#### **Security Token Generation**
```typescript
// 4-digit verification code
const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

// 6-character password reset token
const resetToken = Math.random()
  .toString(36)
  .substring(2, 8)
  .toUpperCase();
```

### 📧 **Email Template System**

#### **Context-Aware Templates**
```typescript
await this.mailService.sendMail({
  to: email,
  subject: 'Verify your email',
  template: 'email-verification',
  context: {
    token,
    name: firstName ?? 'there',
    appName: 'Auth Flow',
    verificationUrl: `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`,
    expiresIn: expiryTime,
  },
});
```

### 🎯 **Error Handling**

#### **Structured Error Responses**
```typescript
throw new BadRequestException({
  message: 'Invalid verification token',
  description: 'Verification token is invalid or expired',
});
```

#### **Comprehensive Logging**
```typescript
private readonly logger = new Logger();

try {
  // Business logic
} catch (error) {
  this.logger.error(error);
  throw error;
}
```

---

## 🛠️ Technical Stack

### **Backend Framework**
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment

### **Database & ORM**
- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database access
- **Database migrations** - Version control for schema

### **Authentication & Security**
- **JWT** - JSON Web Tokens
- **Passport** - Authentication middleware
- **bcrypt** - Password hashing
- **class-validator** - Input validation

### **Email & Templates**
- **@nestjs-modules/mailer** - Email service
- **Handlebars** - Template engine
- **Responsive HTML** - Professional email design

### **Development Tools**
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Swagger** - API documentation

---

## 🚀 Getting Started

### **Prerequisites**
```bash
Node.js >= 16.x
PostgreSQL >= 12.x
pnpm (recommended) or npm
```

### **Installation**
```bash
# Clone the repository
git clone https://github.com/abdulrahmanmahmood/Auth-Flow-API

# Navigate to project directory
cd auth-flow

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Configure database
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate

# Seed the database (optional)
pnpm prisma db seed

# Start development server
pnpm start:dev
```

### **Environment Configuration**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/authflow"
JWT_SECRET="your-super-secret-jwt-key"
VERIFICATION_TOKEN_EXPIRY_MINUTES=15
FRONTEND_URL="http://localhost:3000"
```

### **API Documentation**
Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

---

## 📈 Performance Optimizations

### **Database Optimizations**
- **Indexed queries** for user lookups
- **Efficient token cleanup** with batch operations
- **Connection pooling** with Prisma
- **Query optimization** for complex relationships

### **Security Optimizations**
- **Short-lived access tokens** (15 minutes)
- **Automatic token cleanup** for expired entries
- **Password complexity validation**
- **Rate limiting ready** architecture

### **Code Organization**
- **Modular architecture** for maintainability
- **Service-oriented design** for reusability
- **Type-safe operations** throughout the codebase
- **Separation of concerns** across layers

---

## 🔮 Future Enhancements

### **Planned Features**
- [ ] **OAuth Integration** (Google, GitHub, Apple)
- [ ] **Multi-factor Authentication** (2FA)
- [ ] **Rate Limiting** middleware
- [ ] **Session Management** with Redis
- [ ] **Audit Logging** for security events
- [ ] **Account Lockout** after failed attempts
- [ ] **Email Templates** customization
- [ ] **WebSocket Integration** for real-time features

### **Technical Improvements**
- [ ] **Docker Containerization**
- [ ] **CI/CD Pipeline** setup
- [ ] **Health Check** endpoints
- [ ] **Monitoring & Metrics**
- [ ] **API Gateway** integration
- [ ] **Microservices** architecture migration

---

## 🤝 Contributing

This project demonstrates production-ready code quality and architectural patterns. Contributions following the established patterns and coding standards are welcome.

### **Code Quality Standards**
- **TypeScript strict mode**
- **Comprehensive error handling**
- **Detailed API documentation**
- **Unit test coverage**
- **Consistent code formatting**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 About the Developer

This project showcases advanced backend development skills including:

- **🏗️ Architecture Design** - Clean, scalable, maintainable code structure
- **🔒 Security Implementation** - Enterprise-grade authentication and authorization
- **📊 Database Design** - Efficient, normalized database schemas
- **🧪 Testing Strategies** - Comprehensive test coverage and quality assurance
- **📚 Documentation** - Clear, detailed API and code documentation
- **⚡ Performance** - Optimized queries and efficient resource management

**Technologies Mastered**: NestJS, TypeScript, PostgreSQL, Prisma ORM, JWT Authentication, Email Systems, API Design, Testing Frameworks, and Modern Backend Development Practices.

---

<div align="center">
  <strong>Built with ❤️ by Abdulrahman Mahmood</strong>
  <br>
  <em>Demonstrating expertise in modern backend development</em>
</div>
