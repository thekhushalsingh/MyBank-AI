# 🏦 MyBankAI - Transparent AI-Powered Banking

A full-stack web application that demonstrates AI-powered banking decisions with complete transparency, user control, and regulatory compliance.

![MyBankAI](https://img.shields.io/badge/MyBankAI-AI%20Banking-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## 🚀 Overview

MyBankAI is a modern banking application that leverages artificial intelligence to provide financial services while maintaining complete transparency. Users can view AI-generated profiles, control their data consent preferences, review automated decisions, and request corrections when needed.

### ✨ Key Features

- 🤖 **AI-Powered Decisions** - Real AI analysis for financial profiling and risk assessment
- 🔍 **Complete Transparency** - See exactly how AI makes decisions about your finances
- 🛡️ **Data Control** - Granular consent management for data usage
- 📊 **Audit Trails** - Immutable logs of all AI decisions for compliance
- ⚖️ **Fairness Monitoring** - AI bias detection and fairness reporting
- ✏️ **Correction System** - Request corrections to AI inferences

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library
- **TanStack Query** - Data fetching and state management
- **Wouter** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Full-stack type safety
- **JWT** - Authentication
- **bcrypt** - Password security

### Database & AI
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and migrations
- **OpenAI GPT-4** - Natural language processing
- **Hugging Face** - Specialized ML models

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- OpenAI API key
- Hugging Face API key (optional)

### Quick Start

1. **Clone the repository**
   ```bash
   
### Install root dependencies
npm install

### Install client dependencies
cd client && npm install && cd ..

### Install server dependencies
cd server && npm install && cd ..

##Environment Setup
Create a .env file in the root directory:
.env
### Database
DATABASE_URL="postgresql://username:password@localhost:5432/mybankai"

### JWT
JWT_SECRET="your-super-secure-jwt-secret-key"

### AI APIs
OPENAI_API_KEY="your-openai-api-key"
HUGGINGFACE_API_KEY="your-huggingface-api-key"

### Node Environment
NODE_ENV="development"
### Create Database
### Generate Prisma client
npx prisma generate

### Create database and run migrations
npx prisma db push

### Development mode (runs both frontend and backend)
npm run dev:all

## 📸 Screenshots

| Landing Page | Login Page | Dashboard |
|--------------|------------|-----------|
| ![Landing Page](./screenshot/landing-page.png) | ![Login Page](./screenshot/log-in.png) | ![Dashboard](./screenshot/home-page.png) |

| AI Profile | Data Consent | Recent Decisions |
|------------|--------------|------------------|
| ![AI Profile](./screenshot/ai-profile.png) | ![Data Consent](./screenshot/data-consent.png) | ![Recent Decisions](./screenshot/recent-page.png) |

| Correction  | Audit Log | Fairness Monitor |
|-----------------|-----------|------------------|
| ![Correction Dashboard](./screenshot/customer-correction.png) | ![Audit Log](./screenshot/immutable-page.png) | ![Fairness Monitor](./screenshot/fairness-monitor.png) |

