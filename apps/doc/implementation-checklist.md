# Implementation Checklist

## 1. Project Setup
- [ ] Inisialisasi project React (Next.js/Vite) + TypeScript
- [ ] Setup Tailwind CSS/Chakra UI untuk styling
- [ ] Pastikan hot reload aktif (default Next.js/Vite)
- [ ] Setup linting & prettier

## 2. API Integration
- [ ] Buat modul API service (fetch/axios) untuk konsumsi endpoint backend
- [ ] Implementasi error handling global, tampilkan pesan error jelas di UI

## 3. Authentication
- [ ] Komponen Register & Login (form, validasi, error)
- [ ] Simpan JWT di localStorage/sessionStorage
- [ ] Middleware/Context untuk otorisasi request

## 4. List Management
- [ ] Komponen List (daftar, detail, form tambah/edit, hapus)
- [ ] Komponen ListItem (card/row)
- [ ] API: `/api/lists`, `/api/lists/{id}`

## 5. Task Management
- [ ] Komponen Task (daftar, detail, form tambah/edit, hapus)
- [ ] Komponen TaskItem (card/row)
- [ ] Komponen ToggleComplete (checkbox/button)
- [ ] API: `/api/tasks`, `/api/tasks/{id}`, `/api/lists/{listId}/tasks`
- [ ] Sorting tugas (`/api/tasks?sort=deadline`)
- [ ] Tugas due minggu ini (`/api/tasks/due-this-week`)

## 6. User Experience
- [ ] Responsif mobile & desktop (test di berbagai device)
- [ ] Dark mode & light mode toggle
- [ ] Loading state & animasi transisi sederhana

## 7. Error Handling
- [ ] Tampilkan error API di komponen (alert/toast)
- [ ] Error boundary untuk crash UI
- [ ] Logging error ke console untuk debugging AI

## 8. State Management
- [ ] Gunakan React Context/Redux untuk state global (user, lists, tasks)

## 9. Testing
- [ ] Unit test untuk setiap komponen UI (Jest/React Testing Library)
- [ ] Unit test untuk modul API
- [ ] E2E test untuk workflow utama (Cypress/Playwright):
  - Register & login
  - Membuat/mengedit/menghapus daftar
  - Membuat/mengedit/menghapus tugas
  - Menandai tugas selesai
  - Melihat tugas due minggu ini & sorting deadline

## 10. Documentation
- [ ] Dokumentasi komponen & modul (JSDoc/TSDoc)
- [ ] Dokumentasi cara menjalankan, testing, dan debugging

---

Checklist ini modular, mudah di-test, dan siap untuk pengembangan AI-assisted. Setiap UI element dibuat sebagai komponen, error selalu jelas, dan testing lengkap (unit & E2E).
