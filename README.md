# The Baby Studio

## Run locally

1. Create a Postgres database (e.g. a free project at [neon.tech](https://neon.tech)) and copy its connection string.
2. Create a `.env` file in the project root (already git-ignored) with:
   ```
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   ```
3. Install dependencies and start the app:
   ```sh
   npm install
   npm start
   ```

Open `http://127.0.0.1:4173` for the website and `http://127.0.0.1:4173/admin.html` for the admin dashboard.

On the first visit to the admin dashboard, create the administrator username and password — it's hashed (scrypt) and stored in the `admin_users` table. You can instead supply `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables to use a fixed login instead of a database-backed one.

The server stores enquiries, photos, and admin credentials in Postgres — data persists across restarts and redeploys as long as `DATABASE_URL` points at the same database. Photo assets should be hosted externally (for example on Cloudinary), and the admin panel stores image URLs.

Deployment notes:
- Install dependencies and start the app with `npm install` and `npm start`.
- Set `DATABASE_URL` as an environment variable on your hosting platform (never commit it) — pointing at the same Neon (or other Postgres) database keeps data across deploys, unlike a local SQLite file.
- In production, bind to all network interfaces and configure port with `HOST=0.0.0.0 PORT=4173 npm start`.
- The admin dashboard is available at `/admin.html` and lets you create or sign in to the admin account, view enquiries, update enquiry status, upload portfolio photos, and remove or unpublish photos.
- `/api/photos` returns published admin photos, but the public pages (`index.html`, `gallery.html`, `portfolio.html`) are currently static and don't read from it yet.
- Contact form submissions are stored as enquiries in Postgres.
