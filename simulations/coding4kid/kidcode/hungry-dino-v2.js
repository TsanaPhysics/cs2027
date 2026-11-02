[ignoring loop detection]
// Hungry Dino v2: Parallax & 2.5D Shading
// อัปเกรดฉากหลังและเอฟเฟกต์

info.setLife(3)
scene.setBackgroundColor(13) // พื้นหลังสีน้ำตาลทะเลทราย

// 1. ตัวละคร Shaded Dino
let dino = sprites.create(img`
    . . . . . . . 7 7 7 7 7 . . . . 
    . . . . . . 7 7 7 7 f 7 7 . . . 
    . . . . . . 7 7 7 7 7 7 7 . . . 
    . . . . . 7 7 7 7 7 7 7 7 . . . 
    . . . 7 7 7 7 7 7 7 7 7 . . . . 
    . . 7 7 7 7 7 7 7 7 7 7 . . . . 
    . . 7 d d d d d d d 7 7 . . . . 
    . . 7 d d d d d d d 7 7 . . . . 
    . . . 7 7 7 . . 7 7 7 . . . . . 
    . . . 4 4 4 . . 4 4 4 . . . . . 
`, SpriteKind.Player)
controller.moveSprite(dino)

// 2. Parallax Effect: เมฆที่เคลื่อนที่ช้าๆ ในพื้นหลัง
game.onUpdateInterval(3000, function() {
    let cloud = sprites.create(img`
        . . . . . . f f f f . . . . . . 
        . . . f f f f f f f f f f . . . 
        . f f f f f f f f f f f f f f . 
        . f f f f f f f f f f f f f f . 
        . . . f f f f f f f f f f . . . 
    `, SpriteKind.Food)
    cloud.setFlag(SpriteFlag.Ghost, true)
    cloud.setPosition(160, Math.randomRange(10, 50))
    cloud.vx = -20 // เคลื่อนที่ช้า
    cloud.z = -2 // อยู่หลังสุด
})

// 3. 3D Projectile: ลูกไฟที่มีหาง (Trail)
game.onUpdateInterval(1500, function () {
    let fireball = sprites.createProjectileFromSide(img`
        . . . . . . . . . . . . . . . . 
        . . . . . . . 4 4 . . . . . . . 
        . . . . . . 4 5 5 4 . . . . . . 
        . . . 4 4 4 5 2 2 5 4 4 4 . . . 
        . . . . . . 4 5 5 4 . . . . . . 
        . . . . . . . 4 4 . . . . . . . 
        . . . . . . . . . . . . . . . . 
    `, -80, 0)
    fireball.y = Math.randomRange(10, 110)
    fireball.setKind(SpriteKind.Enemy)
    fireball.startEffect(effects.fire, 500) // หางไฟ
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    info.changeLifeBy(-1)
    otherSprite.destroy(effects.disintegrate, 200)
    scene.cameraShake(4, 500)
})
