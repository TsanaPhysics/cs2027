# cs2027

# วิทยาการคำนวณสำหรับการสอนวิทยาศาสตร์ (Computing Science for Science Teaching)
**รหัสวิชา:** 4124941 | **หลักสูตร:** ครุศาสตรบัณฑิต สาขาวิชาวิทยาศาสตร์ทั่วไป (ค.บ. 4 ปี)  
**คณะครุศาสตร์ มหาวิทยาลัยราชภัฏรำไพพรรณี** | **อาจารย์ผู้สอน:** ผศ.ดร.ชีวะ ทัศนา

---

## 🌟 จุดเด่นของระบบและสถาปัตยกรรม (Key Features & Architecture)

1. **Modern Responsive Design (Tailwind CSS 3.4 & Dark Mode Support)**
   - ออกแบบ UI/UX ระดับมืออาชีพ สไตล์ Glassmorphism
   - สลับโหมด Light / Dark แบบ Zero-Flicker ด้วย Tailwind CSS
   - แสดงผลสมบูรณ์แบบบนทุกหน้าจอ (Desktop, Tablet, Smartphone) พร้อม **Smart Mobile Bottom Navigation Bar** ทรงส่วนโค้ง 3D Bangchak Dock

2. **ระบบสูตรคณิตศาสตร์และฟิสิกส์ชั้นสูง (KaTeX & MathJax Rendering)**
   - แสดงผลสมการคณิตศาสตร์และฟิสิกส์อย่างถูกต้อง สวยงาม คมชัด ไม่มีเพี้ยน เช่น CWSI, ดัชนีหักเหแสง, กฎของชแนลล์, คลื่นซ้อนทับ และจลนศาสตร์

3. **3D Virtual Physics Lab & Interactive Simulators (Three.js & PBR)**
   - ห้องปฏิบัติการเสมือนจริง 3 มิติ เรนเดอร์ด้วย Three.js และ PBR Materials ควบคุมและหมุนมุมมองได้ 360 องศา
   - เครื่องกำเนิดคลื่นและสัญญาณเสมือนจริง **Live Multi-Channel Oscilloscope** ทำงานแบบ Real-time ด้วย Canvas API

4. **Real-time AR MediaPipe 21-Joint Hand Tracking**
   - ตรวจจับโครงกระดูกมือ 21 ข้อต่อด้วยกล้องเว็บแคมผ่าน MediaPipe Hands แบบ In-Browser 100%
   - **Palm Tilt Navigation**: ควบคุมมุมเล็งและหมุนแท่นทดลองฟิสิกส์ 3 มิติตามการเอียงของฝ่ามือ
   - **Pinch-to-Fire Gesture**: ตรวจจับการประกบนิ้ว (นิ้วโป้งกับนิ้วชี้) เพื่อยิงลำแสงเลเซอร์และสร้างเสียง Synth Effect ผ่าน Web Audio API

5. **คลังแบบจำลองอัลกอริทึมและฟิสิกส์เชิงพื้นที่ (Spatial Simulators Hub)**
   - **Coding4Kids Mission Maps**: จำลองภารกิจเดินหุ่นยนต์ตามตาราง (5x5, 6x6, 8x8) พร้อมบล็อกคำสั่งและการหลบสิ่งกีดขวาง
   - **AR 2-Hand Gesture Sensor Lab**: ตรวจจับสองมือพร้อมกัน ระบุซ้าย-ขวา และการควบคุมพิกัด
   - **AR Simple Harmonic Motion (SHM)**: การเคลื่อนที่แบบฮาร์มอนิกอย่างง่ายและลูกตุ้มนาฬิกา
   - **AR Friction & Inclined Plane**: ฟิสิกส์แรงเสียดทานและการเคลื่อนที่บนพื้นเอียง
   - **Human-Robot Collaborative Lab & Map Builder**: ชุดการเรียนรู้ Unplugged และการสร้างแผนที่โค้ดดิง

6. **ระบบคลังข้อสอบและประเมินผลก่อน-หลังเรียน (Pre-test & Post-test System)**
   - แบบทดสอบวัดผลการเรียนรู้รายสัปดาห์ (16 สัปดาห์) ครอบคลุมวิทยาการคำนวณและฟิสิกส์
   - ระบบจับเวลา, บันทึกคะแนน และแสดงผลวิเคราะห์การเรียนรู้แบบอัตโนมัติ

7. **ระบบบริหารจัดการสมาชิกและผู้ดูแลระบบ (Member & Admin CMS)**
   - ระบบสมัครสมาชิกและเข้าสู่ระบบของนักศึกษา (Authentication & Authorization)
   - ฐานข้อมูล Dual-Backend รองรับ SQLite3 และ MySQL
   - แผงควบคุมผู้ดูแลระบบ (Admin Dashboard) บริหารจัดการรายวิชา นักศึกษา ผลคะแนน และคลังข้อสอบ

8. **ผู้ช่วยอัจฉริยะ AI Agent ("น้อง LEQs AI")**
   - ติดตั้ง RAG Knowledge Base คลังความรู้วิทยาการคำนวณและฟิสิกส์เกษตรดิจิทัล
   - พูดคุย ตอบคำถาม แนะนำเนื้อหา และมีระบบเสียงสังเคราะห์ Web Speech API พร้อม Animation ลอยตัว

---

## 📂 โครงสร้างไดเรกทอรี (Directory Structure)

```text
41249CS2027/
├── index.html                   # หน้าหลักรายวิชาและ Interactive Courseware
├── admin.php                    # แผงควบคุมระบบสำหรับอาจารย์และผู้ดูแลระบบ
├── course.md                    # เอกสารรายละเอียดหลักสูตร มคอ.3 ฉบับสมบูรณ์
├── MASTER_PLAN.md               # สถาปัตยกรรมและแผนการพัฒนาระบบ
├── api/                         # RESTful API Endpoints (Auth, Quizzes, Labs, Logs)
├── assets/                      # ทรัพยากรเว็บไซต์ (CSS, JavaScript, Media, AI Agent)
├── config/                      # การตั้งค่าระบบ ฐานข้อมูล และความปลอดภัย
├── data/                        # คลังข้อมูล JSON (แบบทดสอบ, ใบงาน, เกณฑ์ประเมิน, ผู้ใช้งาน)
├── database/                    # โครงสร้างฐานข้อมูล SQLite3 / MySQL และสคริปต์ Migration
├── lessons/                     # เนื้อหาบทเรียนรายสัปดาห์ สัปดาห์ที่ 1 - 16
└── simulations/                 # คลังแบบจำลอง AR MediaPipe, Coding4Kids และ 3D Labs
    ├── coding4kid/              # Mission Maps, Unplugged Logic, Robot Simulators
    └── mediapipe_hands/         # AR Hand Tracking, SHM, Incline Plane Labs
```

---

## 🚀 การติดตั้งและใช้งาน (Getting Started)

### การรันบน Local Server (XAMPP / Apache / PHP)
1. ติดตั้ง XAMPP หรือ PHP Web Server (PHP 7.4+ หรือ PHP 8.x)
2. วางโฟลเดอร์โครงการไว้ใน `htdocs/`
3. เปิดเว็บบราวเซอร์แล้วไปที่:
   ```text
   http://localhost/G2_Education_Curriculum_Exam/41249CS2027/
   ```

### การเข้าใช้งานระบบเซิร์ฟเวอร์จริง
* **URL:** `https://chewa.rbru.ac.th/cs2027/`
