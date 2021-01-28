import { Util } from "../Common/util";
import { Engine } from "../engine";
import { Shape } from "./shape";
import * as zrender from "zrender";
import { Element } from "../Model/element";


export type zrShape = any;
export type ZrShapeConstructor = { new(): zrShape };


export class ShapeScheduler {
    private engine: Engine;
    private shapeList: Shape[] = [];
    private shapeTable: { [key: string]: Shape[] } = {};

    private appendList: Shape[] = [];
    private removeList: Shape[] = [];

    constructor(engine: Engine) {
        this.engine = engine;
    }

    /**
     * 创建图形元素
     * @param id 
     * @param zrShapeConstructors 
     * @param element 
     */
    createShape(id: string, zrShapeConstructors: ZrShapeConstructor, element: Element): Shape {
        let shapeType = Util.getClassName(zrShapeConstructors),
            shape = this.getReuseShape(id, shapeType);

        if(shape === null) {
            shape = new Shape(id, zrShapeConstructors, element);
        }

        return shape;
    }

    /**
     * 添加一个图形
     * @param shape 
     */
    private appendShape(shape: Shape) {
        let shapeType = shape.type;

        if(this.shapeTable[shapeType] === undefined) {
            this.shapeTable[shapeType] = [];
        }

        this.shapeTable[shapeType].push(shape);
        this.shapeList.push(shape);
        this.appendList.push(shape);
    }

    /**
     * 移除一个图形
     * @param shape 
     */
    private removeShape(shape: Shape) {
        let shapeType = shape.type;

        Util.removeFromList(this.shapeTable[shapeType], item => item.id === shape.id); 

        if(this.shapeTable[shapeType].length === 0) {
            delete this.shapeTable[shapeType];
        }

        Util.removeFromList(this.shapeList, item => item.id === shape.id); 
        this.removeList.push(shape);
    }

    /**
     * 查找可复用的图形
     * @param id 
     * @param shapeType 
     */
    private getReuseShape(id: string, shapeType: string): Shape {
        if(this.shapeTable[shapeType] !== undefined) {
            let reuseShape = this.shapeTable[shapeType].find(item => item.id === id);

            if(reuseShape) return reuseShape;
        }

        return null;
    }

    /**
     * 重置数据
     */
    public reset() {
        this.appendList.length = 0;
        this.removeList.length = 0;
    }
};