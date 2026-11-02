// MakeCode Arcade: Star Catcher
// แนะนำสำหรับ ป.1-ป.3

// 1. สร้างตัวละครผู้เล่น (รูปแมว)
let mySprite = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . 5 5 5 5 . . . . . . 
    . . . . . 5 5 5 5 5 5 . . . . . 
    . . . . 5 5 5 5 5 5 5 5 . . . . 
    . . . . 5 d 5 5 5 5 d 5 . . . . 
    . . . . 5 5 5 5 5 5 5 5 . . . . 
    . . . . 5 5 f 5 5 f 5 5 . . . . 
    . . . . 5 5 5 f f 5 5 5 . . . . 
    . . . . . 5 5 5 5 5 5 . . . . . 
    . . . . . . 5 5 5 5 . . . . . . 
    . . . . . . . . . . . . . . . . 
`, SpriteKind.Player)

// บังคับด้วยปุ่มกด
controller.moveSprite(mySprite)

// 2. สร้างดวงดาว (Food)
let star = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . 5 . . . . . . . . 
    . . . . . . 5 5 5 . . . . . . . 
    . . . . . 5 5 5 5 5 . . . . . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 . . . 
    . . . 5 5 5 5 5 5 5 5 5 . . . . 
    . . . . 5 5 5 5 5 5 5 . . . . . 
    . . . 5 5 5 5 5 5 5 5 5 . . . . 
    . . 5 5 5 5 5 5 5 5 5 5 5 . . . 
    . . . . . 5 5 5 5 5 . . . . . . 
    . . . . . . 5 5 5 . . . . . . . 
    . . . . . . . 5 . . . . . . . . 
`, SpriteKind.Food)

// 3. ตรรกะการเก็บดวงดาว
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    info.changeScoreBy(1)
    // สุ่มตำแหน่งใหม่ให้ดวงดาว
    otherSprite.setPosition(Math.randomRange(10, 150), Math.randomRange(10, 110))
    // เล่นเสียง
    music.baDing.play()
    // เอฟเฟกต์แอนิเมชัน
    sprite.startEffect(effects.confetti, 200)
})
