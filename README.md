# Homigo - Full Stack MERN Application

This project is a full-stack web application with a Node.js/Express backend and a React frontend.

## Project Structure

- `/server`: Contains the Node.js/Express backend API.
- `/client`: Contains the React frontend application.

## Prerequisites

- Node.js and npm
- MongoDB

## Getting Started

### 1. Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory and add your MongoDB connection string and other necessary environment variables:
    ```
    MONGO_URL=your_mongodb_connection_string
    SECRET=your_session_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```
    The backend will be running on `http://localhost:8080`.

### 2. Frontend Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  In `client/package.json`, add a proxy to forward API requests to the backend:
    ```json
    "proxy": "http://localhost:8080"
    ```
4.  Start the frontend development server:
    ```bash
    npm start
    ```
    The frontend will be running on `http://localhost:3000`.

### 3. Running Both Servers Concurrently

You can use a package like `concurrently` to run both servers with a single command.

1.  Install `concurrently` in the root directory:
    ```bash
    npm install concurrently
    ```
2.  In the root `package.json`, add the following scripts:
    ```json
    "scripts": {
      "server": "npm start --prefix server",
      "client": "npm start --prefix client",
      "dev": "concurrently \"npm run server\" \"npm run client\""
    }
    ```
3.  Now you can run both servers with:
    ```bash
    npm run dev
    ```
