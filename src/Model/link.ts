import { LinkTarget } from "../sources";
import { zrShape } from "../View/shapeScheduler";
import { Element, Style } from "./element";
import { LabelStyle } from "./pointer";


export interface LinkOptions {
    style: Style;
    labelStyle: LabelStyle;                  
};



export class Link { 
    // 连线 id
    id: string;
    // 连线起始 element
    element: Element;
    // 连线目标 element
    target: Element;
    // 连线类型名称
    linkName: string;
    // 连线图形实例
    zrShapes: zrShape[];
    // 连线序号
    index: number;
    // 连线在源数据的声明
    sourceLinkTarget: LinkTarget;

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
};