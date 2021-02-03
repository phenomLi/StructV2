import { LinkTarget } from "../sources";
import { Shape } from "../View/shape";
import { zrShape } from "../View/shapeScheduler";
import { Element, ElementStatus, Style } from "./element";
import { LabelStyle } from "./pointer";



export interface LinkOptions {
    style: Style;
    labelStyle: LabelStyle;                  
};


export interface LinkStatus extends ElementStatus {
    points: [number, number][];
};


export class Link { 
    id: string;
    element: Element = null;
    target: Element = null;
    linkLabel: string = null;
    linkStatus: LinkStatus;

    shapes: Shape[] | Shape = [];
    index: number = -1;
    sourceLinkTarget: LinkTarget = null;

    isDirty: boolean = false;

    constructor() { }

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