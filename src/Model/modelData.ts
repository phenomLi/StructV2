import { Util } from "../Common/util";
import { ElementLabelOption, ElementOption, LinkLabelOption, LinkOption, PointerOption, Style } from "../options";
import { SourceElement } from "../sources";
import { BoundingRect } from "../View/boundingRect";


export interface G6NodeModel {
    id: string;
    x: number;
    y: number;
    rotation: number;
    type: string;
    size: number | [number, number];
    anchorPoints: [number, number];
    label: string;
    style: Style;
    labelCfg: ElementLabelOption;
    externalPointerId: string; 
};


export interface G6EdgeModel {
    id: string;
    source: string | number;
    target: string | number;
    type: string;
    sourceAnchor: number | ((index: number) => number);
    targetAnchor: number | ((index: number) => number);
    label: string;
    style: Style;
    labelCfg: LinkLabelOption;
};


class Model {
    id: string;
    name: string;

    props: G6NodeModel | G6EdgeModel;
    G6Item;

    constructor(id: string, name: string) { 
        this.id = id;
        this.name = name;
        this.G6Item = null;
        this.props = null;
    }

    /**
     * 初始化 G6 model 的属性
     * @param option 
     */
    initProps(option: ElementOption | LinkOption | PointerOption) { }

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
    set(attr: string, value: any) {
        if(this.props[attr] === undefined) {
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
        else if(attr === 'x' || attr === 'y') {
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
        return this.G6Item.getContainer().getMatrix();
    }

    /**
     * 钩子函数：在获取 G6Item 后执行
     */
    afterInitG6Item() {
        this.set('rotation', this.get('rotation'));
    }
}


export class Element extends Model {
    constructor(type: string, sourceElement: SourceElement) {
        super(sourceElement.id.toString(), type);

        Object.keys(sourceElement).map(prop => {
            if(prop !== 'id') {
                this[prop] = sourceElement[prop];
            }
        });
    }

    /**
     * 初始化 G6 model 的属性
     * @param option 
     */
    initProps(option: ElementOption) {
        this.props = {
            id: this.id,
            x: 0,
            y: 0,
            rotation: option.rotation || 0,
            type: option.type,
            size: option.size,
            anchorPoints: option.anchorPoint,
            label: null,
            style: Util.objectClone<Style>(option.style),
            labelCfg: Util.objectClone<ElementLabelOption>(option.labelOptions),
            externalPointerId: null
        };
    }
};



export class Link extends Model { 
    element: Element;
    target: Element;
    index: number;

    constructor(type: string, element: Element, target: Element, index: number) { 
        super(`${element.id}-${target.id}`, type);
        this.element = element;
        this.target = target;
        this.index = index;
    }

    /**
     * 初始化 G6 model 的属性
     * @param option 
     */
    initProps(option: LinkOption) {
        let sourceAnchor = option.sourceAnchor, 
            targetAnchor = option.targetAnchor;

        if(option.sourceAnchor && typeof option.sourceAnchor === 'function' && this.index !== null) {
            sourceAnchor = option.sourceAnchor(this.index);
        }

        if(option.targetAnchor && typeof option.targetAnchor === 'function' && this.index !== null) {
            targetAnchor = option.targetAnchor(this.index);
        }

        this.props = {
            id: this.id,
            type: option.type,
            source: this.element.id,
            target: this.target.id,
            sourceAnchor,
            targetAnchor,
            label: option.label,
            style: Util.objectClone<Style>(option.style),
            labelCfg: Util.objectClone<LinkLabelOption>(option.labelOptions)
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

    /**
     * 初始化 G6 model 的属性
     * @param option 
     */
     initProps(option: ElementOption) {
        this.props = {
            id: this.id,
            x: 0,
            y: 0,
            rotation: 0,
            type: option.type || 'external-pointer',
            size: option.size,
            anchorPoints: option.anchorPoint,
            label: typeof this.label === 'string'? this.label: this.label.join(', '),
            style: Util.objectClone<Style>(option.style),
            labelCfg: Util.objectClone<ElementLabelOption>(option.labelOptions),
            externalPointerId: null
        };
    }
};