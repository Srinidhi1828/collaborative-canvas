
# Architecture Overview

## High-Level Design
The application follows a client–server architecture.

Each client renders drawings using the raw HTML Canvas API, while the server coordinates real-time synchronization using Socket.io.  
The server acts as the single source of truth for the shared drawing state.


## Data Flow
1. A user draws on the canvas using mouse events.
2. Mouse movements are converted into a stroke object.
3. The stroke is rendered locally for immediate visual feedback.
4. When the stroke is completed, it is sent to the server.
5. The server broadcasts the stroke to all connected clients.
6. Each client redraws the canvas using the shared stroke history.


## WebSocket Communication (Socket.io)
Real-time synchronization is implemented using Socket.io, which internally leverages WebSockets (with fallbacks) to provide reliable bi-directional communication between clients and the server.

### Client → Server Events
- `stroke`: Sends a completed stroke object
- `cursor`: Sends live cursor position
- `undo`: Requests a global undo
- `redo`: Requests a global redo

### Server → Client Events
- `stroke`: Broadcasts a completed stroke
- `sync`: Sends full stroke history
- `cursor`: Broadcasts cursor updates
- `init`: Assigns a unique color to each user


## Drawing Model
Each drawing action is represented as a stroke object:

```js
{
  tool,
  color,
  width,
  points: [{ x, y }]
}

## Undo / Redo Strategy

A global stroke history is maintained on the server.

Undo removes the most recent stroke from the shared history.

Redo restores the last undone stroke.

After an undo or redo, the updated history is synchronized to all clients.

## Conflict Handling

Multiple users can draw simultaneously.

Strokes are processed in the order they arrive at the server.

Server-side ordering ensures a consistent canvas state across all clients.

## Performance Decisions

Immediate client-side rendering avoids perceived latency.

Stroke paths are transmitted instead of pixel data.

Full canvas redraws occur only during synchronization events.

## Scalability Notes

The current implementation supports a single shared canvas.
The architecture can be extended to support multiple rooms with isolated drawing histories.