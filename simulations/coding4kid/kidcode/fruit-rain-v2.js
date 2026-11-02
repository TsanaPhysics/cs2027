[ignoring loop detection]
// Fruit Rain v2: The Challenge
// เพิ่มอุปสรรคและระบบพลังชีวิต

info.setLife(3)
let basket = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . 4 4 4 4 4 4 4 4 4 4 4 4 . . 
    . . 4 e e e e e e e e e e 4 . . 
    . . 4 e e e e e e e e e e 4 . . 
    . . . 4 4 4 4 4 4 4 4 4 4 . . . 
`, SpriteKind.Player)
basket.y = 110
controller.moveSprite(basket, 100, 0)

// สุ่มผลไม้ดี
game.onUpdateInterval(1000, function () {
    let apple = sprites.createProjectileFromSide(img`
        . . . . . . . e e . . . . . . . 
        . . . . . e 2 2 2 2 e . . . . . 
        . . . . e 2 2 2 2 2 2 e . . . . 
        . . . . 2 2 2 2 2 2 2 2 . . . . 
        . . . . e 2 2 2 2 2 2 e . . . . 
    `, 0, 50)
    apple.x = Math.randomRange(10, 150)
    apple.setKind(SpriteKind.Food)
})

// เพิ่ม: สุ่มระเบิด (Enemy)
game.onUpdateInterval(2500, function () {
    let bomb = sprites.createProjectileFromSide(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . f f . . . . . . . 
        . . . . . f f 1 1 f f . . . . . 
        . . . . f 1 1 1 1 1 1 f . . . . 
        . . . . f 1 1 1 1 1 1 f . . . . 
        . . . . . f f 1 1 f f . . . . . 
    `, 0, 70)
    bomb.x = Math.randomRange(10, 150)
    bomb.setKind(SpriteKind.Enemy)
})

// เมื่อรับผลไม้
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    info.changeScoreBy(1)
    otherSprite.destroy()
})

// เมื่อชนระเบิด
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    info.changeLifeBy(-1)
    otherSprite.destroy(effects.disintegrate, 200)
    scene.cameraShake(4, 500)
})

// เพิ่ม: ถ้าผลไม้ตกพื้น (Miss) ให้ลดเลือด
scene.onHitWall(SpriteKind.Food, function(sprite, location) {
    // หมายเหตุ: ต้องตั้งค่าพื้นเป็นกำแพงก่อน
})
