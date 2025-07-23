# Product Requirements Document (PRD)

## Task Management Web App

### 1. Purpose
Membangun aplikasi web manajemen tugas yang modern, minimal, cepat, dan responsif untuk pengguna mobile maupun desktop. Backend API sudah tersedia dan terdokumentasi di Swagger UI, mendukung seluruh fitur manajemen tugas dan daftar.

### 2. Target User
- Profesional, pelajar, dan tim yang membutuhkan pengelolaan tugas harian.
- Pengguna mobile dan desktop.

### 3. Fitur Utama
#### 3.1 Autentikasi
- Register dan login user menggunakan email dan password.
- Token JWT untuk otorisasi setiap request.

#### 3.2 Manajemen Daftar
- Membuat, melihat, mengedit, dan menghapus daftar tugas.
- Melihat detail daftar dan semua tugas di dalamnya.

#### 3.3 Manajemen Tugas
- Membuat, melihat, mengedit, dan menghapus tugas.
- Menambah tugas ke daftar tertentu.
- Menandai tugas sebagai selesai/tidak selesai.
- Melihat tugas yang due minggu ini.
- Sorting tugas berdasarkan deadline.

#### 3.4 Dokumentasi & API
- Semua endpoint backend terdokumentasi di Swagger UI (`/docs`).
- Frontend akan mengkonsumsi API sesuai dokumentasi berikut:
  - `/api/auth/register`, `/api/auth/login`
  - `/api/lists`, `/api/lists/{id}`
  - `/api/lists/{listId}/tasks`
  - `/api/tasks`, `/api/tasks/{id}`
  - `/api/tasks/due-this-week`, `/api/tasks?sort=deadline`, `/api/tasks/{id}/complete`

### 4. Pengalaman Pengguna
- UI minimalis, clean, dan intuitif.
- Navigasi cepat, loading ringan.
- Responsif di mobile dan desktop.
- Dark mode dan light mode.
- Animasi transisi sederhana.

### 5. Teknologi
- Frontend: React.js (Next.js/Vite), Tailwind CSS/Chakra UI.
- Backend: Express.js + TypeScript (API sudah tersedia).
- API konsumsi menggunakan fetch/axios.
- State management: React Context/Redux.

### 6. Flow Penggunaan
1. User register/login.
2. User membuat daftar tugas.
3. User menambah tugas ke daftar.
4. User melihat, mengedit, menghapus tugas/daftar.
5. User menandai tugas selesai.
6. User melihat tugas due minggu ini dan sorting deadline.

### 7. Non Functional Requirements
- Fast load time (<1s untuk halaman utama).
- Mobile-first dan desktop responsive.
- Minimal dependencies, bundle size kecil.
- Keamanan: JWT, validasi input, error handling.
- Dokumentasi API selalu update.

### 8. Pengembangan
- Iteratif, mulai dari MVP (fitur utama) lalu penambahan fitur UX/UI.
- Testing unit dan integrasi minimal 80% coverage.
- Deployment: Vercel/Netlify untuk frontend, server Node.js untuk backend.

### 9. Referensi
- API documentation: `/docs` (Swagger UI)
- Arsitektur backend: `docs/architecture.md`

---

Dokumen ini menjadi acuan pengembangan frontend web app, seluruh interaksi data dilakukan melalui API backend sesuai dokumentasi dan arsitektur yang tersedia.
