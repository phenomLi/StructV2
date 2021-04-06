import { Element } from "./Model/modelData";
import { Sources } from "./sources";
import { ConstructedData, ModelConstructor } from "./Model/modelConstructor";
import { Renderer } from "./View/renderer";
import { AnimationOptions, ElementOption, LayoutOptions, LinkOption, Options, PointerOption } from "./options";
import { Layouter } from "./View/layouter";


export class Engine { 
    private stringifySources: string = null; // 序列化的源数据

    private modelConstructor: ModelConstructor = null;
    private layouter: Layouter = null;
    private renderer: Renderer = null;
    private containerWidth: number;
    private containerHeight: number;
    
    public elementOptions: { [key: string]: ElementOption } = {  };
    public linkOptions: { [key: string]: LinkOption } = {  };
    public pointerOptions: { [key: string]: PointerOption } = {  };
    public layoutOptions: LayoutOptions = null;
    public animationOptions: AnimationOptions = null;

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
            timingFunction: 'linearEasing'
        }, options.animation);

        this.containerWidth = DOMContainer.offsetWidth,
        this.containerHeight = DOMContainer.offsetHeight;

        this.modelConstructor = new ModelConstructor(this);
        this.layouter = new Layouter(this, this.containerWidth, this.containerHeight);
        this.renderer = new Renderer(this, DOMContainer, this.containerWidth, this.containerHeight);
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

        const constructedData: ConstructedData = this.modelConstructor.construct(sourceData);

        this.renderer.build(constructedData);

        this.layouter.layout(constructedData, this.layout);

        this.renderer.render(constructedData);
    }

    /**
     * 定义配置项
     * @returns 
     */
    public defineOptions(): Options {
        return null;
    }

    /**
     * 设置布局函数
     * @overwrite
     */
    public layout(elementContainer: { [ket: string]: Element[] }, layoutOptions: LayoutOptions) { }

    /**
     * 获取容器尺寸
     * @returns 
     */
    public getContainerSize(): { width: number, height: number } {
        return { 
            width: this.containerWidth, 
            height: this.containerHeight 
        };
    }

    /**
     * 绑定 G6 事件
     * @param eventName 
     * @param callback 
     */
     public on(eventName: string, callback: Function) {
        this.renderer.on(eventName, callback);
    }
};