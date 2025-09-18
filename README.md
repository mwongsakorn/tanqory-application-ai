# Tanqory AI Demo (Expo)

Tanqory AI Demo คือแอประบบสนทนาแบบ ChatGPT บน Expo/React Native ที่ออกแบบสำหรับนำเสนอขีดความสามารถของ Tanqory Platform และ Company Memory ที่เก็บไว้ใน Markdown ไฟล์ใน `src/memory`. ตัวแอพให้ประสบการณ์แชทคล้าย ChatGPT พร้อมการปรับโทนคำตอบ, quick prompt, feedback ต่อข้อความ และ haptic feedback เต็มรูปแบบ

## คุณสมบัติเด่น

- 🌗 **UI สไตล์ Facebook Dark**: พื้นหลัง #0C0D10 และสีหลัก #E1FF00
- 🔐 **Login พร้อม persona**: เลือกบทบาท (Founder, Marketer, Developer) เพื่อให้คำตอบตรงกับบริบท
- ⚡ **Quick Prompts + Haptics**: ปุ่มคำถามลัดพร้อมสั่นตอบสนองทันที
- 🧠 **Company Memory Integration**: โหลด Markdown ทั้งหมดครั้งเดียวแล้วส่งให้ GPT เพื่ออ้างอิงข้อมูลภายใน
- 🎞 **Typewriter Animation**: ข้อความผู้ช่วยค่อย ๆ พิมพ์พร้อม caret กะพริบเหมือน ChatGPT
- 🎯 **Tone Settings**: ผู้ใช้สลับโหมดคำตอบ Balanced / Detailed / Concise ได้จากแผงตั้งค่า
- 👍 **Feedback ต่อข้อความ AI**: ปุ่ม up/down ให้ผู้ใช้บอกความพึงพอใจ
- 🔄 **เริ่มสนทนาใหม่รวดเร็ว**: ไอคอน `+` สำหรับเคลียร์บทสนทนา และปุ่มตั้งค่าแบบโมดัล

## โครงสร้างหลัก

```
.
├── App.tsx                         # Root component
├── app.config.js                   # โหลด environment (.env) และ config Expo
├── metro.config.js                 # เพิ่ม asset ext .md
├── README.md
├── src
│   ├── components
│   │   ├── ChatComposer.tsx        # กล่องพิมพ์พร้อมสถานะกำลังส่ง
│   │   ├── ChatMessageBubble.tsx   # Bubble ข้อความ + animation + feedback
│   │   └── TypingIndicator.tsx
│   ├── screens
│   │   ├── LoginScreen.tsx
│   │   └── ChatScreen.tsx          # โค้ดหลักของ Tanqory AI
│   ├── services
│   │   ├── memory.ts               # โหลด/แคช Markdown memory
│   │   └── openai.ts               # Wrapper เรียก OpenAI Responses API
│   ├── navigation
│   │   └── RootNavigator.tsx
│   └── memory                      # Company Memory (.md)
└── .env.example                    # ตัวอย่าง environment variables
```

## การติดตั้งและรัน

1. ติดตั้ง dependency
   ```bash
   npm install
   ```
2. สร้างไฟล์ `.env.local` (หรือ `.env`) ที่ root แล้วกำหนดค่า
   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=sk-********
   EXPO_PUBLIC_OPENAI_MODEL=gpt-4.1-mini
   ```
3. รัน Expo Dev Server
   ```bash
   npm start
   ```
4. เปิดผ่าน Expo Go (SDK 54 ขึ้นไป) หรือ simulator แล้วเข้าสู่ระบบด้วยข้อมูล demo ที่มีให้

> **หมายเหตุความปลอดภัย:** ค่าคีย์ `EXPO_PUBLIC_*` จะถูก bundle ไปยังแอพเสมอ ใช้เพื่อการเดโมเท่านั้น หากจะใช้จริงควรมี backend/proxy คอยเรียก OpenAI

## ฟีเจอร์ที่เพิ่มเข้ามาเพื่อให้เหมือน ChatGPT

- ส่ง context ย้อนหลัง (ล่าสุด 6 ข้อความ) เพื่อให้ AI ตอบต่อเนื่อง
- ปรับโทนคำตอบผ่านโมดัลได้ทันที
- แสดง badge ว่า “ข้อมูลจาก Company Memory” + ปุ่ม feedback
- ปุ่ม quick prompt พร้อม haptics, ป้องกันการกดระหว่างกำลังส่งคำตอบ
- เคลียร์บทสนทนาและตั้งค่าได้ด้วยไอคอนขนาดเล็กที่มุมขวาบน

## Known Limitations

- ยังไม่มีการ stream คำตอบ (ข้อความจะขึ้นเมื่อ API ตอบกลับสำเร็จ)
- การตอบ feedback ยังไม่ส่งไป backend (เก็บไว้ใน state ภายในเท่านั้น)
- API key ยังถูกจัดเก็บฝั่ง client สำหรับการสาธิต

## เส้นทางแนะนำต่อยอด

- เพิ่ม backend proxy เพื่อปกป้อง API key และจัดการ RAG ขั้นสูง
- รองรับการ stream ข้อความจาก OpenAI เพื่อให้พิมพ์แบบเรียลไทม์จริง
- สร้างหน้า “Conversation History” และระบบเก็บบทสนทนา
- เพิ่ม quick prompt แบบเลือกหมวดหมู่หรือค้นหาได้

---

ถ้าต้องการอัปเดต Company Memory ให้ regenerate `src/memory/manifest.ts` (รันสคริปต์ที่ใช้ require) แล้วรีสตาร์ท Expo Dev Server ก่อนใช้งานเพื่อให้ asset ถูก bundle ใหม่
