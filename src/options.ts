import { Element } from "./Model/modelData";
import { SourceElement } from "./sources";


export interface Style {
    fill: string; // 填充颜色
    text: string; // 图形文本
    textFill: string; // 文本颜色
    fontSize: number; // 字体大小
    fontWeight: number; // 字重
    stroke: string; // 描边样式
    opacity: number; // 透明度
    lineWidth: number; // 线宽
    matrix: number[]; // 变换矩阵
};


export interface ElementLabelOption {
    position: string;
    offset: number;
    style: Style;
};


export interface LinkLabelOption {
    refX: number;
    refY: number;
    position: string;
    autoRotate: boolean;
    style: Style;
};



export interface ElementOption {
    type: string;
    size: number | [number, number];
    rotation: number;
    anchorPoints: [number, number];
    label: string | string[];
    labelOptions: ElementLabelOption;
    style: Style;
}


export interface LinkOption {
    type: string;
    sourceAnchor: number | ((index: number) => number);
    targetAnchor: number | ((index: number) => number);
    label: string;
    curveOffset: number;
    labelOptions: LinkLabelOption;
    style: Style;
}


export interface PointerOption extends ElementOption {
    anchor: number;
    offset: number;
};


export interface LayoutOptions {
    [key: string]: any;
};


export interface BehaviorOptions {
    dragNode: boolean | string[];
    selectNode: boolean | string[];
};


export interface LayoutGroupOptions {
    element: { [key: string]: ElementOption };
    link?: { [key: string]: LinkOption }
    pointer?: { [key: string]: PointerOption };
    layout?: LayoutOptions;
    behavior?: BehaviorOptions;
};


/**
 * ---------------------------------------------------------------------------------------------------------------------------------------------
 * -------------------------------------------------------------------------------------------------------------------------------------------
 * ------------------------------------------------------------------------------------------------------------------------
 */

export interface ViewOptions {
    fitCenter: boolean;
    fitView: boolean;
    groupPadding: number;
}


export interface AnimationOptions {
    enable: boolean;
    duration: number;
    timingFunction: string;
};


export interface InteractionOptions {
    changeHighlight: string;
    drag: boolean;
    zoom: boolean;
}

export interface EngineOptions {
    freedContainer?: HTMLElement;
    leakContainer?: HTMLElement;
    view?: ViewOptions;
    animation?: AnimationOptions;
    interaction?: InteractionOptions;
};


export interface Layouter {
    defineOptions(): LayoutGroupOptions;
    sourcesPreprocess?(sources: SourceElement[], options: LayoutGroupOptions): SourceElement[];
    defineLeakRule?(elements: Element[]): Element[];
    layout(elements: Element[], layoutOptions: LayoutOptions);
    [key: string]: any;
}

