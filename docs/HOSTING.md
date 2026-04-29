# Hosting your audio files

The Blauw Audio Player itself doesn't host audio — it just plays files from any URL you point it to. You host the audio yourself, on whatever storage you prefer.

This guide covers Cloudflare R2 (recommended for cost and CORS simplicity), but the player works with any HTTPS audio URL.

## Cloudflare R2

R2 has a generous free tier (10 GB storage, 1 million reads/month) and zero egress fees, making it ideal for serving audio.

### Setup

1. **Create a bucket** in your Cloudflare dashboard → R2 → Create bucket. Name it whatever — `my-audio` works fine.

2. **Enable public access:**
   - Open the bucket → **Settings** tab
   - Find **Public Development URL** → click **Enable**
   - Copy the URL — it looks like `https://pub-XXXXXXXXXXXX.r2.dev`

3. **Configure CORS** (so audio plays from your site):
   - Settings → **CORS Policy** → Add policy
   - Paste:
   ```json
   [
     {
       "AllowedOrigins": [
         "https://your-site.com",
         "https://www.your-site.com"
       ],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
   - Save

4. **Upload audio files:**
   - Objects tab → Upload
   - Each file gets a public URL like `https://pub-XXXXXXXXXXXX.r2.dev/track.mp3`
   - Use these URLs in your `data-src` and `data-tracks` attributes

### Folder structure (optional)

R2 doesn't have real folders, but you can simulate them by uploading files with prefixed names:

```
audio/episode-01.mp3
audio/episode-02.mp3
covers/episode-01.jpg
```

The dashboard will display these as folders. Helps when you have many files.

## Other hosting options

The player works with any HTTPS URL that:

- Returns the audio file with appropriate `Content-Type` (e.g. `audio/mpeg`)
- Sends CORS headers allowing your site (most CDNs do by default)

Common options:

- **Amazon S3** + CloudFront — works fine, just configure CORS on the bucket
- **Vercel Blob / Vercel static assets** — works for small files
- **Backblaze B2** — has a free tier, similar to R2
- **Direct on your web host** — works for one-off use, not recommended for many files

## Supported audio formats

The HTML5 `<audio>` element supports formats based on the user's browser:

| Format | Support | Notes |
|---|---|---|
| MP3 | All browsers | Best universal compatibility |
| AAC / M4A | All browsers | Common for podcasts |
| WAV | All browsers | Large files |
| OGG / Opus | Most browsers, not Safari iOS | High quality at small sizes |
| FLAC | Most modern browsers | Lossless |

For maximum compatibility, **MP3 is the safest choice**. For best quality-to-size ratio, **AAC**.
