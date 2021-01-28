import { Util } from "../Common/util";
import { Element, Style } from "../Model/element";
import { zrShape, ZrShapeConstructor } from "./shapeScheduler";


export interface ShapeStatus {
    x: number;
    y: number;
    rotation: number;
    zIndex: number;
    width: number;
    height: number;
    content: string;
    style: Style;
};



export class Shape {
    id: string = '';
    type: string = '';
    zrConstructor: ZrShapeConstructor = null;
    zrShape: zrShape = null;
    targetElement: Element = null;
    
    shapeStatus: ShapeStatus = {
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

    constructor(id: string, zrConstructor: ZrShapeConstructor, element: Element) {
        this.id = id;
        this.type = Util.getClassName(zrConstructor);
        this.targetElement = element;
        this.zrConstructor = zrConstructor;
        this.zrShape = new zrConstructor();
    }

    /**
     * 设置属性
     * @param propName 
     * @param props 
     * @param sync
     */
    attr(propName: string, props: any, sync: boolean = false) {
        if(this.shapeStatus[propName] === undefined) return;

        if(propName === 'style') {
            Util.merge(this.shapeStatus.style, props);
        }
        else {
            this.shapeStatus[propName] = props;
        }

        if(sync) {
            this.zrShape.attr(propName, props);
        }
    }


    updateShape() {

    }
};


