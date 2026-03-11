# VacoBuilt Backend Code Exercise

## Tech Stack
- Node.js
- Express
- SQLite

## Setup
npm install
npm run dev

## Base URL
http://localhost:5001

## Endpoints
GET /categories
GET /posts
GET /posts/:id
POST /posts
PUT /posts/:id
DELETE /posts
DELETE /posts/:id
GET /posts/generateSampleData

## Notes
- Categories are seeded automatically.
- Posts are returned from most recent to least recent.
- Updating a post preserves the original timestamp.
- API accepts either `contents` or `text` in request bodies for compatibility.