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

    constructor(engine: Engine) {
        this.engine = engine;
    }

    /**
     * 构建element，link和pointer
     * @param sourceData 
     */
    public construct(sourceData: Sources): ConstructedData {
        let elementContainer = this.constructElements(sourceData),
            linkContainer = this.constructLinks(this.engine.linkOptions, elementContainer),
            pointerContainer = this.constructPointers(this.engine.pointerOptions, elementContainer);

        return { 
            element: elementContainer,
            link: linkContainer,
            pointer: pointerContainer
        };
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
                    sourceLinkData: sourceLinkData = element[name],
                    options: LinkOption = linkOptions[name],
                    targetElement: Element | Element[] = null,
                    link: Link = null;

                if(sourceLinkData === undefined || sourceLinkData === null) continue;

                //  ------------------- 将连接声明字段 sourceLinkData 从 id 变为 Element -------------------
                if(Array.isArray(sourceLinkData)) {
                    element[name] = sourceLinkData.map((item, index) => {
                        targetElement = this.fetchTargetElements(elementContainer, element, item);

                        if(targetElement) {
                            link = new Link(name, element, targetElement, index);
                            linkContainer[name].push(link);
                            link.initProps(options);
                        }

                        return targetElement;
                    });
                }
                else {
                    targetElement = this.fetchTargetElements(elementContainer, element, sourceLinkData);
                    
                    if(targetElement) {
                        link = new Link(name, element, targetElement, null);
                        linkContainer[name].push(link);
                        link.initProps(options);
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
            let options = pointerOptions[name];

            for(let i = 0; i < elementList.length; i++) {
                let element = elementList[i],
                    pointerData = element[name];
                
                // 若没有指针字段的结点则跳过
                if(!pointerData) continue;

                let id = name + '#' + (Array.isArray(pointerData)? pointerData.join('-'): pointerData),
                    pointer = new Pointer(id, name, pointerData, element);

                pointer.initProps(options);
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
            element = new Element(elementName, sourceElement),
            label = elementOption.label? this.parserElementContent(sourceElement, elementOption.label): '';

        element.initProps(elementOption);
        element.set('label', label);

        return element;
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
        let elementName = element.name,
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
        
        targetElement = elementList.find(item => item.id === targetId);
        return targetElement || null;
    }
};