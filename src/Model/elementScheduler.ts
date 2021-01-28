import { Engine } from "../engine";
import { SourceElement, Sources } from "../sources";
import { Shape, ShapeStatus } from "../View/shape";
import { ZrShapeConstructor } from "../View/shapeScheduler";
import { Element } from "./element";


// 元素集类型
export type ElementContainer = { [key: string]: Element[] };
export type ElementConstructor = { new(elementLabel: string, sourceElement: SourceElement): Element };


export class ElementScheduler {
    private engine: Engine;
    // 元素队列
    private elementList: Element[] = [];
    // 元素容器，即源数据经element包装后的结构
    private elementContainer: ElementContainer = {};

    private elementMap: { 
        [key: string]: { 
            elementConstructor: ElementConstructor,
            zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
            shapeOptions: Partial<ShapeStatus>
        } 
    };

    constructor(engine: Engine) {
        this.engine = engine;
    }

    /**
     * 设置一个元素的信息
     * @param elementLabel 
     * @param elementConstructor 
     * @param zrShapeConstructors
     * @param shapeOptions 
     */
    setElementMap(
        elementLabel: string, 
        elementConstructor: ElementConstructor, 
        zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
        shapeOptions: Partial<ShapeStatus>
    ) {
        this.elementMap[elementLabel] = {
            elementConstructor,
            zrShapeConstructors,
            shapeOptions
        };
    }

    /**
     * 从源数据构建 element 集
     * 主要工作：
     * - 遍历源数据，将每个 SourceElement 转化为 Element
     * - 处理连接
     * - 处理指针
     * @param sourceData
     */
    constructElements(sourceData: Sources) {
        if(Array.isArray(sourceData)) {
            this.elementContainer['element'] = [];
            sourceData.forEach(item => {
                if(item) {
                    let ele = this.createElement(item, 'element');
                    this.elementContainer['element'].push(ele);
                    this.elementList.push(ele);
                }
            });
        }
        else {
            Object.keys(sourceData).forEach(prop => {
                this.elementContainer[prop] = [];
                sourceData[prop].forEach(item => {
                    if(item) {
                        let ele = this.createElement(item, prop);
                        this.elementContainer[prop].push(ele);
                        this.elementList.push(ele);
                    }
                });
            });
        }
    }

    /**
     * 元素工厂，创建Element
     * @param sourceElement
     * @param elementLabel
     */
    private createElement(sourceElement: SourceElement, elementLabel: string): Element {
        let elementInfo = this.elementMap[elementLabel],
            shapes: Shape[] | Shape;

        if(elementInfo === undefined) {
            return null;
        }

        let { elementConstructor, zrShapeConstructors, shapeOptions } = elementInfo,
            element: Element = null,
            elementId = `${elementLabel}#${sourceElement.id}`;

        element = new elementConstructor(elementLabel, sourceElement);
        element.applyShapeOptions(shapeOptions);

        if(Array.isArray(zrShapeConstructors)) {
            shapes = zrShapeConstructors.map((item, index) => new Shape(`${elementId}(${index})`, item, element));
        }
        else {
            shapes = new Shape(`elementId`, zrShapeConstructors, element);
        }

        element.defineShape(shapes, element.elementStatus);

        return element;
    }


    public updateShapes() {
        for(let i = 0; i < this.elementList.length; i++) {
            let ele = this.elementList[i];

            if(ele.isDirty) {
                ele.renderShape();
            }
        }
    }

    /**
     * 获取所有element元素
     */
    public getElementContainer(): ElementContainer | Element[] {
        let keys = Object.keys(this.elementContainer);

        if(keys.length === 1 && keys[0] === 'element') {
            return this.elementContainer['element'];
        }

        return this.elementContainer;
    }

    /**
     * 获取element列表
     */
    public getElementList(): Element[] {
        return this.elementList;
    }

    /**
     * 重置数据
     */
    public reset() {
        this.elementList.length = 0;
        this.elementContainer = {};
    }
};