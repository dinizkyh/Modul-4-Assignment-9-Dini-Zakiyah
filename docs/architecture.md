# Arsitektur API Manajemen Tugas

Dokumen ini menjelaskan arsitektur dan struktur kode untuk pengembangan API Manajemen Tugas sesuai PRD.

---

## 1. Layered Architecture

### 1.1 API Layer
- Berbasis Express.js dan TypeScript.
- Menyediakan endpoint RESTful untuk frontend.
- Semua endpoint didokumentasikan dengan JSDoc/TSDoc dan Swagger (OpenAPI).
- Endpoint utama:
  - `/api/auth/register`, `/api/auth/login` (autentikasi)
  - `/api/lists` (CRUD daftar)
  - `/api/lists/{id}` (detail, update, delete daftar)
  - `/api/lists/{listId}/tasks` (tambah tugas ke daftar)
  - `/api/tasks/{id}` (update, delete tugas)
  - `/api/tasks/due-this-week` (tugas yang due minggu ini)
  - `/api/tasks?sort=deadline` (sorting tugas)
  - `/api/tasks/{id}/complete` (toggle status selesai)
  - `/docs` (Swagger UI)

### 1.2 Service Layer
- Berisi business logic, validasi, dan aturan aplikasi.
- Semua validasi input, otorisasi, dan proses data dilakukan di sini.
- Service utama:
  - `UserService`: registrasi, login, otentikasi, pengelolaan user
  - `ListService`: CRUD daftar, validasi nama unik, otorisasi user
  - `TaskService`: CRUD tugas, validasi deadline, filter/sort tugas, status selesai

### 1.3 Repository Layer
- Abstraksi data, menyediakan dua tipe repository:
  - **Memory Repository**: Untuk development/testing, data disimpan di memori.
  - **SQL Repository**: Untuk production, data disimpan di database SQL (MySQL/PostgreSQL).
- Migrasi database disimpan di folder `migrations`.
- Repository utama:
  - `UserRepository`, `ListRepository`, `TaskRepository`
- Factory untuk switching antara memory dan SQL repository.

---

## 2. Struktur Direktori

```
src/
  api/           # API layer (Express routes)
    auth.ts      # Endpoint autentikasi
    lists.ts     # Endpoint daftar
    tasks.ts     # Endpoint tugas
  services/      # Service layer (business logic)
    userService.ts
    listService.ts
    taskService.ts
  repositories/  # Repository layer (data access)
    interfaces.ts
    memory.ts
    sql.ts
    index.ts     # Factory
  middleware/    # Middleware (auth, validation, error, rate limit)
  types/         # TypeScript types & interfaces
  utils/         # Utility functions (JWT, password, date, email)
  config/        # Konfigurasi aplikasi
migrations/      # SQL migration scripts
public/
  ...            # Static files (optional)
docs/
  prd.md         # Product Requirements Document
  architecture.md# Dokumen arsitektur
  tasks.md       # Task list implementasi
  ...
.env.example     # Contoh environment variables
README.md        # Dokumentasi developer/AI
```

---

## 3. Teknologi & Tools
- **Express.js**: Framework utama API
- **TypeScript**: Bahasa utama
- **Vite**: Build script
- **Swagger (OpenAPI)**: Dokumentasi endpoint di `/docs`
- **Joi**: Validasi input
- **JWT**: Bearer token authentication
- **bcrypt**: Hash password
- **MySQL/PostgreSQL**: Database SQL
- **Postman/Insomnia**: Koleksi request untuk testing

---

## 4. Security & Best Practices
- Semua endpoint CRUD (lists, tasks) wajib Bearer Token
- Validasi input di service layer & middleware
- Rate limiting di endpoint sensitif (auth, create)
- Password di-hash (bcrypt)
- SQL injection prevention
- Error handling terpusat
- API stateless & scalable

---

## 5. Dokumentasi & Testing
- Swagger UI di `/docs` untuk API reference
- Unit test & integration test minimal 80% coverage
- Postman/Insomnia collection untuk frontend/AI
- README.md berisi setup, endpoint, dan flow autentikasi
- Migration SQL di folder `migrations`

---

## 6. Deployment
- Environment variables di `.env`
- Build dengan Vite
- Database migration sebelum start production
- Dokumentasi setup & deployment di `docs/`

---

**Referensi utama: docs/prd.md**
