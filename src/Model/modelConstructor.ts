import { Util } from "../Common/util";
import { Engine } from "../engine";
import { ElementOption, Layouter, LayoutGroupOptions, LinkOption, PointerOption } from "../options";
import { sourceLinkData, SourceElement, LinkTarget, Sources } from "../sources";
import { SV } from "../StructV";
import { Element, Link, Model, Pointer } from "./modelData";


export type LayoutGroup = { 
    element: Element[];
    link: Link[];
    pointer: Pointer[];
    layouter: Layouter;
    options: LayoutGroupOptions;
    modelList: Model[];
};


export type LayoutGroupTable = Map<string, LayoutGroup>;


export class ModelConstructor {
    private engine: Engine;
    private layoutGroupTable: LayoutGroupTable;
    private prevSourcesStringMap: { [key: string]: string };   // 保存上一次源数据转换为字符串之后的值，用作比较该次源数据和上一次源数据是否有差异，若相同，则可跳过重复构建过程

    constructor(engine: Engine) {
        this.engine = engine;
        this.prevSourcesStringMap = { };
    }

    /**
     * 构建element，link和pointer
     * @param sourceList 
     */
    public construct(sources: Sources): LayoutGroupTable {
        const layoutGroupTable = new Map<string, LayoutGroup>(),
              layouterMap: { [key: string]: Layouter } = SV.registeredLayouter,
              optionsTable = this.engine.optionsTable;

        Object.keys(sources).forEach(name => {
            let sourceGroup = sources[name],
                layouterName = sourceGroup.layouter,
                layouter: Layouter = layouterMap[sourceGroup.layouter];

            if(!layouterName || !layouter) {
                return;
            }

            let sourceDataString: string = JSON.stringify(sourceGroup.data),
                prevString: string = this.prevSourcesStringMap[name],
                elementList: Element[] = [],
                pointerList: Pointer[] = [];

            if(prevString === sourceDataString) {
                return;
            }
        
            const options: LayoutGroupOptions = optionsTable[layouterName],
                  sourceData = layouter.sourcesPreprocess(sourceGroup.data),
                  elementOptions = options.element || { },
                  pointerOptions = options.pointer || { };
                
            elementList = this.constructElements(elementOptions, name, sourceData, layouterName);
            pointerList = this.constructPointers(pointerOptions, elementList);
            
            layoutGroupTable.set(name, {
                element: elementList,
                link: [],
                pointer: pointerList,
                options: options,
                layouter: layouter,
                modelList: [...elementList, ...pointerList]
            });
        });
        
        layoutGroupTable.forEach((layoutGroup: LayoutGroup) => {
            const linkOptions = layoutGroup.options.link || { },
                  linkList: Link[] = this.constructLinks(linkOptions, layoutGroup.element, layoutGroupTable);

            layoutGroup.link = linkList;
            layoutGroup.modelList.push(...linkList);
        });

        this.layoutGroupTable = layoutGroupTable;

        return this.layoutGroupTable;
    }

    /**
     * 
     * @returns 
     */
    public getLayoutGroupTable(): LayoutGroupTable {
        return this.layoutGroupTable;
    }

    /**
     * 从源数据构建 element 集
     * @param elementOptions 
     * @param groupName 
     * @param sourceList 
     * @param layouterName
     * @returns 
     */
    private constructElements(elementOptions: { [key: string]: ElementOption }, groupName: string, sourceList: SourceElement[], layouterName: string): Element[] {
        let defaultElementType: string = 'default',
            elementList: Element[] = [];

        sourceList.forEach(item => {
            if(item === null) {
                return;
            }

            if(item.type === undefined || item.type === null) {
                item.type = defaultElementType;
            }

            elementList.push(this.createElement(item, item.type, groupName, layouterName, elementOptions[item.type]));
        });

        return elementList;
    }

    /**
     * 从配置和 element 集构建 link 集
     * @param linkOptions 
     * @param elements 
     * @param layoutGroupTable
     * @returns 
     */
    private constructLinks(linkOptions: { [key: string]: LinkOption }, elements: Element[], layoutGroupTable: LayoutGroupTable): Link[] {
        let linkList: Link[] = [],
            linkNames = Object.keys(linkOptions);

        linkNames.forEach(name => {
            for(let i = 0; i < elements.length; i++) {
                let element: Element = elements[i],
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
                        targetElement = this.fetchTargetElements(layoutGroupTable, element, item);

                        if(targetElement) {
                            link = this.createLink(name, element, targetElement, index, linkOptions[name]);
                            linkList.push(link);
                        }

                        return targetElement;
                    });
                }
                else {
                    targetElement = this.fetchTargetElements(layoutGroupTable, element, sourceLinkData);

                    if(targetElement) {
                        link = this.createLink(name, element, targetElement, null, linkOptions[name]);
                        linkList.push(link);
                    }

                    element[name] = targetElement;
                }
            }
        });

        return linkList;
    }

    /**
     * 从配置和 element 集构建 pointer 集
     * @param pointerOptions 
     * @param elements
     * @returns 
     */
    private constructPointers(pointerOptions: { [key: string]: PointerOption }, elements: Element[]): Pointer[] {
        let pointerList: Pointer[] = [],
            pointerNames = Object.keys(pointerOptions);

        pointerNames.forEach(name => {
            
            for(let i = 0; i < elements.length; i++) {
                let element = elements[i],
                    pointerData = element[name];
                
                // 若没有指针字段的结点则跳过
                if(!pointerData) continue;

                let id = name + '.' + (Array.isArray(pointerData)? pointerData.join('-'): pointerData),
                    pointer = this.createPointer(id, name, pointerData, element, pointerOptions[name]);

                pointerList.push(pointer);
            }
        });

        return pointerList;
    }

    /**
     * 元素工厂，创建Element
     * @param sourceElement
     * @param elementName
     * @param groupName
     * @param layouterName
     * @param options
     */
    private createElement(sourceElement: SourceElement, elementName: string, groupName: string, layouterName: string, options: ElementOption): Element {
        let element: Element = undefined,
            label = options.label? this.parserElementContent(sourceElement, options.label): '',
            id =  elementName + '.' + sourceElement.id.toString();

        if(label === null || label === 'undefined') {
            label = '';
        }

        element = new Element(id, elementName, groupName, layouterName, sourceElement);
        element.initProps(options);
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
     * @param options
     */
    private createPointer(id: string, pointerName: string, pointerData: string | string[], target: Element, options: PointerOption): Pointer {
        let pointer = undefined;

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
     * @param options
     */
    private createLink(linkName: string, element: Element, target: Element, index: number, options: LinkOption): Link {
        let link = undefined,
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
    private fetchTargetElements(layoutGroupTable: LayoutGroupTable, element: Element, linkTarget: LinkTarget): Element {
        let groupName: string = element.groupName,
            elementName = element.type,
            elementList: Element[], 
            targetId = linkTarget,
            targetGroupName = groupName,
            targetElement = null;

        if(linkTarget === null || linkTarget === undefined) {
            return null;
        }

        if(typeof linkTarget === 'number' || (typeof linkTarget === 'string' && !linkTarget.includes('#'))) {
            linkTarget = 'default#' + linkTarget;
        }

        let info = linkTarget.split('#');

        targetId = info.pop();

        if(info.length > 1) {
            elementName = info.pop();
            targetGroupName = info.pop();
        }
        else {
            let field = info.pop();
            if(layoutGroupTable.get(targetGroupName).element.find(item => item.type === field)) {
                elementName = field;
            }
            else if(layoutGroupTable.has(field)) {
                targetGroupName = field;
            }
            else {
                return null;
            }
        }
        
        elementList = layoutGroupTable.get(targetGroupName).element.filter(item => item.type === elementName);

        // 若目标element不存在，返回null
        if(elementList === undefined) {
            return null;
        }
        
        targetElement = elementList.find(item => item.sourceId === targetId);
        return targetElement || null;
    }

    /**
     * 销毁
     */
    destroy() {
        this.layoutGroupTable = null;
    }
};