# Implementation Checklist

## 1. Project Setup
- [x] Inisialisasi project React (Next.js/Vite) + TypeScript
- [x] Setup Tailwind CSS/Chakra UI untuk styling
- [x] Pastikan hot reload aktif (default Next.js/Vite)
- [x] Setup linting & prettier

## 2. API Integration
- [x] Buat modul API service (fetch/axios) untuk konsumsi endpoint backend
- [x] Implementasi error handling global, tampilkan pesan error jelas di UI

## 3. Authentication
- [x] Komponen Register & Login (form, validasi, error)
- [x] Simpan JWT di localStorage/sessionStorage
- [x] Middleware/Context untuk otorisasi request

## 4. List Management
- [x] Komponen List (daftar, detail, form tambah/edit, hapus)
- [x] Komponen ListItem (card/row)
- [x] API: `/api/lists`, `/api/lists/{id}`

## 5. Task Management
- [x] Komponen Task (daftar, detail, form tambah/edit, hapus)
- [x] Komponen TaskItem (card/row)
- [x] Komponen ToggleComplete (checkbox/button)
- [x] API: `/api/tasks`, `/api/tasks/{id}`, `/api/lists/{listId}/tasks`
- [x] Sorting tugas (`/api/tasks?sort=deadline`)
- [x] Tugas due minggu ini (`/api/tasks/due-this-week`)

## 6. User Experience
- [x] Responsif mobile & desktop (test di berbagai device)
- [x] Dark mode & light mode toggle
- [x] Loading state & animasi transisi sederhana

## 7. Error Handling
- [x] Tampilkan error API di komponen (alert/toast)
- [x] Error boundary untuk crash UI
- [x] Logging error ke console untuk debugging AI

## 8. State Management
- [x] Gunakan React Context/Redux untuk state global (user, lists, tasks)

## 9. Testing
- [x] Unit test untuk setiap komponen UI (Jest/React Testing Library)
- [x] Unit test untuk modul API
- [x] E2E test untuk workflow utama (Cypress/Playwright):
  - Register & login
  - Membuat/mengedit/menghapus daftar
  - Membuat/mengedit/menghapus tugas
  - Menandai tugas selesai
  - Melihat tugas due minggu ini & sorting deadline

## 10. Documentation
- [x] Dokumentasi komponen & modul (JSDoc/TSDoc)
- [x] Dokumentasi cara menjalankan, testing, dan debugging

---
