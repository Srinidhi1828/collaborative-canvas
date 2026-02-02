# Real-Time Collaborative Drawing Canvas

## Overview
This project is a real-time collaborative drawing application where multiple users can draw simultaneously on a shared canvas. Drawing actions are synchronized instantly across all connected clients using WebSockets.

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express
- Real-Time Communication: Socket.io
- Rendering: Raw HTML5 Canvas API (no canvas libraries)

## Features
- Real-time collaborative drawing
- Brush and eraser tools
- Different stroke widths for tools (brush vs eraser)
- Global undo and redo
- Live cursor indicators for connected users
- Multiple users with unique colors

## Installation & Run
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
3. Start the server:
     npm start
4. Open the application in the browser:
     http://localhost:3000

## How to Test

Open the app in two different browsers or two browser windows.
Draw in one window and observe real-time updates in the other

## Test undo/redo:

Undo: Ctrl + Z
Redo: Ctrl + Y

## Switch tools:

Brush: B
Eraser: E

## Design Notes

Drawing is performed locally first for smooth user experience. Completed strokes are synchronized via the server.

Canvas is always redrawn from shared stroke history to maintain consistency Known Limitations.

Mobile touch support is not implemented

Canvas data is stored in memory (not persisted)

Stroke width is tool-based and not adjustable via UI controls

## Time Spent

Core implementation completed in 1 day


