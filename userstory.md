# USER STORIES – HỆ THỐNG QUẢN LÝ GARA Ô TÔ 



## 0. PHẠM VI & NGUYÊN TẮC THIẾT KẾ

### 0.1. Nguyên tắc cốt lõi

* Work Order (WO) là **thực thể trung tâm**
* Mọi hành động đều phải:

  * Gắn với **User**
  * Gắn với **Thời gian**
  * Ghi **Audit Log (bất biến)**
* Không có thao tác ngoài hệ thống

### 0.2. Mô hình triển khai

* Hệ thống phục vụ **1 gara duy nhất**
* Không có khái niệm chi nhánh
* Toàn bộ kho, thợ, khách dùng chung một hệ thống

---

## 1. ACTOR: CHỦ GARA (ADMIN)

### 1.1. Quản lý tài khoản & phân quyền

**User Story**
Là Chủ gara, tôi muốn quản lý tài khoản người dùng để kiểm soát quyền truy cập và trách nhiệm.

**Business Rules**

* Mỗi User có **1 role duy nhất**
* User **không được tự đổi role**
* Role quyết định toàn bộ quyền

**Acceptance Criteria**

* Tạo / khóa / mở tài khoản
* Gán role: Sale, Thợ chẩn đoán, Thợ sửa chữa, Kho, Kế toán
* Mỗi role chỉ thấy đúng menu và API
* Mọi thay đổi role/trạng thái đều ghi audit log

---

### 1.2. Cấu hình nghiệp vụ gara

**User Story**
Là Chủ gara, tôi muốn cấu hình quy tắc vận hành để hệ thống phản ánh đúng thực tế gara.

**Business Rules**

* Chỉ Admin được chỉnh cấu hình
* Cấu hình ảnh hưởng đến WO tạo sau thời điểm chỉnh

**Acceptance Criteria**

* Thiết lập bảng giá công thợ theo loại dịch vụ
* Thiết lập chính sách bảo hành:

  * Theo dịch vụ / phụ tùng
  * Theo thời gian / số km
* Bật/tắt duyệt báo giá
* Định nghĩa luồng trạng thái Work Order
* Bật/tắt cho phép phát sinh sửa chữa

---

### 1.3. Kiểm soát giá & chống gian lận

**User Story**
Là Chủ gara, tôi muốn kiểm soát việc chỉnh giá để tránh thất thoát.

**Business Rules**

* Mỗi dịch vụ/phụ tùng có:

  * Giá chuẩn
  * Giá tối thiểu
* Giá dưới mức tối thiểu phải bị chặn

**Acceptance Criteria**

* Chỉ role được phép mới chỉnh giá
* Mỗi lần chỉnh giá phải nhập lý do
* Lưu lịch sử giá trước/sau + người chỉnh

---

## 2. ACTOR: KHÁCH HÀNG

### 2.1. Tiếp nhận xe

**User Story**
Là hệ thống, tôi cần ghi nhận đầy đủ thông tin xe khi vào gara để tránh tranh chấp.

**Business Rules**

* Mỗi xe có thể có nhiều Work Order
* Mỗi Work Order có mã duy nhất

**Acceptance Criteria**

* Lưu thông tin khách hàng
* Lưu thông tin xe (biển số, loại xe)
* Ghi nhận tình trạng ban đầu (mô tả + hình ảnh)
* Tạo Work Order ở trạng thái "Tiếp nhận"

---

### 2.2. Duyệt báo giá

**User Story**
Là Khách hàng, tôi muốn duyệt báo giá trước khi gara sửa xe.

**Business Rules**

* Báo giá chưa duyệt thì **không được sửa**
* Mỗi lần duyệt có timestamp

**Acceptance Criteria**

* Xem chi tiết dịch vụ & phụ tùng
* Chấp nhận / từ chối / yêu cầu chỉnh sửa
* Lưu lịch sử duyệt báo giá

---

## 3. ACTOR: SALE

### 3.1. Lập Work Order

**User Story**
Là Sale, tôi muốn tạo Work Order để bắt đầu quy trình sửa chữa.

**Business Rules**

* Sale không được tự ý xuất kho

**Acceptance Criteria**

* Tạo WO
* Gán trạng thái "Chờ chẩn đoán"

---

### 3.2. Lập báo giá

**User Story**
Là Sale, tôi muốn lập báo giá dựa trên kết quả chẩn đoán.

**Business Rules**

* Chỉ dùng dịch vụ/phụ tùng trong danh mục
* Chưa duyệt thì không xuất kho

**Acceptance Criteria**

* Thêm dịch vụ & phụ tùng
* Tự động tính tổng tiền
* Chuyển WO sang "Chờ khách duyệt"

---

### 3.3. Xử lý phát sinh

**User Story**
Là Sale, tôi muốn ghi nhận phát sinh trong quá trình sửa chữa.

**Business Rules**

* Phát sinh phải tách khỏi báo giá ban đầu

**Acceptance Criteria**

* Tạo mục phát sinh riêng
* Yêu cầu khách duyệt bổ sung
* Chưa duyệt thì không xuất kho phát sinh

---

## 4. ACTOR: THỢ

### 4.1. Thợ chẩn đoán

**User Story**
Là Thợ chẩn đoán, tôi muốn kiểm tra xe và đề xuất sửa chữa.

**Business Rules**

* Không được chỉnh giá
* Không được xuất kho

**Acceptance Criteria**

* Ghi nhận lỗi
* Đề xuất dịch vụ & phụ tùng

---

### 4.2. Thợ sửa chữa

**User Story**
Là Thợ sửa chữa, tôi muốn thực hiện các task được giao.

**Business Rules**

* Chỉ nhận WO đã duyệt

**Acceptance Criteria**

* Nhận task
* Cập nhật tiến độ
* Báo phát sinh kỹ thuật

---

### 4.3. Quản lý nhiều thợ / nhiều task

**User Story**
Là hệ thống, tôi cần cho phép nhiều thợ cùng làm một Work Order và ghi nhận sản lượng.

**Business Rules**

* Mỗi task có:

  * 1 thợ chính
  * 0–n thợ phụ
* Công thợ được chia theo %

**Acceptance Criteria**

* Ghi nhận % công cho từng thợ
* Tổng % = 100%
* Dữ liệu dùng cho báo cáo lương & KPI

---

## 5. ACTOR: KHO

### 5.1. Nhập kho

**User Story**
Là Kho, tôi muốn nhập phụ tùng để cập nhật tồn kho.

**Acceptance Criteria**

* Nhập theo lô
* Lưu giá nhập & nhà cung cấp
* Ghi lịch sử nhập

---

### 5.2. Xuất kho theo Work Order

**User Story**
Là Kho, tôi muốn chỉ xuất kho khi Work Order hợp lệ.

**Business Rules**

* WO chưa duyệt thì không xuất

**Acceptance Criteria**

* Xuất đúng số lượng theo WO
* Tự động trừ tồn
* Ghi log người xuất

---

### 5.3. Nhập trả phụ tùng từ Work Order (Reverse Logistics)

**User Story**
Là Kho, tôi muốn nhập lại phụ tùng thừa hoặc lỗi từ Work Order để cập nhật tồn kho chính xác và giảm trừ chi phí cho WO.

**Business Rules**

* Chỉ cho nhập trả khi phụ tùng chưa sử dụng hoặc bị lỗi
* Nhập trả phải gắn với Work Order gốc

**Acceptance Criteria**

* Tăng tồn kho tương ứng số lượng trả
* Tự động giảm chi phí vật tư trong WO
* Ghi rõ lý do nhập trả
* Audit log bắt buộc

---

### 5.4. Kiểm soát lệch kho

**User Story**
Là Kho, tôi muốn phát hiện lệch kho.

**Acceptance Criteria**

* So sánh tồn thực tế & hệ thống
* Ghi nhận lý do điều chỉnh

---

## 6. THANH TOÁN & CÔNG NỢ

### 6.1. Thanh toán Work Order

**User Story**
Là Sale hoặc Chủ gara, tôi muốn ghi nhận thanh toán.

**Acceptance Criteria**

* Thanh toán nhiều lần
* Tiền mặt / chuyển khoản
* Tự động cập nhật công nợ

---

### 6.2. Quản lý công nợ

**User Story**
Là Chủ gara, tôi muốn theo dõi khách còn nợ.

**Acceptance Criteria**

* Danh sách WO chưa thanh toán đủ
* Cảnh báo khi WO hoàn thành còn nợ

---

## 7. WORK ORDER, HỦY & BẢO HÀNH

### 7.0. Hủy Work Order (Cancelled)

**User Story**
Là Sale hoặc Admin, tôi muốn hủy Work Order khi khách không tiếp tục sửa.

**Business Rules**

* Chỉ cho phép hủy khi:

  * WO chưa xuất kho, hoặc
  * Toàn bộ phụ tùng đã được nhập trả

**Acceptance Criteria**

* Chuyển WO sang trạng thái "Hủy"
* Bắt buộc nhập lý do hủy
* WO ở trạng thái Hủy là **chỉ đọc**

---

## 7. WORK ORDER & BẢO HÀNH

### 7.1. Quản lý vòng đời Work Order

**User Story**
Là hệ thống, tôi cần kiểm soát vòng đời Work Order.

**Business Rules**

* Trạng thái đi theo luồng
* WO đã đóng không chỉnh sửa

**Acceptance Criteria**

* Liên kết Sale – Thợ – Kho – Thanh toán

---

### 7.2. Quản lý bảo hành

**User Story**
Là Chủ gara, tôi muốn quản lý bảo hành.

**Business Rules**

* Bảo hành không thu tiền

**Acceptance Criteria**

* Tạo WO bảo hành từ WO cũ
* Xác định hạng mục được bảo hành

---

## 8. AUDIT & AN TOÀN DỮ LIỆU

### 8.1. Audit log

**User Story**
Là Chủ gara, tôi muốn truy vết toàn bộ thao tác.

**Acceptance Criteria**

* Log tạo / sửa / xóa dữ liệu quan trọng
* Log không sửa/xóa

---

### 8.2. Sao lưu & khôi phục

**User Story**
Là hệ thống, tôi cần sao lưu dữ liệu.

**Acceptance Criteria**

* Backup định kỳ
* Cho phép khôi phục khi có sự cố

---

## 9. HỆ THỐNG THÔNG BÁO (NOTIFICATION FLOW)

> Mục tiêu: đảm bảo **đúng người – đúng thời điểm – đúng hành động**, không thông báo dư thừa.

### 9.1. Nguyên tắc chung

**Business Rules**

* Mỗi thông báo phải gắn với:

  * 1 sự kiện (event)
  * 1 hoặc nhiều người nhận (recipient)
  * 1 Work Order (nếu có)
* Thông báo **chỉ đọc**, không chỉnh sửa
* Trạng thái thông báo: `Unread` / `Read`

---

### 9.2. Kênh thông báo

**Business Rules**

* Hệ thống hỗ trợ các kênh:

  * In-app notification (bắt buộc)
  * SMS / Zalo / Email (tùy cấu hình, có thể bật/tắt)

**Acceptance Criteria**

* Admin cấu hình bật/tắt từng kênh
* Nội dung thông báo giống nhau, chỉ khác kênh gửi

---

### 9.3. Thông báo cho Khách hàng

#### 9.3.1. Có báo giá mới

**Trigger Event**

* Sale chuyển Work Order sang trạng thái "Chờ khách duyệt"

**Recipients**

* Khách hàng của Work Order

**Notification Content**

* Mã Work Order
* Tổng tiền báo giá
* Link/QR để xem chi tiết

**Rules**

* Nếu khách chưa duyệt → gửi lại nhắc sau X giờ (cấu hình)

---

#### 9.3.2. Có phát sinh cần duyệt

**Trigger Event**

* Sale tạo mục phát sinh mới

**Recipients**

* Khách hàng

**Rules**

* Phát sinh chưa duyệt → không cho sửa & không xuất kho

---

#### 9.3.3. Xe sửa xong

**Trigger Event**

* Work Order chuyển sang trạng thái "Chờ thanh toán"

**Recipients**

* Khách hàng

**Notification Content**

* Thông báo xe đã hoàn thành
* Số tiền cần thanh toán còn lại

---

### 9.4. Thông báo nội bộ – Sale

#### 9.4.1. Báo giá bị từ chối / yêu cầu chỉnh sửa

**Trigger Event**

* Khách hàng từ chối hoặc yêu cầu chỉnh sửa báo giá

**Recipients**

* Sale phụ trách Work Order

---

#### 9.4.2. Khách đã thanh toán đủ

**Trigger Event**

* Công nợ Work Order = 0

**Recipients**

* Sale phụ trách

---

### 9.5. Thông báo nội bộ – Thợ

#### 9.5.1. Có Work Order mới được giao

**Trigger Event**

* Sale/Admin gán task cho thợ

**Recipients**

* Thợ được gán task

---

#### 9.5.2. Phát sinh được duyệt

**Trigger Event**

* Khách hàng duyệt phát sinh

**Recipients**

* Thợ đang xử lý Work Order

---

### 9.6. Thông báo nội bộ – Kho

#### 9.6.1. Work Order được duyệt – sẵn sàng xuất kho

**Trigger Event**

* Báo giá hoặc phát sinh được khách duyệt

**Recipients**

* Nhân viên Kho

**Rules**

* Chỉ thông báo khi WO đủ điều kiện xuất kho

---

### 9.7. Thông báo cho Chủ gara

#### 9.7.1. Lệch kho

**Trigger Event**

* Có điều chỉnh tồn kho

**Recipients**

* Chủ gara

---

#### 9.7.2. Work Order hoàn thành nhưng còn nợ

**Trigger Event**

* WO ở trạng thái "Hoàn thành" và công nợ > 0

**Recipients**

* Chủ gara

---

### 9.8. Log & truy vết thông báo

**Acceptance Criteria**

* Lưu lịch sử gửi thông báo:

  * Ai nhận
  * Gửi lúc nào
  * Qua kênh nào
* Không cho sửa/xóa lịch sử thông báo

---

## 10. CÁC RULE BẮT BUỘC ĐỂ LÊN PRODUCTION (CRITICAL FOR AI)

> Phần này dùng để **khóa cứng hành vi hệ thống**, tránh AI hoặc dev hiểu sai nghiệp vụ.

---

### 10.1. Work Order State Machine (CỨNG – CÓ NHÁNH ĐIỀU KIỆN)

**WO Status Flow (chuẩn)**

Tiếp nhận
→ Chờ chẩn đoán
→ Chờ khách duyệt
→ Đã duyệt
→ Đang sửa
→ Chờ thanh toán
→ Hoàn thành
→ Đóng

**Nhánh ngoại lệ (loop-back có kiểm soát)**

* Tại trạng thái **Chờ khách duyệt**:

  * Nếu Khách **TỪ CHỐI** báo giá → chuyển về trạng thái **Báo giá lại**
  * Nếu Khách **YÊU CẦU CHỈNH SỬA** → chuyển về trạng thái **Báo giá lại**

* Trạng thái **Báo giá lại**:

  * Sale chỉnh sửa báo giá
  * Gửi lại cho khách → quay lại **Chờ khách duyệt**

**State Transition Rules**

* Không cho nhảy cóc trạng thái
* Chỉ rollback trong nhánh ngoại lệ được định nghĩa
* Mọi rollback phải có lý do + audit log

**Role được phép chuyển trạng thái**

* Tiếp nhận → Chờ chẩn đoán: Sale
* Chờ chẩn đoán → Chờ khách duyệt: Sale
* Chờ khách duyệt → Đã duyệt: Khách hàng
* Chờ khách duyệt → Báo giá lại: Khách hàng
* Báo giá lại → Chờ khách duyệt: Sale
* Đã duyệt → Đang sửa: Sale / Admin
* Đang sửa → Chờ thanh toán: Thợ / Sale
* Chờ thanh toán → Hoàn thành: Sale / Kế toán
* Hoàn thành → Đóng: Hệ thống (tự động khi đủ điều kiện)

---

### 10.2. Rule chỉnh sửa dữ liệu theo trạng thái Work Order

**Rules**

* WO = Tiếp nhận / Chờ chẩn đoán:

  * Cho phép chỉnh sửa thông tin xe, khách
  * Chưa có báo giá

* WO = Chờ khách duyệt:

  * Cho phép chỉnh báo giá
  * Chưa được xuất kho

* WO = Đã duyệt:

  * **Không cho sửa báo giá gốc**
  * Chỉ cho tạo phát sinh

* WO = Đang sửa:

  * Không sửa báo giá
  * Chỉ cho tạo phát sinh (phải được duyệt)

* WO = Chờ thanh toán:

  * Không cho tạo phát sinh
  * Không cho xuất kho

* WO = Hoàn thành / Đóng:

  * Work Order ở chế độ **chỉ đọc**

---

### 10.3. Ownership & Permission của Work Order

**Rules**

* Mỗi Work Order có **1 Sale phụ trách (Owner)**

* Sale Owner được gán ngay khi tạo WO

* Chỉ các role sau được chỉnh báo giá:

  * Sale Owner
  * Admin

* Sale không phải owner:

  * Chỉ được xem
  * Không được chỉnh giá, không được gửi báo giá

---

### 10.4. Rule thanh toán, đặt cọc & khóa trạng thái

**Rules**

* Work Order có thể thanh toán nhiều lần

* Hệ thống luôn tính **Công nợ = Tổng tiền – Tổng đã thu**

* **Đặt cọc (Deposit)**:

  * Với WO có tổng giá trị > X (cấu hình)
  * Bắt buộc thu tối thiểu Y% tiền cọc
  * Chưa đủ cọc:

    * Không cho chuyển WO sang "Đang sửa"
    * Không cho xuất kho

* Chỉ khi **Công nợ = 0**:

  * Mới cho chuyển WO sang trạng thái "Đóng"

* Trường hợp đặc biệt:

  * Admin có thể đóng WO khi công nợ > 0
  * Bắt buộc nhập lý do
  * Ghi audit log

---

### 10.5. Notification Retry & Deduplication Rules

**Rules**

* Mỗi sự kiện (event) chỉ tạo **1 notification gốc**

* Notification không bị tạo lại nếu event không đổi

* Reminder:

  * Chỉ áp dụng cho sự kiện cần phản hồi (duyệt báo giá, duyệt phát sinh)
  * Mỗi reminder cách nhau X giờ (cấu hình)
  * Tối đa N lần reminder (cấu hình)

* Trạng thái:

  * Đã đọc (Read) ≠ Đã duyệt (Approved)
  * Đọc không dừng reminder
  * Chỉ duyệt/từ chối mới dừng reminder

---

> **LƯU Ý CHO AI / DEV**
> Nếu một hành động không được mô tả rõ trong các rule trên → **MẶC ĐỊNH BỊ CẤM**.

---

## 11. Inventory Reservation (Giữ hàng phụ tùng)

### 11.1. Tạo Reservation khi chờ khách duyệt

**User Story**
Là hệ thống, tôi muốn giữ trước phụ tùng cho Work Order đang chờ khách duyệt để tránh tranh chấp tồn kho giữa các xe.

**Rules**

* Khi Work Order chuyển sang trạng thái **Chờ khách duyệt**:

  * Tạo Inventory Reservation cho từng phụ tùng trong báo giá
  * Reservation gắn với: WorkOrderID, PartID, Quantity
* Reservation **không làm giảm OnHand**, chỉ làm giảm **Available**
* Không cho tạo Reservation nếu `Available < Quantity yêu cầu`
* Báo giá chỉ được lập dựa trên **Available**, không dựa trên OnHand

---

### 11.2. Trạng thái & vòng đời Reservation

**User Story**
Là hệ thống, tôi muốn quản lý vòng đời Reservation rõ ràng để tránh giữ hàng vô hạn.

**Reservation States**

* Active: đang giữ cho WO chờ duyệt
* Converted: đã chuyển thành xuất kho
* Released: đã trả lại kho
* Expired: hết hạn tự động

**Rules**

* Mỗi Reservation có thời hạn (TTL) cấu hình được (ví dụ: 24h)
* Khi hết hạn:

  * Reservation chuyển sang Expired
  * Tự động Release số lượng về kho (tăng Available)
  * Gửi thông báo cho Sale phụ trách
* Chỉ Sale owner hoặc Admin được gia hạn Reservation

---

### 11.3. Chuyển Reservation thành xuất kho

**User Story**
Là Kho, tôi muốn xuất kho dựa trên Reservation đã tồn tại để đảm bảo đúng phụ tùng đã giữ cho Work Order.

**Rules**

* Chỉ cho phép xuất kho khi:

  * Work Order = **Đã duyệt**
  * Reservation ở trạng thái Active
* Khi xuất kho:

  * Trừ OnHand
  * Chuyển Reservation sang Converted
  * Ghi log xuất kho (người xuất, thời điểm)

---

### 11.4. Release Reservation

**User Story**
Là hệ thống, tôi muốn trả lại phụ tùng đã giữ khi Work Order không tiếp tục để kho phản ánh đúng tồn khả dụng.

**Trigger Release**

* Khách từ chối báo giá
* Work Order bị Hủy
* Reservation hết hạn
* Sale chỉnh sửa báo giá làm giảm số lượng phụ tùng

**Rules**

* Khi Release:

  * Reservation chuyển sang Released
  * Available tăng tương ứng
  * Không thay đổi OnHand

---

### 11.5. Ràng buộc & kiểm soát gian lận

**Rules**

* Một Reservation chỉ thuộc về **1 Work Order duy nhất**
* Không cho sửa Quantity của Reservation trực tiếp
* Mọi thao tác tạo / gia hạn / release / convert Reservation phải được ghi log
* Admin override (tạo Reservation vượt Available) bắt buộc ghi rõ lý do

---

## 12. Reverse Logistics – Hoàn nhập kho từ Work Order

### 12.1. Hoàn nhập phụ tùng thừa / xuất nhầm

**User Story**
Là Thợ hoặc Kho, tôi muốn hoàn nhập lại kho các phụ tùng đã xuất cho Work Order nhưng không sử dụng hoặc xuất nhầm, để tồn kho và chi phí Work Order được cập nhật chính xác.

**Business Rules**

* Chỉ cho phép hoàn nhập với phụ tùng:

  * Đã được xuất kho cho đúng Work Order
  * Chưa bị đánh dấu là đã sử dụng / tiêu hao
* Hoàn nhập kho sẽ:

  * Tăng OnHand
  * Giảm chi phí phụ tùng của Work Order tương ứng
* Phụ tùng hoàn nhập phải ghi rõ lý do:

  * Thừa không dùng
  * Xuất nhầm mã
  * Đổi phụ tùng khác

---

### 12.2. Ràng buộc trạng thái Work Order

**Rules**

* Cho phép hoàn nhập khi Work Order ở trạng thái:

  * Đang sửa
  * Chờ thanh toán
* Không cho hoàn nhập khi:

  * Work Order = Đóng
  * Phụ tùng đã được bảo hành / tiêu hao

---

### 12.3. Kiểm soát gian lận & Audit

**Rules**

* Mọi thao tác hoàn nhập kho phải được ghi log:

  * Người thực hiện
  * Thời gian
  * Số lượng
  * Lý do
* Admin override hoàn nhập sau khi WO đã đóng bắt buộc ghi log và lý do đặc biệt

---

## 13. Concurrency & Data Integrity – Phân hệ Kho

### 13.1. Vấn đề truy cập đồng thời

**User Story**
Là hệ thống, tôi cần đảm bảo dữ liệu tồn kho luôn chính xác khi nhiều người cùng thao tác nhập / xuất kho đồng thời.

---

### 13.2. Business Rules

**Rules**

* Mọi thao tác làm thay đổi OnHand / Reserved phải được xử lý trong **database transaction**
* Không cho phép tồn kho âm trong mọi trường hợp (trừ Admin override có log)
* Khi xuất kho hoặc tạo Reservation:

  * Phải khóa bản ghi tồn kho liên quan (row-level locking)
* Nếu transaction thất bại:

  * Không thay đổi dữ liệu kho
  * Trả lỗi rõ ràng cho người dùng

---

### 13.3. Yêu cầu kỹ thuật (cho Dev / AI code)

**Rules**

* Ưu tiên sử dụng:

  * `SELECT ... FOR UPDATE` hoặc cơ chế lock tương đương
* Không xử lý tồn kho bằng logic ngoài database
* Mọi thay đổi tồn kho phải đi qua **Warehouse Service duy nhất**

---

## 14. Permission Matrix – Phân quyền cứng theo Actor × Hành động × Trạng thái WO

> Mục tiêu: Khóa toàn bộ quyền thao tác để AI / Dev **không thể tự suy diễn**, đảm bảo đúng nghiệp vụ gara thực tế.

---

### 14.1. Nguyên tắc chung

**Global Rules**

* Quyền thao tác = Actor + Hành động + Trạng thái Work Order
* Không có quyền ngầm (implicit permission)
* Không có rollback trạng thái trừ trường hợp được ghi rõ
* Admin có quyền override nhưng **bắt buộc ghi log + lý do**

---

### 14.2. Quyền theo Actor

#### 14.2.1. Chủ Gara (Admin)

| Hành động                  | Trạng thái WO   | Quyền  |
| -------------------------- | --------------- | ------ |
| Tạo / sửa / khóa tài khoản | Mọi trạng thái  | ✅      |
| Cấu hình hệ thống          | Mọi trạng thái  | ✅      |
| Chỉnh báo giá              | Trước Đang sửa  | ✅      |
| Override xuất kho          | Mọi trạng thái  | ⚠️ Log |
| Đóng Work Order            | Khi công nợ = 0 | ✅      |
| Hủy Work Order             | Trước Đã duyệt  | ✅      |

---

#### 14.2.2. Sale (Owner của WO)

| Hành động           | Trạng thái WO                   | Quyền |
| ------------------- | ------------------------------- | ----- |
| Tạo Work Order      | Tiếp nhận                       | ✅     |
| Chỉnh báo giá gốc   | Chờ chẩn đoán / Chờ khách duyệt | ✅     |
| Gửi báo giá         | Chờ khách duyệt                 | ✅     |
| Gia hạn Reservation | Chờ khách duyệt                 | ✅     |
| Tạo phát sinh       | Đang sửa                        | ✅     |
| Thu tiền            | Chờ thanh toán                  | ✅     |
| Hủy WO              | Trước Đã duyệt                  | ✅     |

**Sale KHÔNG ĐƯỢC**

* Xuất kho
* Hoàn nhập kho
* Chỉnh giá sau khi WO = Đang sửa

---

#### 14.2.3. Sale (Không phải owner)

| Hành động      | Trạng thái WO  | Quyền |
| -------------- | -------------- | ----- |
| Xem Work Order | Mọi trạng thái | 👁️   |
| Chỉnh báo giá  | Mọi trạng thái | ❌     |
| Thu tiền       | Mọi trạng thái | ❌     |

---

#### 14.2.4. Thợ chẩn đoán

| Hành động                  | Trạng thái WO  | Quyền |
| -------------------------- | -------------- | ----- |
| Ghi nhận lỗi               | Chờ chẩn đoán  | ✅     |
| Đề xuất dịch vụ / phụ tùng | Chờ chẩn đoán  | ✅     |
| Xuất kho                   | Mọi trạng thái | ❌     |
| Chỉnh giá                  | Mọi trạng thái | ❌     |

---

#### 14.2.5. Thợ sửa chữa

| Hành động              | Trạng thái WO       | Quyền          |
| ---------------------- | ------------------- | -------------- |
| Nhận task              | Đã duyệt / Đang sửa | ✅              |
| Cập nhật tiến độ task  | Đang sửa            | ✅              |
| Báo phát sinh kỹ thuật | Đang sửa            | ✅              |
| Hoàn nhập kho          | Đang sửa            | ⚠️ Yêu cầu Kho |

---

#### 14.2.6. Kho

| Hành động               | Trạng thái WO             | Quyền      |
| ----------------------- | ------------------------- | ---------- |
| Nhập kho                | Không phụ thuộc WO        | ✅          |
| Xuất kho                | WO = Đã duyệt             | ✅          |
| Hoàn nhập kho           | Đang sửa / Chờ thanh toán | ✅          |
| Tạo Reservation         | Chờ khách duyệt           | ❌ (System) |
| Chỉnh tồn kho trực tiếp | Mọi trạng thái            | ❌          |

---

#### 14.2.7. Khách hàng

| Hành động               | Trạng thái WO   | Quyền |
| ----------------------- | --------------- | ----- |
| Xem báo giá             | Chờ khách duyệt | 👁️   |
| Duyệt / từ chối báo giá | Chờ khách duyệt | ✅     |
| Xem trạng thái sửa chữa | Sau Đã duyệt    | 👁️   |
| Thanh toán              | Chờ thanh toán  | ✅     |

---

### 14.3. Quyền theo hành động nhạy cảm

| Hành động       | Điều kiện bắt buộc                 |
| --------------- | ---------------------------------- |
| Xuất kho        | Reservation hợp lệ + WO = Đã duyệt |
| Hoàn nhập kho   | Phụ tùng đã xuất cho đúng WO       |
| Đóng WO         | Công nợ = 0                        |
| Override bất kỳ | Admin + Log                        |

---

### 14.4. Nguyên tắc triển khai cho Dev / AI

**Implementation Rules**

* Permission phải được kiểm tra ở Backend (không tin Frontend)
* Mỗi API phải khai báo rõ:

  * Required Role
  * Required WO State
* Không cho phép bypass permission bằng API nội bộ
* Mọi hành động bị từ chối phải trả lỗi rõ ràng (403 + reason)
