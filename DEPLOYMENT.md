# Papua New Guinea Investment Guide 2025

## Cloudflare Pages Deployment Guide

This folder contains the complete Papua New Guinea Investment Guide website optimized for Cloudflare Pages deployment.

### Files Structure

```
├── index.html                    # Main website (upgraded from ultimate-enhanced.html)
├── _redirects                   # Cloudflare Pages routing rules
├── additional-projects-optimized.html  # Additional projects page
├── additional-projects.html      # Legacy projects page
├── beautiful-version.html       # Alternative version
├── seo-optimized.html          # SEO optimized version
├── k.jpeg                      # Image assets
├── tele.jpg                    # Image assets
├── wapp.jpg                    # Image assets
├── wechat.jpg                  # Image assets
└── DEPLOYMENT.md               # This deployment guide
```

### Features

- **Responsive Design**: Works on all devices
- **2025 Latest Policies**: Updated with August 2025 policy changes
- **Investment Calculator**: Interactive ROI calculator
- **Project Database**: 30+ specific investment opportunities
- **Official Contacts**: Direct links to PNG government agencies
- **Success Stories**: Real case studies and lessons learned
- **Registration Guide**: Step-by-step company setup process

### Cloudflare Pages Setup

1. **Connect Repository**: Link your GitHub/GitLab repository to Cloudflare Pages
2. **Build Settings**:
   - Build command: `echo "No build required"`
   - Build output directory: `/`
   - Root directory: `/`
3. **Environment Variables**: None required
4. **Custom Domain**: Optional - can use Cloudflare's subdomain

### Deployment Steps

1. **Direct Upload via Dashboard**:
   - Go to Cloudflare Pages dashboard
   - Create new project
   - Upload all files directly
   - Set custom domain if desired

2. **Git Integration**:
   - Push all files to GitHub/GitLab
   - Connect repository to Cloudflare Pages
   - Automatic deployment on push

### Routing Configuration

The `_redirects` file handles:
- Main page routing to index.html
- Direct access to all HTML files
- SPA-style routing for all paths
- 200 status codes for proper SPA behavior

### Key URLs

- **Main Guide**: `https://yourdomain.com/`
- **Additional Projects**: `https://yourdomain.com/additional-projects-optimized.html`
- **Legacy Checklist**: `https://yourdomain.com/beautiful-version.html`

### Contact Information

- **China Embassy**: info@cloudwindai.com
- **PNG Investment Authority**: info@ipa.gov.pg
- **Website Updates**: Based on 2025 August policies

---

**Note**: All content is based on 2025 August official policies and market data. Investment decisions should be made after consulting with professional advisors.