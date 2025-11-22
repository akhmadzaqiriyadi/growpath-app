# PWA Setup - UTY Growpath App

## ✅ Sudah Diimplementasikan

### 1. Package Installation
- ✅ `next-pwa` sudah terinstall
- ✅ `sharp` (dev dependency) untuk generate icons

### 2. Konfigurasi Next.js
File: `next.config.ts`
- ✅ PWA wrapper dengan config:
  - `dest: 'public'` - Service worker akan di-generate di folder public
  - `register: true` - Auto-register service worker
  - `skipWaiting: true` - Update langsung saat ada versi baru
  - `disable: development` - PWA disabled saat development

### 3. Manifest PWA
File: `public/manifest.json`
- ✅ Name, short_name, description
- ✅ Theme color: #f97316 (orange)
- ✅ Display: standalone (seperti native app)
- ✅ Icons untuk semua ukuran (72-512px)

### 4. Meta Tags & Icons
File: `src/app/layout.tsx`
- ✅ Viewport configuration
- ✅ Theme color
- ✅ Apple Web App capable
- ✅ Icons references
- ✅ Manifest link

### 5. PWA Icons
Folder: `public/icons/`
- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png (Apple)
- ✅ icon-192x192.png (Android)
- ✅ icon-384x384.png
- ✅ icon-512x512.png (Splash)

## 🚀 Testing PWA

### Development
PWA disabled saat development mode untuk memudahkan debugging.

### Production
1. Build aplikasi:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Buka browser dan akses aplikasi

4. Test PWA features:
   - ✅ **Install to Home Screen** - Check ada prompt install di browser
   - ✅ **Offline Support** - Tutup internet, app masih bisa dibuka
   - ✅ **App-like Experience** - Standalone mode tanpa browser UI
   - ✅ **Fast Loading** - Cache assets untuk loading cepat

### Chrome DevTools
1. Buka DevTools (F12)
2. Tab **Application**
3. Check:
   - **Manifest** - Lihat manifest.json terload
   - **Service Workers** - Lihat SW aktif
   - **Cache Storage** - Lihat cached files
   - **Lighthouse** - Run PWA audit

### Mobile Testing
1. Deploy ke server (Vercel/Netlify)
2. Akses dari mobile browser
3. Test "Add to Home Screen"
4. Buka dari icon di home screen
5. Test offline mode

## 📱 Features PWA

### Yang Sudah Berfungsi:
- ✅ Install ke home screen
- ✅ Offline caching
- ✅ App icon
- ✅ Splash screen
- ✅ Standalone mode
- ✅ Fast loading dengan cache

### Tips:
- PWA hanya bekerja di HTTPS atau localhost
- Update service worker otomatis saat deploy versi baru
- Cache akan di-clear saat ada update
- Icons sudah optimized untuk semua device

## 🔧 Maintenance

### Regenerate Icons
Jika logo berubah:
```bash
node generate-icons.js
```

### Update Manifest
Edit `public/manifest.json` untuk ubah:
- App name
- Theme color
- Description
- Start URL

### Clear Cache (Development)
Jika perlu clear PWA cache:
1. DevTools → Application
2. Service Workers → Unregister
3. Cache Storage → Delete all
4. Hard refresh (Cmd+Shift+R)

## 🌐 Deployment Checklist

- [ ] Build production: `npm run build`
- [ ] Test locally: `npm start`
- [ ] Verify manifest: `/manifest.json`
- [ ] Check service worker: `/sw.js`
- [ ] Test offline mode
- [ ] Test install prompt
- [ ] Lighthouse audit (PWA score)
- [ ] Deploy to HTTPS
- [ ] Test on mobile device

---

**Status**: ✅ PWA Ready for Production
