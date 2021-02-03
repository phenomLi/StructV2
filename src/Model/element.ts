import { Util } from "../Common/util";
import { SourceElement } from "../sources";
import { Shape, ShapeStatus } from "../View/shape";
import { zrShape } from "../View/shapeScheduler";
import { Link } from "./link";
import { Pointer } from "./pointer";


export interface Style {
    // 填充颜色
    fill: string;
    // 图形文本
    text: string;
    // 文本颜色
    textFill: string;
    // 字体大小
    fontSize: number;
    // 字重
    fontWeight: number;
    // 描边样式
    stroke: string;
    // 透明度
    opacity: number;
    // 线宽
    lineWidth: number;
    // 其余属性（免得每次新增属性都要声明一个新的子interface）
    [key: string]: any;
}



export interface ElementStatus {
    x: number;
    y: number;
    rotation: number;
    width: number;
    height: number;
    zIndex: number;
    content: string;
    style: Style;
};




export class Element {
    id: number;
    elementId: string = null;
    elementLabel: string = null;

    elementStatus: ElementStatus = null;
    shapes: Shape[] | Shape = null;
    relativeLinks: Link[] = [];
    relativePointers: Pointer[] = [];

    isDirty: boolean = false;

    // 给sourceElement的部分    
    [key: string]: any;

    constructor(elementLabel: string, sourceElement: SourceElement) {
        this.elementLabel = elementLabel;

        Object.keys(sourceElement).map(prop => {
            this[prop] = sourceElement[prop];
        });

        this.elementStatus = {
            x: 0, y: 0,
            rotation: 0,
            width: 0, 
            height: 0,
            zIndex: 1,
            content: '',
            style: {
                fill: '#000',
                text: '',
                textFill: '#000',
                fontSize: 15,
                fontWeight: null,
                stroke: null,
                opacity: 1,
                transformText: true,
                lineWidth: 1
            }
        };
    }

    /**
     * set方法，设置elementStatus的值
     * @param propName 
     * @param value 
     */
    set(propName: string, value: any) {
        if(this.elementStatus[propName] !== undefined) {
            this.elementStatus[propName] = value;
        }

        this.setDirty(true);
    }

    /**
     * 元素是否为脏
     * @param isDirty 
     */
    setDirty(isDirty: boolean) {
        this.isDirty = isDirty;
    }

    /**
     * 定义该element映射的图形
     * @param shapes 
     * @param elementStatus
     * @override
     */
    renderShape(shapes: Shape[] | Shape, elementStatus: ElementStatus) { }

    /**
     * 应用shapeOptions
     * @param shapeOptions 
     */
    applyShapeOptions(shapeOptions: Partial<ShapeStatus>) {
        Util.extends(this.elementStatus, shapeOptions);
    }

    // ------------------------------- 钩子方法 ------------------------------

    onClick(event: any) { }

    /**
     * 当结点连接其他结点触发
     * @param targetEle 
     */
    onLinkTo(targetEle: Element) {};

    /**
     * 当结点被其他结点连接时触发
     * @param emitEle 
     */
    onLinkFrom(emitEle: Element) {};

    /**
     * 当结点断开与其他结点触发
     * @param targetEle
     */
    onUnLinkTo(targetEle: Element) {}

    /**
     * 当结点被其他结点断开连接时触发
     * @param emitEle 
     */
    onUnLinkFrom(emitEle: Element) {}

    /**
     * 当指向结点时触发
     */
    onRefer() {}

    /**
     * 当指针离开该结点触发
     */
    onUnRefer() {}
};