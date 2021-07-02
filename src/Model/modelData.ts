import { Util } from "../Common/util";
import { ElementLabelOption, ElementOption, LinkLabelOption, LinkOption, PointerOption, Style } from "../options";
import { SourceElement } from "../sources";
import { BoundingRect } from "../Common/boundingRect";
import { SV } from './../StructV';


export interface G6NodeModel {
    id: string;
    x: number;
    y: number;
    rotation: number;
    type: string;
    size: number | [number, number];
    anchorPoints: [number, number];
    label: string | string[];
    style: Style;
    labelCfg: ElementLabelOption;
    externalPointerId: string; 
    SVLayouter: string;
    SVModelType: string;
    SVModelName: string;
};


export interface G6EdgeModel {
    id: string;
    source: string | number;
    target: string | number;
    type: string;
    curveOffset: number;
    sourceAnchor: number | ((index: number) => number);
    targetAnchor: number | ((index: number) => number);
    label: string;
    style: Style;
    labelCfg: LinkLabelOption;
    SVModelType: string;
    SVModelName: string;
};


export class Model {
    id: string;
    type: string;
    isLeak: boolean;
    
    props: G6NodeModel | G6EdgeModel;
    shadowG6Item;
    renderG6Item;
    G6Item;

    constructor(id: string, type: string) { 
        this.id = id;
        this.type = type;
        this.shadowG6Item = null;
        this.renderG6Item = null;
        this.G6Item = null;
        this.props = <G6NodeModel | G6EdgeModel>{ };
        this.isLeak = false;
    }

    /**
     * @override
     * 定义 G6 model 的属性
     * @param option 
     */
    protected defineProps(option: ElementOption | LinkOption | PointerOption) {
        return null;
    }

    /**
     * 初始化 G6 model 的属性
     * @param option 
     */
    initProps(option: ElementOption | LinkOption | PointerOption) { 
        this.props = this.defineProps(option);
    }

    /**
     * 克隆 G6 model 的属性
     * @returns 
     */
    cloneProps() {
        return Util.objectClone(this.props);
    }

    /**
     * 获取 G6 model 的属性
     * @param attr 
     */
    get(attr: string): any {
        return this.props[attr];
    }

    /**
     * 设置 G6 model 的属性
     * @param attr 
     * @param value 
     * @returns 
     */
    set(attr: string | object, value?: any) {
        if(typeof attr === 'object') {
            Object.keys(attr).map(item => {
                this.set(item, attr[item]);
            });
            return;
        }

        if(this.props[attr] === value) {
            return;
        }

        if(attr === 'style' || attr === 'labelCfg') {
            Object.assign(this.props[attr], value);
        }
        else {
            this.props[attr] = value;
        }

        if(this.G6Item === null) {
            return;
        }

        if(attr === 'rotation') {
            const matrix = Util.calcRotateMatrix(this.getMatrix(), value);
            this.set('style', { matrix });
        }
        
        if(attr === 'x' || attr === 'y') {
            this.G6Item.updatePosition({
                [attr]: value
            });
        }
        else {
            this.G6Item.update(this.props);
        }
    }

    /**
     * 获取包围盒
     * @returns 
     */
    getBound(): BoundingRect {
        return this.G6Item.getBBox();
    }

    /**
     * 获取变换矩阵
     */
    getMatrix(): number[] {
        if(this.G6Item === null) return null;
        const Mat3 = SV.G6.Util.mat3;
        return Mat3.create();
    }

    getType(): string {
        return this.type;
    }

    getId(): string {
        return this.id;
    }
}


export class Element extends Model {
    sourceElement: SourceElement;
    sourceId: string;
    groupName: string;
    layouterName: string;
    freed: boolean;

    constructor(id: string, type: string, group: string, layouter: string, sourceElement: SourceElement) {
        super(id, type);

        if(type === null) {
            return;
        }

        this.groupName = group;
        this.layouterName = layouter;
        this.freed = false;

        Object.keys(sourceElement).map(prop => {
            if(prop !== 'id') {
                this[prop] = sourceElement[prop];
            }
        });

        this.sourceId = this.id.split('.')[1];
        this.sourceElement = sourceElement;
    }

    protected defineProps(option: ElementOption): G6NodeModel {
        return {
            ...this.sourceElement,
            id: this.id,
            x: 0,
            y: 0,
            rotation: option.rotation || 0,
            type: option.type,
            size: option.size || [60, 30],
            anchorPoints: option.anchorPoints,
            label: option.label,
            style: Util.objectClone<Style>(option.style),
            labelCfg: Util.objectClone<ElementLabelOption>(option.labelOptions),
            externalPointerId: null,
            SVLayouter: this.layouterName,
            SVModelType: 'element',
            SVModelName: this.type
        };
    }
};



export class Link extends Model { 
    element: Element;
    target: Element;
    index: number;

    constructor(id: string, type: string, element: Element, target: Element, index: number) { 
        super(id, type);
        this.element = element;
        this.target = target;
        this.index = index;
    }


    protected defineProps(option: LinkOption): G6EdgeModel {
        let sourceAnchor = option.sourceAnchor, 
            targetAnchor = option.targetAnchor;

        if(option.sourceAnchor && typeof option.sourceAnchor === 'function' && this.index !== null) {
            sourceAnchor = option.sourceAnchor(this.index);
        }

        if(option.targetAnchor && typeof option.targetAnchor === 'function' && this.index !== null) {
            targetAnchor = option.targetAnchor(this.index);
        }

        return {
            id: this.id,
            type: option.type,
            source: this.element.id,
            target: this.target.id,
            sourceAnchor,
            targetAnchor,
            label: option.label,
            style: Util.objectClone<Style>(option.style),
            labelCfg: Util.objectClone<LinkLabelOption>(option.labelOptions),
            curveOffset: option.curveOffset,
            SVModelType: 'link',
            SVModelName: this.type
        };
    }
};



export class Pointer extends Model {
    target: Element;
    label: string | string[];

    constructor(id: string, type: string, label: string | string[], target: Element) {
        super(id, type);
        this.target = target;
        this.label = label;

        this.target.set('externalPointerId', id);
    }

    protected defineProps(option: ElementOption): G6NodeModel {
        return {
            id: this.id,
            x: 0,
            y: 0,
            rotation: 0,
            type: option.type || 'external-pointer',
            size: option.size || [8, 45],
            anchorPoints: option.anchorPoints,
            label: typeof this.label === 'string'? this.label: this.label.join(', '),
            style: Util.objectClone<Style>(option.style),
            labelCfg: Util.objectClone<ElementLabelOption>(option.labelOptions),
            externalPointerId: null,
            SVLayouter: null,
            SVModelType: 'pointer',
            SVModelName: this.type
        };
    }
};