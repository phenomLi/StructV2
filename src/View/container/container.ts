import { Bound, BoundingRect } from "../../Common/boundingRect";
import { Engine } from "../../engine";
import { ConstructList } from "../../Model/modelConstructor";
import { Element, Model, Pointer } from "../../Model/modelData";
import { AnimationOptions, InteractionOptions, LayoutOptions } from "../../options";
import { Animations } from "../animation";
import { g6Behavior, Renderer } from "../renderer";



export class Container {
    protected engine: Engine;
    protected DOMContainer: HTMLElement; // 可视化视图容器
    protected renderer: Renderer; // 渲染器
    protected prevModelList: Model[]; // 上一次渲染的模型列表

    protected animationsOptions: AnimationOptions;
    protected interactionOptions: InteractionOptions;

    protected afterAppendModelsCallbacks: ((models: Model[]) => void)[] = [];
    protected afterRemoveModelsCallbacks: ((models: Model[]) => void)[] = [];

    constructor(engine: Engine, DOMContainer: HTMLElement, g6Options: { [key: string]: any } = { }) {
        this.engine = engine;
        this.DOMContainer = DOMContainer;
        this.animationsOptions = engine.animationOptions;
        this.interactionOptions = engine.interactionOptions;
        this.renderer = new Renderer(engine, DOMContainer, {
            ...g6Options,
            modes: {
                default: this.initBehaviors()
            } 
        });
        this.prevModelList = [];
    }

    /**
     * 初始化交互行为
     * @returns 
     */
    protected initBehaviors(): g6Behavior[] {
        return ['drag-canvas', 'zoom-canvas'];
    }

    /**
     * 对比上一次和该次 modelList 找出新添加的节点和边
     * @param prevList
     * @param list
     */
    protected getAppendModels(prevList: Model[], list: Model[]): Model[] {
        return list.filter(item => !prevList.find(n => n.id === item.id));
    }   

    /**
     * 对比上一次和该次 modelList 找出被删除的节点和边
     * @param prevList
     * @param list
     */
    protected getRemoveModels(prevList: Model[], list: Model[]): Model[] {
        return prevList.filter(item => !list.find(n => n.id === item.id));
    }   

    /**
     * 找出重新指向的外部指针
     * @param list 
     * @returns 
     */
    protected findReTargetPointer(list: Model[]): Pointer[] {
        let prevPointers = this.prevModelList.filter(item => item instanceof Pointer),
            pointers = list.filter(item => item instanceof Pointer);

        return <Pointer[]>pointers.filter(item => prevPointers.find(prevItem => {
            return prevItem.id === item.id && (<Pointer>prevItem).target.id !== (<Pointer>item).target.id
        }));
    }

    /**
     * 处理新增的 G6Item（主要是动画）
     * @param appendData 
     */
    protected handleAppendModels(appendModels: Model[]) {
        let counter = 0;

        appendModels.forEach(item => {
            Animations.animate_append(item, this.animationsOptions.duration, this.animationsOptions.timingFunction, () => {
                counter++;

                if(counter === appendModels.length) {
                    this.afterAppendModelsCallbacks.map(item => item(appendModels));
                }
            });
        });
    }

    /**
     * 处理被移除（也就是泄露）的 G6Item（主要是动画）
     * @param removeData 
     */
    protected handleRemoveModels(removeModels: Model[]) {
        let counter = 0;

        removeModels.forEach(item => {
            Animations.animate_remove(item, this.animationsOptions.duration, this.animationsOptions.timingFunction, () => {
                this.renderer.removeModel(item);
                item.renderG6Item = item.G6Item = null;

                counter++;

                if(counter === removeModels.length) {
                    this.afterRemoveModelsCallbacks.map(item => item(removeModels));
                }
            });
        });
    }

    /**
     * 处理发生变化的 models
     * @param models 
     */
    protected handleChangeModels(models: Model[]) { }

    // ------------------------------------------ hook ---------------------------------------------

    afterAppendModels(callback: (models: Model[]) => void) {
        this.afterAppendModelsCallbacks.push(callback);
    }

    afterRemoveModels(callback: (models: Model[]) => void) {
        this.afterRemoveModelsCallbacks.push(callback);
    }

    // ----------------------------------------------------------------------------------------


    /**
     * 渲染函数
     * @param modelList
     * @param layoutFn
     */
    public render(constructList: ConstructList, layoutFn: (elements: Element[], layoutOptions: LayoutOptions) => void) {
        const modelList: Model[] = [...constructList.element, ...constructList.link, ...constructList.pointer],
              appendModels: Model[] = this.getAppendModels(this.prevModelList, modelList),
              removeModels: Model[] = this.getRemoveModels(this.prevModelList, modelList),
              changeModels: Model[] = [...appendModels, ...this.findReTargetPointer(modelList)];

        // 渲染视图
        this.renderer.render(modelList, removeModels);

        // 处理副作用
        this.handleAppendModels(appendModels);
        this.handleRemoveModels(removeModels);
        this.handleChangeModels(changeModels);

        if(this.renderer.getIsFirstRender()) {
            this.renderer.setIsFirstRender(false);
        }

        this.prevModelList = modelList;
    }

    /**
     * 获取 g6 实例
     */
    public getG6Instance() {
        return this.renderer.getG6Instance();
    }

    /**
     * 销毁
     */
    public destroy() {
        this.renderer.destroy();
        this.DOMContainer = null;
        this.prevModelList = [];
        this.animationsOptions = this.interactionOptions = null;
    }
}


// -----------------------------------------------------------------------------------------------------------







