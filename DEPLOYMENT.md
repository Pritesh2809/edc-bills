# Deployment Guide

This guide provides step-by-step instructions for deploying the EDC Receipt Management System.

## Quick Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Initial admin user created in Firebase
- [ ] SendGrid account created and sender verified
- [ ] Cloud Functions deployed
- [ ] Firestore rules and indexes deployed
- [ ] Storage rules deployed
- [ ] Frontend built and deployed to Netlify
- [ ] Email notifications tested
- [ ] PDF/CSV export tested

## Detailed Steps

### 1. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project (if not already done)
firebase init

# Select the following:
# - Firestore
# - Functions
# - Storage
# - Choose existing project: edc-bills-trail
```

### 2. Deploy Firebase Services

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage

# Deploy Cloud Functions
firebase deploy --only functions
```

### 3. Create Initial Admin User

**Via Firebase Console:**

1. Go to Firebase Console > Authentication
2. Add user:
   - Email: `edc@kprcas.ac.in@edc-bills.internal`
   - Password: (choose a secure password)
3. Note the User UID

4. Go to Firestore Database > users collection
5. Add document with User UID as document ID:

```json
{
  "authUid": "<user-uid-from-step-3>",
  "loginId": "edc@kprcas.ac.in",
  "name": "EDC Administrator",
  "contact_email": "edc@kprcas.ac.in",
  "role": "admin",
  "createdAt": <use server timestamp>
}
```

**Via Firebase CLI (Alternative):**

```bash
# Use Firebase Admin SDK or create via Auth console as above
```

### 4. Configure SendGrid

```bash
# Set SendGrid API key
firebase functions:config:set sendgrid.key="SG.xxxxxxxxxxxxx"

# View current config
firebase functions:config:get

# Redeploy functions to apply config
firebase deploy --only functions
```

### 5. Build Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test build locally
npm run preview
```

### 6. Deploy to Netlify

#### Method 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize Netlify site
netlify init

# Deploy
netlify deploy --prod
```

#### Method 2: Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Go to Netlify Dashboard
3. Click "Add new site" > "Import an existing project"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18
6. Click "Deploy site"

### 7. Post-Deployment Configuration

#### Update Firebase Authorized Domains

1. Go to Firebase Console > Authentication > Settings
2. Under "Authorized domains", add your Netlify domain:
   - `your-app-name.netlify.app`

#### Test Authentication

1. Visit your deployed site
2. Try logging in with admin credentials
3. Verify dashboard loads correctly

### 8. Verify Email Notifications

1. Create a test member with a real email
2. Create a test trip with that member
3. Upload a test receipt as another member
4. Check that the bill payer receives an email
5. Check audit logs for email_sent status

### 9. Test Exports

1. Upload a few test receipts
2. Try exporting to PDF
   - Verify images are embedded
   - Check formatting
3. Try exporting to CSV
   - Verify all data is present

## Environment-Specific Configurations

### Development

```bash
# Use Firebase emulators
firebase emulators:start

# Run dev server
npm run dev
```

### Staging (Optional)

```bash
# Create a staging Firebase project
firebase use staging

# Deploy to staging
firebase deploy

# Deploy frontend to Netlify branch
netlify deploy --alias staging
```

### Production

```bash
# Switch to production project
firebase use default

# Deploy everything
firebase deploy

# Deploy frontend
netlify deploy --prod
```

## Monitoring and Maintenance

### Check Cloud Function Logs

```bash
# View recent logs
firebase functions:log

# Follow logs in real-time
firebase functions:log --only onReceiptCreate
```

### Monitor Firestore Usage

1. Go to Firebase Console > Firestore
2. Check Usage tab for:
   - Document reads/writes
   - Storage usage

### Monitor Storage Usage

1. Go to Firebase Console > Storage
2. Check Files and Usage tabs

### Monitor Netlify Deploys

1. Go to Netlify Dashboard
2. Check Deploys tab
3. View build logs if needed

## Rollback Procedures

### Rollback Cloud Functions

```bash
# List previous versions
firebase functions:list

# Rollback is not directly supported
# Redeploy previous code from git
git checkout <previous-commit>
firebase deploy --only functions
git checkout main
```

### Rollback Netlify Deploy

1. Go to Netlify Dashboard > Deploys
2. Find the previous successful deploy
3. Click "Publish deploy"

### Rollback Firestore Rules

```bash
# Keep rules in version control
git checkout <previous-commit> firestore.rules
firebase deploy --only firestore:rules
git checkout main
```

## Troubleshooting Deployment Issues

### Functions Deployment Fails

```bash
# Check Node version
node --version  # Should be 18

# Clear functions cache
rm -rf functions/node_modules
cd functions && npm install

# Try deploying again
firebase deploy --only functions --debug
```

### Build Fails on Netlify

1. Check build logs in Netlify dashboard
2. Verify Node version in netlify.toml
3. Try building locally: `npm run build`
4. Check for missing dependencies

### Firestore Rules Deployment Fails

```bash
# Validate rules first
firebase firestore:rules:validate

# Fix any syntax errors
# Deploy again
firebase deploy --only firestore:rules
```

## Security Checklist

- [ ] Firebase security rules properly configured
- [ ] Storage rules restrict access appropriately
- [ ] SendGrid sender verified
- [ ] Admin password is strong
- [ ] Environment variables not committed to git
- [ ] HTTPS enforced on all routes
- [ ] CORS configured correctly
- [ ] Rate limiting considered for Cloud Functions

## Performance Optimization

### Frontend

- [ ] Enable Netlify CDN
- [ ] Enable gzip compression (default in Netlify)
- [ ] Lazy load images
- [ ] Code splitting configured

### Backend

- [ ] Firestore indexes created
- [ ] Cloud Functions have appropriate memory/timeout
- [ ] Storage has lifecycle policies for old files

## Cost Monitoring

### Firebase

1. Go to Firebase Console > Usage and billing
2. Set up budget alerts
3. Monitor:
   - Function invocations
   - Firestore reads/writes
   - Storage bandwidth

### SendGrid

1. Check SendGrid dashboard for email usage
2. Monitor against free tier limits (100 emails/day)

### Netlify

1. Check Netlify dashboard for bandwidth usage
2. Monitor build minutes

## Backup Strategy

### Firestore Backup

```bash
# Use gcloud to export Firestore data
gcloud firestore export gs://[BUCKET_NAME]

# Schedule automated backups
# Set up in Google Cloud Console
```

### Storage Backup

- Enable versioning in Firebase Storage
- Periodically download critical files

## Support and Maintenance

- Monitor error logs daily
- Review audit logs weekly
- Update dependencies monthly
- Review security rules quarterly
- Backup data weekly

For issues, contact: edc@kprcas.ac.in
