[ignoring loop detection]
// Maze Explorer: The Ancient Key
// สำหรับ ป.5 - ป.6: ระบบไขปริศนาและ AI ศัตรู

let hasKey = false
let hero = sprites.create(img`
    . . . . . . . f f . . . . . . . 
    . . . . . . f 4 4 f . . . . . . 
    . . . . . f 4 4 4 4 f . . . . . 
    . . . . . f 4 4 4 4 f . . . . . 
    . . . . . . f f f f . . . . . . 
    . . . . . . . 8 8 . . . . . . . 
    . . . . . . 8 8 8 8 . . . . . . 
`, SpriteKind.Player)
controller.moveSprite(hero)
scene.cameraFollowSprite(hero)

// 1. ระบบกุญแจ (Key System)
let key = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . . 5 5 5 . . . . . . . 
    . . . . . . 5 . 5 . . . . . . . 
    . . . . . . 5 5 5 . . . . . . . 
    . . . . . . . 5 . . . . . . . . 
    . . . . . . . 5 5 . . . . . . . 
    . . . . . . . 5 . . . . . . . . 
`, SpriteKind.Food)
key.setPosition(140, 20)

sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function(sprite, otherSprite) {
    hasKey = true
    otherSprite.destroy(effects.confetti, 500)
    sprite.sayText("I got the key!", 2000)
    music.magicWand.play()
})

// 2. ระบบประตู (Door Logic)
// สมมติว่าประตูคือ Tile ชนิดหนึ่ง
scene.onHitTile(SpriteKind.Player, 13, function(sprite, location) {
    if (hasKey) {
        // เปิดประตู (เปลี่ยน Tile เป็นพื้นว่าง)
        scene.setTileAt(location, 0)
        music.doorOpen.play()
    } else {
        sprite.sayText("I need a key!", 1000)
    }
})

// 3. ศัตรูที่เดินตาม (AI Hunter)
let ghost = sprites.create(img`
    . . . . . . f f f f . . . . . . 
    . . . . . f 1 1 1 1 f . . . . . 
    . . . . f 1 f 1 1 f 1 f . . . . 
    . . . . f 1 1 1 1 1 1 f . . . . 
    . . . . f f f f f f f f . . . . 
`, SpriteKind.Enemy)
ghost.setPosition(20, 20)

game.onUpdate(function() {
    // ให้ผีค่อยๆ เดินตามผู้เล่น
    if (hero.x > ghost.x) ghost.vx = 30
    else ghost.vx = -30
    
    if (hero.y > ghost.y) ghost.vy = 30
    else ghost.vy = -30
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function(sprite, otherSprite) {
    game.over(false)
})
