# College Grievance Management System

A comprehensive web-based platform for managing student grievances in colleges, featuring AI-powered assistance, automated escalation, and real-time tracking.

## Features

- **Role-based Access**: Student, Faculty, HOD, and Admin roles
- **AI Assistant**: Smart complaint categorization and FAQ chatbot
- **Automated Escalation**: Time-based automatic escalation to higher authorities
- **Real-time Tracking**: Track complaint status with timeline
- **Analytics Dashboard**: Comprehensive charts and reports
- **File Upload**: Attach documents and images
- **Email Notifications**: Automatic status update alerts
- **Mobile Responsive**: Works on all devices

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- Recharts
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- OpenAI API
- Nodemailer

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- OpenAI API key (optional)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev