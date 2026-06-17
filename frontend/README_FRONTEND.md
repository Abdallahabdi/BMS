# Lost & Found — Frontend

## Requirements
- Node >= 16
- Backend running (default at http://localhost:5000)

## Setup
1. Copy files into `frontend/`.
2. Create `.env` from `.env.example` and set `VITE_API_URL`.
3. Run:
npm install
npm run dev

4. Open `http://localhost:3000`.

## Notes
- JWT is stored in `localStorage` under `token`. For production, consider HttpOnly cookies.
- Image uploads send `multipart/form-data` using FormData.
- Adjust API endpoints if your backend paths differ.
- Add nicer styling, icons and Lottie animations as desired.
