# Test Case Checklist

## 1. Unit Tests (Jest/React Testing Library)
- [ ] Setiap komponen UI memiliki unit test
- [ ] Validasi props dan rendering
- [ ] Event handler (onClick, onChange, dll)
- [ ] State dan efek (useState, useEffect)
- [ ] Error boundary dan fallback UI

## 2. API Module Unit Tests
- [ ] Modul API (auth, lists, tasks) memiliki unit test
- [ ] Mock request/response
- [ ] Error handling dan edge case
- [ ] Integrasi dengan context/state

## 3. E2E Tests (Cypress/Playwright)
- [ ] Register & login
- [ ] Membuat daftar baru
- [ ] Mengedit daftar
- [ ] Menghapus daftar
- [ ] Membuat tugas baru
- [ ] Mengedit tugas
- [ ] Menghapus tugas
- [ ] Menandai tugas selesai
- [ ] Melihat tugas due minggu ini
- [ ] Sorting tugas berdasarkan deadline
- [ ] Error handling (API gagal, validasi form)
- [ ] Responsif mobile & desktop
- [ ] Dark mode & light mode toggle
- [ ] Loading state & animasi transisi

## 4. Dokumentasi Testing
- [ ] Cara menjalankan unit test
- [ ] Cara menjalankan E2E test
- [ ] Cara debugging test failure
