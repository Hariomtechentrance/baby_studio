# The Baby Studio

## Run locally

```sh
npm start
```

Open `http://127.0.0.1:4173` for the website and `http://127.0.0.1:4173/admin.html` for the admin dashboard.

On the first visit to the admin dashboard, create the administrator username and password. The password is securely derived and stored in `data/admin.json`, which is ignored by Git. You can instead supply `ADMIN_USERNAME` and `ADMIN_PASSWORD` when starting the server for a deployment environment.

The server stores enquiries, photos, and admin credentials in a real SQLite database at `data/studio.db`. Existing JSON files in `data/studio.json` and `data/admin.json` are migrated automatically if present, but the app now persists runtime data in SQLite. Photo assets should be hosted externally (for example on Cloudinary), and the admin panel stores image URLs.

Deployment notes:
- Install dependencies and start the app with `npm install` and `npm start`.
- In production, bind to all network interfaces and configure port with `HOST=0.0.0.0 PORT=4173 npm start`.
- On Render, set the start command to `npm start`, and ensure the `data/` folder is writable for the local SQLite database file.
- The admin dashboard is available at `/admin.html` and lets you create or sign in to the admin account, view enquiries, update enquiry status, upload portfolio photos, and remove or unpublish photos.
- The public portfolio is loaded from the published admin photos via `/api/photos`.
- Contact form submissions are stored as enquiries in the SQLite database.
