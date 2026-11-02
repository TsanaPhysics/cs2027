[ignoring loop detection]
// Speed Racer v1: Highway Dodge
// พื้นฐาน: บังคับรถหลบสิ่งกีดขวางบนถนน

scene.setBackgroundColor(7) // สีถนน (เทา)

// 1. สร้างรถของผู้เล่น
let car = sprites.create(img`
    . . . . . . . 2 2 . . . . . . . 
    . . . . . . 2 2 2 2 . . . . . . 
    . . . . 2 2 2 2 2 2 2 2 . . . . 
    . . . f f 2 2 2 2 2 2 f f . . . 
    . . . f f 2 2 2 2 2 2 f f . . . 
    . . . . 2 2 2 2 2 2 2 2 . . . . 
    . . . . 2 2 2 2 2 2 2 2 . . . . 
    . . . f f 2 2 2 2 2 2 f f . . . 
    . . . f f 2 2 2 2 2 2 f f . . . 
`, SpriteKind.Player)
car.y = 100
controller.moveSprite(car, 100, 0) // บังคับแค่ซ้าย-ขวา

// 2. สร้างเส้นถนนที่เลื่อนลงมา (จำลองการวิ่ง)
game.onUpdateInterval(200, function () {
    let line = sprites.createProjectileFromSide(img`
        . 5 . 
        . 5 . 
        . 5 . 
        . 5 . 
    `, 0, 100)
    line.x = 80
    line.z = -1 // อยู่ใต้รถ
})

// 3. สุ่มรถคันอื่นสวนทางมา
game.onUpdateInterval(1500, function () {
    let enemy = sprites.createProjectileFromSide(img`
        . . . f f f f f f f f . . . 
        . . . f 4 4 4 4 4 4 f . . . 
        . . . f 4 4 4 4 4 4 f . . . 
        . . . f f f f f f f f . . . 
    `, 0, 120)
    enemy.x = Math.randomRange(20, 140)
    enemy.setKind(SpriteKind.Enemy)
})

// 4. เมื่อชนกัน
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    scene.cameraShake(4, 500)
    otherSprite.destroy(effects.disintegrate, 200)
    music.bigCrash.play()
    game.over(false)
})
