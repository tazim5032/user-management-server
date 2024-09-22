# AuthMaster - Server Side

This is the server-side code for **AuthMaster**, a user management web application built with **Node.js**, **Express**, and **MongoDB**. The server handles user registration, authentication, and user management, including blocking, unblocking, and deleting users. **JWT** is used for secure authentication, and **bcrypt** is used for password hashing.

## Live Demo
[AuthMaster - Live Link](https://auth-master.netlify.app/)

## Client-Side Repository
[Client-Side Code - GitHub](https://github.com/tazim5032/user-management)

---

## Features
- **User Registration**: Users can register with a unique email address.
- **User Login**: Provides JWT token after successful login.
- **User Management**: Admins can block, unblock, and delete users.
- **Password Security**: User passwords are securely hashed using bcrypt.
- **JWT Authentication**: JWT tokens are used to secure API routes.
- **Blocking**: Blocked users cannot log in.
- **Unique Email Constraint**: Ensures that emails are unique using MongoDB indexes.

---

## Technologies Used
- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT (JSON Web Token)**
- **bcrypt**
- **dotenv**: For environment variables management.
- **Cors**: To allow cross-origin requests.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/tazim5032/user-management-server
cd user-management-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the project root and add the following environment variables:

```env
DB_USER=<your-mongodb-username>
DB_PASS=<your-mongodb-password>
ACCESS_TOKEN_SECRET=<your-jwt-secret>
PORT=5000
```

### 4. Start the Server

```bash
npm run server
```

The server will run on [http://localhost:5000](http://localhost:5000).

---

## API Endpoints

### Authentication

- **POST /jwt**: Generate a JWT token for a user.
  - Request body: `{ "email": "user@example.com" }`
  - Response: `{ "token": "<JWT Token>" }`

### User Registration

- **POST /users**: Registers a new user with a hashed password.
  - Request body: `{ "name": "John Doe", "email": "john@example.com", "password": "123456" }`

### User Login

- **GET /userLogin**: Logs in a user and checks the password. Updates last login time.
  - Query parameters: `email`, `password`
  - Response: `{ "message": "matched" | "blocked" | "Pass not matched" }`

### User Management

- **GET /users**: Fetches all users.

- **POST /blockUsers**: Blocks selected users.
  - Request body: `{ "userIds": ["userId1", "userId2"] }`

- **POST /unblockUsers**: Unblocks selected users.
  - Request body: `{ "userIds": ["userId1", "userId2"] }`

- **POST /delete**: Deletes selected users.
  - Request body: `{ "userIds": ["userId1", "userId2"] }`

### User Status

- **GET /user-status/:email**: Returns whether the user is blocked or not.
  - Params: `email`

---

## MongoDB Schema

The **user** collection schema is structured as follows:

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: "active" }, // 'active' or 'blocked'
  lastLogin: { type: Date },
  registrationDate: { type: Date, default: Date.now }
});
```

### Unique Index

The **email** field is indexed to ensure uniqueness:

```javascript
userSchema.index({ email: 1 }, { unique: true });
```

---

## License

This project is licensed under the MIT License.
