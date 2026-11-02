[ignoring loop detection]
// Platformer v2: Environment & Feedback
// อัปเกรดความสมูทและกราฟิกฉาก

// 1. ตัวละครที่มีชุด (Costume) และมิติ
let hero = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . . . . . f f f f f . . . . . . 
    . . . . f f f f f f f . . . . . 
    . . . . f f f f f f f . . . . . 
    . . . . f f f f f f f . . . . . 
    . . . . . f f f f f . . . . . . 
    . . . . . 2 2 2 2 2 . . . . . . 
    . . . . 2 2 2 2 2 2 2 . . . . . 
    . . . . 2 2 2 2 2 2 2 . . . . . 
    . . . . . 2 . . . 2 . . . . . . 
    . . . . . 2 . . . 2 . . . . . . 
`, SpriteKind.Player)

hero.ay = 400 
controller.moveSprite(hero, 100, 0)
scene.cameraFollowSprite(hero)

// 2. เอฟเฟกต์การกระโดด (Jump Juice)
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (hero.isHittingTile(CollisionDirection.Bottom)) {
        hero.vy = -180
        music.jumpUp.play()
        // เพิ่มควันตอนกระโดด
        hero.startEffect(effects.ashes, 200)
    }
})

// 3. ฉากหลังแบบ Gradient (จำลองผ่าน Background Image)
let bg = image.create(160, 120)
bg.fill(9) // สีฟ้า
for(let i=0; i<120; i++) {
    if(i > 80) bg.drawLine(0, i, 160, i, 6) // สีฟ้าเข้มด้านล่าง
}
scene.setBackgroundImage(bg)

// 4. ระบบอนุภาคเมื่อเดิน (Dust particles)
game.onUpdate(function() {
    if (Math.abs(hero.vx) > 0 && hero.isHittingTile(CollisionDirection.Bottom)) {
        if (game.runtime() % 5 == 0) {
            let dust = sprites.create(img`. . \n . 1 . \n . .`, SpriteKind.Food)
            dust.setFlag(SpriteFlag.Ghost, true)
            dust.setPosition(hero.x, hero.y + 6)
            dust.lifespan = 300
        }
    }
})
