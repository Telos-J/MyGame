window.addEventListener('load', function () {
    // Get a CanvasRenderingContext2D object
    const canvas = document.querySelector('canvas')
    const context = canvas.getContext('2d')

    // Set logical canvas dimensions != intrinsic canvas size
    canvas.width = 480 //15 columns
    canvas.height = 400 // 10 rows

    // Pixelate Image
    context.imageSmoothingEnabled = false

    // Define a world constructor function
    const World = function (url) {
        this.tileSet = new Image()
        this.tileSet.src = url
        this.sourceTileWidth = 16
        this.sourceTileHeight = 16
        this.tileWidth = 32
        this.tileHeight = 36

        // prettier-ignore
        this.map = [
          ['A1', 'B1', 'C1', 'C1', 'C1', 'C1', 'C1', 'C1', 'C1', 'C1', 'C1', 'C1', 'C1', 'G1', 'H1'],
          ['A2', 'B2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'C2', 'G2', 'H2'],
          ['A3', 'B3', 'C3', 'C3', 'D3', 'E3', 'F3', 'C3', 'C3', 'C3', 'C3', 'E4', 'F4', 'G3', 'H3'],
          ['A3', 'B3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'D3', 'G3', 'H3'],
          ['A3', 'B3', 'C3', 'C3', 'C3', 'C3', 'C3', 'E4', 'C4', 'D4', 'E4', 'C3', 'C3', 'G3', 'H3'],
          ['A3', 'B3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'E4', 'F4', 'C3', 'C3', 'C3', 'G3', 'H3'],
          ['A3', 'B3', 'C4', 'D4', 'E4', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'G3', 'H3'],
          ['A3', 'B3', 'C3', 'C3', 'C3', 'C3', 'C3', 'C3', 'E4', 'F4', 'D3', 'E3', 'F3', 'G3', 'H3'],
          ['A7', 'B7', 'C7', 'C7', 'C7', 'C7', 'C7', 'C7', 'C7', 'C7', 'C7', 'C7', 'C7', 'G7', 'H7'],
          ['A8', 'B8', 'C8', 'C8', 'C8', 'C8', 'C8', 'C8', 'C8', 'C8', 'C8', 'C8', 'C8', 'G8', 'H8']
        ];

        this.boundary = new World.Boundary(64, 72, 32 * 11, 36 * 6)
    }

    // Define a boundary constructor function for World
    World.Boundary = function (
        boundary_x,
        boundary_y,
        boundary_width,
        boundary_height
    ) {
        this.boundary_x = boundary_x
        this.boundary_y = boundary_y
        this.boundary_width = boundary_width
        this.boundary_height = boundary_height

        // Define a collision detection function
        // which sets the colliding object to the area boundary
        // and returns a boolian of whether it is colliding
        this.collide = function (object) {
            let colliding = true
            if (object.getTop() < this.boundary_y)
                object.setTop(this.boundary_y)
            else if (object.getLeft() < this.boundary_x)
                object.setLeft(this.boundary_x)
            else if (object.getRight() > this.boundary_x + this.boundary_width)
                object.setRight(this.boundary_x + this.boundary_width)
            else if (
                object.getBottom() >
                this.boundary_y + this.boundary_height
            )
                object.setBottom(this.boundary_y + this.boundary_height)
            else colliding = false

            return colliding
        }
    }

    // Create a new world object
    const world = new World('images/houseTileSet.png')

    // Made the default animation type "loop":
    const Animator = function (frameSet, delay, mode = 'loop') {
        this.count = 0
        this.delay = delay >= 1 ? delay : 1
        this.frameSet = frameSet
        this.frameIndex = 0
        this.frame = frameSet[0]
        this.mode = mode
        this.reverse = false

        this.animate = function () {
            switch (this.mode) {
                case 'loop':
                    this.loop()
                    break
                case 'pause':
                    break
                case 'single':
                    if (!this.reverse)
                        if (this.frameIndex < this.frameSet.length - 1) {
                            this.loop()
                        } else this.mode = 'pause'
                    else if (this.frameIndex > 0) {
                        this.loop()
                    } else this.mode = 'pause'
                    break
            }
        }

        this.changeFrameSet = function (
            frameSet,
            mode,
            delay = 10,
            frameIndex = 0
        ) {
            if (this.frameSet === frameSet) {
                return
            }

            this.count = 0
            this.delay = delay
            this.frameSet = frameSet
            this.frameIndex = frameIndex
            this.frame = frameSet[frameIndex]
            this.mode = mode
            this.width = this.frame.source_width * 2
            this.height = this.frame.source_height * 2
        }

        this.loop = function () {
            this.count++

            while (this.count > this.delay) {
                this.count -= this.delay

                if (!this.reverse)
                    this.frameIndex =
                        this.frameIndex < this.frameSet.length - 1
                            ? this.frameIndex + 1
                            : 0
                else
                    this.frameIndex =
                        this.frameIndex > 0
                            ? this.frameIndex - 1
                            : this.frameSet.length - 1

                this.frame = this.frameSet[this.frameIndex]
            }
        }
    }

    // Define a general object constructor function
    const Object = function (url, x, y, width, height) {
        this.sprite = new Image()
        if (url) this.sprite.src = url
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.offset_bottom = 0
        this.offset_left = 0
        this.offset_right = 0
        this.offset_top = 0

        this.getTop = function () {
            return this.y + this.offset_top
        }
        this.getLeft = function () {
            return this.x + this.offset_left
        }
        this.getRight = function () {
            return this.x + this.width - this.offset_right
        }
        this.getBottom = function () {
            return this.y + this.height - this.offset_bottom
        }
        this.getCenterX = function () {
            return (this.getLeft() + this.getRight()) / 2
        }
        this.getCenterY = function () {
            return (this.getTop() + this.getBottom()) / 2
        }
        this.setTop = function (top) {
            this.y = top - this.offset_top
        }
        this.setLeft = function (left) {
            this.x = left - this.offset_left
        }
        this.setRight = function (right) {
            this.x = right - this.width + this.offset_right
        }
        this.setBottom = function (bottom) {
            this.y = bottom - this.height + this.offset_bottom
        }
        this.setCenterX = function (centerX) {
            this.x =
                centerX -
                (this.offset_left - this.offset_right + this.width) / 2
        }
        this.setCenterY = function (centerY) {
            this.y =
                centerY -
                (this.offset_top - this.offset_bottom + this.height) / 2
        }

        // Rectangular collision detection.
        this.collideObject = function (object) {
            if (
                this.getRight() < object.getLeft() ||
                this.getBottom() < object.getTop() ||
                this.getLeft() > object.getRight() ||
                this.getTop() > object.getBottom()
            )
                return false

            return true
        }

        this.collideObjectX = function (object) {
            if (
                this.getRight() < object.getLeft() ||
                this.getLeft() > object.getRight()
            )
                return false

            return true
        }

        this.collideObjectY = function (object) {
            if (
                this.getBottom() < object.getTop() ||
                this.getTop() > object.getBottom()
            )
                return false

            return true
        }
    }

    const MovingObject = function (url, x, y, width, height, speed = 5) {
        Object.call(this, url, x, y, width, height)
        this.speed = speed
        this.direction = 'up'

        this.moveUp = function () {
            this.direction = 'up'
            this.y -= this.speed
        }
        this.moveRight = function () {
            this.direction = 'right'
            this.x += this.speed
        }
        this.moveDown = function () {
            this.direction = 'down'
            this.y += this.speed
        }
        this.moveLeft = function () {
            this.direction = 'left'
            this.x -= this.speed
        }
    }

    const Frame = function (x, y, width, height) {
        this.source_x = x
        this.source_y = y
        this.source_width = width
        this.source_height = height
    }

    /* The carrot class extends Game.Object and Game.Animation. */
    const Bullet = function (x, y, direction) {
        MovingObject.call(this, 'images/fireballSprite.png', x, y, 64, 64, 10)

        this.offset_top = 20
        this.offset_left = 20
        this.offset_right = 20
        this.offset_bottom = 20
        this.direction = direction
        this.state = 'fire'

        this.frameSets = {
            bulletRight: [
                new Frame(32 * 0, 0, 32, 32),
                new Frame(32 * 1, 0, 32, 32),
                new Frame(32 * 2, 0, 32, 32),
            ],
            bulletUp: [
                new Frame(32 * 0, 32 * 1, 32, 32),
                new Frame(32 * 1, 32 * 1, 32, 32),
                new Frame(32 * 2, 32 * 1, 32, 32),
            ],
            bulletLeft: [
                new Frame(32 * 0, 32 * 2, 32, 32),
                new Frame(32 * 1, 32 * 2, 32, 32),
                new Frame(32 * 2, 32 * 2, 32, 32),
            ],
            bulletDown: [
                new Frame(32 * 0, 32 * 3, 32, 32),
                new Frame(32 * 1, 32 * 3, 32, 32),
                new Frame(32 * 2, 32 * 3, 32, 32),
            ],
        }

        switch (direction) {
            case 'right':
                this.frameSet = this.frameSets['bulletRight']
                this.setLeft(player.getRight())
                this.setCenterY(player.getCenterY())
                break
            case 'up':
                this.frameSet = this.frameSets['bulletUp']
                this.setCenterX(player.getCenterX())
                this.setBottom(player.getTop())
                break
            case 'left':
                this.frameSet = this.frameSets['bulletLeft']
                this.setRight(player.getLeft())
                this.setCenterY(player.getCenterY())
                break
            case 'down':
                this.frameSet = this.frameSets['bulletDown']
                this.setTop(player.getBottom())
                this.setCenterX(player.getCenterX())
                break
        }

        Animator.call(this, this.frameSet, 3)

        this.update = function () {
            switch (this.state) {
                case 'fire':
                    if (this.direction == 'right') this.moveRight()
                    else if (this.direction == 'up') this.moveUp()
                    else if (this.direction == 'left') this.moveLeft()
                    else if (this.direction == 'down') this.moveDown()
                    break
            }
            this.animate()
        }
    }

    // Define player constructor function
    const Player = function () {
        // Create image object
        MovingObject.call(this, 'images/linkSprite.png', 120, 150, 48, 64)

        this.offset_top = 30
        this.offset_left = 12
        this.offset_right = 12
        this.offset_bottom = 5
        this.direction = 'right'
        this.bullets = []
        this.bulletLimit = 2
        this.coolTime = 0
        this.bulletCoolTime = 10
        this.state = 'walk'
        this.health = 100

        this.frameSets = {
            walkUp: [
                new Frame(24 * 0, 32 * 0, 24, 32),
                new Frame(24 * 3, 32 * 0, 24, 32),
                new Frame(24 * 6, 32 * 0, 24, 32),
                new Frame(24 * 9, 32 * 0, 24, 32),
                new Frame(24 * 0, 32 * 4, 24, 32),
                new Frame(24 * 3, 32 * 4, 24, 32),
                new Frame(24 * 6, 32 * 4, 24, 32),
                new Frame(24 * 7, 32 * 4, 24, 32),
            ],
            walkRight: [
                new Frame(24 * 0, 32 * 1, 24, 32),
                new Frame(24 * 3, 32 * 1, 24, 32),
                new Frame(24 * 6, 32 * 1, 24, 32),
                new Frame(24 * 7, 32 * 1, 24, 32),
                new Frame(24 * 0, 32 * 5, 24, 32),
                new Frame(24 * 3, 32 * 5, 24, 32),
                new Frame(24 * 6, 32 * 5, 24, 32),
                new Frame(24 * 7, 32 * 5, 24, 32),
            ],
            walkDown: [
                new Frame(24 * 0, 32 * 2, 24, 32),
                new Frame(24 * 3, 32 * 2, 24, 32),
                new Frame(24 * 6, 32 * 2, 24, 32),
                new Frame(24 * 9, 32 * 2, 24, 32),
                new Frame(24 * 0, 32 * 6, 24, 32),
                new Frame(24 * 3, 32 * 6, 24, 32),
                new Frame(24 * 6, 32 * 6, 24, 32),
                new Frame(24 * 9, 32 * 6, 24, 32),
            ],
            walkLeft: [
                new Frame(24 * 0, 32 * 3, 24, 32),
                new Frame(24 * 3, 32 * 3, 24, 32),
                new Frame(24 * 6, 32 * 3, 24, 32),
                new Frame(24 * 9, 32 * 3, 24, 32),
                new Frame(24 * 0, 32 * 7, 24, 32),
                new Frame(24 * 3, 32 * 7, 24, 32),
                new Frame(24 * 6, 32 * 7, 24, 32),
                new Frame(24 * 9, 32 * 7, 24, 32),
            ],
        }

        this.frameSet = this.frameSets['walkRight']
        Animator.call(this, this.frameSet, 2)

        // Define a function for creating and firing a bullet
        this.createBullet = function () {
            if (this.bullets.length < this.bulletLimit && this.coolTime <= 0) {
                this.bullets.push(new Bullet(this.x, this.y, this.direction))
                this.coolTime = this.bulletCoolTime
            }
        }

        this.update = function () {
            switch (this.state) {
                case 'walk':
                    // Change sequence according to the controller
                    this.mode = 'loop'
                    if (controller.up.active) {
                        this.frameSet = this.frameSets['walkUp']
                        this.moveUp()
                    } else if (controller.right.active) {
                        this.frameSet = this.frameSets['walkRight']
                        this.moveRight()
                    } else if (controller.down.active) {
                        this.frameSet = this.frameSets['walkDown']
                        this.moveDown()
                    } else if (controller.left.active) {
                        this.frameSet = this.frameSets['walkLeft']
                        this.moveLeft()
                    } else this.mode = 'pause'

                    // Fire a bullet with spacebar
                    if (controller.space.active) {
                        controller.space.active = false
                        this.createBullet()
                    }
                    break
                case 'hurt':
                    this.mode = 'pause'
                    if (enemy.direction == 'left') this.x -= this.speed * 2
                    else if (enemy.direction == 'right')
                        this.x += this.speed * 2
                    else if (enemy.direction == 'up') this.y -= this.speed * 2
                    else if (enemy.direction == 'down') this.y += this.speed * 2
                    if (this.coolTime == 0) this.state = 'walk'
            }

            // Update the cooltime
            this.coolTime = this.coolTime > 0 ? this.coolTime - 1 : 0
            if (this.health < 0) this.health = 0
        }
    }

    // Create player object
    const player = new Player()

    const Enemy = function () {
        MovingObject.call(
            this,
            'images/lizalfos_trans.png',
            220,
            150,
            32 * 2,
            34 * 2,
            5
        )

        this.offset_top = 30
        this.offset_left = 24
        this.offset_right = 24
        this.offset_bottom = 20
        this.direction = 'left'
        this.isAlive = true
        this.invincible = false
        this.coolTime = 0
        this.state = 'idle'
        this.destination_x = 100
        this.destination_y = 100
        this.health = 100

        this.frameSets = {
            idleup: [
                new Frame(1 + 28 * 0, 89, 27, 34),
                new Frame(1 + 28 * 1, 89, 27, 34),
                new Frame(1 + 28 * 2, 89, 27, 34),
                new Frame(1 + 28 * 3, 89, 27, 34),
                new Frame(1 + 28 * 4, 89, 27, 34),
                new Frame(1 + 28 * 5, 89, 27, 34),
                new Frame(1 + 28 * 6, 89, 27, 34),
                new Frame(1 + 28 * 7, 89, 27, 34),
            ],
            idledown: [
                new Frame(1 + 28 * 0, 20, 27, 34),
                new Frame(1 + 28 * 1, 20, 27, 34),
                new Frame(1 + 28 * 2, 20, 27, 34),
                new Frame(1 + 28 * 3, 20, 27, 34),
                new Frame(1 + 28 * 4, 20, 27, 34),
                new Frame(1 + 28 * 5, 20, 27, 34),
                new Frame(1 + 28 * 6, 20, 27, 34),
                new Frame(1 + 28 * 7, 20, 27, 34),
            ],
            idleright: [
                new Frame(1 + 33 * 0, 55, 32, 33),
                new Frame(1 + 33 * 1, 55, 32, 33),
                new Frame(1 + 33 * 2, 55, 32, 33),
                new Frame(1 + 33 * 3, 55, 32, 33),
                new Frame(1 + 33 * 4, 55, 32, 33),
                new Frame(1 + 33 * 5, 55, 32, 33),
                new Frame(1 + 33 * 6, 55, 32, 33),
                new Frame(1 + 33 * 7, 55, 32, 33),
            ],
            idleleft: [
                new Frame(2371 - 33 * 0, 55, 32, 33),
                new Frame(2371 - 33 * 1, 55, 32, 33),
                new Frame(2371 - 33 * 2, 55, 32, 33),
                new Frame(2371 - 33 * 3, 55, 32, 33),
                new Frame(2371 - 33 * 4, 55, 32, 33),
                new Frame(2371 - 33 * 5, 55, 32, 33),
                new Frame(2371 - 33 * 6, 55, 32, 33),
                new Frame(2371 - 33 * 7, 55, 32, 33),
            ],
            swordgrabup: [
                new Frame(1 + 29 * 0, 235, 28, 33),
                new Frame(1 + 29 * 1, 235, 28, 33),
                new Frame(1 + 29 * 2, 235, 28, 33),
                new Frame(1 + 29 * 3, 235, 28, 33),
            ],
            swordgrabdown: [
                new Frame(1 + 29 * 0, 145, 28, 41),
                new Frame(1 + 29 * 1, 145, 28, 41),
                new Frame(1 + 29 * 2, 145, 28, 41),
                new Frame(1 + 29 * 3, 145, 28, 41),
            ],
            swordgrabright: [
                new Frame(1 + 34 * 0, 188, 33, 33),
                new Frame(1 + 34 * 1, 188, 33, 33),
                new Frame(1 + 34 * 2, 188, 33, 33),
                new Frame(1 + 34 * 3, 188, 33, 33),
            ],
            swordgrableft: [
                new Frame(2370 - 34 * 0, 188, 33, 33),
                new Frame(2370 - 34 * 1, 188, 33, 33),
                new Frame(2370 - 34 * 2, 188, 33, 33),
                new Frame(2370 - 34 * 3, 188, 33, 33),
            ],
            swordmoveup: [
                new Frame(145 + 24 * 0, 222, 23, 46),
                new Frame(145 + 24 * 1, 222, 23, 46),
                new Frame(145 + 24 * 2, 222, 23, 46),
                new Frame(145 + 24 * 3, 222, 23, 46),
            ],
            swordmovedown: [
                new Frame(145 + 30 * 0, 133, 29, 53),
                new Frame(145 + 30 * 1, 133, 29, 53),
                new Frame(145 + 30 * 2, 133, 29, 53),
                new Frame(145 + 30 * 3, 133, 29, 53),
            ],
            swordmoveright: [
                new Frame(145 + 49 * 0, 187, 48, 34),
                new Frame(145 + 49 * 1, 187, 48, 34),
                new Frame(145 + 49 * 2, 187, 48, 34),
                new Frame(145 + 49 * 3, 187, 48, 34),
            ],
            swordmoveleft: [
                new Frame(2211 - 49 * 0, 187, 48, 34),
                new Frame(2211 - 49 * 1, 187, 48, 34),
                new Frame(2211 - 49 * 2, 187, 48, 34),
                new Frame(2211 - 49 * 3, 187, 48, 34),
            ],
            hurtup: [new Frame(273, 90, 22, 33)],
            hurtdown: [new Frame(273, 21, 27, 33)],
            hurtright: [new Frame(273, 57, 33, 31)],
            hurtleft: [new Frame(2098, 57, 33, 31)],
        }

        this.frameSet = this.frameSets['idleleft']
        Animator.call(this, this.frameSet, 5)

        this.fixPosition = function (up, down, right, left) {
            if (this.direction === 'up') {
                this.x += up[0]
                this.y += up[1]
            } else if (this.direction === 'down') {
                this.x += down[0]
                this.y += down[1]
            } else if (this.direction === 'right') {
                this.x += right[0]
                this.y += right[1]
            } else if (this.direction === 'left') {
                this.x += left[0]
                this.y += left[1]
            }
        }

        this.switchState = function (
            nextState,
            mode,
            reverse = false,
            changeFrameSet = true
        ) {
            // prettier-ignore
            if (this.state == 'idle' && nextState == 'swordgrab')
                this.fixPosition([-2, 0], [-4, 0], [2, 0], [-4, 0])
            else if (this.state == 'swordmove' && nextState == 'idle')
                this.fixPosition([-2, 0], [2, 6], [4, 0], [20, 4])
            else if (this.state == 'swordmove' && nextState == 'hurt')
                this.fixPosition([4, 8], [0, 4], [4, 0], [20, 2])
            else if (this.state == 'hurt' && nextState == 'idle')
                this.fixPosition([-6, 0], [2, -6], [-6, 0], [0, -2])
            else if ((this.state == 'swordgrab' || this.state == 'sworddrop')
                && nextState == 'idle')
                this.fixPosition([2, 0], [4, 0], [-2, 0], [4, 0])
            else if ((this.state == 'swordgrab' || this.state == 'sworddrop')
                && nextState == 'swordmove')
                this.fixPosition([4, -15], [2, 0], [2, 0], [-30, -4])
            else if ((this.state == 'swordgrab' || this.state == 'sworddrop') 
                && nextState == 'hurt')
                this.fixPosition([8, 0], [2, 6], [4, 0], [4, 2])

            if (changeFrameSet)
                this.changeFrameSet(
                    this.frameSets[nextState + this.direction],
                    mode,
                    this.delay
                )

            this.reverse = reverse
            this.state = nextState
        }

        this.facePlayer = function () {
            let x = player.x - this.x
            let y = this.y - player.y
            if (y < x && y > -x) this.direction = 'right'
            else if (y > x && y < -x) this.direction = 'left'
            else if (y > x && y > -x) this.direction = 'up'
            else if (y < x && y < -x) this.direction = 'down'
            this.changeFrameSet(
                this.frameSets[this.state + this.direction],
                'loop',
                this.delay
            )
        }

        this.update = function () {
            switch (this.state) {
                case 'idle':
                    this.facePlayer()
                    this.health += 0.1
                    if (
                        this.collideObjectX(player) ||
                        this.collideObjectY(player)
                    )
                        this.switchState('swordgrab', 'single')
                    break
                case 'patrol':
                    break
                case 'swordgrab':
                    // If player gets out of range, enemy drops sword
                    if (
                        !this.collideObjectX(player) &&
                        !this.collideObjectY(player)
                    )
                        this.switchState('sworddrop', 'single', true, false)
                    // If enemy charges up the sword, it attacks
                    else if (this.frameIndex == this.frameSet.length - 1)
                        this.switchState('swordmove', 'single')
                    break
                case 'sworddrop':
                    if (this.frameIndex == 0) {
                        this.reverse = false
                        this.switchState('idle', 'loop')
                    }
                    break
                case 'swordmove':
                    if (this.direction == 'down') this.y += this.speed
                    else if (this.direction == 'up') this.y -= this.speed
                    else if (this.direction == 'right') this.x += this.speed
                    else if (this.direction == 'left') this.x -= this.speed

                    if (this.frameIndex == this.frameSet.length - 1) {
                        this.switchState('idle', 'loop')
                    }
                    break
                case 'hurt':
                    if (this.coolTime == 80) this.switchState('idle', 'loop')
                    break
            }

            // Update the cooltime
            this.coolTime = this.coolTime > 0 ? this.coolTime - 1 : 0
            if (this.health < 0) this.health = 0
            if (this.health > 100) this.health = 100
            if (this.invincible && this.coolTime == 0) this.invincible = false
        }
    }

    const enemy = new Enemy()

    // Update animation for every frame
    const update = function () {
        player.bullets.forEach((bullet, index) => {
            bullet.update()
            if (world.boundary.collide(bullet)) {
                player.bullets.splice(index, 1)
            }
            if (bullet.collideObject(enemy) && !enemy.invincible) {
                enemy.health -= 20
                enemy.coolTime = 100
                enemy.invincible = true
                enemy.switchState('hurt', 'loop')
                player.bullets.splice(index, 1)
            }
        })

        player.update()
        enemy.update()

        // Collision check
        world.boundary.collide(player)
        world.boundary.collide(enemy)
        ;[enemy].forEach((object) => {
            if (player.collideObject(object)) {
                player.state = 'hurt'
                player.health -= 10
                player.coolTime = 5
                if (object.direction == 'left')
                    object.setLeft(player.getRight())
                else if (object.direction == 'right')
                    object.setRight(player.getLeft())
                else if (object.direction == 'up')
                    object.setTop(player.getBottom() + 5)
                else if (object.direction == 'down')
                    object.setBottom(player.getTop())
            }
        })

        player.animate()
        enemy.animate()
    }

    // Draw to canvas
    const render = function () {
        context.fillStyle = 'Black'
        context.fillRect(0, 0, canvas.width, canvas.height)
        // Draw the tile map
        for (let column in world.map) {
            for (let row in world.map[column]) {
                context.drawImage(
                    world.tileSet,
                    (world.map[column][row][0].charCodeAt() - 65) *
                        world.sourceTileWidth,
                    (parseInt(world.map[column][row].slice(1)) - 1) *
                        world.sourceTileHeight,
                    world.sourceTileWidth,
                    world.sourceTileHeight,
                    world.tileWidth * row,
                    world.tileHeight * column,
                    world.tileWidth,
                    world.tileHeight
                )
            }
        }

        // Draw the enemy
        context.drawImage(
            enemy.sprite,
            enemy.frame.source_x,
            enemy.frame.source_y + enemy.frame.source_height / 2,
            enemy.frame.source_width,
            enemy.frame.source_height / 2,
            enemy.x,
            enemy.y + enemy.height / 2,
            enemy.width,
            enemy.height / 2
        )

        // Draw the bullet
        player.bullets.forEach((bullet) => {
            context.drawImage(
                bullet.sprite,
                bullet.frame.source_x,
                bullet.frame.source_y,
                bullet.frame.source_width,
                bullet.frame.source_height,
                bullet.x,
                bullet.y,
                bullet.width,
                bullet.height
            )
        })

        // Draw the player
        context.drawImage(
            player.sprite,
            player.frame.source_x,
            player.frame.source_y,
            player.frame.source_width,
            player.frame.source_height,
            player.x,
            player.y,
            player.width,
            player.height
        )

        context.drawImage(
            enemy.sprite,
            enemy.frame.source_x,
            enemy.frame.source_y,
            enemy.frame.source_width,
            enemy.frame.source_height / 2,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height / 2
        )

        /*
        context.strokeStyle = 'green'
        context.lineWidth = '1'
        context.beginPath()
        context.moveTo(0, player.getCenterY())
        context.lineTo(canvas.width, player.getCenterY())
        context.stroke()
        context.beginPath()
        context.moveTo(player.getCenterX(), 0)
        context.lineTo(player.getCenterX(), canvas.height)
        context.stroke()
        context.beginPath()
        context.lineWidth = '3'
        context.rect(
            player.getLeft(),
            player.getTop(),
            player.getRight() - player.getLeft(),
            player.getBottom() - player.getTop()
        )
        context.stroke()
        context.strokeStyle = 'red'
        context.lineWidth = '1'
        context.beginPath()
        context.moveTo(0, enemy.getCenterY())
        context.lineTo(canvas.width, enemy.getCenterY())
        context.stroke()
        context.beginPath()
        context.moveTo(enemy.getCenterX(), 0)
        context.lineTo(enemy.getCenterX(), canvas.height)
        context.stroke()
        context.beginPath()
        context.lineWidth = '3'
        context.rect(
            enemy.getLeft(),
            enemy.getTop(),
            enemy.getRight() - enemy.getLeft(),
            enemy.getBottom() - enemy.getTop()
        )
        context.stroke()
        */

        context.fillStyle = 'green'
        context.beginPath()
        context.fillRect(
            5,
            canvas.height - 40 + 5,
            (canvas.width / 2 - 5) * (player.health / 100),
            30
        )
        context.stroke()
        context.fillStyle = enemy.invincible ? 'white' : 'red'
        context.beginPath()
        context.fillRect(
            canvas.width / 2 + 5,
            canvas.height - 40 + 5,
            (canvas.width / 2 - 10) * (enemy.health / 100),
            30
        )
        context.stroke()
        context.strokeStyle = 'white'
        context.beginPath()
        context.rect(5, canvas.height - 40 + 5, canvas.width / 2 - 5, 30)
        context.stroke()
        context.beginPath()
        context.rect(
            canvas.width / 2 + 5,
            canvas.height - 40 + 5,
            canvas.width / 2 - 10,
            30
        )
        context.stroke()
        context.fillStyle = 'black'
        context.font = '30px Arial'
        if (enemy.invincible)
            context.fillText(
                enemy.coolTime,
                canvas.width / 2 + 10,
                canvas.height - 10
            )

        if (enemy.health == 0 || player.health == 0) {
            let text = enemy.health == 0 ? 'Victory!' : 'Game Over'
            context.font = '30px Arial'
            context.fillText(text, canvas.width / 2 - 50, canvas.height / 2)
            context.freeze()
        }
    }

    // Create engine object
    const engine = new Engine(1000 / 30, update, render)

    // Create controller object
    const controller = new Controller()

    // Callback function for controller
    const keyDownUp = function (event) {
        controller.keyDownUp(event.type, event.keyCode)
    }

    // Add event listeners for controller
    window.addEventListener('keydown', keyDownUp)
    window.addEventListener('keyup', keyDownUp)

    engine.start()
})
