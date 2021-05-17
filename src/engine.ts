import { Element, Pointer } from "./Model/modelData";
import { SourceElement } from "./sources";
import { ModelConstructor, ConstructList } from "./Model/modelConstructor";
import { AnimationOptions, ElementOption, EngineInitOptions, InteractionOptions, LayoutOptions, LinkOption, Options, PointerOption } from "./options";
import { Behavior } from "./Behavior.ts/behavior";
import { ViewManager } from "./View/viewManager";


export class Engine { 
    private stringifySources: string = null; // 序列化的源数据

    private modelConstructor: ModelConstructor = null;
    private viewManager: ViewManager
    private behavior: Behavior;
    
    public initOptions: EngineInitOptions;
    public elementOptions: { [key: string]: ElementOption } = {  };
    public linkOptions: { [key: string]: LinkOption } = {  };
    public pointerOptions: { [key: string]: PointerOption } = {  };
    public layoutOptions: LayoutOptions = null;
    public animationOptions: AnimationOptions = null;
    public interactionOptions: InteractionOptions = null;

    constructor(DOMContainer: HTMLElement, initOptions: EngineInitOptions = { }) {
        const options: Options = this.defineOptions();
        
        this.initOptions = initOptions;
        this.elementOptions = options.element;
        this.linkOptions = options.link || { };
        this.pointerOptions = options.pointer || { };

        this.layoutOptions = Object.assign({
            fitCenter: true,
            fitView: false
        }, options.layout);

        this.animationOptions = Object.assign({
            enable: true,
            duration: 750,
            timingFunction: 'easePolyOut'
        }, options.animation);

        this.interactionOptions = Object.assign({
            drag: true,
            zoom: true,
            dragNode: true,
            selectNode: true,
            changeHighlight: '#fc5185'
        }, options.interaction);

        this.initOptions = Object.assign({
            freedContainer: null,
            leakContainer: null
        }, initOptions);

        this.modelConstructor = new ModelConstructor(this);
        
        this.viewManager = new ViewManager(this, DOMContainer);
        this.behavior = new Behavior(this, this.viewManager.getG6Instance());
    }

    /**
     * 输入数据进行渲染
     * @param sourceData 
     */
    public render(sourceData: SourceElement[] | { [key: string]: SourceElement[] }) {
        if(sourceData === undefined || sourceData === null) {
            return;
        }

        // 若前后数据没有发生变化，什么也不干（将json字符串化后比较）
        let stringifySources = JSON.stringify(sourceData);
        if(stringifySources === this.stringifySources) return;
        this.stringifySources = stringifySources;

        let processedSourcesData = this.sourcesPreprocess(sourceData);
        if(processedSourcesData) {
            sourceData = processedSourcesData;
        }

        const sourceList: SourceElement[] = this.sourcesProcess(sourceData);

        // 1 转换模型（data => model）
        const constructList: ConstructList = this.modelConstructor.construct(sourceList);
        
        // 2 渲染（使用g6进行渲染）
        this.viewManager.renderAll(constructList, this.layout.bind(this));
    }
    
    /**
     * 源数据处理
     * @param sourceData 
     */
    private sourcesProcess(sourceData: SourceElement[] | { [key: string]: SourceElement[] }): SourceElement[] {
        if(Array.isArray(sourceData)) {
            return sourceData;
        }

        const sourceList: SourceElement[] = [];

        Object.keys(sourceData).forEach(name => {
            sourceData[name].forEach(item => {
                item.type = name;
            });

            sourceList.push(...sourceData[name]);
        });

        return sourceList;
    }

    /**
     * 定义配置项
     * @returns 
     */
    protected defineOptions(): Options {
        return null;
    }

    /**
     * 对源数据进行预处理
     * @param sourceData 
     */
    protected sourcesPreprocess(sourceData: SourceElement[] | { [key: string]: SourceElement[] }): SourceElement[] | { [key: string]: SourceElement[] } | void {
        return sourceData;
    }

    /**
     * 设置布局函数
     * @overwrite
     */
    protected layout(elements: Element[], layoutOptions: LayoutOptions) { }

    /**
     * 重新布局
     */
    public reLayout() {
        const constructList: ConstructList = this.modelConstructor.getConstructList();

        this.viewManager.reLayout(constructList, this.layout.bind(this));

        [...constructList.element, ...constructList.pointer].forEach(item => {
            let model = item.G6Item.getModel(),
                x = item.get('x'),
                y = item.get('y');

            model.x = x;
            model.y = y;
        });

        this.viewManager.refresh();
    }

    /**
     * 获取 G6 实例
     */
    public getGraphInstance() {
        return this.viewManager.getG6Instance();
    }

    /**
     * 获取所有 element
     */
    public getElements(): Element[] {
        const constructList = this.modelConstructor.getConstructList();
        return constructList.element;
    }

    /**
     * 获取所有 pointer
     */
    public getPointers(): Pointer[] {
        const constructList = this.modelConstructor.getConstructList();
        return constructList.pointer;
    }

    /**
     * 获取所有 link
     */
    public getLinks() {
        const constructList = this.modelConstructor.getConstructList();
        return constructList.link;
    }

    /**
     * 调整容器尺寸
     * @param width 
     * @param height 
     */
    public resize(width: number, height: number) {
        this.viewManager.resize(width, height);
    }

    /**
     * 绑定 G6 事件
     * @param eventName 
     * @param callback 
     */
    public on(eventName: string, callback: Function) {
        this.behavior.on(eventName, callback);
    }

    /**
     * 销毁引擎
     */
    public destroy() {
        this.modelConstructor.destroy();
        this.viewManager.destroy();
        this.behavior = null;
    }
};