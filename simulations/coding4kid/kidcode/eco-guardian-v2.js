[ignoring loop detection]
// Eco-Guardian v2: Ocean Cleaner
// ภารกิจกู้โลกใต้ทะเล: เก็บขยะและปกป้องสัตว์น้ำ

scene.setBackgroundColor(9) // สีน้ำทะเล
effects.bubbles.startScreenEffect() // เอฟเฟกต์ฟองอากาศ

// 1. ตัวละครนักประดาน้ำ
let diver = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . 5 5 5 . . . . . . . 
    . . . . 5 5 5 5 5 5 5 . . . . . 
    . . . . 5 5 5 f f 5 5 . . . . . 
    . . . . 5 5 5 5 5 5 5 . . . . . 
    . . 5 5 5 5 5 5 5 5 5 5 . . . . 
    . . 5 . . 5 . . . 5 . . . . . . 
`, SpriteKind.Player)
controller.moveSprite(diver)
diver.setStayInScreen(true)

// 2. สุ่มขยะทะเล (ขวดพลาสติก/อวน)
game.onUpdateInterval(2000, function() {
    let trash = sprites.createProjectileFromSide(img`
        . . . . . . . f f . . . . . . . 
        . . . . . f f f f f f . . . . . 
        . . . . f f f f f f f f . . . . 
    `, -50, 0)
    trash.y = Math.randomRange(10, 110)
    trash.setKind(SpriteKind.Food)
})

// 3. สุ่มสัตว์ทะเล (ที่ต้องหลีกเลี่ยงการชน)
game.onUpdateInterval(3000, function() {
    let fish = sprites.createProjectileFromSide(img`
        . . . . . . . 4 4 . . . . . . . 
        . . . . . . 4 4 4 4 . . . . . . 
        . . . . . 4 4 4 4 4 4 4 . . . . 
    `, -70, 0)
    fish.y = Math.randomRange(10, 110)
    fish.setKind(SpriteKind.Enemy)
})

// เก็บขยะ = คะแนน
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function(sprite, otherSprite) {
    info.changeScoreBy(10)
    otherSprite.destroy(effects.disintegrate, 200)
    music.baDing.play()
})

// ชนปลา = พลังชีวิตลด (รบกวนสัตว์น้ำ)
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function(sprite, otherSprite) {
    info.changeLifeBy(-1)
    otherSprite.sayText("Ouch!", 500)
    scene.cameraShake(4, 500)
    music.smallCrash.play()
})

// 4. ระบบอากาศหายใจ (Timer)
let air = 100
game.onUpdateInterval(1000, function() {
    air -= 2
    if (air <= 20) {
        diver.sayText("Need Air!", 1000)
    }
    if (air <= 0) {
        game.over(false)
    }
})
