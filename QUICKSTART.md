# EDC Receipt Management System - Quick Start Guide

## What You Have

A complete, production-ready receipt management system with:

✅ **Frontend**: React app with admin, member, and viewer dashboards
✅ **Backend**: Firebase (Auth, Firestore, Storage, Functions)
✅ **Email**: Automated notifications via SendGrid
✅ **Export**: PDF with embedded images + CSV
✅ **Hosting**: Ready for Netlify deployment

## File Structure Overview

```
edc-bills/
├── src/                          # React frontend source code
│   ├── components/              # All UI components
│   │   ├── admin/              # Admin-specific components
│   │   ├── member/             # Member-specific components
│   │   ├── AdminDashboard.jsx
│   │   ├── MemberDashboard.jsx
│   │   ├── ViewerDashboard.jsx
│   │   └── Login.jsx
│   ├── context/                # Auth context for state management
│   ├── utils/                  # Export utilities (PDF, CSV)
│   └── firebase.js             # Firebase configuration
├── functions/                   # Cloud Functions for email
├── firestore.rules             # Database security rules
├── storage.rules               # File storage security rules
├── netlify.toml                # Netlify deployment config
├── README.md                   # Comprehensive documentation
└── DEPLOYMENT.md               # Detailed deployment guide
```

## Next Steps (5 Minutes to Get Running)

### 1. Install Dependencies (1 min)

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Local Development (1 min)

```bash
# Start the development server
npm run dev

# Visit http://localhost:3000
```

### 3. Deploy to Netlify (2 mins)

```bash
# Build the project
npm run build

# Deploy to Netlify
npx netlify-cli deploy --prod
# OR connect via Netlify dashboard
```

### 4. Set Up Firebase (Optional - for full functionality)

See detailed steps in `DEPLOYMENT.md`, but in summary:

1. Create initial admin user in Firebase Console
2. Configure SendGrid API key for emails
3. Deploy Cloud Functions: `firebase deploy --only functions`
4. Deploy security rules: `firebase deploy --only firestore,storage`

## First Time Login

After deploying, create your first admin user:

1. Go to Firebase Console > Authentication
2. Add user: `edc@kprcas.ac.in@edc-bills.internal`
3. Add user document in Firestore (see DEPLOYMENT.md step 3)
4. Login with `edc@kprcas.ac.in` and your chosen password

## User Roles

- **Admin** (`edc@kprcas.ac.in`): Full access - create users, trips, view all receipts, export data
- **Member**: Upload receipts, view own receipts
- **Viewer**: Read-only access to all receipts

## Key Features Demo

### As Admin:
1. Create a member (Create Members tab)
2. Create a trip and add members (Create Trips tab)
3. View all receipts and export to PDF/CSV (View Receipts tab)

### As Member:
1. Select a trip
2. Upload a receipt
3. Choose bill payer from dropdown
4. View confirmation - bill payer receives email automatically!

## Live Demo Workflow

**Scenario**: Student uploads lunch receipt, faculty member gets notified

1. Admin creates student account (member role)
2. Admin creates faculty account (member role)
3. Admin creates trip "College Fest 2025"
4. Student logs in, uploads receipt for ₹500 lunch
5. Student selects faculty member as bill payer
6. Faculty receives email with receipt image and details ✉️
7. Admin can export all receipts as PDF with embedded images 📄

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Email**: SendGrid
- **PDF**: html2pdf.js
- **Hosting**: Netlify

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Firebase
firebase deploy --only functions    # Deploy Cloud Functions
firebase deploy --only firestore    # Deploy database rules
firebase functions:log              # View function logs

# Netlify
netlify deploy --prod              # Deploy to production
netlify dev                        # Test locally with Netlify
```

## Need Help?

- 📖 **Full Documentation**: See `README.md`
- 🚀 **Deployment Guide**: See `DEPLOYMENT.md`
- 🐛 **Troubleshooting**: Check README.md troubleshooting section

## What's Already Done

✅ Complete authentication system
✅ Role-based access control
✅ Receipt upload with file validation
✅ Automatic email notifications
✅ PDF export with embedded images
✅ CSV export
✅ Audit logging
✅ Responsive design
✅ Security rules
✅ Cloud Functions
✅ Netlify configuration

## Production Checklist

Before going live:

- [ ] Create initial admin user in Firebase
- [ ] Configure SendGrid and verify sender email
- [ ] Deploy Cloud Functions
- [ ] Deploy Firestore and Storage rules
- [ ] Test email notifications
- [ ] Test PDF/CSV exports
- [ ] Add production domain to Firebase authorized domains
- [ ] Set up monitoring and alerts

## Environment Variables

No frontend environment variables needed - Firebase config is in `src/firebase.js`

For Cloud Functions, set SendGrid key:
```bash
firebase functions:config:set sendgrid.key="YOUR_KEY"
```

## Support

Built with ❤️ for K.P.R. College of Arts and Science

For questions: edc@kprcas.ac.in

---

**You're ready to go! Start with `npm run dev` and explore the app. 🚀**
