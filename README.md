# E-Commerce Barang Bekas API

A RESTful API for an e-commerce platform specializing in second-hand goods, built with Node.js, Express, and Sequelize ORM.

## Features

- User authentication and authorization
- Product management with categories
- Wishlist functionality
- Transaction processing
- Rating and review system
- Real-time chat between users
- Notification system
- Product reporting system
- Admin moderation tools

## Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Sequelize** - Promise-based ORM for MySQL
- **MySQL** - Relational database management system
- **JWT** - Authentication mechanism
- **Multer** - File upload handling
- **bcrypt** - Password hashing

## Project Structure

```
├── app.js                  # Application entry point
├── config/                 # Configuration files
│   ├── database.js         # Database connection setup
│   └── multer.js           # File upload configuration
├── controllers/            # Request handlers
├── middleware/             # Custom middleware
│   ├── auth.js             # Authentication middleware
│   └── errorHandler.js     # Error handling middleware
├── models/                 # Database models
├── routes/                 # API routes
├── uploads/                # Uploaded files storage
└── package.json            # Project dependencies
```

## API Endpoints

### User Management

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/:userId` - Get user by ID
- `DELETE /api/users/me` - Delete user account

### Category Management

- `GET /api/kategori` - Get all categories
- `GET /api/kategori/:id` - Get category by ID
- `POST /api/kategori` - Create a new category (admin only)
- `PUT /api/kategori/:id` - Update a category (admin only)
- `DELETE /api/kategori/:id` - Delete a category (admin only)

### Product Management

- `GET /api/barang` - Get all products (with filtering)
- `GET /api/barang/:id` - Get product by ID
- `POST /api/barang` - Create a new product
- `PUT /api/barang/:id` - Update a product
- `DELETE /api/barang/:id` - Soft delete a product
- `DELETE /api/barang/:id/hard` - Hard delete a product (admin only)
- `GET /api/barang/user/:userId` - Get products by user ID
- `GET /api/barang/search` - Search and filter products

### Wishlist Management

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:id` - Remove item from wishlist
- `GET /api/wishlist/check/:barangId` - Check if item is in wishlist

### Transaction Management

- `GET /api/transaksi` - Get all transactions
- `POST /api/transaksi` - Create a new transaction
- `GET /api/transaksi/:id` - Get transaction by ID
- `PATCH /api/transaksi/:id/status` - Update transaction status
- `GET /api/transaksi/as-buyer` - Get transactions as buyer
- `GET /api/transaksi/as-seller` - Get transactions as seller
- `GET /api/transaksi/history` - Get transaction history

### Rating Management

- `GET /api/rating/user/:userId` - Get ratings for a user
- `GET /api/rating/:ratingId` - Get rating by ID
- `GET /api/rating/transaksi/:transaksiId` - Get rating by transaction ID
- `POST /api/rating` - Create a new rating

### Chat Management

- `GET /api/chat` - Get all user's conversations
- `GET /api/chat/:userId` - Get chat with a specific user
- `GET /api/chat/:userId/barang/:barangId` - Get chat about a specific product
- `POST /api/chat` - Send a new message
- `PATCH /api/chat/read` - Mark messages as read

### Notification Management

- `GET /api/notifikasi` - Get all notifications
- `PATCH /api/notifikasi/:notifikasiId/read` - Mark notification as read
- `PATCH /api/notifikasi/read-all` - Mark all notifications as read
- `DELETE /api/notifikasi/:notifikasiId` - Delete a notification
- `DELETE /api/notifikasi` - Delete all notifications
- `POST /api/notifikasi` - Create a notification (admin only)

### Report Management

- `POST /api/laporan` - Create a new report
- `GET /api/laporan` - Get all reports (admin only)
- `GET /api/laporan/user` - Get user's reports
- `GET /api/laporan/:reportId` - Get report by ID
- `PATCH /api/laporan/:reportId/status` - Update report status (admin only)
- `DELETE /api/laporan/:reportId` - Delete a report (admin only)

## Setup and Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/ecommerce-barang-bekas.git
   cd ecommerce-barang-bekas
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables

   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=ecommerce_bekas
   JWT_SECRET=your_jwt_secret
   ```

4. Run the application
   ```
   npm start
   ```

## Running in Development Mode

```
npm run dev
```

## Docker Setup

### Prerequisites

- Docker
- Docker Compose

### Running with Docker Compose

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/e-commerce-barang-bekas.git
   cd e-commerce-barang-bekas/backend
   ```

2. Create .env file from .env.example:
   ```bash
   cp .env.example .env
   ```
3. Update the .env file with your configuration values, especially the Appwrite credentials.

4. Build and start the containers:

   ```bash
   docker-compose up -d
   ```

5. Access the API at http://localhost:3000

### Container Architecture

The Docker setup consists of three main services:

- **app**: The Node.js application container running the API
- **db**: MySQL database container
- **backup**: Automated backup service for the database

### Database Backups

Database backups are automatically scheduled to run daily at 2 AM. Backups are stored in the `mysql-backup` volume and are retained for 7 days.

You can manually trigger a backup by running:

```bash
docker exec marketplace-backup /backup.sh
```

### Customizing Docker Setup

You can customize resource limits, ports, and other configurations in the `docker-compose.yml` file.

## License

This project is licensed under the MIT License.

## Contributors

- Your Name - Initial work
