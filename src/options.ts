

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
    anchorPoint: [number, number];
    label: string;
    labelOptions: ElementLabelOption;
    style: Style;
}


export interface LinkOption {
    type: string;
    sourceAnchor: number | ((index: number) => number);
    targetAnchor: number | ((index: number) => number);
    label: string;
    controlPoints: { x: number, y: number }[];
    curveOffset: number;
    labelOptions: LinkLabelOption;
    style: Style;
}


export interface PointerOption extends ElementOption {
    position: 'top' | 'left' | 'bottom' | 'right';
    offset: number;
};


export interface LayoutOptions {
    fitCenter: boolean;
    fitView: boolean;
    [key: string]: any;
};


export interface AnimationOptions {
    enable: boolean;
    duration: number;
    timingFunction: string;
};


export interface InteractionOptions {
    drag: boolean;
    zoom: boolean;
    dragNode: boolean | string[];
    selectNode: boolean | string[];
};


export interface Options {
    element: { [key: string]: ElementOption };
    link?: { [key: string]: LinkOption }
    pointer?: { [key: string]: PointerOption };
    layout?: LayoutOptions;
    animation?: AnimationOptions;
    interaction?: InteractionOptions;
};




