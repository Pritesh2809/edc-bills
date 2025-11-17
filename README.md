# EDC Receipt Management System

A comprehensive web application for managing receipts for educational trips and events at K.P.R. College of Arts and Science.

## Features

### For Members
- Upload receipts with details (amount, category, date, time, description)
- Select bill payer from trip members
- View uploaded receipts
- Automatic email notifications sent to bill payers

### For Admins
- Create and manage members
- Create and manage trips
- View all receipts with advanced filtering
- Export receipts to PDF (with embedded images) and CSV
- View audit logs for all system activities

### For Viewers (Faculty)
- Read-only access to view all receipts
- Filter receipts by trip, category, and date range
- View summary statistics

### System Features
- Firebase Authentication for secure login
- Cloud Firestore for data storage
- Firebase Storage for receipt file storage
- Cloud Functions for automated email notifications
- Responsive design with Tailwind CSS
- PDF export with embedded receipt images
- CSV export for data analysis
- Comprehensive audit logging

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Email**: SendGrid
- **PDF Generation**: html2pdf.js
- **Hosting**: Netlify

## Project Structure

```
edc-bills/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── CreateMember.jsx
│   │   │   ├── CreateTrip.jsx
│   │   │   ├── ViewReceipts.jsx
│   │   │   └── AuditLog.jsx
│   │   ├── member/
│   │   │   ├── UploadReceipt.jsx
│   │   │   └── MyReceipts.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── MemberDashboard.jsx
│   │   ├── ViewerDashboard.jsx
│   │   ├── Login.jsx
│   │   └── PrivateRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   └── exportUtils.js
│   ├── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── functions/
│   ├── index.js
│   └── package.json
├── public/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── netlify.toml
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project
- SendGrid account (for email notifications)
- Netlify account (for hosting)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd edc-bills
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Setup

#### a. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Functions

#### b. Configure Firebase in the App

The Firebase configuration is already in `src/firebase.js`. If you need to update it:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

#### c. Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

#### d. Create Initial Admin User

Since you need an admin to create other users, you'll need to create the first admin manually:

1. Go to Firebase Console > Authentication
2. Add a user with email: `edc@kprcas.ac.in@edc-bills.internal` and password
3. Copy the user's UID
4. Go to Firestore Database and create a document in the `users` collection:

```json
{
  "authUid": "<copied-uid>",
  "loginId": "edc@kprcas.ac.in",
  "name": "EDC Administrator",
  "contact_email": "edc@kprcas.ac.in",
  "role": "admin",
  "createdAt": <current timestamp>
}
```

### 4. SendGrid Setup (for Email Notifications)

#### a. Create SendGrid Account

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender email (edc@kprcas.ac.in)
3. Create an API key

#### b. Configure SendGrid in Firebase Functions

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
```

Alternatively, set it as an environment variable in your deployment.

#### c. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### 5. Local Development

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

To test Cloud Functions locally:

```bash
# Start Firebase emulators
firebase emulators:start
```

### 6. Build for Production

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

### 7. Deploy to Netlify

#### Option 1: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### Option 2: Using Netlify Dashboard

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect your Git repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy

#### Environment Variables on Netlify

If you need any environment variables, add them in:
- Netlify Dashboard > Site settings > Environment variables

### 8. Post-Deployment Setup

1. **Update Firebase Authentication Settings**:
   - Go to Firebase Console > Authentication > Settings
   - Add your Netlify domain to authorized domains

2. **Update CORS Settings** (if needed):
   - Configure Firebase Storage CORS if you encounter issues

3. **Test the Application**:
   - Login with admin credentials
   - Create test members and trips
   - Upload test receipts
   - Verify email notifications are working
   - Test PDF and CSV exports

## Usage Guide

### Admin Workflow

1. **Login** with admin credentials
2. **Create Members**:
   - Go to "Create Members" tab
   - Fill in member details (login ID, name, email, password, role)
   - Submit to create member
3. **Create Trips**:
   - Go to "Create Trips" tab
   - Enter trip details and select members
   - Submit to create trip
4. **View Receipts**:
   - Go to "View Receipts" tab
   - Use filters to find specific receipts
   - Export to PDF or CSV as needed
5. **Audit Logs**:
   - Go to "Audit Log" tab
   - Monitor system activities

### Member Workflow

1. **Login** with member credentials
2. **Upload Receipt**:
   - Select trip
   - Select bill payer from dropdown
   - Enter receipt details
   - Upload file (JPG, PNG, or PDF, max 20MB)
   - Submit
3. **View My Receipts**:
   - See all uploaded receipts
   - View summary statistics

### Viewer Workflow

1. **Login** with viewer credentials
2. **View Receipts**:
   - Filter receipts by various criteria
   - View summary statistics
   - Click "View" to see receipt images

## Data Model

### Users Collection

```javascript
{
  id: "<docId>",
  authUid: "<firebaseAuthUid>",
  loginId: "pritesh123",
  name: "Full Name",
  contact_email: "user@example.com",
  role: "admin|member|viewer",
  createdAt: serverTimestamp()
}
```

### Trips Collection

```javascript
{
  id: "<tripId>",
  name: "Trip Name",
  description: "Trip description",
  start_date: "2025-01-01",
  end_date: "2025-01-05",
  members: ["userId1", "userId2"],
  createdAt: serverTimestamp()
}
```

### Receipts Collection

```javascript
{
  id: "<receiptId>",
  trip_id: "<tripId>",
  uploader_id: "<authUid>",
  uploader_name: "Uploader Name",
  bill_payer_id: "<authUid>",
  bill_payer_name: "Payer Name",
  bill_payer_email: "payer@example.com",
  amount: 1250.00,
  currency: "INR",
  date: "2025-12-09",
  time: "13:20:00",
  category: "food|travel|accom|misc",
  description: "...",
  file_path: "receipts/{tripId}/{receiptId}_orig.pdf",
  file_url: "<url>",
  created_at: serverTimestamp(),
  created_by: "<authUid>"
}
```

### Audit Collection

```javascript
{
  id: "<id>",
  entity_type: "receipt|user|trip|export",
  entity_id: "<entityId>",
  action: "created|exported|email_sent",
  success: true|false,
  actor_id: "<authUid>",
  recipient: "email@example.com",
  reason: "...",
  error: "...",
  meta: {...},
  timestamp: serverTimestamp()
}
```

## Email Notifications

When a member uploads a receipt:

1. Cloud Function is triggered
2. Generates signed URL for receipt file (valid 7 days)
3. Sends email to bill payer with:
   - Receipt details (amount, category, date, time)
   - Link to view/download receipt
   - Trip information
4. Logs the email send status in audit collection

## Troubleshooting

### Email notifications not working

- Check SendGrid API key is configured: `firebase functions:config:get`
- Verify sender email is verified in SendGrid
- Check Cloud Function logs: `firebase functions:log`

### Receipt uploads failing

- Check Storage rules allow authenticated users to write
- Verify file size is under 20MB
- Check file type is JPG, PNG, or PDF

### Cannot login

- Verify user exists in Firestore `users` collection
- Check loginId matches exactly
- Ensure Firebase Auth has the user with email: `{loginId}@edc-bills.internal`

### PDF export not working

- Check browser console for errors
- Verify all receipt URLs are accessible
- Try with fewer receipts if browser runs out of memory

## Security Considerations

- All routes are protected with authentication
- Role-based access control (admin, member, viewer)
- Firestore security rules enforce permissions
- Storage rules restrict file access to authenticated users
- Signed URLs expire after 7 days
- Passwords must be minimum 6 characters

## License

Proprietary - K.P.R. College of Arts and Science

## Support

For issues or questions, contact: edc@kprcas.ac.in
