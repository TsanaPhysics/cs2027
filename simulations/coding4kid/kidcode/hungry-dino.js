// MakeCode Arcade: Hungry Dino
// แนะนำสำหรับ ป.3-ป.4

// 1. ตั้งค่าเริ่มต้นและสร้างไดโนเสาร์
info.setLife(3)
let dino = sprites.create(img`
    . . . . . . . . . . . . 7 7 7 . 
    . . . . . . . . . . . 7 7 7 7 7 
    . . . . . . . . . . . 7 7 f 7 7 
    . . . . . . 7 7 7 7 7 7 7 7 7 7 
    . . . . . 7 7 7 7 7 7 7 . . . . 
    . 7 7 7 7 7 7 7 7 7 7 7 . . . . 
    . 7 7 7 7 7 7 7 7 7 7 7 . . . . 
    . . . . . 7 7 7 7 7 7 7 . . . . 
    . . . . . 7 7 . . 7 7 . . . . . 
    . . . . . 7 7 . . 7 7 . . . . . 
`, SpriteKind.Player)
controller.moveSprite(dino)

// 2. สุ่มสร้างลูกไฟ (Enemy) ทุกๆ 2 วินาที
game.onUpdateInterval(2000, function () {
    let fireball = sprites.createProjectileFromSide(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . 2 2 2 2 . . . . . . 
        . . . . . 2 4 4 4 4 2 . . . . . 
        . . . . 2 4 5 5 5 4 4 2 . . . . 
        . . . . 2 4 5 5 5 4 4 2 . . . . 
        . . . . . 2 4 4 4 4 2 . . . . . 
        . . . . . . 2 2 2 2 . . . . . . 
    `, -60, 0) // พุ่งจากขวาไปซ้าย
    fireball.y = Math.randomRange(10, 110)
    fireball.setKind(SpriteKind.Enemy)
})

// 3. เมื่อชนลูกไฟ (ลดพลังชีวิต)
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    info.changeLifeBy(-1)
    otherSprite.destroy(effects.fire, 100)
    scene.cameraShake(4, 500)
    music.pewPew.play()
})

// 4. สุ่มสร้างเบอร์เกอร์ (เพิ่มคะแนน)
game.onUpdateInterval(3500, function() {
    let food = sprites.createProjectileFromSide(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . 7 7 7 7 . . . . . . 
        . . . 7 7 7 e e e e 7 7 7 . . . 
        . . e e e e e e e e e e e e . . 
        . . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
        . . . 5 5 5 5 5 5 5 5 5 5 . . . 
        . . . . 7 7 e e e e 7 7 . . . . 
        . . . . . . . . . . . . . . . . 
    `, -40, 0)
    food.y = Math.randomRange(10, 110)
    food.setKind(SpriteKind.Food)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function(sprite, otherSprite) {
    info.changeScoreBy(5)
    otherSprite.destroy()
    music.baDing.play()
})
