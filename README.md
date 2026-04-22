# Enterprise SaaS Authentication Boilerplate (Next.js 15)

A high-performance, security-first authentication foundation designed for modern SaaS applications. Built with **Clean Architecture**, **Zod-validated configuration**, and a **Global Design System**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Key Features

### 🔐 Authentication & Security
- **Dual Token Strategy**: Access Tokens (short-lived) + Refresh Tokens (long-lived) for secure session recovery.
- **Refresh Token Rotation**: Advanced security to prevent session replay attacks.
- **HTTP-Only Cookies**: Mitigation against XSS and CSRF attacks by storing sensitive tokens outside JavaScript reach.
- **Password Hashing**: Industry-standard encryption using `bcryptjs`.
- **RBAC (Role-Based Access Control)**: Granular permission levels for `User` and `Admin` roles.

### 📧 User Management
- **Email Verification**: Automated verification flow using secure, time-limited tokens.
- **Password Recovery**: Robust "Forgot Password" system with secure reset links.
- **Profile Management**: Self-service profile updates and secure password rotation.
- **Audit Logging**: Comprehensive tracking of security events (Logins, Password Changes, Admin Actions).

### 🛠 Administrative Tools
- **User Management Console**: Paginated user index with account control (Block/Unblock) and role reassignment.
- **Instant Revocation**: Administrative actions automatically invalidate active sessions for the target user.

## 🏗 Technical Architecture

```mermaid
graph TD
    Client[Next.js Client] --> Middleware[Edge Middleware RBAC]
    Middleware --> API[Next.js API Routes]
    API --> Lib[Lib / Services]
    Lib --> DB[(MongoDB / Mongoose)]
    Lib --> Mail[Nodemailer / SMTP]
    
    subgraph Security
        Auth[JWT / jose]
        Security[Bcrypt / Hashing]
    end
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authenticaton**: JWT (jose & jsonwebtoken)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Icons**: Lucide React
- **Email**: Nodemailer

## 🎨 Branding & Customization

The system features a **Global Design System** based on CSS variables. You can re-brand the entire application in seconds by modifying the variables in `src/app/globals.css`.

### Primary Color System
```css
:root {
  --primary: #4f46e5;      /* Main Brand Color */
  --accent: #6366f1;       /* Interactive Accents */
  --success: #10b981;      /* Success States */
  --destructive: #ef4444;  /* Error States */
  --radius: 0.75rem;       /* Global Corner Radius */
}
```

## 🛡 Security Audit Summary

| Feature | Implementation | Benefit |
| :--- | :--- | :--- |
| **Token Storage** | HttpOnly Cookies | Protects against XSS attacks |
| **Secret Protection** | jose / JWT | Prevents token tampering |
| **Password Polish** | bcryptjs (10 salts) | Brute-force resistant hashing |
| **Session Control** | Token Rotation | Prevents session hijacking |
| **Access Control** | Edge Middleware | Prevents unauthorized route access |

## 📦 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure Environment Variables**: Create a `.env.local` file.
4. **Run development server**: `npm run dev`

---

## 👨‍💻 Author
**[Hitesh Bhoot]** - Full Stack Developer
*Professional solutions for secure application architecture.*
