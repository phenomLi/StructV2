import { Util } from "../Common/util";
import { Engine } from "../engine";
import { LinkOption, PointerOption } from "../options";
import { sourceLinkData, SourceElement, Sources, LinkTarget } from "../sources";
import { Element, Link, Pointer } from "./modelData";


export interface ConstructedData {
    element: { [key: string]: Element[] };
    link: { [key: string]: Link[] };
    pointer: { [key: string]: Pointer[] };
};


export class ModelConstructor {
    private engine: Engine;
    private constructedData: ConstructedData;

    constructor(engine: Engine) {
        this.engine = engine;
        this.constructedData = null;
    }

    /**
     * 构建element，link和pointer
     * @param sourceData 
     */
    public construct(sourceData: Sources): ConstructedData {
        let elementContainer = this.constructElements(sourceData),
            linkContainer = this.constructLinks(this.engine.linkOptions, elementContainer),
            pointerContainer = this.constructPointers(this.engine.pointerOptions, elementContainer);

        this.constructedData = { 
            element: elementContainer,
            link: linkContainer,
            pointer: pointerContainer
        };
        
        return this.constructedData;
    }

    /**
     * 从源数据构建 element 集
     * @param sourceData
     */
    private constructElements(sourceData: Sources): { [key: string]: Element[] } {
        let defaultElementName: string = 'default',
            elementContainer: { [key: string]: Element[] } = { };

        if(Array.isArray(sourceData)) {
            elementContainer[defaultElementName] = [];
            sourceData.forEach(item => {
                if(item) {
                    let ele = this.createElement(item, defaultElementName);
                    elementContainer[defaultElementName].push(ele);
                }
            });
        }
        else {
            Object.keys(sourceData).forEach(prop => {
                elementContainer[prop] = [];
                sourceData[prop].forEach(item => {
                    if(item) {
                        let element = this.createElement(item, prop);
                        elementContainer[prop].push(element);
                    }
                });
            });
        }

        return elementContainer;
    }

    /**
     * 从配置和 element 集构建 link 集
     * @param linkOptions 
     * @param elementContainer 
     * @returns 
     */
    private constructLinks(linkOptions: { [key: string]: LinkOption }, elementContainer: { [key: string]: Element[] }): { [key: string]: Link[] } {
        let linkContainer: { [key: string]: Link[] } = { },
            elementList: Element[] = Object
                .keys(elementContainer)
                .map(item => elementContainer[item])
                .reduce((prev, cur) => [...prev, ...cur]),
            linkNames = Object.keys(linkOptions);

        linkNames.forEach(name => {
            linkContainer[name] = [];
        });

        linkNames.forEach(name => {
            for(let i = 0; i < elementList.length; i++) {
                let element: Element = elementList[i],
                    sourceLinkData: sourceLinkData = element.sourceElement[name],
                    targetElement: Element | Element[] = null,
                    link: Link = null;

                if(sourceLinkData === undefined || sourceLinkData === null) {
                    element[name] = null;
                    continue;
                }

                //  ------------------- 将连接声明字段 sourceLinkData 从 id 变为 Element -------------------
                if(Array.isArray(sourceLinkData)) {
                    element[name] = sourceLinkData.map((item, index) => {
                        targetElement = this.fetchTargetElements(elementContainer, element, item);

                        if(targetElement) {
                            link = this.createLink(name, element, targetElement, index);
                            linkContainer[name].push(link);
                        }

                        return targetElement;
                    });
                }
                else {
                    targetElement = this.fetchTargetElements(elementContainer, element, sourceLinkData);

                    if(targetElement) {
                        link = this.createLink(name, element, targetElement, null);
                        linkContainer[name].push(link);
                    }

                    element[name] = targetElement;
                }
            }
        });

        return linkContainer;
    }

    /**
     * 从配置和 element 集构建 pointer 集
     * @param pointerOptions 
     * @param elementContainer 
     * @returns 
     */
    private constructPointers(pointerOptions: { [key: string]: PointerOption }, elementContainer: { [key: string]: Element[] }): { [key: string]: Pointer[] } {
        let pointerContainer: { [key: string]: Pointer[] } = { },
            elementList: Element[] = Object
                .keys(elementContainer)
                .map(item => elementContainer[item])
                .reduce((prev, cur) => [...prev, ...cur]),
            pointerNames = Object.keys(pointerOptions);

        pointerNames.forEach(name => {
            pointerContainer[name] = [];
        });

        pointerNames.forEach(name => {
            

            for(let i = 0; i < elementList.length; i++) {
                let element = elementList[i],
                    pointerData = element[name];
                
                // 若没有指针字段的结点则跳过
                if(!pointerData) continue;

                let id = name + '.' + (Array.isArray(pointerData)? pointerData.join('-'): pointerData),
                    pointer = this.createPointer(id, name, pointerData, element);

                pointerContainer[name].push(pointer);
            }
        });

        return pointerContainer;
    }

    /**
     * 元素工厂，创建Element
     * @param sourceElement
     * @param elementName
     */
    private createElement(sourceElement: SourceElement, elementName: string): Element {
        let elementOption = this.engine.elementOptions[elementName],
            element: Element = undefined,
            label = elementOption.label? this.parserElementContent(sourceElement, elementOption.label): '',
            id =  elementName + '.' + sourceElement.id.toString();

        if(label === null || label === undefined) {
            label = '';
        }

        element = new Element(id, elementName, sourceElement);
        element.initProps(elementOption);
        element.set('label', label);
        element.sourceElement = sourceElement;

        return element;
    }

    /**
     * 外部指针工厂，创建Pointer
     * @param id 
     * @param pointerName 
     * @param label 
     * @param target 
     */
    private createPointer(id: string, pointerName: string, pointerData: string | string[], target: Element): Pointer {
        let options = this.engine.pointerOptions[pointerName],
            pointer = undefined;

        pointer = new Pointer(id, pointerName, pointerData, target);
        pointer.initProps(options);

        return pointer;
    };

    /**
     * 连线工厂，创建Link
     * @param linkName 
     * @param element 
     * @param target 
     * @param index 
     */
    private createLink(linkName: string, element: Element, target: Element, index: number): Link {
        let options: LinkOption = this.engine.linkOptions[linkName],
            link = undefined,
            id = `${element.id}-${target.id}`;
        
        link = new Link(id, linkName, element, target, index);
        link.initProps(options);

        return link;
    }

    /**
     * 解析元素文本内容
     * @param sourceElement
     * @param formatLabel
     */
     private parserElementContent(sourceElement: SourceElement, formatLabel: string): string {
        let fields = Util.textParser(formatLabel);
        
        if(Array.isArray(fields)) {
            let values = fields.map(item => sourceElement[item]);

            values.map((item, index) => {
                formatLabel = formatLabel.replace('[' + fields[index] + ']', item);
            });
        }

        return formatLabel;
    }

    /**
     * 由source中的连接字段获取真实的连接目标元素
     * @param elementContainer
     * @param element
     * @param linkTarget 
     */
    private fetchTargetElements(
        elementContainer: { [key: string]: Element[] } , 
        element: Element, 
        linkTarget: LinkTarget
    ): Element {
        let elementName = element.modelName,
            elementList: Element[], 
            targetId = linkTarget,
            targetElement = null;

        if(linkTarget === null || linkTarget === undefined) {
            return null;
        }

        if(typeof linkTarget === 'string' && linkTarget.includes('#')) {
            let info = linkTarget.split('#');
            elementName = info[0];
            targetId = info[1];
        }

        if(typeof targetId === 'number') {
            targetId = targetId.toString();
        }
        
        elementList = elementContainer[elementName];

        // 若目标element不存在，返回null
        if(elementList === undefined) {
            return null;
        }
        
        targetElement = elementList.find(item => item.sourceId === targetId);
        return targetElement || null;
    }
};