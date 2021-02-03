import { Element } from "./Model/element";
import { Sources } from "./sources";
import { Pointer } from "./Model/pointer";
import { ShapeStatus } from "./View/shape";
import { ShapeScheduler, ZrShapeConstructor } from "./View/shapeScheduler";
import { ElementConstructor, ElementContainer, ElementScheduler } from "./Model/elementScheduler";
import { Link } from "./Model/link";
import { LinkScheduler } from "./Model/linkScheduler";
import { PointerScheduler } from "./Model/pointerScheduler";


export type LayoutFunction = (elements: ElementContainer | Element[], containerWidth: number, containerHeight: number) => void;


export class Engine { 
    // 引擎id
    private id: string;
    // 引擎名称
    private engineName: string;
    // HTML容器
    private DOMContainer: HTMLElement;
    // 当前保存的源数据
    private sources: Sources = null;
    // 序列化的源数据
    private stringifySources: string = null;

    private elementScheduler: ElementScheduler = null;
    private linkScheduler: LinkScheduler = null;
    private pointerScheduler: PointerScheduler = null;
    private shapeScheduler: ShapeScheduler = null;

    private containerWidth: number;
    private containerHeight: number;
    
    private layoutFunction: LayoutFunction;

    constructor(DOMContainer: HTMLElement, engineName: string) {
        this.engineName = engineName;
        this.DOMContainer = DOMContainer;
        this.shapeScheduler = new ShapeScheduler(this);
        this.elementScheduler = new ElementScheduler(this, this.shapeScheduler);
        this.linkScheduler = new LinkScheduler();
        this.pointerScheduler = new PointerScheduler();

        this.containerWidth = this.DOMContainer.offsetWidth;
        this.containerHeight = this.DOMContainer.offsetHeight;
    }

    /**
     * 
     * @param sourceData 
     */
    public render(sourceData: Sources) {
  
        if(sourceData === undefined || sourceData === null) {
            return;
        }

        // 若前后数据没有发生变化，什么也不干（将json字符串化后比较）
        let stringifySources = JSON.stringify(sourceData);
        if(stringifySources === this.stringifySources) return;
        this.sources = sourceData;
        this.stringifySources = stringifySources;

        this.constructModel(sourceData);
        this.layoutFunction(this.elementScheduler.getElementContainer(), this.containerWidth, this.containerHeight);
    }

    /**
     * 
     * @param elementLabel 
     * @param element 
     * @param zrShapeConstructors 
     * @param shapeOptions 
     */
    public applyElement(
        elementLabel: string, 
        elementConstructor: ElementConstructor, 
        zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
        shapeOptions: Partial<ShapeStatus>
    ) {
        this.elementScheduler.setElementMap(elementLabel, elementConstructor, zrShapeConstructors, shapeOptions);
    }

    /**
     * 应用一个Link模型
     * @param linkLabel 
     * @param linkConstructor 
     * @param zrShapeConstructors 
     * @param shapeOptions 
     */
    public applyLink(
        linkLabel: string, linkConstructor: { new(): Link }, 
        zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
        shapeOptions: Partial<ShapeStatus>
    ) {
        this.linkScheduler.setLinkMap(linkLabel, linkConstructor, zrShapeConstructors, shapeOptions);
    }

    /**
     * 应用一个Pointer模型
     * @param pointerLabel 
     * @param pointerConstructor 
     * @param zrShapeConstructors 
     * @param shapeOptions 
     */
    public applyPointer( 
        pointerLabel: string, pointerConstructor: { new(): Pointer }, 
        zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
        shapeOptions: Partial<ShapeStatus>
    ) {
        this.pointerScheduler.setPointerMap(pointerLabel, pointerConstructor, zrShapeConstructors, shapeOptions);
    }

    /**
     * 设置布局函数
     * @param layoutFunction 
     */
    public applyLayout(layoutFunction: LayoutFunction) {
        this.layoutFunction = layoutFunction;
    }

    /**
     * 构建模型
     * @param sourceData 
     */
    private constructModel(sourceData: Sources) {
        this.elementScheduler.constructElements(sourceData);
        this.linkScheduler.constructLinks([]);
        this.pointerScheduler.constructPointers([]);
    }

    private updateShapes() {

    }

    /**
     * 重置引擎数据
     */
    private resetData() {
        this.elementScheduler.reset();
        this.linkScheduler.reset();
        this.pointerScheduler.reset();
        this.shapeScheduler.reset();
    }
};