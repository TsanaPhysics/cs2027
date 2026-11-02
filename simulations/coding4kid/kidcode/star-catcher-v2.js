[ignoring loop detection]
// Star Catcher v2: 2.5D Shading & Depth
// เวอร์ชันอัปเกรดกราฟิกให้มีมิติ

scene.setBackgroundColor(11) // ท้องฟ้าสีคราม

// 1. สร้างตัวละครที่มีเฉดสี (Shaded Sprite)
// เพิ่มเงาด้านข้างเพื่อให้ดูเป็นทรงกลม
let player = sprites.create(img`
    . . . . . 5 5 5 5 . . . . . 
    . . . 5 5 d d d d 5 5 . . . 
    . . 5 d d d d d d d d 5 . . 
    . 5 d d d f d d f d d d 5 . 
    . 5 d d d d d d d d d d 5 . 
    . 5 d d d f f f f d d d 5 . 
    . 5 d d f d d d d f d d 5 . 
    . . 5 d d d d d d d d 5 . . 
    . . . 5 5 5 5 5 5 5 5 . . . 
    . . 4 4 5 5 5 5 5 5 4 4 . . 
    . 4 4 4 4 4 4 4 4 4 4 4 4 . 
`, SpriteKind.Player)

controller.moveSprite(player)

// 2. ระบบเงา (Shadow) ให้ดูเหมือนลอยอยู่บนพื้น
let shadow = sprites.create(img`
    . . . . . f f f f . . . . . 
    . . f f f f f f f f f f . . 
    . f f f f f f f f f f f f . 
    . . f f f f f f f f f f . . 
    . . . . . f f f f . . . . . 
`, SpriteKind.Food) // ใช้ Kind อื่นเพื่อไม่ให้ชน
shadow.setFlag(SpriteFlag.Ghost, true)
shadow.z = -1 // อยู่ใต้ตัวละคร

// อัปเดตตำแหน่งเงาตามตัวละคร
game.onUpdate(function() {
    shadow.x = player.x
    shadow.y = player.y + 12
    // เพิ่มมิติ: ขนาดตัวละครเปลี่ยนตามตำแหน่ง Y (Perspective)
    player.setScale(0.8 + (player.y / 200), ScaleAnchor.Middle)
})

// 3. ดวงดาวที่มีประกาย (Sparkling Star)
let star = sprites.create(img`
    . . . . . . . f . . . . . . . 
    . . . . . . f 5 f . . . . . . 
    . . . . . f 5 5 5 f . . . . . 
    . f f f f 5 5 5 5 5 f f f f . 
    . . f 5 5 5 5 5 5 5 5 5 f . . 
    . . . f 5 5 5 5 5 5 5 f . . . 
    . . f 5 5 5 5 5 5 5 5 5 f . . 
    . f f f f 5 5 5 5 5 f f f f . 
    . . . . . f 5 5 5 f . . . . . 
    . . . . . . f 5 f . . . . . . 
    . . . . . . . f . . . . . . . 
`, SpriteKind.Food)

sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    info.changeScoreBy(1)
    otherSprite.setPosition(Math.randomRange(10, 150), Math.randomRange(10, 110))
    music.baDing.play()
    sprite.startEffect(effects.halo, 200)
})
