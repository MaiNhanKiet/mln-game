# Luật chơi & cơ chế — Trà Sữa Đại Tư Bản

Tài liệu mô tả **toàn bộ luật đang chạy trong code** (cập nhật theo `src/config/game.ts`, `src/lib/game-rules.ts`, `src/data/scenarioCards.ts`).

---

## 1. Tổng quan

- **Thể loại:** mô phỏng quyết định kinh doanh kiểu swipe (Tinder).
- **Số lượt:** **15 câu hỏi** (`GAME_CONFIG.totalRounds`).
- **Mỗi thiết bị chỉ chơi 1 lần** — sau khi kết thúc ván (thắng hoặc thua), `localStorage` đánh dấu `mln-has-played = 1`.
- **Đơn vị vốn:** 1 đơn vị = **1 triệu VNĐ** (hiển thị dạng `5.000`, `20.000`, …).

---

## 2. Bốn thanh sinh mệnh (HUD)

| Chỉ số trong game | Nhãn UI | Ý nghĩa |
|-------------------|---------|---------|
| `capital` | Vốn tích lũy | Tiền mặt / két sắt |
| `reputation` | Uy tín | Niềm tin khách hàng (0–100) |
| `staffMorale` | Sức lao động | Năng lượng nhân viên (0–100) |
| `scale` | Quy mô | Cấp quy mô doanh nghiệp |

**Ẩn trên HUD nhưng vẫn tính trong engine:**

| Chỉ số | Giá trị ban đầu | Ghi chú |
|--------|-----------------|---------|
| `customerTrust` | 70 | Có thể gây **game over** nếu `< 1`, nhưng **không có câu hỏi nào** trong `scenarioCards` thay đổi chỉ số này hiện tại |
| `profitPerTurn` | 0 | Lãi vận hành cộng vào vốn **sau mỗi quyết định** nếu > 0 |

### Giá trị khởi đầu

| Chỉ số | Giá trị |
|--------|---------|
| Vốn | **5.000** |
| Uy tín | **50** |
| Sức lao động | **70** |
| Niềm tin khách (ẩn) | **70** |
| Quy mô | **1** |
| Lãi mỗi lượt | **0** |

### Giới hạn clamp

| Chỉ số | Min | Max |
|--------|-----|-----|
| Vốn | -20.000 | 50.000 |
| Uy tín / Sức lao động / Niềm tin khách | 0 | 100 |
| Quy mô | 0 | (không cap cứng) |
| Lãi mỗi lượt | 0 | (không giảm dưới 0) |

---

## 3. Cơ chế thao tác

- **Quẹt trái (←)** = chọn `leftChoice` = **Từ chối**
- **Quẹt phải (→)** = chọn `rightChoice` = **Đồng ý**
- **Phím:** `ArrowLeft` / `ArrowRight` khi đang chơi
- Sau mỗi lựa chọn: hiện **modal kết quả** → bấm **Tiếp tục** mới sang câu tiếp theo
- Câu hỏi lấy theo thứ tự cố định trong `scenarioCards` (không shuffle)

---

## 4. Luồng xử lý sau mỗi quyết định

```
1. Kiểm tra requiresCapitalAtLeast
   → Không đủ vốn: GAME OVER ngay (không áp impact, không cộng lãi vận hành)

2. Áp impact của lựa chọn lên state

3. Nếu profitPerTurn > 0 → cộng thêm vào vốn (lãi vận hành)

4. Tăng currentCardIndex + 1 (để đánh giá kết thúc ván)

5. Xác định phase:
   - forcedPhase trên lựa chọn (nếu có) → ưu tiên
   - Không thì gọi resolveGamePhase()
```

---

## 5. Điều kiện thắng / thua

### 5.1. Game over ngay (critical failure)

Sau khi áp impact + lãi vận hành, nếu **bất kỳ** điều kiện sau đúng → `gameOver`:

| Điều kiện | Ngưỡng |
|-----------|--------|
| Vốn | `<= 0` |
| Sức lao động | `< 1` |
| Uy tín | `< 1` |
| Niềm tin khách | `< 1` |

> Trong UI luật chơi gọi là: hết tiền = phá sản; uy tín / sức lao động về 0 = tẩy chay / đình công.

### 5.2. Kết thúc sau 15 câu

Khi `currentCardIndex >= 15`:

| Điều kiện | Kết quả |
|-----------|---------|
| Vốn `>= 20.000` | **VICTORY** |
| Vốn `< 20.000` | **GAME OVER** |

> `victoryCapital = 20.000` trong code. Thanh vốn trên HUD cũng dùng 20.000 làm mốc max.

### 5.3. Chiến thắng đặc biệt (câu 15)

Câu **Chốt Lời Lịch Sử** có thể **ép VICTORY** mà không cần đạt 20.000 vốn — xem mục 7.

---

## 6. Game over trực tiếp (ép kết thúc ngay)

Các lựa chọn sau **không cần** chờ hết 15 câu hay chờ chỉ số về 0 — game kết thúc ngay sau modal kết quả.

### 6.1. `forcedPhase: gameOver`

| Câu | ID | Lựa chọn | Nhãn | Thông điệp kết thúc |
|-----|-----|----------|------|---------------------|
| 10 | `tester-warning` | **Phải — Vẫn release** | Bỏ qua cảnh báo tester, release app có bug mã 0 đồng | `GAME OVER: Bug 0 đồng làm hệ thống vỡ trận và doanh nghiệp mất kiểm soát.` |

### 6.2. Không đủ vốn tối thiểu (`requiresCapitalAtLeast`)

Khi chọn option có yêu cầu vốn mà `vốn hiện tại < ngưỡng` → **GAME OVER** với `failureEnding`:

| Câu | ID | Lựa chọn | Vốn tối thiểu | Thông điệp kết thúc |
|-----|-----|----------|---------------|---------------------|
| 13 | `acquire-competitor` | **Phải — Thâu tóm đối thủ** | 5.000 | `GAME OVER: Vỡ nợ vì thâu tóm vượt quá năng lực tài chính.` |
| 14 | `all-in-expansion` | **Phải — Mở 3 mặt bằng** | 15.000 | `GAME OVER: Vỡ nợ vì mở rộng quá sức.` |

**Lưu ý:** Điều kiện là `capital < requiresCapitalAtLeast` — đúng bằng ngưỡng vẫn được phép chọn (ví dụ vốn đúng 5.000 vẫn thâu tóm được).

### 6.3. Câu 15 — kết thúc có thông điệp riêng (không ép phase ngay)

| Câu | ID | Lựa chọn | Cơ chế |
|-----|-----|----------|--------|
| 15 | `historic-exit` | **Trái — Không bán** | Sau câu 15: nếu vốn `< 20.000` → game over với `Game kết thúc: doanh nghiệp chưa đạt đủ 5.000 vốn tích lũy để được xem là chiến thắng.` |
| 15 | `historic-exit` | **Phải — Bán cho quỹ** | Nếu vốn `< 5.000` → game over với `Game kết thúc: thương vụ thất bại vì vốn tích lũy chưa đạt tối thiểu 5.000.` |

---

## 7. Game over gián tiếp (qua chỉ số / hết ván)

Không có `forcedPhase`, nhưng impact có thể đẩy vào game over ngay lượt đó hoặc ở câu 15.

### 7.1. Vốn về 0 hoặc âm (phá sản)

Các lựa chọn **trừ vốn lớn** (cần đủ vốn trước khi chọn):

| Câu | Lựa chọn | Impact vốn |
|-----|----------|------------|
| Khởi Nghiệp Bùng Nổ | Mua Porsche | -500 |
| Chủ Tịch Hào Phóng | Chia 90% lợi nhuận | +50 (thực tế giữ ít) |
| Công Nhân Xin Nghỉ Sinh | Cho nghỉ | -300 |
| Đêm Deadline | Không ép ca đêm | -200 |
| Team Building Chữa Lành | Chi team building | -200 |
| Đầu Tư Nâng Trình | Đào tạo | -50 |
| Robot Ủ Trà | Mua robot | -1.000 |
| Cảnh Báo Từ Tester | Hoãn fix | -300 |
| Ma Thuật Khấu Hao | Lấy tiền mua SH | -200 |
| Cá Lớn Nuốt Cá Bé | Thâu tóm (đủ vốn) | **-5.000** → dễ về 0 nếu vốn = 5.000 |
| Chơi Khô Máu | Mở 3 mặt bằng (đủ vốn) | **-15.000** |

Ví dụ: vốn đúng **5.000** mà chọn **Thâu tóm đối thủ** → vốn = 0 → **game over ngay**.

### 7.2. Uy tín `< 1` (tẩy chay)

| Câu | Lựa chọn | Impact uy tín |
|-----|----------|---------------|
| Công Nhân Xin Nghỉ Sinh | Ép làm tiếp | -25 |
| Đêm Deadline | Ép 16 tiếng | -10 |
| Máy Vắt Chanh | (không có -uy tín trực tiếp) | — |
| Team Building | Không tổ chức | **-25** |
| Đầu Tư Nâng Trình | Không đào tạo | -10 |
| Robot Ủ Trà | Không mua | -10 |
| Sữa Bột 3 Không | Nhập hàng rẻ | **-60** (dễ tụt mạnh) |
| Cá Lớn Nuốt Cá Bé | Không thâu tóm | -10 |

Uy tín khởi đầu 50 — cần **cộng dồn** nhiều lựa chọn tiêu cực mới về 0. Riêng **Nhập sữa bột lậu (-60)** từ 50 → dưới ngưỡng 1 nếu không có buff uy tín trước đó (thực tế 50-60 clamp về 0 → `< 1` → game over).

### 7.3. Sức lao động `< 1` (đình công)

| Câu | Lựa chọn | Impact sức lao động |
|-----|----------|---------------------|
| Chủ Tịch Hào Phóng | Không chia | -10 |
| Công Nhân Xin Nghỉ Sinh | Ép làm tiếp | **-30** |
| Đêm Deadline | Ép 16 tiếng | **-35** |
| Máy Vắt Chanh | Rút giờ nghỉ | **-30** |
| Team Building | Không tổ chức | **-50** |
| Robot Ủ Trà | Mua robot | -10 |

**Không tổ chức team building** từ 70 → 20 (chưa chết). Cần **xếp chồng** nhiều lựa chọn bóc lột lao động.

### 7.4. Hết 15 câu mà vốn < 20.000

Mọi lối chơi không đạt 20.000 vốn và không kích hoạt VICTORY đặc biệt ở câu 15 đều **game over** khi hoàn thành lượt 15 — kể cả chọn **Không bán** ở câu cuối.

---

## 8. Điều kiện chiến thắng

| Cách thắng | Điều kiện |
|------------|-----------|
| **Vượt ải** | Hoàn thành 15 câu, vốn `>= 20.000`, không rơi vào critical failure |
| **Bán công ty** (câu 15) | Chọn **Bán cho quỹ đầu tư**, vốn `>= 5.000` → `forcedPhase: victory` |
| | Thông điệp: `VICTORY: Trở thành tỷ phú sau thương vụ mua lại lịch sử.` |

---

## 9. Lãi vận hành (`profitPerTurn`)

Một số lựa chọn tăng **lãi cố định mỗi lượt**. Sau **mỗi** quyết định (kể cả lựa chọn chỉ đổi uy tín), nếu `profitPerTurn > 0` thì cộng thêm vào vốn.

| Câu | Lựa chọn | +Lãi mỗi lượt |
|-----|----------|---------------|
| Đầu Tư Nâng Trình | Đào tạo | +200 |
| Robot Ủ Trà | Mua robot | +500 |
| Ma Thuật Khấu Hao | Tái đầu tư | +100 |
| Cá Lớn Nuốt Cá Bé | Thâu tóm | +1.000 |
| Chơi Khô Máu | Mở 3 mặt bằng | +2.000 |

Feedback modal sẽ nối thêm: *"Lãi vận hành cộng thêm X vốn."*

---

## 10. Danh sách 15 câu hỏi

Đơn vị impact: vốn (triệu), uy tín / sức lao động (điểm 0–100), quy mô (cấp).

### Câu 1 — Khởi Nghiệp Bùng Nổ (`startup-boom`) · *Bẫy tiêu dùng*

**Tình huống:** Lãi 500 triệu tháng đầu — rút hết mua Porsche?

| | Trái: Không mua | Phải: Mua Porsche |
|--|-----------------|-------------------|
| Vốn | +500 | -500 |
| Uy tín | — | +5 |
| Khác | — | — |

---

### Câu 2 — Chủ Tịch Hào Phóng (`generous-chairman`) · *Bẫy lao động*

**Tình huống:** Lãi 500 triệu — chia 450 triệu cho nhân viên?

| | Trái: Không chia nhiều | Phải: Chia 90% |
|--|------------------------|----------------|
| Vốn | +500 | +50 |
| Sức lao động | -10 | +20 |
| Uy tín | — | +10 |

---

### Câu 3 — Cá Mập Pool Party (`shark-pool-party`) · *Bẫy tăng trưởng*

**Tình huống:** Shark rót 10 tỷ, 2 tỷ làm Pool Party PR?

| | Trái: Từ chối | Phải: Làm Pool Party |
|--|---------------|----------------------|
| Vốn | — | +8.000 |
| Uy tín | +5 | +10 |

---

### Câu 4 — Công Nhân Xin Nghỉ Sinh (`maternity-leave`) · *Thử đạo đức*

| | Trái: Ép làm tiếp | Phải: Cho nghỉ |
|--|-------------------|----------------|
| Vốn | +700 | -300 |
| Uy tín | -25 | +15 |
| Sức lao động | -30 | +20 |

---

### Câu 5 — Đêm Deadline (`deadline-night`) · *Bẫy lao động*

| | Trái: Không ép ca đêm | Phải: Ép 16 tiếng |
|--|------------------------|-------------------|
| Vốn | -200 | +1.200 |
| Sức lao động | +15 | -35 |
| Uy tín | — | -10 |

---

### Câu 6 — Máy Vắt Chanh (`lemon-squeezer`) · *Bẫy lao động*

| | Trái: Giữ giờ nghỉ | Phải: Rút giờ nghỉ |
|--|--------------------|--------------------|
| Vốn | +300 | +1.000 |
| Sức lao động | +10 | -30 |

---

### Câu 7 — Team Building Chữa Lành (`healing-team-building`) · *Bẫy lao động*

| | Trái: Không tổ chức | Phải: Chi team building |
|--|---------------------|-------------------------|
| Vốn | — | -200 |
| Sức lao động | -50 | +40 |
| Uy tín | -25 | +10 |

---

### Câu 8 — Đầu Tư Nâng Trình (`staff-upskill`) · *Bẫy tăng trưởng*

| | Trái: Không đào tạo | Phải: Đào tạo |
|--|---------------------|---------------|
| Vốn | — | -50 |
| Uy tín | -10 | +5 |
| Lãi/lượt | — | +200 |

---

### Câu 9 — Robot Ủ Trà (`tea-robot`) · *Bẫy tăng trưởng*

| | Trái: Không mua | Phải: Mua robot |
|--|-----------------|-----------------|
| Vốn | — | -1.000 |
| Uy tín | -10 | — |
| Sức lao động | — | -10 |
| Quy mô | — | +1 |
| Lãi/lượt | — | +500 |

---

### Câu 10 — Cảnh Báo Từ Tester (`tester-warning`) · *Thử đạo đức*

| | Trái: Hoãn fix | Phải: Vẫn release |
|--|----------------|-------------------|
| Vốn | -300 | — |
| Uy tín | +15 | — |
| **Đặc biệt** | — | **GAME OVER trực tiếp** |

---

### Câu 11 — Sữa Bột 3 Không (`unsafe-milk-powder`) · *Thử đạo đức*

| | Trái: Từ chối nhập | Phải: Nhập hàng rẻ |
|--|---------------------|---------------------|
| Vốn | +300 | +2.000 |
| Uy tín | +15 | **-60** (rủi ro game over) |

---

### Câu 12 — Ma Thuật Khấu Hao (`depreciation-magic`) · *Bẫy tiêu dùng*

| | Trái: Tái đầu tư | Phải: Mua SH |
|--|------------------|--------------|
| Vốn | — | -200 |
| Quy mô | +1 | -1 |
| Lãi/lượt | +100 | — |

---

### Câu 13 — Cá Lớn Nuốt Cá Bé (`acquire-competitor`) · *Bẫy tăng trưởng*

| | Trái: Không thâu tóm | Phải: Thâu tóm |
|--|----------------------|--------------|
| Uy tín | -10 | +10 |
| Vốn | — | -5.000 |
| Quy mô | — | +2 |
| Lãi/lượt | — | +1.000 |
| Yêu cầu vốn (phải) | — | ≥ 5.000, không đủ → **GAME OVER** |

---

### Câu 14 — Chơi Khô Máu (`all-in-expansion`) · *Bẫy tăng trưởng*

| | Trái: Không mở rộng | Phải: Mở 3 mặt bằng |
|--|---------------------|---------------------|
| Vốn | — | -15.000 |
| Quy mô | — | +3 |
| Lãi/lượt | — | +2.000 |
| Yêu cầu vốn (phải) | — | ≥ 15.000, không đủ → **GAME OVER** |

---

### Câu 15 — Chốt Lời Lịch Sử (`historic-exit`) · *Sốc thị trường*

**Tình huống:** Quỹ Wall Street mua lại — bán không?

| | Trái: Không bán | Phải: Bán cho quỹ |
|--|-----------------|-------------------|
| Uy tín | +10 | — |
| Yêu cầu vốn (phải) | — | ≥ 5.000 |
| Kết quả | Hết ván: vốn ≥ 20.000 → thắng; `< 20.000` → thua | Đủ vốn → **VICTORY**; thiếu vốn → thua |

---

## 11. Bảng xếp hạng

### 3 bảng

| Tab | Trường DB | Nguồn in-game |
|-----|-----------|---------------|
| Vốn | `capital` | `capital` |
| Uy tín | `reputation` | `reputation` |
| Sức lao động | `laborPower` | `staffMorale` |

### Thứ tự xếp hạng

1. **VICTORY** và **PLAYING** xếp **trên** mọi **GAME OVER** (kể cả điểm cao hơn).
2. Trong cùng nhóm status: điểm **cao hơn** xếp trên.
3. Cùng status + cùng điểm: ai **`updatedAt` sớm hơn** (hoàn thành sớm hơn) xếp trên.
4. Hòa tiếp: so `id`.

### Badge trạng thái

| Status | Hiển thị |
|--------|----------|
| `VICTORY` | VICTORY |
| `PLAYING` | PLAYING |
| `GAME_OVER` | GAME OVER |

Điểm được sync lên server qua `PATCH /api/players/:id` khi chơi và khi kết thúc ván.

---

## 12. Ghi chú UI vs code

Modal **Mục tiêu chiến thắng** khi bắt đầu (`RulesScreen`) hiển thị *"giữ vốn từ 5.000 trở lên"* — đó là **vốn khởi đầu**, không phải ngưỡng thắng trong engine.

**Ngưỡng thắng thực tế trong code:** vốn **≥ 20.000** sau 15 câu, hoặc bán công ty ở câu 15 với vốn **≥ 5.000**.

---

## 13. Tóm tắt nhanh — Game over trực tiếp

| # | Câu | Chọn | Lý do |
|---|-----|------|-------|
| 1 | Cảnh Báo Từ Tester | Vẫn release | `forcedPhase: gameOver` |
| 2 | Cá Lớn Nuốt Cá Bé | Thâu tóm khi vốn < 5.000 | `failureEnding` |
| 3 | Chơi Khô Máu | Mở 3 mặt bằng khi vốn < 15.000 | `failureEnding` |
| 4 | Chốt Lời Lịch Sử | Bán khi vốn < 5.000 | `failureEnding` |
| 5 | Chốt Lời Lịch Sử | Không bán, hết 15 câu, vốn < 20.000 | `resolveGamePhase` + `gameOverEnding` |

**Game over gián tiếp phổ biến:** vốn ≤ 0, uy tín < 1 (đặc biệt nhập sữa lậu), sức lao động < 1 (xếp chồng bóc lột), hoặc hết 15 câu không đủ 20.000 vốn.
