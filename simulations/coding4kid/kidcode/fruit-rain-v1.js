[ignoring loop detection]
/**
 * =======================
 * 
 * เมื่อรับผลไม้ได้
 * 
 * =======================
 */
/**
 * =======================
 * 
 * สุ่มผลไม้ตก
 * 
 * =======================
 */
/**
 * Fruit Rain v1
 */
/**
 * =======================
 * 
 * สร้างตะกร้า (สร้างครั้งเดียว)
 * 
 * =======================
 */
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    info.changeScoreBy(1)
    music.baDing.play()
    otherSprite.destroy()
})
let apple: Sprite = null
let basket = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . 3 . . . . . . . . . . 3 . . 
    . . 3 . . . . . . . . . . 3 . . 
    . . 3 3 3 3 3 3 3 3 3 3 3 3 . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
basket.y = 110
controller.moveSprite(basket, 100, 0)
basket.setStayInScreen(true)
game.onUpdateInterval(1000, function () {
    apple = sprites.createProjectileFromSide(img`
        . . . e e e . . . 
        . . e 2 2 2 e . . 
        . e 2 2 2 2 2 e . 
        . e 2 2 2 2 2 e . 
        . . e 2 2 2 e . . 
        . . . e e e . . . 
        `, 0, 50)
    apple.x = randint(10, 150)
    apple.setKind(SpriteKind.Food)
})
