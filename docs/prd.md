# Product Requirements Document (PRD)
## API Manajemen Tugas (Task Management API)

### 1. Ringkasan Produk

API Manajemen Tugas adalah sebuah RESTful API yang memungkinkan pengguna untuk mengelola tugas-tugas mereka dengan sistem organisasi berbasis daftar (list). API ini menyediakan fitur lengkap untuk manajemen tugas dengan autentikasi dan otorisasi yang aman.

### 2. Tujuan dan Sasaran

- **Tujuan Utama**: Menyediakan platform yang memungkinkan pengguna mengelola tugas-tugas mereka secara efisien dengan sistem pengelompokan berbasis daftar
- **Sasaran Pengguna**: Developer yang membutuhkan backend API untuk aplikasi manajemen tugas
- **Manfaat**: Organisasi tugas yang lebih baik, tracking deadline, dan manajemen produktivitas

### 3. Fitur Utama

#### 3.1 Manajemen Autentikasi
- **Registrasi Pengguna**: Pendaftaran akun baru dengan email dan password
- **Login Pengguna**: Autentikasi dengan kredensial yang valid
- **Token Management**: Implementasi Bearer Token untuk akses API yang aman

#### 3.2 Manajemen Daftar (Lists)
- **Membuat Daftar**: Pengguna dapat membuat daftar baru untuk mengelompokkan tugas
- **Melihat Semua Daftar**: Menampilkan semua daftar milik pengguna beserta tugas di dalamnya
- **Mengupdate Daftar**: Mengubah nama atau properti daftar
- **Menghapus Daftar**: Menghapus daftar beserta semua tugas di dalamnya

#### 3.3 Manajemen Tugas (Tasks)
- **Menambah Tugas**: Menambahkan tugas baru ke dalam daftar tertentu
- **Mengupdate Tugas**: Mengubah detail tugas (nama, deskripsi, deadline, status)
- **Menghapus Tugas**: Menghapus tugas dari daftar
- **Set Deadline**: Menetapkan dan mengubah deadline tugas
- **Mark Complete**: Menandai tugas sebagai selesai atau belum selesai

#### 3.4 Fitur Pencarian dan Filtering
- **Tugas Due Minggu Ini**: Mendapatkan daftar tugas yang deadline-nya dalam minggu ini
- **Sorting by Deadline**: Mengurutkan tugas berdasarkan deadline (ascending/descending)

### 4. Spesifikasi Teknis

#### 4.1 Arsitektur API
- **Protokol**: HTTP/HTTPS
- **Format Data**: JSON
- **Authentication**: Bearer Token (JWT recommended)
- **Status Codes**: Standard HTTP status codes

#### 4.2 Endpoint Utama

##### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout (optional)
```

##### Lists Endpoints
```
GET    /api/lists                    # Mendapatkan semua daftar dengan tugas
POST   /api/lists                    # Membuat daftar baru
GET    /api/lists/{id}               # Mendapatkan detail daftar tertentu
PUT    /api/lists/{id}               # Mengupdate daftar
DELETE /api/lists/{id}               # Menghapus daftar
```

##### Tasks Endpoints
```
POST   /api/lists/{listId}/tasks     # Menambah tugas ke daftar
PUT    /api/tasks/{id}               # Mengupdate tugas
DELETE /api/tasks/{id}               # Menghapus tugas
PATCH  /api/tasks/{id}/complete      # Toggle status complete tugas
GET    /api/tasks/due-this-week      # Tugas yang due minggu ini
GET    /api/tasks?sort=deadline      # Tugas diurutkan berdasarkan deadline
```

#### 4.3 Model Data

##### User Model
```json
{
  "id": "string",
  "email": "string",
  "password": "string (hashed)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

##### List Model
```json
{
  "id": "string",
  "name": "string",
  "description": "string (optional)",
  "userId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "tasks": ["array of Task objects"]
}
```

##### Task Model
```json
{
  "id": "string",
  "title": "string",
  "description": "string (optional)",
  "deadline": "datetime (optional)",
  "isCompleted": "boolean",
  "listId": "string",
  "userId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### 5. Persyaratan Fungsional

#### 5.1 Autentikasi dan Otorisasi
- [ ] Pengguna harus mendaftar dengan email yang valid dan password yang memenuhi kriteria keamanan
- [ ] Pengguna harus login untuk mendapatkan Bearer Token
- [ ] Semua endpoint CRUD untuk list dan task harus menggunakan Bearer Token
- [ ] Token harus memiliki expiration time
- [ ] Pengguna hanya dapat mengakses data mereka sendiri

#### 5.2 Manajemen Daftar
- [ ] Pengguna dapat membuat daftar dengan nama yang unik (per user)
- [ ] Pengguna dapat melihat semua daftar mereka beserta jumlah tugas di dalamnya
- [ ] Pengguna dapat mengupdate nama dan deskripsi daftar
- [ ] Pengguna dapat menghapus daftar (dengan konfirmasi)
- [ ] Ketika daftar dihapus, semua tugas di dalamnya juga terhapus

#### 5.3 Manajemen Tugas
- [ ] Pengguna dapat menambahkan tugas baru ke daftar yang ada
- [ ] Pengguna dapat mengupdate semua properti tugas
- [ ] Pengguna dapat menghapus tugas
- [ ] Pengguna dapat set/update deadline tugas
- [ ] Pengguna dapat menandai tugas sebagai complete/incomplete
- [ ] Tugas yang tidak memiliki deadline tetap dapat dibuat

#### 5.4 Fitur Pencarian dan Filter
- [ ] API dapat mengembalikan tugas yang deadline-nya dalam 7 hari ke depan
- [ ] API dapat mengurutkan tugas berdasarkan deadline (earliest first atau latest first)
- [ ] Filter harus mempertimbangkan timezone pengguna

### 6. Persyaratan Non-Fungsional

#### 6.1 Performa
- Response time maksimal 2 detik untuk semua endpoint
- API harus dapat handle minimal 100 concurrent requests

#### 6.2 Keamanan
- Password harus di-hash menggunakan algoritma yang aman (bcrypt/scrypt)
- Bearer Token harus menggunakan JWT dengan signature yang valid
- API harus protected dari common attacks (SQL injection, XSS, CSRF)
- Rate limiting untuk mencegah abuse

#### 6.3 Skalabilitas
- Database design harus mendukung horizontal scaling
- API harus stateless untuk memudahkan load balancing

### 7. Validasi dan Error Handling

#### 7.1 Validasi Input
- Email harus memiliki format yang valid
- Password minimal 8 karakter dengan kombinasi huruf dan angka
- Nama daftar tidak boleh kosong dan maksimal 100 karakter
- Judul tugas tidak boleh kosong dan maksimal 255 karakter
- Deadline harus dalam format datetime yang valid

#### 7.2 Error Responses
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

#### 7.3 Standard Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource tidak ditemukan)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### 8. Contoh Request/Response

#### 8.1 Registrasi
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (201):
{
  "message": "User registered successfully",
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  }
}
```

#### 8.2 Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  }
}
```

#### 8.3 Mendapatkan Semua Daftar
```http
GET /api/lists
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200):
{
  "lists": [
    {
      "id": "list-123",
      "name": "Pekerjaan",
      "description": "Tugas-tugas kantor",
      "createdAt": "2025-01-01T10:00:00Z",
      "tasks": [
        {
          "id": "task-456",
          "title": "Review proposal",
          "deadline": "2025-01-15T17:00:00Z",
          "isCompleted": false
        }
      ]
    }
  ]
}
```

#### 8.4 Tugas Due Minggu Ini
```http
GET /api/tasks/due-this-week
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response (200):
{
  "tasks": [
    {
      "id": "task-456",
      "title": "Review proposal",
      "deadline": "2025-01-15T17:00:00Z",
      "isCompleted": false,
      "listName": "Pekerjaan"
    }
  ]
}
```

### 9. Timeline Pengembangan

#### Phase 1 (Week 1-2): Core Infrastructure
- Setup project structure
- Database design dan migration
- Authentication system
- Basic CRUD untuk User

#### Phase 2 (Week 3-4): Lists Management
- CRUD operations untuk Lists
- User authorization
- Basic API testing

#### Phase 3 (Week 5-6): Tasks Management
- CRUD operations untuk Tasks
- Deadline management
- Complete/incomplete functionality

#### Phase 4 (Week 7-8): Advanced Features
- Due this week functionality
- Sorting by deadline
- Comprehensive testing
- API documentation

### 10. Testing Strategy

#### 10.1 Unit Testing
- Test semua business logic
- Test validation functions
- Test authentication/authorization

#### 10.2 Integration Testing
- Test API endpoints
- Test database interactions
- Test authentication flow

#### 10.3 End-to-End Testing
- Test complete user workflows
- Test error scenarios
- Performance testing

### 11. Dokumentasi

- API documentation menggunakan OpenAPI/Swagger
- Setup dan deployment guide
- Database schema documentation
- Authentication flow documentation

### 12. Kriteria Penerimaan

Produk dianggap selesai ketika semua persyaratan fungsional telah diimplementasi dan:
- [ ] Semua endpoint API berfungsi sesuai spesifikasi
- [ ] Authentication dan authorization bekerja dengan benar
- [ ] Semua validasi input dan error handling sudah tepat
- [ ] API documentation lengkap dan akurat
- [ ] Unit test coverage minimal 80%
- [ ] Performance requirements terpenuhi
- [ ] Security requirements terpenuhi

---

**Document Version**: 1.0  
**Last Updated**: 6 Juli 2025  
**Prepared By**: Development Team
