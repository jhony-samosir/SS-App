# SS-App

## Overview

`SS-App` adalah aplikasi antarmuka klien utama (frontend) untuk platform e-commerce SamStore. Berfungsi sebagai etalase toko (Storefront), Dasbor Admin, serta Portal Penjual (Seller).

Aplikasi ini tidak memiliki koneksi database langsung; semua operasi data dikoordinasikan melalui panggilan REST API ke `SS-APIGateway`. Menggunakan fitur canggih dari **Next.js 16 (App Router)** dan **React 19**, frontend ini menawarkan rendering hybrid (SSR, SSG, CSR) yang optimal untuk SEO maupun interaktivitas pengguna tingkat tinggi.

---

## Tech Stack

| Kategori              | Teknologi                                               |
| --------------------- | ------------------------------------------------------- |
| Framework             | Next.js 16 (App Router)                                 |
| UI Library            | React 19                                                |
| Bahasa                | TypeScript                                              |
| Styling               | Tailwind CSS 4, Radix UI, Shadcn UI                     |
| Animasi               | Framer Motion                                           |
| State Management      | Zustand (Client State), React Query v5 (Server State)   |
| Form & Validasi       | React Hook Form, Zod                                    |
| HTTP Client & Logging | Axios, Pino (dengan pino-pretty)                        |

---

## Arsitektur

### Struktur Direktori

```text
SS-App/
├── public/               # File aset statis (gambar, favicon) yang bisa diakses langsung via URL
└── src/
    ├── app/              # Struktur Next.js App Router (Halaman dan Layout)
    │   ├── (auth)/       # Route Grouping: Halaman otentikasi (login, register, forgot-password)
    │   ├── (main)/       # Route Grouping: Storefront pembeli (home, product detail, cart, checkout)
    │   ├── admin/        # Route Grouping: Dasbor manajemen admin (catalog, users, roles)
    │   ├── seller/       # Route Grouping: Portal penjual toko
    │   ├── globals.css   # Variabel dasar Tailwind CSS
    │   └── layout.tsx    # Root layout HTML (Inject providers, fonts)
    ├── components/       # Komponen presentasional React yang dapat digunakan ulang
    │   ├── ui/           # Base component dari Shadcn UI (buttons, inputs, dialogs)
    │   ├── auth/         # Form login/register khusus
    │   ├── admin/        # Layout dan navigasi admin
    │   └── shared/       # Komponen general
    ├── config/           # File pengaturan statis aplikasi (menu navigasi, list konstanta)
    ├── hooks/            # Custom React Hooks (mis. useAuth, useCart)
    ├── lib/              # Fungsi utilitas murni (formatter uang, tanggal, Pino logger)
    ├── proxy.ts          # Konfigurasi proxy bypass untuk dev server Next.js (bila digunakan)
    ├── services/         # Layer API Client (Bungkus axios ke berbagai endpoint microservices)
    ├── store/            # Store Zustand (misal: cartStore, uiStore untuk tema)
    └── types/            # Tipe / antarmuka (interfaces) TypeScript global
```

### Route Groups Next.js

Penggunaan folder bergaris kurung `(folder_name)` di `src/app/` mengelompokkan halaman secara logis *tanpa memengaruhi pola URL*.
- Halaman Login berada di `src/app/(auth)/login/page.tsx` namun diakses pada `/login`.
- Dasbor Admin memiliki sub-jalur eksplisit `src/app/admin/...` yang diakses pada `/admin/...`.

---

## Fitur Utama

- **Storefront & Katalog**: Menelusuri, memfilter (*faceted search*), serta melihat detil produk e-commerce.
- **Autentikasi Aman**: Login, Pendaftaran, Verifikasi Email, pengaturan Multi-Factor Authentication (MFA), Reset Password.
- **Keranjang Belanja (Cart)**: Tambah, hapus, dan update item. Menampilkan status *out of stock*.
- **Admin Dashboard**: RBAC (Role-Based Access Control) yang dikelola lewat antarmuka khusus admin untuk mengontrol pengguna, roles, menu dinamis.
- **Theme Switcher**: Menyediakan integrasi peralihan mode gelap/terang (Dark Mode) bawaan Tailwind & Shadcn.
- **Form Interaktif**: Validasi formulir menggunakan skema Zod secara *real-time* (sisi client) yang dicocokkan dengan skema API backend.

---

## Pengaturan HTTP Client (Services)

Aplikasi berkomunikasi via **Axios**, yang telah dikonfigurasi melalui instans interseptor kustom.
Lokasi: `src/services/`
- Interseptor secara otomatis menambahkan JWT `Authorization: Bearer <token>` dari persistensi lokal (cookie access_token/zustand).
- Ketika API melempar balasan *401 Unauthorized*, interseptor mencoba melakukan panggilan pembaharuan ke endpoint Refresh Token secara senyap sebelum mengulang request (Silent Refresh).

### Rincian Service:
- `auth-service.ts`: Sign-in, sign-up, refresh token, log out.
- `user-service.ts`: Pengaturan akun pengguna mandiri.
- `profile-service.ts`: Manajemen buku alamat.
- `catalog-service.ts`: Fetches katalog produk.
- `cart-service.ts`: Manajemen isi keranjang.
- Dan layanan manajemen peranan (roles/menus) untuk admin.

---

## Environment Variables

Salin `.env.example` ke `.env.local` pada environment lokal.

| Variable                   | Deskripsi                                                        |
| -------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | URL absolut untuk memanggil API Gateway dari browser klien       |
| `API_BASE_URL`             | URL absolut panggilan API Gateway dari komponen server (SSR)     |
| `LOG_LEVEL`                | Batas pencatatan logger Pino (`info`, `debug`, `error`)          |
| `NODE_ENV`                 | Lingkungan Node (`development` / `production`)                   |

---

## Instalasi & Menjalankan

### Prasyarat

- Node.js v20+
- Pengelola paket NPM

### Setup Proyek

```bash
git clone <repository>
cd SamStore/SS-App

# Instal dependensi
npm install
```

### Menjalankan Server Pengembangan

Memulai server dev Next.js dengan hot module replacement (HMR).

```bash
npm run dev
```

Aplikasi bisa diakses di `http://localhost:3000`. Pastikan **SS-APIGateway** telah berjalan agar data dinamis berfungsi.

### Build untuk Produksi

```bash
npm run build
npm start
```

### Linter
```bash
npm run lint
```

---

## Known Issues

- Saat ini, *refresh token loop* sesekali memerlukan relogin manual apabila durasi koneksi gateway terputus panjang.

## Future Improvements

- Menerapkan pengujian E2E (End-to-End Test) dengan Cypress atau Playwright.
- Migrasi secara parsial request fetch standar `axios` murni menjadi pola `React Server Components (RSC)` secara optimal.
