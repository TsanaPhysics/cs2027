[ignoring loop detection]
namespace SpriteKind {
    export const Trash = SpriteKind.create()
}
/**
 * =====================================
 * 
 * เปลี่ยนประเภทถัง
 * 
 * =====================================
 */
/**
 * =====================================
 * 
 * สร้างขยะขนาดใหญ่
 * 
 * =====================================
 */
/**
 * =====================================
 * 
 * ตรวจการชน
 * 
 * =====================================
 */
/**
 * =====================================
 * 
 * คำอธิบายเกม
 * 
 * =====================================
 */
/**
 * =====================================
 * 
 * สร้างถังขยะขนาดใหญ่
 * 
 * =====================================
 */
/**
 * =====================================
 * 
 * เกมจบ
 * 
 * =====================================
 */
/**
 * =====================================
 * 
 * คะแนน
 * 
 * =====================================
 */
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    trashType += 1
    if (trashType > 3) {
        trashType = 0
    }
    // รีไซเคิล
    // เปียก
    // อันตราย
    // ทั่วไป
    if (trashType == 0) {
        bin.setImage(img`
            . . . . 1 1 1 1 1 1 1 1 . . . . 
            . . . 1 1 1 1 1 1 1 1 1 1 . . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . 1 1 1 1 1 1 1 1 1 1 1 1 . . 
            . . . 1 1 1 1 1 1 1 1 1 1 . . . 
            `)
    } else if (trashType == 1) {
        bin.setImage(img`
            . . . . 7 7 7 7 7 7 7 7 . . . . 
            . . . 7 7 7 7 7 7 7 7 7 7 . . . 
            . . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
            . . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
            . . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
            . . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
            . . 7 7 7 7 7 7 7 7 7 7 7 7 . . 
            . . . 7 7 7 7 7 7 7 7 7 7 . . . 
            `)
    } else if (trashType == 2) {
        bin.setImage(img`
            . . . . 2 2 2 2 2 2 2 2 . . . . 
            . . . 2 2 2 2 2 2 2 2 2 2 . . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . 2 2 2 2 2 2 2 2 2 2 2 2 . . 
            . . . 2 2 2 2 2 2 2 2 2 2 . . . 
            `)
    } else {
        bin.setImage(img`
            . . . . 5 5 5 5 5 5 5 5 . . . . 
            . . . 5 5 5 5 5 5 5 5 5 5 . . . 
            . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
            . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
            . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
            . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
            . . 5 5 5 5 5 5 5 5 5 5 5 5 . . 
            . . . 5 5 5 5 5 5 5 5 5 5 . . . 
            `)
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Trash, function (sprite, otherSprite) {
    if (trashType == 0 && otherSprite.data == "recycle") {
        correct = true
    }
    if (trashType == 1 && otherSprite.data == "wet") {
        correct = true
    }
    if (trashType == 2 && otherSprite.data == "danger") {
        correct = true
    }
    if (trashType == 3 && otherSprite.data == "general") {
        correct = true
    }
    // ตอบถูก
    // ตอบผิด
    if (correct) {
        info.changeScoreBy(1)
        music.baDing.play()
        otherSprite.destroy(effects.hearts, 100)
    } else {
        info.changeLifeBy(-1)
        music.wawawawaa.play()
        scene.cameraShake(4, 200)
        otherSprite.destroy(effects.fire, 100)
    }
    correct = false
})
info.onCountdownEnd(function () {
    if (info.score() >= 15) {
        game.over(true, effects.confetti)
    } else {
        game.over(false, effects.dissolve)
    }
})
let _type = 0
let correct = false
let trashType = 0
let bin: Sprite = null
let trash: Sprite = null
scene.setBackgroundColor(7)
bin = sprites.create(img`
    . . . . 8 8 8 8 8 8 8 8 . . . . 
    . . . 8 8 8 8 8 8 8 8 8 8 . . . 
    . . 8 8 8 8 8 8 8 8 8 8 8 8 . . 
    . . 8 8 8 8 8 8 8 8 8 8 8 8 . . 
    . . 8 8 8 8 8 8 8 8 8 8 8 8 . . 
    . . 8 8 8 8 8 8 8 8 8 8 8 8 . . 
    . . 8 8 8 8 8 8 8 8 8 8 8 8 . . 
    . . . 8 8 8 8 8 8 8 8 8 8 . . . 
    `, SpriteKind.Player)
bin.setPosition(80, 105)
controller.moveSprite(bin, 140, 0)
bin.setStayInScreen(true)
info.setScore(0)
info.setLife(3)
info.startCountdown(60)
game.showLongText("♻️ เกมคัดแยกขยะ\n\n🎮 ปุ่ม A = เปลี่ยนถัง\n⬅️➡️ = เคลื่อนที่\n\n🟦 รีไซเคิล\n🟩 เปียก\n🟥 อันตราย\n🟨 ทั่วไป", DialogLayout.Full)
game.onUpdateInterval(900, function () {
    _type = randint(0, 3)
    // รีไซเคิล
    // เปียก
    // อันตราย
    // ทั่วไป
    if (_type == 0) {
        trash = sprites.create(img`
            . . 1 1 1 1 1 . . 
            . 1 1 9 9 9 1 1 . 
            1 1 9 9 9 9 9 1 1 
            1 1 9 9 9 9 9 1 1 
            . 1 1 9 9 9 1 1 . 
            . . 1 1 1 1 1 . . 
            `, SpriteKind.Trash)
        trash.data = "recycle"
    } else if (_type == 1) {
        trash = sprites.create(img`
            . . 7 7 7 7 7 . . 
            . 7 4 4 4 4 4 7 . 
            7 4 4 4 4 4 4 4 7 
            7 4 4 4 4 4 4 4 7 
            . 7 4 4 4 4 4 7 . 
            . . 7 7 7 7 7 . . 
            `, SpriteKind.Trash)
        trash.data = "wet"
    } else if (_type == 2) {
        trash = sprites.create(img`
            . . 2 2 2 2 2 . . 
            . 2 9 9 9 9 9 2 . 
            2 9 9 9 9 9 9 9 2 
            2 9 9 9 9 9 9 9 2 
            . 2 9 9 9 9 9 2 . 
            . . 2 2 2 2 2 . . 
            `, SpriteKind.Trash)
        trash.data = "danger"
    } else {
        trash = sprites.create(img`
            . . 5 5 5 5 5 . . 
            . 5 6 6 6 6 6 5 . 
            5 6 6 6 6 6 6 6 5 
            5 6 6 6 6 6 6 6 5 
            . 5 6 6 6 6 6 5 . 
            . . 5 5 5 5 5 . . 
            `, SpriteKind.Trash)
        trash.data = "general"
    }
    trash.setPosition(randint(15, 145), 0)
    trash.vy = randint(35, 55)
})
