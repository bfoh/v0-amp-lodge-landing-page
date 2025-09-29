# AMP Lodge Landing Page

A modern, responsive hotel website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first approach with smooth navigation
- **Advanced Gallery System**: 4 thumbnails + View Full Gallery pattern with full-screen modal
- **Virtual Tour**: Dedicated slideshow page with auto-play and fullscreen support
- **Image Optimization**: LQIP support, responsive images, and CDN-ready
- **Accessibility**: WCAG compliant with proper focus management and screen reader support
- **Performance**: Lazy loading, infinite scroll, and optimized images

## Gallery System

The gallery system includes:

### Components
- `GalleryPreview`: Shows 4 thumbnails in 2x2 grid with "View Full Gallery" button
- `GalleryModal`: Full-screen accessible lightbox with touch gestures and keyboard navigation
- `OptimizedImage`: Image component with LQIP and responsive loading

### Features
- **Touch Gestures**: Swipe left/right to navigate images
- **Keyboard Navigation**: Arrow keys for navigation, Esc to close
- **Accessibility**: Focus trapping, screen reader support, proper ARIA labels
- **Performance**: Lazy loading, LQIP blur effect, responsive images
- **Analytics Ready**: Hooks for tracking image views and interactions

## Virtual Tour System

The virtual tour feature provides an immersive slideshow experience:

### Page Location
- **Route**: `/virtual-tour`
- **Component**: `VirtualTourSlideshow` (used only by the virtual tour page)
- **Navigation**: Accessible via the "Virtual Tour" button in the hero section

### Features
- **Auto-play**: Optional slideshow with 4-second intervals (respects reduced-motion preference)
- **Touch/Swipe Navigation**: Mobile-friendly gesture controls
- **Keyboard Controls**: 
  - `←/→` arrows for navigation
  - `Space` to toggle auto-play
  - `Esc` to exit fullscreen
- **Fullscreen Mode**: Immersive viewing experience
- **Thumbnail Navigation**: Quick access to any image
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Analytics Hooks**: Ready for tracking slide changes and interactions

### Image Management
The virtual tour automatically uses all images from the gallery folder (`lib/gallery-data.ts`). To add more images:

1. Add image files to `/public/` directory
2. Update `lib/gallery-data.ts` with new image entries:
\`\`\`tsx
{
  id: "new-image",
  name: "new-image", 
  alt: "Description of the new image",
  category: "room" | "amenity" | "exterior" | "dining",
  src: "/amp-lodge-new-image.png"
}
\`\`\`

### Slideshow Options
Customize the slideshow behavior in `components/virtual-tour-slideshow.tsx`:
- **Auto-play interval**: Change the `4000` value (milliseconds)
- **Swipe sensitivity**: Adjust `minSwipeDistance` (pixels)
- **Default state**: Set `isAutoplay` initial value

## Installation

### Using shadcn CLI (Recommended)
\`\`\`bash
npx shadcn@latest init
npx shadcn@latest add button card badge
\`\`\`

### Manual Installation
1. Download the ZIP file from the project
2. Extract and navigate to the project directory
3. Install dependencies:
\`\`\`bash
npm install
\`\`\`

## Running Locally

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Image Setup

### Current Images
Place your hotel images in the `/public` directory with this naming convention:
- `/public/amp-lodge-[name].png` for thumbnails
- `/public/amp-lodge-[name].webp` for WebP versions (optional)

### CDN Integration
To integrate with an image CDN, update the following files:
1. `lib/image-utils.ts` - Add your CDN's URL transformation logic
2. `components/optimized-image.tsx` - Enable srcset and format detection
3. `components/gallery-preview.tsx` & `components/gallery-modal.tsx` - Update image paths

### Recommended CDNs
- **Vercel Image Optimization**: Built-in with Vercel deployment
- **Cloudinary**: Full-featured image management
- **ImageKit**: Real-time image optimization

## Analytics Integration

Add analytics tracking by implementing the callback functions:

\`\`\`tsx
// Example with Google Analytics
const handleImageOpen = (imageId: string) => {
  gtag('event', 'image_view', {
    event_category: 'gallery',
    event_label: imageId,
  })
}

const handleSlideChange = (index: number) => {
  gtag('event', 'slide_change', {
    event_category: 'virtual_tour',
    event_label: `slide_${index}`,
  })
}

<GalleryPreview onImageOpen={handleImageOpen} />
<VirtualTourSlideshow onImageOpen={handleImageOpen} onSlideChange={handleSlideChange} />
\`\`\`

## Advanced Features

### Pinch-to-Zoom
For enhanced mobile experience, install PhotoSwipe:
\`\`\`bash
npm install photoswipe
\`\`\`

Then integrate it in `components/gallery-modal.tsx`.

### Image Optimization Pipeline
For production, consider setting up:
1. **Sharp** for server-side image processing
2. **LQIP generation** during build time
3. **WebP/AVIF conversion** pipeline
4. **Responsive image generation** at multiple sizes

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with automatic image optimization

### Other Platforms
Ensure your hosting platform supports:
- Next.js 14+ features
- Image optimization (or configure external CDN)
- Static file serving from `/public`

## Performance Tips

1. **Preload critical images**: Use `preloadImages()` utility for above-the-fold images
2. **Optimize image sizes**: Generate multiple sizes for different screen resolutions
3. **Use WebP/AVIF**: Modern formats reduce file sizes by 25-50%
4. **Implement LQIP**: Improves perceived performance with blur placeholders

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use for your hotel or business website.
