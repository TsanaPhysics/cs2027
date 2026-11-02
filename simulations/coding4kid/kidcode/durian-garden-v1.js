[ignoring loop detection]
/**
 * =======================
 * 🌳 เกมดูแลสวนทุเรียน (Durian Garden Care)
 * =======================
 */

// 1. ตั้งค่าสวนและตัวละคร
scene.setBackgroundColor(7) // สีพื้นหญ้า
let gardener = sprites.create(img`
    . . . . . . 5 5 5 . . . . . . . 
    . . . . . 5 5 5 5 5 . . . . . . 
    . . . . . d d d d d . . . . . . 
    . . . . . d 1 d 1 d . . . . . . 
    . . . . . d d d d d . . . . . . 
    . . . . . . . 8 . . . . . . . . 
    . . . . 8 8 8 8 8 8 8 . . . . . 
    . . . . 8 . . 8 . . 8 . . . . . 
    . . . . 8 . . 8 . . 8 . . . . . 
    . . . . . . . 8 . . . . . . . . 
    . . . . . . 8 . 8 . . . . . . . 
    . . . . . . 8 . 8 . . . . . . . 
    . . . . . . f . f . . . . . . . 
    `, SpriteKind.Player)
gardener.setPosition(80, 100)
controller.moveSprite(gardener, 100, 100)
gardener.setStayInScreen(true)

// 2. ทุเรียนหล่นจากต้น
game.onUpdateInterval(1500, function () {
    let durian = sprites.createProjectileFromSide(img`
        . . . . . . . 7 . . . . . . . . 
        . . . . . . . 7 . . . . . . . . 
        . . . . . . a a a . . . . . . . 
        . . . . . a a 5 a a . . . . . . 
        . . . . a a 5 5 5 a a . . . . . 
        . . . a a 5 5 5 5 5 a a . . . . 
        . . a a a 5 5 5 5 5 a a a . . . 
        . . . a a 5 5 5 5 5 a a . . . . 
        . . . . a a 5 5 5 a a . . . . . 
        . . . . . a a 5 a a . . . . . . 
        . . . . . . a a a . . . . . . . 
        . . . . . . . . . . . . . . . . 
        `, 0, 50)
    durian.x = randint(10, 150)
    durian.setKind(SpriteKind.Food)
})

// 3. แมลงศัตรูพืชหล่นลงมา
game.onUpdateInterval(2500, function () {
    let bug = sprites.createProjectileFromSide(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . f f f . . . . . . . 
        . . . . . f 2 f 2 f . . . . . . 
        . . . . . f f f f f . . . . . . 
        . . . f f f f f f f f f . . . . 
        . . . f f f f f f f f f . . . . 
        . . . . f f f f f f f . . . . . 
        . . . . . f . f . f . . . . . . 
        `, 0, 70)
    bug.x = randint(10, 150)
    bug.setKind(SpriteKind.Enemy)
})

// 4. เมื่อเก็บทุเรียนได้
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    otherSprite.destroy(effects.confetti, 200)
    info.changeScoreBy(1)
    music.baDing.play()
})

// 5. เมื่อโดนแมลงกัด
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.destroy()
    scene.cameraShake(4, 200)
    info.changeLifeBy(-1)
    music.buzzer.play()
})

// ตั้งค่าเริ่มต้น
info.setScore(0)
info.setLife(5)
game.showLongText("🌳 ยินดีต้อนรับสู่สวนทุเรียน!\n\n🎮 บังคับชาวสวนเก็บทุเรียนที่หล่น\n❌ ระวังแมลงศัตรูพืชด้วยนะ!", DialogLayout.Bottom)
