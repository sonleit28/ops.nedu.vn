<!--
NLH PR template — follow structure này cho mọi PR trong workspace NLH-300.
Xoá section nào không áp dụng (ghi "N/A" thay vì để trống để reviewer biết
bạn đã cân nhắc).

Title: conventional commit format — "feat(scope): ...", "fix(scope): ...", "chore(...)".
      Subject lower-case, ≤ 70 ký tự.
-->

## Summary

<!--
1-3 câu: Gì + Tại sao (KHÔNG cần Cách làm — reviewer đọc code biết). Ưu tiên
motivation đằng sau design, không phải list file đã đổi.

Ví dụ tốt: "Thêm idempotency cho lead ingest để nedu.vn/test có thể retry
webhook mà không tạo lead trùng."

Ví dụ dở: "Add sourceRef column to leads table and update DTO."
-->

## Commits

<!--
Liệt kê commits theo logical group, 1 dòng mỗi cái, format:
  - `<type>(<scope>): <subject>` — 1 câu giải thích ngắn gì trong commit này
Nếu PR chỉ 1 commit, skip section này.
-->

- `feat(xxx): ...` — ...
- `chore(xxx): ...` — ...

## Quyết định thiết kế cần reviewer biết

<!--
Optional nhưng rất khuyến khích cho PR có trade-off không hiển nhiên.
Mỗi bullet = 1 quyết định, kèm lý do ngắn. Dùng khi:
- Có ≥ 2 cách làm, bạn chọn 1
- Có magic number / threshold
- Có hành vi khác convention của repo
- Có privacy / security consideration
-->

- **<Tên quyết định>** — <lý do ngắn, 1-2 câu>

## API / Contract changes

<!--
Optional. Dùng khi PR thêm/sửa:
- HTTP endpoint (method, path, request/response shape)
- Event shape (notification bus, event store)
- DI token, module export
- DB column / table / index
- Env variable
- Feature flag

Format code block cho shape dễ đọc:
-->

```
GET  /api/<...>    <auth>    → <response shape>
POST /api/<...>    <auth>    body { ... }
```

## Migration / Deployment notes

<!--
Optional. Dùng khi PR:
- Có migration SQL (nêu 0000_xxx.sql + có backfill/downtime không)
- Cần đặt env mới
- Cần chạy command ngoài (seed, index, migration manual)
- Có breaking change với client đang deploy
-->

## Breaking / Contract phụ thuộc

<!--
Optional. Dùng khi:
- Depend PR khác merge trước (BE → FE)
- Đổi shape API mà consumer chưa sync
- Đổi behavior mặc định (vd unwrap api-client, default value)

Nếu có → cụ thể: "Depend #123 (BE) merged trước. Nếu merge solo → FE 404."
-->

## Test plan

<!--
BẮT BUỘC. Checklist đã test gì. Reviewer dùng để quyết có cần test thêm.

- [x] = đã chạy
- [ ] = plan chạy (cần reviewer aware) hoặc blocked
-->

- [ ] Unit tests pass (`npm test`)
- [ ] Type-check + build clean (`npm run build`)
- [ ] Lint clean cho file mới đụng
- [ ] E2E smoke manual (Postman / UI):
  - <scenario 1>
  - <scenario 2>

## Tech debt ghi nhận (không block PR)

<!--
Optional. Những thứ biết chưa tối ưu nhưng ý thức bỏ qua — để lại dấu vết cho
reviewer khỏi comment lặp, và cho người đọc code tương lai hiểu ngữ cảnh.

Format: vấn đề — lý do chưa fix — khi nào fix.
-->

- <tech debt 1>

## Related

<!--
Link PR khác / issue / design doc liên quan. Nếu chạy multi-repo workspace,
nêu repo + branch của FE/BE/auth tương ứng.
-->

- Frontend / Backend / Auth: <repo:branch hoặc PR link>
- Design doc / issue: <link>
