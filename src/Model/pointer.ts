import { Shape } from "../View/shape";
import { zrShape } from "../View/shapeScheduler";
import { ElementStatus, Style } from "./element";


export interface LabelStyle extends Style {
    textBackgroundColor: 'rgba(0, 0, 0, 1)',
    textFill: '#fff',
    textPadding: [4, 4, 4, 4]
};


export interface PointerOptions {
    labelStyle: LabelStyle;
    style: Style;
};


export class Pointer {
    // 指针 id
    id: string;
    // 指针图形实例
    shape: Shape;
    // 指针类型名称
    pointerLabel: string;
    // 被该指针合并的其他指针
    branchPointer: Pointer[];
    // 若该指针是一个被合并的指针，保存合并这个指针的主指针
    masterPointer: Pointer;

    // 指针标签内容
    text: string;
    //  指针标签图形实例
    textZrShapes: Shape[];
    // 逗号图形实例
    commaShapes: Shape[];
    // 目标 element
    target: Element;

    isDirty: boolean = false;

    constructor() {

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
};