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
    modelType: string;
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


export class Model {
    id: string;
    name: string;
    type: string;

    props: G6NodeModel | G6EdgeModel;
    shadowG6Item;
    renderG6Item;
    G6Item;

    constructor(id: string, name: string) { 
        this.id = id;
        this.name = name;
        this.shadowG6Item = null;
        this.renderG6Item = null;
        this.G6Item = null;
        this.props = <G6NodeModel | G6EdgeModel>{ };
    }

    /**
     * @override
     * 定义 G6 model 的属性
     * @param option 
     */
    protected defineProps(option: ElementOption | LinkOption | PointerOption): G6NodeModel | G6EdgeModel {
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
    cloneProps(): G6NodeModel | G6EdgeModel {
        return Util.objectClone(this.props);
        // return this.props;
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
}


export class Element extends Model {
    type = 'element';
    sourceElement: SourceElement;

    constructor(type: string, sourceElement: SourceElement) {
        super(sourceElement.id.toString(), type);

        Object.keys(sourceElement).map(prop => {
            if(prop !== 'id') {
                this[prop] = sourceElement[prop];
            }
        });
    }

    protected defineProps(option: ElementOption) {
        return {
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
            externalPointerId: null,
            modelType: this.type
        };
    }
};



export class Link extends Model { 
    type = 'link';
    element: Element;
    target: Element;
    index: number;

    constructor(id: string, type: string, element: Element, target: Element, index: number) { 
        super(id, type);
        this.element = element;
        this.target = target;
        this.index = index;
    }


    protected defineProps(option: LinkOption) {
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
            labelCfg: Util.objectClone<LinkLabelOption>(option.labelOptions)
        };
    }
};



export class Pointer extends Model {
    type = 'pointer';
    target: Element;
    label: string | string[];

    constructor(id: string, type: string, label: string | string[], target: Element) {
        super(id, type);
        this.target = target;
        this.label = label;

        this.target.set('externalPointerId', 
        id);
    }

    protected defineProps(option: ElementOption) {
        return {
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
            externalPointerId: null,
            modelType: this.type
        };
    }
};