
import { _decorator, Component, Node, Vec2, BoxCollider2D, director, v2, Sprite, Color, v3, UIOpacity, Vec3, tween } from 'cc';
import { DissTian } from '../../_Scripts/CocosCreatorTool/DissTian';
const { ccclass, property } = _decorator;

@ccclass('GameBullet')
export class GameBullet extends Component {

    private opacity: UIOpacity;

    public value: BulletValue;
    public angle: number;
    public isContinuedRotate: boolean = true;/**是否持续旋转 */
    public angleIndex: number;
    public isCanMove: boolean = true;
    public accel: number;

    private paths: number[];
    private isTurnBack: boolean = false;

    public async init(value: BulletValue) {
        if (!this.opacity) this.opacity = this.getComponent(UIOpacity);

        this.value = value;

        this.node.setPosition(v3(value.position.x, value.position.y));
        this.node.angle = DissTian.Tool.Vec2LookAt(this.node.position, value.direction);

        if (value.parent) {
            this.node.setParent(value.parent);
        }

        if (value.activeDelay > 0 && value.activeDelayHide == true) {
            this.opacity.opacity = 0;
        }
        if (value.isCamMove != undefined)
            this.isCanMove = value.isCamMove;
        else
            this.isCanMove = true;

        this.isTurnBack = false;
        if (value.isTurnBack) {
            this.paths = [];
        } else {
            this.paths = null;
        }

        switch (value.color) {
            case 0:
                this.getComponent(Sprite).color = new Color("#FD4545");
                break;
            case 1:
                this.getComponent(Sprite).color = new Color("#45FD62");
                break;
            case 2:
                this.getComponent(Sprite).color = new Color("#4579FD");
                break;
            case 3:
                this.getComponent(Sprite).color = new Color("#FDF645");
                break;
            case 4:
                this.getComponent(Sprite).color = new Color("#FD45B3");
                break;
            case 5:
                this.getComponent(Sprite).color = new Color("#D145FD");
                break;
            case 6:
                this.getComponent(Sprite).color = new Color("#FD8045");
                break;
        }

        this.angleIndex = 0;
        this.angle = 0;
        this.accel = this.value.accel;


        this.scheduleOnce(this.nextAngle, this.value.activeDelay);
        let delay = (value.duration == undefined ? 10 : value.duration) + (this.value.activeDelay != undefined ? this.value.activeDelay : 0);
        this.scheduleOnce(() => {
            this.delete();
        }, delay);
        if (this.value.motionTimer && this.value.motionTimer > 0) {
            this.scheduleOnce(async () => {
                this.isCanMove=false;
                if (this.value.motionCB) {
                    let temp = this.value.motionCB(this);
                    if (temp > 0)
                        await DissTian.Tool.delaySync(temp);
                }
                // this.value.speed = 0;

                if (this.value.isTurnBack) {
                    this.scheduleOnce(async () => {
                        this.value.isTurnBack.callback&&this.value.isTurnBack.callback();
                        //开始折返
                        if (this.paths) {
                            let speed = this.value.speed;
                            this.isCanMove = true;
                            this.isContinuedRotate = true;
                            this.value.rotateAngle = null;
                            this.isTurnBack=true;
                            await DissTian.Tool.delaySync(this.value.isTurnBack.time+this.value.motionTimer);
                            this.delete();
                        }
                    },this.value.isTurnBack.time+this.value.motionTimer);
                }
            }, this.value.motionTimer);

            
        }
    }

    SwitchDirection(dir: Vec2) {
        this.node.angle = DissTian.Tool.Vec2LookAt(this.node.position, dir);
    }

    private async nextAngle() {
        if (!this.value || !this.value.rotateAngle) return;


        let angle = this.value.rotateAngle[this.angleIndex];
        if (angle) {
            if (angle.delay && angle.delay > 0)
                await DissTian.Tool.delaySync(angle.delay);
            this.angle = angle.angle;
            this.isContinuedRotate = angle.disposable;
            if (this.isContinuedRotate) {
                if (angle.isAbs)
                    this.node.angle = angle.angle;
                else
                    this.node.angle += angle.angle;
            }
            this.angleIndex++;
            if (!this.value) return;

            if (this.angleIndex >= this.value.rotateAngle.length) {
                if (this.value.rotateAngle_loop == true)
                    this.angleIndex = 0;
            }
            // this.scheduleOnce(this.nextAngle,angle.duration);
            if (this.value.rotateAngle.length > 1) {
                await DissTian.Tool.delaySync(angle.duration);
                this.isContinuedRotate = true;
                this.nextAngle();
            }
        }
    }


    public update(elaspedTime: number) {
        if (!this.isCanMove || !this.value) return;
        // elaspedTime = 0.05;
        if (this.value.activeDelay > 0) {
            this.value.activeDelay -= elaspedTime;
            this.value.moveBeforCB && this.value.moveBeforCB(this);
            if (this.value.activeDelay <= 0)
                this.opacity.opacity = 255;
            return;
        }


        // this.Speed = v2(this.Speed.x + this.Accel.x * elaspedTime, this.Speed.y + this.Accel.y * elaspedTime);
        // this.Position = v2(this.Position.x+this.Speed.x * elaspedTime,this.Position.y+ this.Speed.y * elaspedTime);
        // this.node.setPosition(this.Position.x, this.Position.y);

        // this.node.translate(v3((this.value.speed+this.Accel.x* elaspedTime) * elaspedTime,(this.value.speed+this.Accel.y*elaspedTime)*elaspedTime));
        let dir;
        if (this.accel && this.accel > 0) {
            dir = v3((this.value.speed + this.accel) * elaspedTime);
            this.accel -= this.value.accel / this.value.accelTimer * elaspedTime;
        } else {
            dir = v3(this.value.speed * elaspedTime);
        }
        this.node.translate(dir);

        if (this.isTurnBack) {
            let angle = this.paths.pop();
            if (angle!=undefined)
                this.node.angle = angle + 180;
        } else {
            if (!this.isContinuedRotate)
                this.node.angle += this.angle * elaspedTime;
            if (this.paths) {
                this.paths.push(this.node.angle);
            }
        }
    }


    // moveTo(pos:Vec2){
    //     this.onMove();

    // }

    onMove() {
        this.isCanMove = true;
    }
    offMove() {
        this.isCanMove = false;
    }

    onDisable() {
        this.angle = 0;
        this.node.angle = 0;
        this.value = null;
        this.unscheduleAllCallbacks();
    }

    delete() {
        this.value && this.value.destoryCB && this.value.destoryCB(this);
        this.angle = 0;
        this.node.angle = 0;
        this.value = null;
        this.unscheduleAllCallbacks();
        DissTian.ResManager.DelGameObject(this.node);
    }
}


export interface BulletValue {
    /**初始位置 */
    position: Vec2;
    /**移动角度 */
    direction?: Vec2;
    /**移动速度 */
    speed: number;
    /**父节点 */
    parent?: Node;
    /**加速度(会递减) */
    accel?: number;
    /**递减到0的时间 */
    accelTimer?: number;
    /**子弹颜色 */
    color: number;
    /**延迟发射 */
    activeDelay?: number;
    /**延迟发射时隐藏 */
    activeDelayHide?: boolean;
    /**子弹每帧旋转角度*dt */
    rotateAngle?: BulletRotateValue[];
    /**子弹旋转是否循环 */
    rotateAngle_loop?: boolean;
    /**子弹存活时间,默认10秒 */
    duration?: number;
    /**运动时间，如果该值存在，那么运动到指定时间后移动速度将设为0 */
    motionTimer?: number;
    /**运动时间停止后的回调 */
    motionCB?: Function;
    /**是否可移动 */
    isCamMove?: boolean;
    /**是否根据移动的路径折返(比较耗性能) */
    isTurnBack?: TurnbackValue;


    /**移动前(activeDelay)的回调(持续型) */
    moveBeforCB?: Function;
    /**删除前的回调 */
    destoryCB?: Function;
}

export interface TurnbackValue {
    time: number;
    callback?: Function;
}

export interface BulletRotateValue {
    /**角度 */
    angle: number;
    /**是否绝对值(只对一次性有效) */
    isAbs?: boolean;
    /**一次性 */
    disposable?: boolean;
    /**持续时间 */
    duration?: number;
    /**延迟时间 */
    delay?: number;
}