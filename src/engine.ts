import { Element, Pointer } from "./Model/modelData";
import { Sources } from "./sources";
import { ConstructedData, ModelConstructor } from "./Model/modelConstructor";
import { Renderer } from "./View/renderer";
import { AnimationOptions, ElementOption, InteractionOptions, LayoutOptions, LinkOption, Options, PointerOption } from "./options";
import { Layouter } from "./View/layouter";
import { Behavior } from "./View/behavior";
import { Util } from "./Common/util";


export class Engine { 
    private stringifySources: string = null; // 序列化的源数据

    private modelConstructor: ModelConstructor = null;
    private layouter: Layouter = null;
    private renderer: Renderer = null;
    private behavior: Behavior;
    private graphInstance;
    private constructedData: ConstructedData;
    
    public elementOptions: { [key: string]: ElementOption } = {  };
    public linkOptions: { [key: string]: LinkOption } = {  };
    public pointerOptions: { [key: string]: PointerOption } = {  };
    public layoutOptions: LayoutOptions = null;
    public animationOptions: AnimationOptions = null;
    public interactionOptions: InteractionOptions = null;

    constructor(DOMContainer: HTMLElement) {
        const options: Options = this.defineOptions();

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
            selectNode: true
        }, options.interaction);

        this.modelConstructor = new ModelConstructor(this);
        this.layouter = new Layouter(this);
        this.renderer = new Renderer(this, DOMContainer);
        this.graphInstance = this.renderer.getGraphInstance();
        this.behavior = new Behavior(this, this.renderer.getGraphInstance());
    }

    /**
     * 输入数据进行渲染
     * @param sourceData 
     */
    public render(sourceData: Sources) {
        if(sourceData === undefined || sourceData === null) {
            return;
        }

        // 若前后数据没有发生变化，什么也不干（将json字符串化后比较）
        let stringifySources = JSON.stringify(sourceData);
        if(stringifySources === this.stringifySources) return;
        this.stringifySources = stringifySources;

        this.constructedData = this.modelConstructor.construct(sourceData);

        this.renderer.build(this.constructedData);

        this.layouter.layout(this.constructedData, this.renderer.getModelList(), this.layout);

        this.renderer.render(this.constructedData);
    }

    /**
     * 定义配置项
     * @returns 
     */
    protected defineOptions(): Options {
        return null;
    }

    /**
     * 设置布局函数
     * @overwrite
     */
    protected layout(elementContainer: { [ket: string]: Element[] }, layoutOptions: LayoutOptions) { }

    /**
     * 重新布局
     */
    public reLayout() {
        const modelList = this.renderer.getModelList();

        this.layouter.layout(this.constructedData, modelList, this.layout);
        modelList.forEach(item => {
            if(item.type === 'link') return;

            let model = item.G6Item.getModel(),
                x = item.get('x'),
                y = item.get('y');

            model.x = x;
            model.y = y;
        });

        this.graphInstance.refresh();
    }

    /**
     * 获取 G6 实例
     */
     public getGraphInstance() {
        return this.graphInstance;
    }

    /**
     * 获取所有 element
     */
    public getElements(): Element[] {
        return Util.converterList(this.constructedData.element);
    }

    /**
     * 获取所有 pointer
     */
    public getPointers(): Pointer[] {
        return Util.converterList(this.constructedData.pointer);
    }

    /**
     * 获取所有 link
     */
    public getLinks() {
        return Util.converterList(this.constructedData.link);
    }

    /**
     * 调整容器尺寸
     * @param width 
     * @param height 
     */
    public resize(width: number, height: number) {
        this.graphInstance.changeSize(width, height);
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
        this.graphInstance.destroy();
        this.modelConstructor = null;
        this.layouter = null;
        this.renderer = null;
        this.behavior = null;
        this.graphInstance = null;
    }
};