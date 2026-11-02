[ignoring loop detection]
// Speed Racer v2: Track Master
// แข่งในสนามจริง: ห้ามออกนอกเส้นทาง!

let speed = 100
let car = sprites.create(img`
    . . . . . f f f f . . . . . 
    . . . f f 2 2 2 2 f f . . . 
    . . f 2 2 2 2 2 2 2 2 f . . 
    . . f f f f f f f f f f . . 
    . . f 2 2 2 2 2 2 2 2 f . . 
    . . f f f f f f f f f f . . 
`, SpriteKind.Player)

controller.moveSprite(car, speed, speed)
scene.cameraFollowSprite(car)

// 1. การตั้งค่าสนาม (Tilemap)
// หมายเหตุ: ใน JS คุณครูต้องวาด Tilemap ในโหมด Blocks ก่อน
// นี่คือตัวอย่างการเช็ค Tile (Logic)
game.onUpdate(function() {
    // ถ้าตัวรถ "ไม่ได้" อยู่บนถนน (สมมติว่าถนนคือ Tile สีเทา)
    // ให้ลดความเร็วลงเหลือ 30%
    if (!car.isHittingTile(CollisionDirection.All)) {
        // (ในทางปฏิบัติจะใช้ scene.getTileAttribute เพื่อเช็คสีหรือชนิดของพื้น)
        // ตัวอย่าง: ถ้าออกนอกทาง ให้ควันขึ้น
        car.startEffect(effects.ashes, 100)
    }
})

// 2. ระบบน้ำมัน/ความร้อน (Variable)
let fuel = 100
game.onUpdateInterval(1000, function() {
    fuel -= 1
    if (fuel <= 0) {
        game.showDialog("Out of Fuel!", "Game Over")
        game.over(false)
    }
})

// 3. จุดเช็คพอยต์ (Checkpoints)
scene.onOverlapTile(SpriteKind.Player, img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . f . f . f . f . f . f . f . f 
    . f f f f f f f f f f f f f f f 
`, function(sprite, location) {
    info.changeScoreBy(100) // ผ่านเส้นชัย
    music.magicWand.play()
})
