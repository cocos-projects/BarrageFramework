
import { _decorator, Component, Node, Vec2, v2, v3 } from 'cc';
import { Tools } from '../../_Scripts/Tools';
import { DissTian } from '../CocosCreatorTool/DissTian';
import { BulletValue, GameBullet } from './GameBullet';
import { Helper } from './Helper';
const { ccclass, property } = _decorator;

@ccclass('GameBarrage')
export class GameBarrage {


    /**
     * 圆形弹幕
     * @param isOwn 是否为玩家子弹
     * @param type 子弹类型
     * @param color 子弹颜色
     * @param position 中心点位置
     * @param speed 子弹移动速度
     * @param accel 子弹移动加速度
     * @param interval 每颗子弹的角度间隔
     * @param delay 延迟发射时间
     * @param rotateAngle 子弹每帧旋转角度
     * @param survivalDuration 存活时间
     */
    public static CreateCircle(interval: number,value: BulletValue) {
        let angle = 0;

        let bullets=[];
        while (angle < 360) {
            let temp = this.CopyBulletValue(value);
            temp.direction = Helper.GetSpeedWithAngle(angle, value.speed);
            let bullet = Tools.CreateBullet();
            bullet.init(temp);
            bullets.push(bullet);
            angle += interval;
        }
        return bullets;
    }

    /**
     * 扇形弹幕
     * @param isOwn 是否为玩家子弹
     * @param type 子弹类型
     * @param color 子弹颜色
     * @param position 中心点的位置
     * @param startAngle 扇形的起始角度（向右为0°）
     * @param endAngle 扇形的结束角度（顺时针）
     * @param speed 子弹移动速度
     * @param accel 子弹移动加速度
     * @param interval 每颗子弹的角度间隔
     * @param duration 发射持续时间（为0表示瞬间发射所有）
     * @param delay 延迟发射时间
     * @param rotateAngle 子弹每帧旋转角度
     * @param survivalDuration 存活时间
     */
    public static async CreateRotateAndShoot(startAngle: number, endAngle: number, interval: number, duration:number,value: BulletValue,offsetPos?:number) {
        let count = startAngle;
        let angle = Math.abs(endAngle - startAngle);
        let wait = duration / angle;
        //let delay = value.activeDelay == undefined ? 0 : value.activeDelay;
        if(!offsetPos) offsetPos = 1;
        let bullets=[];

        let motionTimer=value.motionTimer;
        if(value.isTurnBack) motionTimer=value.isTurnBack.time;
        let num=motionTimer/(angle/interval);

        if (endAngle > startAngle) {
            while (count < endAngle) {
                let temp = this.CopyBulletValue(value);
                temp.direction = Helper.GetSpeedWithAngle(count, value.speed);
                // temp.activeDelay = ((count - startAngle) * wait) + delay;

                if(temp.isTurnBack){
                    temp.isTurnBack.time=motionTimer;
                    motionTimer-=num;
                }

                let normalize = temp.direction.normalize();
                temp.position = v2(temp.position.x+(normalize.x*offsetPos),temp.position.y+(normalize.y*offsetPos));
                let bullet = Tools.CreateBullet();
                bullet.init(temp);
                bullets.push(bullet);
                if(wait>0)
                await DissTian.Tool.delaySync(wait);
                count += interval;
            }
        }
        else {
            while (count > endAngle) {
                let temp = this.CopyBulletValue(value);
                temp.direction = Helper.GetSpeedWithAngle(count, value.speed);
                // temp.activeDelay = ((startAngle - count) * wait) + delay;

                if(temp.isTurnBack){
                    temp.isTurnBack.time=motionTimer;
                    motionTimer-=num;
                }

                let normalize = temp.direction.normalize();
                temp.position = v2(temp.position.x+(normalize.x*offsetPos),temp.position.y+(normalize.y*offsetPos));
                let bullet = Tools.CreateBullet();
                bullet.init(temp);
                bullets.push(bullet);
                if(wait>0)
                await DissTian.Tool.delaySync(wait);
                count -= interval;
            }
        }
        return bullets;
    }

    /**
     * 直线交叉弹幕
     * @param isOwn 是否为玩家子弹
     * @param type 子弹类型
     * @param color 子弹颜色
     * @param spawnCount 子弹数量
     * @param beginPos1 开始地点一
     * @param beginPos2 开始地点二
     * @param crossPos 交叉点
     * @param speed 子弹移动速度
     * @param accel 子弹移动加速度
     * @param duration 发射持续时间（为0表示瞬间发射所有）
     * @param delay 延迟发射时间
     */
    public static CreateCrossLine(spawnCount: number, beginPos1: Vec2, beginPos2: Vec2, crossPos: Vec2,duration:number, value: BulletValue) {
        let count = 0;
        let wait = duration / spawnCount;
        let delay = value.activeDelay == undefined ? 0 : value.activeDelay;
        let bullets = [];
        while (count < spawnCount) {
            let temp1 = this.CopyBulletValue(value);
            temp1.position = beginPos1;
            temp1.direction = Helper.GetSpeedWithPosition(beginPos1, crossPos, value.speed);
            temp1.activeDelay = wait * count + delay;

            let bullet1 = Tools.CreateBullet();
            bullet1.init(temp1);
            bullets.push(bullet1);

            let temp2 = this.CopyBulletValue(value);
            temp2.position = beginPos2;
            temp2.direction = Helper.GetSpeedWithPosition(beginPos2, crossPos, value.speed);
            temp2.activeDelay = wait * count + delay;

            let bullet2 = Tools.CreateBullet();
            bullet2.init(temp2);
            bullets.push(bullet2);
            count++;
        }
        return bullets;
    }

   

    /**
     * 直线弹幕
     * @param isOwn 是否为玩家子弹
     * @param type 子弹类型
     * @param color 子弹颜色
     * @param spawnCount 子弹数量
     * @param startPos 开始地点
     * @param targetPos 目标地点（用于确定方向而已）
     * @param speed 子弹移动速度
     * @param accel 子弹移动加速度
     * @param duration 发射持续时间
     * @param delay 延迟发射时间
     * @param value 需填方向
     */
    public static async CreateLine(spawnCount: number, duration:number,value: BulletValue) {
        if(!value || !value.direction){
            throw "需要方向";
        }
        let count = 0;
        let wait = duration / spawnCount;
        let delay = value.activeDelay == undefined ? 0 : value.activeDelay;
        let bullets=[];
        while (count < spawnCount) {
            let temp = this.CopyBulletValue(value);
            // temp.activeDelay = wait * count + delay;
            let bullet = Tools.CreateBullet();
            bullet.init(temp);
            bullets.push(bullet);
            count++;
            await DissTian.Tool.delaySync(wait);
        }
        return bullets;
    }
    /**
     * 随机弹幕
     * !@param isOwn 是否为玩家子弹
     * ?@param type 子弹类型
     * *@param color 子弹颜色
     * //@param spawnCount 子弹数量
     * todo@param boundary 子弹范围
     * @param speed 子弹速度（包括方向）
     * @param accel 子弹加速度（包括方向）
     * @param duration 发射持续时间（为0表示瞬间发射所有）
     * @param delay 延迟发射时间
     */
    public static CreateRandom(spawnCount: number,xMin:number,xMax:number,yMin:number,yMax:number,duration:number,value:BulletValue) {
        let count = 0;
        let wait = duration / spawnCount;
        let delay = value.activeDelay == undefined ? 0 : value.activeDelay;
        let bullets = [];
        while (count < spawnCount) {
            // let sp = value.speed.Get();
            // let dir = sp;
            // dir.Normalize();
            let temp = this.CopyBulletValue(value);
            temp.activeDelay = wait * count + delay;
            temp.position = Helper.GetRandomVector(xMin,xMax,yMin,yMax);
            temp.direction = Helper.GetRandomVector(xMin,xMax,yMin,yMax);
            let bullet = Tools.CreateBullet();
            bullet.init( temp);
            bullets.push(bullet);
            count++;
        }
        return bullets;
    }


    private static CopyBulletValue(value: BulletValue) {
        let temp: any = {}
        temp = Object.assign(temp, value);
        if (value.rotateAngle)
            temp.rotateAngle = value.rotateAngle.concat();
        return temp;
    }


    /**
     * 花瓣型弹幕
     * 弹幕持续8秒
     * @param position 
     */
    public static Petal(position: Vec2) {
        // this.CreateRotateAndShoot(0, position, 0, 300, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(1, position, 30, 330, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(2, position, 60, 360, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(3, position, 90, 390, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(4, position, 120, 420, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(5, position, 150, 450, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(6, position, 180, 480, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(2, position, 210, 510, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(4, position, 240, 540, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(5, position, 270, 570, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(1, position, 300, 600, 30, -350, 5, 8, 0);
        // this.CreateRotateAndShoot(3, position, 330, 630, 30, -350, 5, 8, 0);

        for (let i = 0; i < 12; i++) {
            this.CreateRotateAndShoot(0+30*i,300+30*i,5,8,{
                color:i%6,
                position,
                speed:-350,
                activeDelay:0,
                rotateAngle:[{angle:30}]
            });
        }
    }

    /**
     * 花瓣形弹幕2，先顺时针后逆时针
     * @param postition 
     */
    public static async Petal2(position:Vec2){
        for (let i = 0; i < 12; i++) {
            this.CreateRotateAndShoot(-(0+30*i),-(300+30*i),5,8,{
                color:i%6,
                position,
                speed:-350,
                activeDelay:0,
                // rotateAngle:[{angle:30}]
            });
        }
        await DissTian.Tool.delaySync(8);
        for (let i = 0; i < 12; i++) {
            this.CreateRotateAndShoot(0+30*i,300+30*i,5,8,{
                color:i%6,
                position,
                speed:-350,
                activeDelay:0,
                // rotateAngle:[{angle:30}]
            });
        }
    }

    public static async Petal3(position:Vec2){
        for (let i = 0; i < 18; i++) {
            // this.CreateLine(10,5,{
            //     color:i%6,
            //     speed:300,
            //     position,
            //     direction:Helper.GetSpeedWithAngle(i*20,300),
            //     activeDelay:0.3*i
            // });

            this.CreateRotateAndShoot(0,360,10,5,{
                color:i%6,
                speed:300,
                position,
            });
            await DissTian.Tool.delaySync(0.3);
        }
    }

    /**
     * 直线型弹幕
     * 弹幕持续5秒
     * @param GameBarrage 
     * @param barrage 
     * @returns 
     */
    public static Line() {

        this.CreateLine(50, 15,{
            position: v2(25, 0),
            direction: v2(25, 400),
            speed: 300,
            activeDelay: 0,
            color: 0
        });
        this.CreateLine(50, 15,{
            position: v2(75, 0),
            direction: v2(75, 400),
            speed: 300,
            activeDelay: 0,
            color: 0
        });
        this.CreateLine(50, 15,{
            position: v2(125, 0),
            direction: v2(125, 400),
            speed: 300,
            activeDelay: 0,
            color: 0
        });
        this.CreateLine(50, 15,{
            position: v2(175, 0),
            direction: v2(175, 400),
            speed: 300,
            duration: 15,
            activeDelay: 0,
            color: 0
        });
        this.CreateLine(50, 15,{
            position: v2(225, 0),
            direction: v2(225, 400),
            speed: 300,
            activeDelay: 0,
            color: 0
        });
        this.CreateLine(50, 15,{
            position: v2(275, 0),
            direction: v2(275, 400),
            speed: 300,
            activeDelay: 0,
            color: 0
        });
        this.CreateLine(50, 15,{
            position: v2(325, 0),
            direction: v2(325, 400),
            speed: 300,
            activeDelay: 0,
            color: 0
        });
        this.CreateLine(50, 15,{
            position: v2(375, 0),
            direction: v2(375, 400),
            speed: 300,
            activeDelay: 0,
            color: 0
        });
    }

    /**
     * 连续两拨错开的扇形弹幕
     * 弹幕持续时间2秒
     * @param position 
     * @returns 
     */
    public static TwoFans(position: Vec2) {
        // this.CreateRotateAndShoot(0, position, 45, 135, 30, 100, 5, 0, 0);
        // this.CreateRotateAndShoot(1, position, 43, 143, 30, 100, 5, 0, 0.3);
        // this.CreateRotateAndShoot(2, position, 41, 150, 30, 100, 5, 0, 0.6);

        this.CreateRotateAndShoot(45,135,5,0,{
            color:0,
            position,
            speed:300,
            activeDelay:0
        });
        this.CreateRotateAndShoot(43,143,5,0,{
            color:0,
            position,
            speed:300,
            activeDelay:0.3
        });
        this.CreateRotateAndShoot(41,150,5,0,{
            color:0,
            position,
            speed:300,
            activeDelay:0.6
        });
    }

    /**
     * 左右两边出现相反的漩涡型弹幕
     * 弹幕持续时间4秒
     * @param position 
     * @returns 
     */
    public static TwoReverseRotate(position: Vec2) {
        // this.CreateRotateAndShoot(0, v2(50, position.y), 0, 180, 350, -100, 8, 1, 0);
        // this.CreateRotateAndShoot(4, v2(50, position.y), 90, 270, 350, -100, 8, 1, 0);
        // this.CreateRotateAndShoot(0, v2(50, position.y), 180, 360, 350, -100, 8, 1, 0);
        // this.CreateRotateAndShoot(4, v2(50, position.y), 270, 450, 350, -100, 8, 1, 0);

        // this.CreateRotateAndShoot(1, v2(175, position.y), 180, 0, 350, -100, -8, 1, 0);
        // this.CreateRotateAndShoot(3, v2(175, position.y), 270, 90, 350, -100, -8, 1, 0);
        // this.CreateRotateAndShoot(1, v2(175, position.y), 360, 180, 350, -100, -8, 1, 0);
        // this.CreateRotateAndShoot(3, v2(175, position.y), 450, 270, 350, -100, -8, 1, 0);

        // this.CreateRotateAndShoot(2, v2(350, position.y), 180, 0, 350, -100, -8, 1, 0);
        // this.CreateRotateAndShoot(5, v2(350, position.y), 270, 90, 350, -100, -8, 1, 0);
        // this.CreateRotateAndShoot(2, v2(350, position.y), 360, 180, 350, -100, -8, 1, 0);
        // this.CreateRotateAndShoot(5, v2(350, position.y), 450, 270, 350, -100, -8, 1, 0);

        this.CreateRotateAndShoot(0,180,8,1,{
            color:0,
            speed:350,
            position
        });
        this.CreateRotateAndShoot(90,270,8,1,{
            color:0,
            speed:350,
            position
        });
        this.CreateRotateAndShoot(180,360,8,1,{
            color:0,
            speed:350,
            position
        });
        this.CreateRotateAndShoot(270,450,8,1,{
            color:0,
            speed:350,
            position
        });

        this.CreateRotateAndShoot(180,0,8,1,{
            color:0,
            speed:350,
            position
        });
        this.CreateRotateAndShoot(270,90,8,1,{
            color:0,
            speed:350,
            position
        });
        this.CreateRotateAndShoot(360,180,8,1,{
            color:0,
            speed:350,
            position
        });
        this.CreateRotateAndShoot(450,270,8,1,{
            color:0,
            speed:350,
            position
        });
    }


    /**
     * 三个园型弹幕
     * 弹幕持续时间5秒
     * @param position 
     * @returns 
     */
    public static ThreeCircle(position: Vec2) {
        // this.CreateCircle(0, position, 0, 250, 10, 0);
        // this.CreateCircle(1, v2(position.x + -100, position.y + 50), 0, 250, 10, 0);
        // this.CreateCircle(2, v2(position.x + 100, position.y + 50), 0, 250, 10, 0);

        // this.CreateCircle(3, position, 0, 250, 10, 0.5);
        // this.CreateCircle(4, v2(position.x + -100, position.y + 50), 0, 250, 10, 0.5);
        // this.CreateCircle(5, v2(position.x + 100, position.y + 50), 0, 250, 10, 0.5);

        // this.CreateCircle(6, position, 0, 250, 10, 1);
        // this.CreateCircle(2, v2(position.x + -100, position.y + 50), 0, 250, 10, 1);
        // this.CreateCircle(4, v2(position.x + 100, position.y + 50), 0, 250, 10, 1);

        this.CreateCircle(10,{
            color:0,
            position,
            speed:250 
        });
        this.CreateCircle(10,{
            color:0,
            position:v2(position.x + -100, position.y + 50),
            speed:250 
        });
        this.CreateCircle(10,{
            color:0,
            position:v2(position.x + 100, position.y + 50),
            speed:250 
        });
    }

    /**
     * X交叉型
     * @param position 
     */
    public static XOverlapping(position:Vec2){
        this.CreateCrossLine(10,v2(-screen.width/2,-screen.height/2),v2(screen.width/2,screen.height/2),v2(0,0),2,{
            color:5,
            speed:300,
            position
        });
        this.CreateCrossLine(10,v2(-screen.width/2,screen.height/2),v2(screen.width/2,-screen.height/2),v2(0,0),2,{
            color:5,
            speed:300,
            position
        });
    }



    public static Wang(position:Vec2){
        this.CreateLine(100,20,{
            color:5,
            speed:50,
            position,
            rotateAngle:[{delay:0.5,angle:90,duration:3,disposable:true}],
            direction:v2(0,1),
            duration:2,
            accel:200
        });

        this.CreateLine(100,20,{
            color:5,
            speed:250,
            position,
            rotateAngle:[{delay:0.5,angle:90,duration:3,disposable:true}],
            direction:v2(1,0),
            duration:2
        });

        this.CreateLine(100,20,{
            color:5,
            speed:250,
            position,
            rotateAngle:[{delay:0.5,angle:90,duration:3,disposable:true}],
            direction:v2(0,-1),
            duration:2
        });

        this.CreateLine(100,20,{
            color:5,
            speed:250,
            position,
            rotateAngle:[{delay:0.5,angle:90,duration:3,disposable:true}],
            direction:v2(-1,0),
            duration:2
        });
    }
}

