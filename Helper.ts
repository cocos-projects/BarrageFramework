import { CCInteger, math, v2, Vec2, Vec3 } from "cc";


export class Helper {
    private static mSinValue: number[];
    private static mCosValue: number[];

    public static deg2Rad = (Math.PI * 2) / 360;

    static init() {
        this.mCosValue = [];
        this.mSinValue = [];
        for (let i = 0; i < 360; i++) {
            this.mSinValue.push(Math.sin(i * (Math.PI / 180)));
            this.mCosValue.push(Math.cos(i * (Math.PI / 180)));
        }
    }

    public static FastSin(angle: number): number {
        angle = angle % 360;

        if (angle < 0) {
            angle = -angle;
            return -this.mSinValue[angle];
        }

        return this.mSinValue[angle];
    }

    public static FastCos(angle: number): number {
        angle = angle % 360;

        if (angle < 0) {
            angle = -angle;
        }

        return this.mCosValue[angle];
    }

    public static Clamp(value: number, min: number, max: number): number {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    public static GetRandomFloat(min: number, max: number): number {
        return min + Math.random() * (max - min);
    }

    public static GetRandomBool(): boolean {
        return Math.random() <= 0.5;
    }

    public static GetRandomInt(min: number, max: number): number {
        let differ = min - max
        let random = Math.random()
        return Number((min + differ * random).toFixed(0));
    }

    public static GetRandomPosition(left: number, right: number, top: number, bottom: number): Vec2 {
        return v2(this.GetRandomFloat(left, right), this.GetRandomFloat(top, bottom));
    }

    public static GetRandomVector(xMin: number, xMax: number, yMin: number, yMax: number): Vec2 {
        return v2(this.GetRandomFloat(xMin, xMax), this.GetRandomFloat(yMin, yMax));
    }

    public static GetSpeedWithAngle(angle: number, speed: number): Vec2 {
        angle = Math.ceil(angle);
        let x = Helper.FastCos(angle) * (speed);
        let y = Helper.FastSin(angle) * (speed);

        return v2(x, y);
    }

    public static GetSpeedWithPosition(start: Vec2, end: Vec2, speed: number): Vec2 {
        let result = end.clone().subtract(start);
        result.normalize();
        return result.multiplyScalar(speed);
    }


    public static GetRotatePosition(targetPosition: Vec2|Vec3, centerPosition: Vec2|Vec3, angele: number): Vec2 {

        let endX = (targetPosition.x - centerPosition.x) * Math.cos(angele * this.deg2Rad) -
            (targetPosition.y - centerPosition.y) * Math.sin(angele * this.deg2Rad) + centerPosition.x;
        let endY = (targetPosition.y - centerPosition.y) * Math.cos(angele * this.deg2Rad) +
            (targetPosition.x - targetPosition.x) * Math.sin(angele * this.deg2Rad) + centerPosition.y;
        return v2(endX, endY);
    }
}

