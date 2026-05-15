# Dokumentasi Skill Web

Dokumen ini menjelaskan skill dari `.agents/skills/` yang harus dipertimbangkan saat mengerjakan aplikasi `web`. Ketentuan ini tetap berlaku sebagai standar kerja walaupun dependency atau stack terkait belum terpasang.

## Konteks Project

- Folder aplikasi: `web/`
- Stack saat ini: Next.js, React, TypeScript, Tailwind CSS
- Skill utama: `frontend-design`, `web-design-guidelines`
- Skill kondisional: `shadcn`, `tanstack-query-best-practices`, `redis-development`, dan skill Prisma jika perubahan web menyentuh kontrak data fullstack

## Skill Wajib

### `frontend-design`

Gunakan skill ini saat membuat atau mengubah UI web.

Wajib digunakan untuk pekerjaan berikut:

- Membuat halaman baru.
- Membuat komponen React.
- Mengubah layout, visual hierarchy, typography, warna, spacing, animasi, atau responsive behavior.
- Membuat landing page, dashboard, halaman admin, form, tabel, kartu konten, navigasi, atau empty state.
- Memperbaiki tampilan yang terasa generic, tidak konsisten, atau kurang production-grade.

Ketentuan penerapan:

- Tentukan arah visual yang jelas sebelum implementasi.
- Hindari tampilan generic dan pola visual yang terlalu aman.
- Pastikan UI bekerja baik di desktop dan mobile.
- Ikuti pola desain yang sudah ada jika project sudah memiliki design system.
- Gunakan Tailwind dan CSS secara terstruktur, bukan sekadar menumpuk class tanpa konsep.

### `web-design-guidelines`

Gunakan skill ini saat melakukan review UI, UX, accessibility, atau kualitas antarmuka.

Wajib digunakan untuk pekerjaan berikut:

- Review halaman atau komponen web.
- Audit accessibility.
- Mengecek usability, hierarchy, copy, focus state, keyboard navigation, responsive behavior, dan semantic HTML.
- Memvalidasi apakah UI sudah layak untuk production.

Ketentuan penerapan:

- Ambil guideline terbaru sesuai instruksi skill sebelum review.
- Output review harus berfokus pada temuan, risiko, dan lokasi file/baris jika tersedia.
- Jangan hanya memberi ringkasan positif tanpa mengidentifikasi risiko.

## Skill Kondisional

### `shadcn`

Gunakan skill ini jika project web memakai atau akan memakai shadcn/ui, registry component, preset, atau file `components.json`.

Gunakan untuk pekerjaan berikut:

- Inisialisasi shadcn/ui.
- Menambahkan komponen dari registry.
- Memperbaiki komponen shadcn/ui.
- Menyusun form, dialog, sheet, drawer, tabs, card, table, command, dropdown, alert, skeleton, badge, avatar, toast, atau komponen berbasis Radix/Base.
- Menggunakan preset shadcn.

Ketentuan penerapan:

- Gunakan komponen yang tersedia sebelum membuat markup custom.
- Gunakan semantic token seperti `bg-background`, `text-muted-foreground`, dan `bg-primary`.
- Gunakan `gap-*`, bukan `space-x-*` atau `space-y-*`.
- Gunakan komposisi component yang lengkap seperti `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, dan `CardFooter`.
- Pastikan `Dialog`, `Sheet`, dan `Drawer` memiliki title untuk accessibility.
- Jalankan CLI dengan package runner project jika perlu, misalnya `npx shadcn@latest`.

### `tanstack-query-best-practices`

Gunakan skill ini jika web memakai atau akan memakai TanStack Query/React Query untuk server state.

Gunakan untuk pekerjaan berikut:

- Membuat query data dari API.
- Membuat mutation create, update, delete, submit form, atau upload.
- Mengatur cache, stale time, invalidation, optimistic update, retry, error state, prefetch, SSR hydration, infinite query, atau parallel query.
- Merapikan data fetching yang masih memakai `useEffect` manual untuk server state.

Ketentuan penerapan:

- Query key wajib berbentuk array dan memuat semua dependency.
- Gunakan query key factory jika struktur data mulai kompleks.
- Set `staleTime` sesuai volatilitas data.
- Invalidate query secara targeted setelah mutation.
- Tangani error dan loading state secara eksplisit.
- Gunakan `HydrationBoundary` dan QueryClient per request untuk SSR/SSG jika stack mendukung.

### `redis-development`

Gunakan skill ini pada web jika pekerjaan web menyentuh fitur yang memakai Redis melalui API, edge layer, atau realtime integration.

Gunakan untuk pekerjaan berikut:

- Realtime notification yang bergantung pada Redis Pub/Sub atau Streams.
- UI cache/session/rate-limit yang kontraknya dipengaruhi Redis di backend.
- Dashboard monitoring Redis-backed data.
- Search, vector search, RAG, atau semantic cache yang hasilnya dikonsumsi web.

Ketentuan penerapan:

- Web tidak boleh mengakses Redis langsung dari browser.
- Akses Redis harus melalui API/backend atau edge service yang aman.
- Pastikan UI memperhitungkan TTL, stale data, retry, dan fallback state.

## Skill Prisma Untuk Web

Skill Prisma bukan skill utama web, tetapi tetap perlu dirujuk jika perubahan web memengaruhi kontrak data yang berasal dari API/database.

Gunakan skill berikut secara koordinatif:

- `prisma-client-api` saat UI membutuhkan bentuk query, filter, relasi, pagination, atau response shape tertentu dari API.
- `prisma-cli` saat perubahan web membutuhkan perubahan schema/migration di backend.
- `prisma-database-setup` saat fitur web baru membutuhkan provider database baru atau env database baru.
- `prisma-postgres` dan `prisma-postgres-setup` saat fitur web bergantung pada database Prisma Postgres baru.
- `prisma-upgrade-v7` saat perubahan web ikut terdampak upgrade Prisma di backend.

## Alur Kerja Web

1. Tentukan apakah pekerjaan menyentuh UI, data fetching, component library, atau kontrak backend.
2. Aktifkan `frontend-design` untuk implementasi UI.
3. Aktifkan `shadcn` jika menggunakan shadcn/ui atau akan menambah component registry.
4. Aktifkan `tanstack-query-best-practices` jika ada server state.
5. Aktifkan `web-design-guidelines` saat review UI/UX/accessibility.
6. Koordinasikan dengan skill API, Prisma, atau Redis jika perubahan web membutuhkan perubahan backend.

## Contoh Pemilihan Skill

| Pekerjaan | Skill yang Digunakan |
| --- | --- |
| Membuat halaman dashboard | `frontend-design` |
| Review accessibility form login | `web-design-guidelines` |
| Menambahkan dialog konfirmasi shadcn | `shadcn`, `frontend-design` |
| Membuat hook list data dari API | `tanstack-query-best-practices` |
| Membuat optimistic update setelah mutation | `tanstack-query-best-practices` |
| UI menampilkan status job Redis queue | `redis-development`, `tanstack-query-best-practices` |
| UI membutuhkan pagination/filter baru dari API | `tanstack-query-best-practices`, `prisma-client-api` |

## Catatan Implementasi

- Jangan menambahkan dependency hanya karena skill dicantumkan di dokumen ini.
- Jika stack belum tersedia, dokumentasikan keputusan dan implementasikan bagian yang relevan saja.
- Jika stack akan ditambahkan, baca skill terkait sebelum memilih package, struktur folder, atau API kontrak.
