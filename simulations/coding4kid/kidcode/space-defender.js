[ignoring loop detection]
// Space Defender: Advanced Edition
// สำหรับ ป.5 - ป.6: ระบบอาวุธและบอส

let ship = sprites.create(img`
    . . . . . . . 9 9 . . . . . . . 
    . . . . . . 9 9 9 9 . . . . . . 
    . . . . . 9 9 1 1 9 9 . . . . . 
    . . . . 9 9 1 1 1 1 9 9 . . . . 
    . . . 9 9 9 9 9 9 9 9 9 9 . . . 
    . . 9 9 b b 9 9 9 9 b b 9 9 . . 
`, SpriteKind.Player)
ship.y = 110
controller.moveSprite(ship, 100, 0)
ship.setStayInScreen(true)

// ระบบยิงกระสุน (Weapon System)
controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    let laser = sprites.createProjectileFromSprite(img`
        . . 4 . . 
        . . 4 . . 
        . . 4 . . 
    `, ship, 0, -150)
    music.pewPew.play()
})

// สุ่มฝูงบินศัตรู
game.onUpdateInterval(800, function () {
    let alien = sprites.createProjectileFromSide(img`
        . . . . f f f f . . . . 
        . . . f f 2 2 f f . . . 
        . . f f 2 2 2 2 f f . . 
        . . . f f 2 2 f f . . . 
    `, 0, 60)
    alien.x = Math.randomRange(10, 150)
    alien.setKind(SpriteKind.Enemy)
})

// ระบบ Boss (จะออกมาเมื่อคะแนนถึง 50)
let bossActive = false
game.onUpdate(function() {
    if (info.score() >= 50 && !bossActive) {
        bossActive = true
        let boss = sprites.create(img`
            . . . . . . f f f f f f . . . . . . 
            . . . . f f f 4 4 4 4 f f f . . . . 
            . . f f f 4 4 4 4 4 4 4 4 f f f . . 
            . . f 4 4 4 4 4 4 4 4 4 4 4 4 f . . 
        `, SpriteKind.Enemy)
        boss.y = 30
        boss.vx = 50
        boss.setBounceOnWall(true)
        boss.sayText("I am the BOSS!", 2000)
    }
})

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function(sprite, otherSprite) {
    otherSprite.destroy(effects.fire, 200)
    sprite.destroy()
    info.changeScoreBy(1)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function(sprite, otherSprite) {
    info.changeLifeBy(-1)
    otherSprite.destroy()
    scene.cameraShake(4, 500)
})
