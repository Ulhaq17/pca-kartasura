# Panduan Penggunaan Skills

Dokumen ini adalah index penggunaan semua skill di `.agents/skills/`. Tujuannya agar pengembangan `web` dan `api` konsisten, termasuk untuk stack yang belum terpasang saat ini.

## Prinsip Umum

- Gunakan skill sebelum membuat keputusan teknis besar pada area yang relevan.
- Skill tetap dicantumkan walaupun dependency belum tersedia agar menjadi standar ketika stack tersebut ditambahkan.
- Jangan memasang dependency hanya karena sebuah skill ada di daftar.
- Jika pekerjaan menyentuh lebih dari satu area, gunakan lebih dari satu skill.
- Jika ada konflik antara skill dan pola project yang sudah berjalan, prioritaskan pola project kecuali skill mencegah bug, security issue, atau regresi besar.

## Ringkasan Skill

| Skill | Area | Status | Gunakan Saat |
| --- | --- | --- | --- |
| `frontend-design` | Web | Wajib untuk UI | Membuat/mengubah page, layout, React component, styling, responsive UI, visual polish |
| `web-design-guidelines` | Web | Wajib untuk review UI | Review UX, accessibility, semantic HTML, keyboard navigation, visual consistency |
| `shadcn` | Web | Kondisional | Menggunakan shadcn/ui, registry, preset, component composition, atau `components.json` |
| `tanstack-query-best-practices` | Web/API | Kondisional | Data fetching, cache, mutation, optimistic update, SSR hydration, kontrak server-state |
| `nestjs-best-practices` | API | Wajib untuk NestJS | Module, controller, service, DI, DTO, guard, interceptor, pipe, filter, auth, testing |
| `prisma-cli` | API/Database | Kondisional | Menjalankan Prisma CLI, generate, migrate, db push/pull, seed, studio, validate, format |
| `prisma-client-api` | API/Database | Kondisional | Menulis query Prisma Client, CRUD, filter, relation, transaction, raw SQL |
| `prisma-database-setup` | API/Database | Kondisional | Setup provider database, connection string, adapter, env, troubleshooting koneksi |
| `prisma-upgrade-v7` | API/Database | Kondisional | Upgrade Prisma v6 ke v7, generator baru, driver adapter, `prisma.config.ts`, ESM/CJS |
| `prisma-postgres` | API/Database | Kondisional | Prisma Postgres Console, create-db, link project, Management API, SDK |
| `prisma-postgres-setup` | API/Database | Kondisional | Provision database Prisma Postgres baru dan koneksi ke project lokal |
| `prisma-driver-adapter-implementation` | API/Database | Khusus | Implementasi atau modifikasi driver adapter Prisma v7 |
| `redis-development` | API/Infra/Web integration | Kondisional | Redis cache, session, rate limit, queue, Pub/Sub, Streams, RQE, vector search, semantic cache |

## Aturan Pemilihan Untuk Web

Gunakan skill berikut saat bekerja di `web/`:

- `frontend-design` untuk semua perubahan UI.
- `web-design-guidelines` untuk review UI/UX/accessibility.
- `shadcn` jika memakai atau akan memakai shadcn/ui.
- `tanstack-query-best-practices` jika ada server state, API query, mutation, cache, atau optimistic update.
- `redis-development` jika fitur web menampilkan atau mengontrol data yang berasal dari Redis-backed feature di backend.
- Skill Prisma jika perubahan web membutuhkan perubahan kontrak data, schema, pagination, filter, atau response shape dari API.

## Aturan Pemilihan Untuk API

Gunakan skill berikut saat bekerja di `api/`:

- `nestjs-best-practices` untuk semua perubahan NestJS.
- `prisma-cli` untuk command Prisma.
- `prisma-client-api` untuk query Prisma Client.
- `prisma-database-setup` untuk setup provider, env, adapter, dan connection string.
- `prisma-upgrade-v7` untuk upgrade atau error terkait Prisma v7.
- `prisma-postgres` untuk operasi umum Prisma Postgres.
- `prisma-postgres-setup` untuk provisioning Prisma Postgres baru.
- `prisma-driver-adapter-implementation` untuk pekerjaan adapter Prisma v7.
- `redis-development` untuk cache, queue, session, rate limit, realtime, search, vector, atau semantic cache.
- `tanstack-query-best-practices` saat endpoint API didesain untuk konsumsi frontend dengan cache/mutation behavior.

## Prioritas Skill

| Situasi | Prioritas Skill |
| --- | --- |
| UI baru tanpa data fetching | `frontend-design` |
| UI baru dengan API query/mutation | `frontend-design`, `tanstack-query-best-practices` |
| Review UI | `web-design-guidelines` |
| Component shadcn | `shadcn`, `frontend-design` |
| Endpoint NestJS baru | `nestjs-best-practices` |
| Endpoint dengan Prisma query | `nestjs-best-practices`, `prisma-client-api` |
| Perubahan schema database Prisma | `prisma-cli`, `prisma-database-setup`, `prisma-client-api` |
| Provision database Prisma Postgres | `prisma-postgres-setup`, `prisma-postgres` |
| Upgrade Prisma | `prisma-upgrade-v7` |
| Redis cache/session/queue | `redis-development`, `nestjs-best-practices` |
| Driver adapter Prisma | `prisma-driver-adapter-implementation` |

## Contoh Trigger

| Permintaan | Skill |
| --- | --- |
| "Buat halaman dashboard admin" | `frontend-design` |
| "Audit aksesibilitas halaman login" | `web-design-guidelines` |
| "Tambahkan dialog konfirmasi dengan shadcn" | `shadcn`, `frontend-design` |
| "Ambil data user dari API dan cache di frontend" | `tanstack-query-best-practices` |
| "Buat endpoint CRUD posts" | `nestjs-best-practices` |
| "Tambahkan pagination dan filter di endpoint posts" | `nestjs-best-practices`, `prisma-client-api`, `tanstack-query-best-practices` |
| "Setup PostgreSQL dengan Prisma" | `prisma-database-setup`, `prisma-cli` |
| "Jalankan migrate dan generate Prisma" | `prisma-cli` |
| "Upgrade Prisma ke v7" | `prisma-upgrade-v7` |
| "Buat database Prisma Postgres baru" | `prisma-postgres-setup`, `prisma-postgres` |
| "Tambahkan Redis untuk rate limit" | `redis-development`, `nestjs-best-practices` |
| "Implement adapter database custom untuk Prisma" | `prisma-driver-adapter-implementation` |

## Checklist Sebelum Implementasi

- Identifikasi folder yang disentuh: `web/`, `api/`, atau keduanya.
- Cocokkan pekerjaan dengan tabel skill.
- Jika memakai stack yang belum terpasang, jangan langsung memasang package tanpa kebutuhan jelas.
- Jika perubahan menyentuh kontrak web dan API, dokumentasikan request/response shape.
- Jika perubahan menyentuh database, pastikan migration, env, dan credential aman.
- Jika perubahan menyentuh cache/queue, pastikan TTL, retry, observability, dan failure mode jelas.

## Referensi Dokumen Turunan

- `docs/web.md` untuk aturan penggunaan skill pada aplikasi web.
- `docs/api.md` untuk aturan penggunaan skill pada aplikasi API.
