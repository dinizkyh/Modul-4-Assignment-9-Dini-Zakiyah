# Authentication Flow Documentation

1. User melakukan registrasi melalui endpoint /api/auth/register.
2. User login melalui endpoint /api/auth/login dan menerima JWT token.
3. Token digunakan untuk mengakses endpoint yang membutuhkan otentikasi.
4. Logout dapat dilakukan dengan endpoint /api/auth/logout (opsional blacklist token).
