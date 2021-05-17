import { Engine } from "../engine";
import { Element, Link } from "../Model/modelData";
import { EngineInitOptions, LayoutOptions } from "../options";
import { Container } from "./container/container";
import { SV } from '../StructV';
import { ConstructList } from "../Model/modelConstructor";
import { MainContainer } from "./container/main";
import { FreedContainer } from "./container/freed";
import { LeakContainer } from "./container/leak";
import { Layouter } from "./layouter";


export class ViewManager {
    private engine: Engine;
    private layouter: Layouter;
    private mainContainer: Container;
    private freedContainer: Container;
    private leakContainer: Container;

    private prevConstructList: ConstructList = { element:[], pointer: [], link: [] };
    private freedConstructList: ConstructList = { element:[], pointer: [], link: [] };
    private leakConstructList: ConstructList = { element:[], pointer: [], link: [] };

    private shadowG6Instance;

    constructor(engine: Engine, DOMContainer: HTMLElement) {
        this.engine = engine;
        this.layouter = new Layouter(engine);
        this.mainContainer = new MainContainer(engine, DOMContainer);

        const options: EngineInitOptions = this.engine.initOptions;

        if(options.freedContainer) {
            this.freedContainer = new FreedContainer(engine, options.freedContainer, { fitCenter: true });
        }

        if(options.leakContainer) {
            this.leakContainer = new LeakContainer(engine, options.leakContainer, { fitCenter: true });
        }

        this.shadowG6Instance = new SV.G6.Graph({
            container: DOMContainer.cloneNode()
        });
    }

    /**
     * 对每一个 model 在离屏 Canvas 上构建 G6 item，用作布局
     * @param constructList
     */
    private build(constructList: ConstructList) {
        constructList.element.map(item => item.cloneProps()).forEach(item => this.shadowG6Instance.addItem('node', item));
        constructList.pointer.map(item => item.cloneProps()).forEach(item => this.shadowG6Instance.addItem('node', item));
        constructList.link.map(item => item.cloneProps()).forEach(item => this.shadowG6Instance.addItem('edge', item));
        
        constructList.element.forEach(item => {
            item.shadowG6Item = this.shadowG6Instance.findById(item.id);
        });
        constructList.pointer.forEach(item => {
            item.shadowG6Item = this.shadowG6Instance.findById(item.id);
        });
        constructList.link.forEach(item => {
            item.shadowG6Item = this.shadowG6Instance.findById(item.id);
        });
    }

    /**
     * 获取被 free 的节点
     * @param constructList 
     * @returns 
     */
    private getFreedConstructList(constructList: ConstructList): ConstructList {
        const freedList: ConstructList = {
            element: constructList.element.filter(item => item.free),
            pointer: [],
            link: []
        };

        freedList.element.forEach(fItem => {
            constructList.element.splice(constructList.element.findIndex(item => item.id === fItem.id), 1);
            constructList.link.splice(constructList.link.findIndex(item => item.element.id === fItem.id || item.target.id === fItem.id));
            constructList.pointer.splice(constructList.pointer.findIndex(item => item.target.id === fItem.id));
        });

        return freedList;
    }

    /**
     * 获取被泄露的节点
     * @param constructList 
     * @param prevConstructList
     * @returns 
     */
    private getLeakConstructList(prevConstructList: ConstructList, constructList: ConstructList): ConstructList {
        const elements: Element[] = prevConstructList.element.filter(item => !constructList.element.find(n => n.id === item.id)),
              links: Link[] = prevConstructList.link.filter(item => !constructList.link.find(n => n.id === item.id)),
              elementIds: string[] = elements.map(item => item.id);

        elements.forEach(item => {
            item.set('style', {
                fill: '#ccc'
            });
        });

        for(let i = 0; i < links.length; i++) {
            let sourceId = links[i].element.id,
                targetId = links[i].target.id;

            links[i].set('style', {
                stroke: '#333'
            });

            if(elementIds.find(item => item === sourceId) === undefined || elementIds.find(item => item === targetId) === undefined) {
                links.splice(i, 1);
                i--;
            }
        }

        return {
            element: elements,
            link: links,
            pointer: []
        };
    }

    // ----------------------------------------------------------------------------------------------

    /**
     * 对主视图进行重新布局
     * @param constructList
     * @param layoutFn 
     */
    reLayout(constructList: ConstructList, layoutFn: (elements: Element[], layoutOptions: LayoutOptions) => void) {
        this.layouter.layout(this.mainContainer, constructList, layoutFn);
    }


    /**
     * 获取 g6 实例
     */
    getG6Instance() {
        return this.mainContainer.getG6Instance();
    }

    /**
     * 刷新视图
     */
    refresh() {
        this.mainContainer.getG6Instance().refresh();
    }

    /**
     * 重新调整容器尺寸
     * @param width 
     * @param height 
     */
    resize(width: number, height: number) {
        this.mainContainer.getG6Instance().changeSize(width, height);
    }

    /**
     * 渲染所有视图
     * @param models 
     * @param layoutFn 
     */
    renderAll(constructList: ConstructList, layoutFn: (elements: Element[], layoutOptions: LayoutOptions) => void) {
        this.shadowG6Instance.clear();

        this.build(constructList);

        this.freedConstructList = this.getFreedConstructList(constructList);
        this.leakConstructList = this.getLeakConstructList(this.prevConstructList, constructList);

        this.build(this.leakConstructList);

        if(this.freedContainer) {
            this.freedContainer.render(this.freedConstructList, layoutFn);
        }

        // 进行布局（设置model的x，y）
        this.layouter.layout(this.mainContainer, constructList, layoutFn);
        this.mainContainer.render(constructList, layoutFn);

        if(this.leakContainer) {
            this.mainContainer.afterRemoveModels(() => {
                this.leakContainer.render(this.leakConstructList, layoutFn);
            });
        }

        this.prevConstructList = constructList;
    }   

    /**
     * 销毁
     */
    destroy() {
        this.shadowG6Instance.destroy();
        this.mainContainer.destroy();
        this.freedContainer && this.freedContainer.destroy();
        this.leakContainer && this.leakContainer.destroy();
    }
}











