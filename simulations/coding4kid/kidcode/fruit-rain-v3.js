[ignoring loop detection]
// Fruit Rain v3: The Full Game
// สมบูรณ์แบบ: มีเอฟเฟกต์ เสียง และระดับความยากที่เพิ่มขึ้น

info.setLife(3)
info.setScore(0)
scene.setBackgroundColor(11)

let basket = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . 4 4 4 4 4 4 4 4 4 4 4 4 . . 
    . . 4 e e e e e e e e e e 4 . . 
    . . . 4 4 4 4 4 4 4 4 4 4 . . . 
`, SpriteKind.Player)
basket.y = 110
controller.moveSprite(basket, 120, 0)

// ระบบระดับความยาก (Difficulty)
let spawnRate = 1000
let fallSpeed = 50

game.onUpdate(function() {
    // ทุกๆ 20 คะแนน จะทำให้เกมยากขึ้น
    fallSpeed = 50 + (info.score() / 5)
})

// สุ่มผลไม้
game.onUpdateInterval(spawnRate, function () {
    let fruit = sprites.createProjectileFromSide(img`
        . . . . . . 2 2 2 2 . . . . . . 
        . . . . . 2 2 2 2 2 2 . . . . . 
    `, 0, fallSpeed)
    fruit.x = Math.randomRange(10, 150)
    fruit.setKind(SpriteKind.Food)
    
    // สุ่มผลไม้สีทอง (Bonus)
    if (Math.percentChance(10)) {
        fruit.setImage(img`
            . . . . . . 5 5 5 5 . . . . . . 
            . . . . . 5 5 5 5 5 5 . . . . . 
        `)
        fruit.setKind(SpriteKind.Projectile) // พิเศษ
    }
})

// เก็บผลไม้ปกติ
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    info.changeScoreBy(1)
    otherSprite.destroy()
    sprite.startEffect(effects.bubbles, 200)
    music.baDing.play()
})

// เก็บผลไม้สีทอง
sprites.onOverlap(SpriteKind.Player, SpriteKind.Projectile, function (sprite, otherSprite) {
    info.changeScoreBy(10)
    otherSprite.destroy()
    sprite.startEffect(effects.confetti, 500)
    music.magicWand.play()
})

// ระบบจบเกมสวยๆ
info.onLifeZero(function() {
    game.over(false, effects.melt)
})
