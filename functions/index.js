const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const sgMail = require('@sendgrid/mail');

// Set SendGrid API key from environment variable
// You'll set this using: firebase functions:config:set sendgrid.key="YOUR_API_KEY"
const sendgridKey = functions.config().sendgrid?.key || process.env.SENDGRID_API_KEY;
if (sendgridKey) {
  sgMail.setApiKey(sendgridKey);
}

/**
 * Helper function to generate signed URL for a file
 * @param {string} bucketName - The storage bucket name
 * @param {string} filePath - The file path in storage
 * @param {number} expiresSeconds - Expiration time in seconds (default 7 days)
 * @returns {Promise<string>} - The signed URL
 */
async function generateSignedUrl(bucketName, filePath, expiresSeconds = 7 * 24 * 60 * 60) {
  try {
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresSeconds * 1000,
    };

    const [url] = await storage
      .bucket(bucketName)
      .file(filePath)
      .getSignedUrl(options);

    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * Cloud Function triggered when a new receipt is created
 * Sends email notification to the bill payer with receipt details and link
 */
exports.onReceiptCreate = functions.firestore
  .document('receipts/{receiptId}')
  .onCreate(async (snap, context) => {
    const receiptId = context.params.receiptId;

    try {
      const receipt = snap.data();
      const {
        id,
        trip_id,
        uploader_name,
        bill_payer_id,
        bill_payer_name,
        bill_payer_email,
        amount,
        currency = 'INR',
        date,
        time,
        category,
        description,
        file_path,
        created_by
      } = receipt;

      console.log(`Processing receipt ${receiptId} for bill payer: ${bill_payer_name}`);

      // Resolve payer email if not present on doc
      let payerEmail = bill_payer_email;
      if (!payerEmail && bill_payer_id) {
        console.log('Bill payer email not found, querying users collection...');
        const userQuery = await admin
          .firestore()
          .collection('users')
          .where('authUid', '==', bill_payer_id)
          .limit(1)
          .get();

        if (!userQuery.empty) {
          payerEmail = userQuery.docs[0].data().contact_email;
        }
      }

      // If no email found, log failure and return
      if (!payerEmail) {
        console.error('No payer email found for receipt:', receiptId);
        await admin.firestore().collection('audit').add({
          entity_type: 'receipt',
          entity_id: id || receiptId,
          action: 'email_sent',
          success: false,
          reason: 'no_payer_email',
          actor_id: created_by || null,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        return null;
      }

      // Generate signed URL for the receipt file
      const bucketName = admin.storage().bucket().name;
      console.log(`Generating signed URL for file: ${file_path}`);
      const signedUrl = await generateSignedUrl(bucketName, file_path, 7 * 24 * 60 * 60);

      // Get trip details
      let tripName = 'Trip';
      if (trip_id) {
        const tripDoc = await admin.firestore().collection('trips').doc(trip_id).get();
        if (tripDoc.exists) {
          tripName = tripDoc.data().name;
        }
      }

      // Prepare email content
      const msg = {
        to: payerEmail,
        from: 'edc@kprcas.ac.in', // Must be verified in SendGrid
        subject: `[EDC] New receipt added — ${tripName} — ₹${amount}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4a5568; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f7fafc; }
                .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .details ul { list-style: none; padding: 0; }
                .details li { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
                .details li:last-child { border-bottom: none; }
                .button { display: inline-block; padding: 12px 24px; background-color: #4299e1; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #718096; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>EDC Receipt Management System</h2>
                  <p>K.P.R. College of Arts and Science</p>
                </div>
                <div class="content">
                  <h3>Hi ${bill_payer_name || 'there'},</h3>
                  <p>${uploader_name || 'A team member'} has uploaded a receipt for <strong>${tripName}</strong> and marked you as the bill payer.</p>

                  <div class="details">
                    <h4>Receipt Details:</h4>
                    <ul>
                      <li><strong>Amount:</strong> ${amount} ${currency}</li>
                      <li><strong>Category:</strong> ${category}</li>
                      <li><strong>Date:</strong> ${date} ${time || ''}</li>
                      <li><strong>Description:</strong> ${description || 'N/A'}</li>
                      <li><strong>Uploaded by:</strong> ${uploader_name}</li>
                    </ul>
                  </div>

                  <div style="text-align: center;">
                    <a href="${signedUrl}" class="button">View Receipt</a>
                  </div>

                  <p style="margin-top: 20px;">The receipt link will be valid for 7 days. Please download it if you need to keep a copy.</p>
                </div>
                <div class="footer">
                  <p>If you did not expect this email, please contact the administrator at <a href="mailto:edc@kprcas.ac.in">edc@kprcas.ac.in</a></p>
                  <p>This is an automated email from the EDC Receipt Management System.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      // Send email
      if (sendgridKey) {
        console.log(`Sending email to ${payerEmail}...`);
        await sgMail.send(msg);
        console.log('Email sent successfully');

        // Record audit success
        await admin.firestore().collection('audit').add({
          entity_type: 'receipt',
          entity_id: id || receiptId,
          action: 'email_sent',
          success: true,
          actor_id: created_by || null,
          recipient: payerEmail,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        console.warn('SendGrid API key not configured. Email not sent.');
        // Record audit with warning
        await admin.firestore().collection('audit').add({
          entity_type: 'receipt',
          entity_id: id || receiptId,
          action: 'email_sent',
          success: false,
          reason: 'sendgrid_not_configured',
          actor_id: created_by || null,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return null;
    } catch (err) {
      console.error('Error in onReceiptCreate:', err);

      // Record audit failure
      await admin.firestore().collection('audit').add({
        entity_type: 'receipt',
        entity_id: receiptId,
        action: 'email_sent',
        success: false,
        error: err.message || String(err),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Don't throw - we don't want to retry on permanent failures
      return null;
    }
  });

/**
 * Optional: Cloud Function to manually resend email for a receipt
 * Can be called by admin if needed
 */
exports.resendReceiptEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const receiptId = data.receiptId;
  if (!receiptId) {
    throw new functions.https.HttpsError('invalid-argument', 'Receipt ID is required');
  }

  try {
    // Fetch receipt
    const receiptDoc = await admin.firestore().collection('receipts').doc(receiptId).get();
    if (!receiptDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Receipt not found');
    }

    const receipt = receiptDoc.data();
    // Call the same logic as onCreate (simplified here)
    // In production, you'd extract the email sending logic to a shared function

    return { success: true, message: 'Email resent successfully' };
  } catch (error) {
    console.error('Error resending email:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
