[ignoring loop detection]
/**
 * =======================
 * 🚀 เกมตะลุยอวกาศ (Space Adventure)
 * =======================
 */

// 1. ตั้งค่าฉากและตัวละคร
scene.setBackgroundColor(15) // สีดำอวกาศ
effects.starField.startScreenEffect()

let ship = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . 9 . . . . . . . . 
    . . . . . . 9 9 9 . . . . . . . 
    . . . . . . 8 8 8 . . . . . . . 
    . . . . . . 8 1 8 . . . . . . . 
    . . . . . 8 8 1 8 8 . . . . . . 
    . . . . 8 8 8 1 8 8 8 . . . . . 
    . . . . 8 8 1 1 1 8 8 . . . . . 
    . . . . 8 1 1 1 1 1 8 . . . . . 
    . . . . 1 1 1 1 1 1 1 . . . . . 
    . . . . 2 2 2 2 2 2 2 . . . . . 
    . . . . . 2 5 2 5 2 . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
ship.setPosition(80, 100)
controller.moveSprite(ship, 100, 100)
ship.setStayInScreen(true)

// 2. การยิงกระสุน (ปุ่ม A)
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    let laser = sprites.createProjectileFromSprite(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . 4 . . . . . . . . 
        . . . . . . . 4 . . . . . . . . 
        . . . . . . . 4 . . . . . . . . 
        . . . . . . . 4 . . . . . . . . 
        . . . . . . . 4 . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, ship, 0, -100)
    music.pewPew.play()
})

// 3. สร้างศัตรู (อุกกาบาต)
game.onUpdateInterval(800, function () {
    let enemy = sprites.createProjectileFromSide(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . f f f f f . . . . . . . 
        . . . f f f f f f f . . . . . . 
        . . f f f e e e f f f . . . . . 
        . f f f e e e e e f f f . . . . 
        . f f e e e e e e e f f . . . . 
        . f f e e e e e e e f f . . . . 
        . f f f e e e e e f f f . . . . 
        . . f f f e e e f f f . . . . . 
        . . . f f f f f f f . . . . . . 
        . . . . f f f f f . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, 0, 60)
    enemy.x = randint(10, 150)
    enemy.setKind(SpriteKind.Enemy)
})

// 4. เมื่อกระสุนโดนศัตรู
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.destroy(effects.disintegrate, 200)
    sprite.destroy()
    info.changeScoreBy(10)
})

// 5. เมื่อศัตรูชนยาน
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.destroy()
    scene.cameraShake(4, 500)
    info.changeLifeBy(-1)
})

// ตั้งค่าเริ่มต้น
info.setScore(0)
info.setLife(3)
