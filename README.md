# Task Management API

RESTful API untuk manajemen tugas dengan autentikasi Bearer Token yang dibangun menggunakan Express.js dan TypeScript.

## Fitur Utama

- ✅ **Autentikasi JWT** - Registrasi dan login dengan Bearer Token
- ✅ **Manajemen Daftar** - CRUD operations untuk mengelompokkan tugas
- ✅ **Manajemen Tugas** - CRUD operations untuk tugas individual
- ✅ **Deadline Management** - Set dan track deadline tugas
- ✅ **Filtering** - Tugas yang due minggu ini dan sorting berdasarkan deadline
- ✅ **Multiple Storage** - Memory storage untuk development, SQL untuk production
- ✅ **Comprehensive Documentation** - OpenAPI/Swagger documentation

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL (jika menggunakan SQL repository)
- npm atau yarn

### Installation

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file dengan konfigurasi Anda:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   REPOSITORY_TYPE=memory  # atau "sql" untuk production
   # Konfigurasi database (jika menggunakan SQL)
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=task_management_db
   ```

4. **Setup database (jika menggunakan SQL):**
   ```bash
   # Buat database PostgreSQL
   psql -U postgres -c "CREATE DATABASE task_management_db;"
   
   # Jalankan migrasi
   npm run migrate:up
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   API akan berjalan di `http://localhost:3000`

## API Documentation

Setelah server berjalan, dokumentasi API tersedia di:
- **Swagger UI**: `http://localhost:3000/docs`
- **JSON Schema**: `http://localhost:3000/docs.json`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/login` - Login user

### Lists (Memerlukan Bearer Token)
- `GET /api/lists` - Dapatkan semua daftar dengan tugas
- `POST /api/lists` - Buat daftar baru
- `GET /api/lists/{id}` - Dapatkan detail daftar
- `PUT /api/lists/{id}` - Update daftar
- `DELETE /api/lists/{id}` - Hapus daftar

### Tasks (Memerlukan Bearer Token)
- `POST /api/lists/{listId}/tasks` - Tambah tugas ke daftar
- `PUT /api/tasks/{id}` - Update tugas
- `DELETE /api/tasks/{id}` - Hapus tugas
- `PATCH /api/tasks/{id}/complete` - Toggle status complete
- `GET /api/tasks/due-this-week` - Tugas due minggu ini
- `GET /api/tasks?sort=deadline` - Tugas diurutkan berdasarkan deadline

## Contoh Penggunaan

### 1. Registrasi User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response akan berisi token JWT yang harus digunakan untuk request selanjutnya.

### 3. Buat Daftar (dengan Bearer Token)
```bash
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Pekerjaan",
    "description": "Tugas-tugas kantor"
  }'
```

### 4. Tambah Tugas
```bash
curl -X POST http://localhost:3000/api/lists/{LIST_ID}/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Review proposal",
    "description": "Review proposal klien",
    "deadline": "2025-01-15T17:00:00Z"
  }'
```

## Authentication Flow

1. **Register/Login** untuk mendapatkan JWT token
2. **Include Bearer Token** di header Authorization untuk semua request ke endpoint yang protected:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Token expiration** default 24 jam (configurable via JWT_EXPIRES_IN)

## Repository Types

API mendukung dua tipe storage:

### Memory Repository (Development)
- Data disimpan dalam memory
- Cocok untuk development dan testing
- Data hilang ketika server restart
- Set `REPOSITORY_TYPE=memory` di .env

### SQL Repository (Production)
- Data disimpan dalam PostgreSQL database
- Persistent storage
- Mendukung transactions dan relational integrity
- Set `REPOSITORY_TYPE=sql` di .env

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run migrate:up   # Run database migrations
npm run migrate:down # Rollback migrations

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|-----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `JWT_SECRET` | JWT signing secret | - | **Yes** |
| `JWT_EXPIRES_IN` | Token expiration | `24h` | No |
| `REPOSITORY_TYPE` | Storage type | `memory` | No |
| `DB_HOST` | Database host | `localhost` | SQL only |
| `DB_PORT` | Database port | `5432` | SQL only |
| `DB_USER` | Database user | - | SQL only |
| `DB_PASSWORD` | Database password | - | SQL only |
| `DB_NAME` | Database name | - | SQL only |

## Error Handling

API menggunakan konsisten error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (development only)"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Input validation failed
- `AUTHENTICATION_ERROR` (401) - Invalid or missing token
- `AUTHORIZATION_ERROR` (403) - Access denied
- `NOT_FOUND_ERROR` (404) - Resource not found
- `CONFLICT_ERROR` (409) - Resource conflict (e.g., duplicate name)
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_SERVER_ERROR` (500) - Server error

## Rate Limiting

API implement rate limiting untuk mencegah abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 attempts per 15 minutes
- **Create operations**: 20 requests per 5 minutes

## Security Features

- ✅ **JWT Authentication** dengan secure token
- ✅ **Password hashing** menggunakan bcrypt
- ✅ **Input validation** dengan Joi
- ✅ **Rate limiting** untuk prevent abuse
- ✅ **CORS protection**
- ✅ **Security headers** dengan Helmet.js
- ✅ **SQL injection protection**

## Architecture

Aplikasi menggunakan layered architecture:

```
src/
├── api/           # API layer (REST endpoints)
├── services/      # Business logic layer
├── repositories/  # Data access layer
├── middleware/    # Express middleware
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── config/        # Configuration management
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Lists Table
```sql
CREATE TABLE lists (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_list_name_per_user UNIQUE (user_id, name)
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    list_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_list FOREIGN KEY(list_id) REFERENCES lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Postman Collection

Import collection dari `postman/Task-Management-API.postman_collection.json` untuk testing semua endpoints.

### Environment Variables untuk Postman
```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "{{token}}"
}
```

## Frontend Integration

### JavaScript/React Example
```javascript
// Setup axios dengan base URL dan auth interceptor
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login example
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token } = response.data.data;
  localStorage.setItem('authToken', token);
  return response.data;
};

// Get lists example
const getLists = async () => {
  const response = await api.get('/lists');
  return response.data.data.lists;
};
```

## Deployment

### Production Setup

1. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-very-secure-secret-key
   export REPOSITORY_TYPE=sql
   export DB_HOST=your-production-db-host
   # ... other variables
   ```

2. **Build application:**
   ```bash
   npm run build
   ```

3. **Run migrations:**
   ```bash
   npm run migrate:up
   ```

4. **Start server:**
   ```bash
   npm start
   ```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Support

Untuk pertanyaan atau dukungan, silakan:
1. Baca dokumentasi ini terlebih dahulu
2. Check existing issues di GitHub
3. Buat issue baru jika diperlukan

## License

MIT License - lihat file LICENSE untuk detail.

---

**Created with ❤️ for efficient task management**
