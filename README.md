# Simple AWS Website

This is a small static website made with plain HTML, CSS, and JavaScript. It does not need a build step.

## Files

- `index.html` - page structure and content
- `styles.css` - responsive design and styling
- `script.js` - small dynamic behavior
- `hero-website.png` - hero image
- `login.html` - login page for AWS Cognito
- `auth.js` - redirects users to Cognito Hosted UI
- `aws-config.js` - Cognito settings to fill after AWS setup
- `dashboard.html` - signed-in user profile and picture page
- `dashboard.js` - profile display, logout, and local picture preview

## Login, Google Sign-In, Password Reset, And Database

Use AWS Amplify Hosting with Amazon Cognito and DynamoDB.

Recommended setup:

1. Host this repo in AWS Amplify Hosting.
2. Create an Amazon Cognito user pool.
3. Add Google as an identity provider in Cognito.
4. Enable the Cognito Hosted UI.
5. Add these callback and sign-out URLs in Cognito:
   - `https://YOUR-AMPLIFY-DOMAIN/login.html`
   - `http://localhost:8000/login.html` for local testing
6. Copy your Cognito hosted UI domain and app client ID into `aws-config.js`.
7. Use DynamoDB for app data. Do not connect the browser directly to DynamoDB; use AWS Amplify Data, API Gateway + Lambda, or AppSync.
8. Use S3 for user picture storage. Do not upload directly to a public bucket; use Amplify Storage or generate pre-signed upload URLs from Lambda.

The forgot-password button uses Cognito Hosted UI. Cognito sends the reset code/email and lets the user create a new password.

After a successful login, the browser stores the Cognito tokens locally and opens `dashboard.html`. The dashboard can show profile values from the ID token, including a Google profile image when Google sign-in is configured.

## Add S3 Storage With Amplify

This repo includes an Amplify Gen 2 backend in `amplify/`.

Local setup:

```bash
npm install
npm run sandbox
```

The storage rule in `amplify/storage/resource.ts` gives each authenticated user access to their own folder:

```text
profile-pictures/{entity_id}/*
```

When sandbox is running, it writes `amplify_outputs.json`. The dashboard imports that file and uses Amplify Storage to upload pictures to S3.

For Amplify Hosting, set the build command to:

```bash
npm run build
```

And set the output directory to:

```text
dist
```

## Host On AWS S3

1. Create an S3 bucket.
2. Upload `index.html`, `styles.css`, `script.js`, and `hero-website.png`.
3. Enable static website hosting in the bucket properties.
4. Set `index.html` as the index document.
5. Add a bucket policy for public read access, or put CloudFront in front of the bucket.

## Recommended Production Setup

For a public site, use:

- S3 for file storage
- CloudFront for HTTPS, caching, and global delivery
- Route 53 for your domain DNS
- AWS Certificate Manager for an HTTPS certificate

AWS Amplify Hosting is also a simple option if you want to connect a GitHub repository and deploy automatically.
