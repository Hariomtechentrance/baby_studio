# Asset Folder Structure Guide

## Folder Organization

Your website now has the following folder structure for assets:

```
The Baby Studio/
├── index.html
├── styles.css
├── script.js
└── assets/
    ├── logo/
    │   └── (Save your logo files here)
    ├── videos/
    │   └── (Save promotional videos here)
    └── images/
        ├── hero/
        │   └── (Save hero section banner images here)
        ├── about/
        │   └── (Save about section images here)
        ├── gallery/
        │   └── (Save all your portfolio gallery images here)
        ├── portfolio/
        │   └── (Archive - use gallery/ for new photos)
        ├── reviews/
        │   └── (Save client review screenshots here)
        └── services/
            └── (Save service-related images here)
```

## Where to Save Your Files

### Logo Files
**Location:** `assets/logo/`

**Recommended formats:**
- PNG (with transparent background) - Best for logos
- SVG (vector format) - Best for scalability
- JPG (if no transparency needed)

**Recommended sizes:**
- Large: 500x500px or larger
- Small: 200x200px for navigation

**Naming:** `logo.png` or `logo.svg`

### Hero Section Images
**Location:** `assets/images/hero/`

**Recommended formats:**
- JPG (for photographs)
- PNG (for graphics with transparency)
- WebP (modern format, smaller file size)

**Recommended sizes:**
- Desktop: 1920x1080px or larger
- Mobile: 800x1200px (vertical)
- File size: Under 500KB for fast loading

**Naming:** `hero-bg.jpg`, `hero-newborn.jpg`, etc.

### About Section Images
**Location:** `assets/images/about/`

**Recommended formats:**
- JPG or PNG
- WebP for better performance

**Recommended sizes:**
- Main image: 800x1000px
- Accent image: 600x600px
- File size: Under 300KB each

**Naming:** `about-main.jpg`, `about-accent.jpg`, etc.

### Portfolio/Gallery Images
**Location:** `assets/images/portfolio/`

**Recommended formats:**
- JPG (high quality for photographs)
- WebP (for better performance)

**Recommended sizes:**
- Landscape: 1200x800px
- Portrait: 800x1200px
- Square: 1000x1000px
- File size: Under 400KB each

**Naming:** Use descriptive names like:
- `newborn-001.jpg`, `newborn-002.jpg`
- `maternity-001.jpg`, `maternity-002.jpg`
- `family-001.jpg`, `family-002.jpg`
- `cake-smash-001.jpg`

### Service Images
**Location:** `assets/images/services/`

**Recommended formats:**
- PNG or JPG
- SVG for icons

**Recommended sizes:**
- Service icons: 200x200px
- Service backgrounds: 800x600px
- File size: Under 200KB each

**Naming:** `service-newborn.jpg`, `service-maternity.jpg`, etc.

### Gallery Images (Portfolio)
**Location:** `assets/images/gallery/`

**Recommended formats:**
- JPG (high quality for photographs)
- WebP (for better performance)

**Recommended sizes:**
- Landscape: 1200×800px
- Portrait: 800×1200px
- Square: 1000×1000px
- File size: Under 400KB each

**Quantity:** 20–50 images recommended

**Naming:** Use descriptive names like:
- `newborn-001.jpg`, `newborn-002.jpg`, `newborn-003.jpg`
- `maternity-001.jpg`, `maternity-002.jpg`
- `family-001.jpg`, `family-002.jpg`
- `cake-smash-001.jpg`, `cake-smash-002.jpg`
- `baby-milestone-001.jpg`
- `outdoor-001.jpg`, `outdoor-002.jpg`

### Review Images
**Location:** `assets/images/reviews/`

**Recommended formats:**
- PNG or JPG (screenshot format)
- WebP for better performance

**Recommended sizes:**
- Square: 600×600px to 800×800px
- File size: Under 300KB each

**Quantity:** 3–6 client review screenshots

**Naming:** `review-001.jpg`, `review-002.jpg`, etc.

### Promotional Videos
**Location:** `assets/videos/`

**Recommended formats:**
- MP4 (H.264 codec, most compatible)
- WebM (alternative, better compression)

**Recommended specifications:**
- Banner video: 1920×1080px (Full HD), 10–30 seconds, 20–50MB
- Gallery video: 1080p, 30–90 seconds, 50–100MB
- File size: Keep under 100MB for web

**Naming:** `banner.mp4`, `gallery-video-001.mp4`, etc.

## File Naming Best Practices

1. **Use lowercase letters** - `logo.png` not `Logo.PNG`
2. **Use hyphens instead of spaces** - `hero-bg.jpg` not `hero bg.jpg`
3. **Use descriptive names** - `newborn-baby-001.jpg` not `img1.jpg`
4. **Avoid special characters** - Only use letters, numbers, and hyphens
5. **Keep names short but meaningful** - Balance clarity with brevity

## Image Optimization Tips

1. **Compress images** before uploading - Use tools like TinyPNG or Squoosh
2. **Use appropriate formats** - WebP for photos, PNG for graphics
3. **Resize images** to the exact dimensions needed
4. **Keep file sizes small** - Under 500KB for most images
5. **Use progressive JPEGs** for better loading experience

## How to Add Your Logo

1. Save your logo file as `logo.png` in the `assets/logo/` folder
2. The website will automatically use your logo
3. For best results, use a PNG with transparent background
4. Recommended size: 200x200px or larger

## How to Add Images

1. Save your images in the appropriate folder (see above)
2. Use descriptive filenames
3. Update the HTML to reference your new images
4. Test the website to ensure images load correctly

## Next Steps

Once you've added your logo and images:
1. Refresh the website to see your logo
2. Update the HTML to replace placeholder images with your actual images
3. Test on different screen sizes to ensure images look good
4. Optimize image sizes if needed for faster loading

## Need Help?

If you need help updating the HTML to use your images, just let me know and I can help you update the image references in the code.

---

## 📋 Quick Reference: Where to Save Each Asset

| Content Type | Folder | Max Files | Size Recommendation |
|---|---|---|---|
| **Logo** | `assets/logo/` | 1-2 | 200×200px or larger |
| **Hero Banner Images** | `assets/images/hero/` | 3-5 | 1920×1080px, <500KB |
| **About Section** | `assets/images/about/` | 2-5 | 800×1000px, <300KB |
| **Gallery/Portfolio** | `assets/images/gallery/` | 20-50 | 1000×1000px, <400KB |
| **Service Images** | `assets/images/services/` | 1-6 | 800×800px, <200KB |
| **Client Review Screenshots** | `assets/images/reviews/` | 3-6 | 600×800px, <300KB |
| **Promotional Videos** | `assets/videos/` | 1-3 | 1920×1080px, <100MB |

---

## 🎯 Getting Started

1. **Create your images** – Use phone or professional camera
2. **Optimize before uploading** – Use TinyPNG or Squoosh to compress
3. **Place in correct folder** – See table above
4. **Use descriptive filenames** – e.g., `newborn-001.jpg` not `photo1.jpg`
5. **Test on the website** – Make sure everything displays correctly


