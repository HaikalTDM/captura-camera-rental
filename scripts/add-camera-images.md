# Adding Camera Images to CAPTURA

## 📸 Current Images

Your CAPTURA app currently uses these local images:

- **Osmo Pocket 3**: `/public/images/osmo-pocket-3.jpg`
- **Action 5 Pro**: `/public/images/dji-action-5-pro.jpg`

## 🖼️ Adding More Images

### Step 1: Add Images to Public Folder

Place additional camera images in the `/public/images/` folder:

```
public/
  images/
    osmo-pocket-3.jpg           ✅ Main image
    osmo-pocket-3-side.jpg      ➕ Side view
    osmo-pocket-3-back.jpg      ➕ Back view
    osmo-pocket-3-accessories.jpg ➕ With accessories
    
    dji-action-5-pro.jpg        ✅ Main image
    dji-action-5-pro-mount.jpg  ➕ Mounted view
    dji-action-5-pro-underwater.jpg ➕ Underwater shot
```

### Step 2: Update Camera Data

Edit `src/lib/cameras.ts` to include additional images:

```typescript
{
  id: 'osmo-pocket-3',
  name: 'Osmo Pocket 3',
  image: '/images/osmo-pocket-3.jpg',
  images: [
    '/images/osmo-pocket-3.jpg',
    '/images/osmo-pocket-3-side.jpg',
    '/images/osmo-pocket-3-back.jpg',
    '/images/osmo-pocket-3-accessories.jpg'
  ],
  // ... rest of camera data
}
```

### Step 3: Image Requirements

**Recommended Specifications:**
- **Format**: JPG or PNG
- **Size**: 400x300px (4:3 aspect ratio)
- **Quality**: High resolution for crisp display
- **File Size**: Under 500KB for fast loading

**Naming Convention:**
- Use lowercase with hyphens
- Include camera model in filename
- Descriptive suffixes: `-side`, `-back`, `-mount`, `-accessories`

## 🎨 Image Gallery Features

The ImageGallery component automatically provides:

- ✅ **Main image display** with smooth transitions
- ✅ **Thumbnail navigation** below main image
- ✅ **Arrow navigation** for cycling through images
- ✅ **Image counter** showing current position
- ✅ **Responsive design** for all screen sizes

## 🔄 Live Updates

After adding new images:

1. **No restart needed** - Images load automatically
2. **Hot reload active** - Changes appear instantly
3. **Error handling** - Fallback for missing images

## 📱 Testing

Test your images on:
- ✅ Desktop browsers
- ✅ Mobile devices
- ✅ Different screen sizes
- ✅ Slow internet connections

Your camera rental app now displays professional, high-quality images that will attract customers and showcase your equipment effectively!
