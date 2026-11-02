// MakeCode Arcade: Classic Platformer
// แนะนำสำหรับ ป.4-ป.6

// 1. ตั้งค่าตัวละครและฟิสิกส์ (แรงโน้มถ่วง)
let hero = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . f f f f . . . . . 
    . . . . . . f f f f f f . . . . 
    . . . . . . f f f f f f . . . . 
    . . . . . . f f f f f f . . . . 
    . . . . . . . f f f f . . . . . 
    . . . . . . . 8 8 8 8 . . . . . 
    . . . . . . 8 8 8 8 8 8 . . . . 
    . . . . . . 8 8 8 8 8 8 . . . . 
    . . . . . . . 8 . . 8 . . . . . 
`, SpriteKind.Player)

hero.ay = 350 // Gravity (แรงดึงดูด)
controller.moveSprite(hero, 100, 0) // บังคับเดินซ้าย-ขวาเท่านั้น
scene.cameraFollowSprite(hero)

// 2. ตรรกะการกระโดด (กระโดดได้เฉพาะตอนอยู่บนพื้น)
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (hero.isHittingTile(CollisionDirection.Bottom)) {
        hero.vy = -175 // กระโดดขึ้น (ความเร็วแกน Y เป็นลบ)
        music.jumpUp.play()
    }
})

// 3. การสร้างฉาก (Tilemap) 
// หมายเหตุ: ใน JavaScript ของ MakeCode แนะนำให้อ้างอิงผ่านโหมดบล็อกจะง่ายกว่า
// นี่คือโค้ดจำลองการตั้งค่าพื้นฐาน
scene.setBackgroundColor(9) // สีฟ้า (ท้องฟ้า)

// 4. เมื่อตกเหว (เกมโอเวอร์)
game.onUpdate(function() {
    if (hero.y > 120) {
        game.over(false)
    }
})

// 5. เมื่อถึงจุดหมาย (ธงชัย)
// แนะนำให้คุณครูวาด Tilemap ในโหมดบล็อก แล้วเลือก Tile เป็นจุดสิ้นสุด
// แล้วใช้คำสั่ง scene.onHitTile เพื่อเช็คการชนะเกม
