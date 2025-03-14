# Twittard

Simple CRUD app

## Running Locally

### Requirements:

- Bun or Node.js (change command accordingly)
- Postgres or any other database supported by Prisma can be used.
- Frontend running, source here: http://github.com/foxane/odin-book-fe

### **Guide**

1. Create a Postgres database (or another Prisma-supported DB).
2. Copy `.env.example` to `.env` and fill it (read the comments there).
3. Run: `bun install && bunx prisma generate && bunx prisma db push`

4. Run `bun dev` to start the server

## Endpoints

For get all, `cursor` and `take` query is suported (to get cursor, get the last item id. Default `take` count is 10 )

| Method                  | Path                        | Description                           |
| ----------------------- | --------------------------- | ------------------------------------- |
| **Auth Routes**         | `/auth` prefix              |
| `GET`                   | `/guest`                    | Guest login                           |
| `GET`                   | `/me`                       | Get current user                      |
| `POST`                  | `/exchange-token`           | Exchange token                        |
| `POST`                  | `/register`                 | Register a new user                   |
| `POST`                  | `/login`                    | Login                                 |
| `GET`                   | `/callback`                 | OAuth callback (Redirect to frontend) |
| `GET`                   | `/github`                   | GitHub OAuth login                    |
| `GET`                   | `/google`                   | Google OAuth login                    |
| **User Routes**         | `/users` prefix             |
| `GET`                   | `/`                         | Get all users                         |
| `GET`                   | `/:userId`                  | Get single user                       |
| `PUT`                   | `/:userId`                  | Update user                           |
| `GET`                   | `/:userId/posts`            | Get posts by user                     |
| `GET`                   | `/:userId/followers`        | Get user's followers                  |
| `GET`                   | `/:userId/following`        | Get users followed by user            |
| `PATCH`                 | `/:userId/avatar`           | Update avatar image                   |
| `PATCH`                 | `/:userId/background`       | Update background image               |
| `POST`                  | `/:userId/follow`           | Follow user                           |
| `DELETE`                | `/:userId/follow`           | Unfollow user                         |
| **Post Routes**         | `/posts` prefix             |
| `GET`                   | `/`                         | Get all posts                         |
| `POST`                  | `/`                         | Create a post (with file upload)      |
| `GET`                   | `/:postId`                  | Get single post                       |
| `PUT`                   | `/:postId`                  | Update post                           |
| `DELETE`                | `/:postId`                  | Delete post                           |
| `GET`                   | `/:postId/like`             | Get users who liked post              |
| `POST`                  | `/:postId/like`             | Like a post                           |
| `DELETE`                | `/:postId/like`             | Unlike a post                         |
| **Comment Routes**      | `/posts/:postId` prefix     |
| `GET`                   | `/comments`                 | Get comments for a post               |
| `POST`                  | `/comments`                 | Create a comment                      |
| `PUT`                   | `/comments/:commentId`      | Update comment                        |
| `DELETE`                | `/comments/:commentId`      | Delete comment                        |
| `GET`                   | `/comments/:commentId/like` | Get users who liked comment           |
| `POST`                  | `/comments/:commentId/like` | Like a comment                        |
| `DELETE`                | `/comments/:commentId/like` | Unlike a comment                      |
| **Notification Routes** | `/notifications` prefix     |
| `GET`                   | `/`                         | Get all notifications                 |
| `PATCH`                 | `/read-all`                 | Mark all notifications as read        |
| `PATCH`                 | `/:notifId/read`            | Mark a single notification as read    |
| `DELETE`                | `/`                         | Delete all notifications              |
| **Chat Routes**         | `/chats` prefix             |
| `GET`                   | `/`                         | Get all chats                         |
| `GET`                   | `/:chatId/messages`         | Get messages for a chat               |
