# Dokumentasi Skill API

Dokumen ini menjelaskan skill dari `.agents/skills/` yang harus dipertimbangkan saat mengerjakan aplikasi `api`. Ketentuan ini tetap ditulis lengkap walaupun dependency atau stack terkait belum terpasang.

## Konteks Project

- Folder aplikasi: `api/`
- Stack saat ini: NestJS, TypeScript, Jest, Supertest
- Skill utama: `nestjs-best-practices`
- Skill database: `prisma-cli`, `prisma-client-api`, `prisma-database-setup`, `prisma-upgrade-v7`, `prisma-postgres`, `prisma-postgres-setup`, `prisma-driver-adapter-implementation`
- Skill cache/infrastruktur data: `redis-development`
- Skill koordinasi frontend data: `tanstack-query-best-practices`

## Skill Wajib

### `nestjs-best-practices`

Gunakan skill ini untuk semua pekerjaan backend/API berbasis NestJS.

Wajib digunakan untuk pekerjaan berikut:

- Membuat module, controller, service, provider, guard, interceptor, pipe, filter, middleware, atau decorator.
- Mendesain struktur feature module.
- Menambahkan authentication, authorization, role/permission, JWT, session, atau rate limiting.
- Membuat DTO, validation, serialization, response contract, error handling, atau API versioning.
- Menambahkan test unit/e2e.
- Mengoptimalkan query, cache, lifecycle hook, logging, config, health check, graceful shutdown, atau background job.
- Refactor dependency injection, module import/export, atau service responsibility.

Ketentuan penerapan:

- Organisasi kode berdasarkan feature module, bukan layer teknis global.
- Hindari circular dependency.
- Gunakan constructor injection.
- Gunakan DTO dan `ValidationPipe` untuk input.
- Gunakan guards untuk akses kontrol, bukan pengecekan manual berulang di controller.
- Gunakan exception filter/interceptor untuk cross-cutting concern.
- Jangan expose entity atau field sensitif secara langsung.
- Tulis test dengan dependency mock yang jelas.

## Skill Prisma

Skill Prisma digunakan saat API memakai atau akan memakai Prisma sebagai ORM/database toolkit.

### `prisma-cli`

Gunakan skill ini saat menjalankan atau merancang workflow Prisma CLI.

Gunakan untuk pekerjaan berikut:

- `prisma init`
- `prisma generate`
- `prisma migrate dev`
- `prisma migrate deploy`
- `prisma db push`
- `prisma db pull`
- `prisma db seed`
- `prisma studio`
- `prisma validate`
- `prisma format`

Ketentuan penerapan:

- Gunakan migration untuk perubahan schema yang perlu versioning.
- Jangan mengubah database production dengan workflow development tanpa keputusan eksplisit.
- Jalankan generate setelah schema berubah.
- Validasi schema sebelum commit perubahan Prisma.

### `prisma-client-api`

Gunakan skill ini saat menulis query Prisma Client.

Gunakan untuk pekerjaan berikut:

- CRUD: `findUnique`, `findFirst`, `findMany`, `create`, `update`, `upsert`, `delete`, `count`, `aggregate`, `groupBy`.
- Filter, sorting, pagination, `select`, `include`, `omit`, relation query, nested write, transaction, atau raw SQL.
- Mendesain response shape yang efisien untuk API.

Ketentuan penerapan:

- Gunakan `select` atau `omit` untuk mencegah over-fetching.
- Hindari N+1 query.
- Gunakan transaction untuk operasi multi-step yang harus atomic.
- Raw SQL harus aman dan tidak menggunakan string interpolation berbahaya.
- Buat query sesuai kontrak DTO/response, bukan mengembalikan seluruh model tanpa kebutuhan.

### `prisma-database-setup`

Gunakan skill ini saat mengatur koneksi database Prisma.

Gunakan untuk pekerjaan berikut:

- Setup PostgreSQL, MySQL, SQLite, MongoDB, SQL Server, CockroachDB, atau Prisma Postgres.
- Menentukan provider database.
- Mengatur connection string, env var, `prisma.config.ts`, driver adapter, atau client instantiation.
- Troubleshooting koneksi database.

Ketentuan penerapan:

- Sesuaikan adapter dengan provider database.
- Untuk Prisma 7 SQL provider, gunakan driver adapter yang tepat.
- MongoDB tidak mengikuti workflow SQL driver adapter Prisma 7.
- Jangan hardcode connection string atau credential.

### `prisma-upgrade-v7`

Gunakan skill ini saat upgrade Prisma ke v7 atau memperbaiki error akibat perubahan Prisma v7.

Gunakan untuk pekerjaan berikut:

- Migrasi dari Prisma v6 ke v7.
- Mengubah generator ke `prisma-client`.
- Membuat atau memperbaiki `prisma.config.ts`.
- Menambahkan driver adapter.
- Memperbaiki import generated client.
- Menangani perubahan ESM/CJS.

Ketentuan penerapan:

- Pastikan Node.js dan TypeScript memenuhi syarat versi Prisma v7.
- Install adapter untuk SQL provider.
- Update client instantiation sesuai adapter.
- Jalankan `prisma generate` dan test setelah migrasi.

### `prisma-postgres`

Gunakan skill ini saat memakai Prisma Postgres sebagai layanan database.

Gunakan untuk pekerjaan berikut:

- Membuat atau mengelola database lewat Prisma Console.
- Menggunakan `create-db`, `create-pg`, atau `create-postgres`.
- Menghubungkan project lokal ke Prisma Postgres.
- Mengambil connection string.
- Menggunakan Management API atau SDK.

Ketentuan penerapan:

- Gunakan workflow Console untuk setup manual.
- Gunakan CLI/Management API untuk provisioning otomatis.
- Kelola claim URL, region, connection string, dan token dengan aman.

### `prisma-postgres-setup`

Gunakan skill ini untuk provisioning database Prisma Postgres baru dan menghubungkannya ke project lokal.

Gunakan untuk pekerjaan berikut:

- Membuat workspace/project database Prisma Postgres.
- Mengambil connection string baru.
- Menggunakan service token Prisma.
- Menghubungkan database baru ke project API.

Ketentuan penerapan:

- Jangan menyimpan service token di file repository.
- Jika token tidak tersedia, minta user membuat service token di Prisma Console.
- Gunakan pilihan region secara eksplisit.
- Setelah database dibuat, dokumentasikan env var yang dibutuhkan tanpa membocorkan secret.

### `prisma-driver-adapter-implementation`

Gunakan skill ini hanya saat pekerjaan menyentuh implementasi adapter Prisma v7.

Gunakan untuk pekerjaan berikut:

- Membuat driver adapter database baru.
- Mengubah `SqlDriverAdapter`, `Transaction`, atau interface adapter Prisma.
- Menangani transaction lifecycle adapter.
- Mapping error driver database ke Prisma adapter error.

Ketentuan penerapan:

- Skill ini wajib jika menyentuh kontrak adapter, walaupun ada contoh implementasi di codebase.
- Ikuti lifecycle transaction dan error mapping sesuai panduan skill.
- Verifikasi dengan checklist adapter sebelum menganggap pekerjaan selesai.

## Skill Redis

### `redis-development`

Gunakan skill ini saat API memakai atau akan memakai Redis.

Gunakan untuk pekerjaan berikut:

- Cache API.
- Session store.
- Rate limiting.
- Queue, background job, Pub/Sub, Streams, atau realtime notification.
- Redis Query Engine, full-text search, vector search, RedisVL, RAG, atau semantic caching.
- Optimasi performance, memory, TTL, connection, observability, atau security Redis.

Ketentuan penerapan:

- Gunakan key naming yang konsisten.
- Set TTL untuk cache key.
- Hindari command lambat seperti `KEYS *` di production.
- Gunakan connection pooling atau multiplexing.
- Gunakan pipeline untuk bulk operation.
- Gunakan Streams jika message tidak boleh hilang, Pub/Sub hanya untuk broadcast yang boleh lossy.
- Gunakan auth, ACL, TLS, dan pembatasan network di production.

## Skill Koordinasi Dengan Web

### `tanstack-query-best-practices`

Gunakan skill ini di API saat perubahan endpoint berdampak pada pola server state frontend.

Gunakan untuk pekerjaan berikut:

- Mendesain endpoint list/detail agar cocok untuk query key dan cache frontend.
- Mendesain response mutation yang memudahkan invalidation atau optimistic update.
- Menentukan pagination, cursor, filter, sorting, dan stale data behavior.
- Menentukan error response yang mudah ditangani frontend.

Ketentuan penerapan:

- Endpoint harus memiliki kontrak yang stabil.
- Response list/detail harus konsisten.
- Mutation harus mengembalikan data yang cukup untuk update cache.
- Error shape harus predictable.

## Alur Kerja API

1. Aktifkan `nestjs-best-practices` untuk semua pekerjaan API.
2. Jika ada database/ORM Prisma, aktifkan skill Prisma yang sesuai dengan jenis pekerjaan.
3. Jika ada cache/session/queue/realtime/search berbasis Redis, aktifkan `redis-development`.
4. Jika endpoint dikonsumsi frontend dengan server-state caching, cek juga `tanstack-query-best-practices`.
5. Jalankan test dan lint/build sesuai perubahan yang dilakukan.

## Contoh Pemilihan Skill

| Pekerjaan | Skill yang Digunakan |
| --- | --- |
| Membuat module user baru | `nestjs-best-practices` |
| Membuat endpoint login JWT | `nestjs-best-practices` |
| Menambahkan DTO dan validation | `nestjs-best-practices` |
| Menulis query `findMany` dengan filter dan pagination | `prisma-client-api`, `nestjs-best-practices` |
| Menjalankan migration database | `prisma-cli`, `prisma-database-setup` |
| Setup database PostgreSQL Prisma | `prisma-database-setup`, `prisma-cli` |
| Provision Prisma Postgres baru | `prisma-postgres-setup`, `prisma-postgres` |
| Upgrade Prisma v6 ke v7 | `prisma-upgrade-v7` |
| Implementasi adapter database Prisma | `prisma-driver-adapter-implementation` |
| Menambahkan Redis cache | `redis-development`, `nestjs-best-practices` |
| Mendesain endpoint untuk optimistic update frontend | `tanstack-query-best-practices`, `nestjs-best-practices` |

## Catatan Implementasi

- Jangan menambahkan dependency hanya karena skill dicantumkan di dokumen ini.
- Skill menjadi standar rujukan saat stack tersebut dipakai atau akan ditambahkan.
- Jika stack belum tersedia, tulis desain yang kompatibel dan hindari asumsi dependency yang belum ada.
- Jangan menyimpan secret, token, connection string production, atau credential di repository.
