# Simple AWS Website

This is a small static website made with plain HTML, CSS, and JavaScript. It does not need a build step.

## Files

- `index.html` - page structure and content
- `styles.css` - responsive design and styling
- `script.js` - small dynamic behavior
- `hero-website.png` - hero image

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
