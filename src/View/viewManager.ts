import { Engine } from "../engine";
import { Element, Link, Model } from "../Model/modelData";
import { EngineOptions } from "../options";
import { Container } from "./container/container";
import { SV } from '../StructV';
import { MainContainer } from "./container/main";
import { FreedContainer } from "./container/freed";
import { LeakContainer } from "./container/leak";
import { Layouter } from "./layouter";
import { LayoutGroup, LayoutGroupTable } from "../Model/modelConstructor";
import { Util } from "../Common/util";
import { EventBus } from "../Common/eventBus";


export class ViewManager {
    private engine: Engine;
    private layouter: Layouter;
    private mainContainer: Container;
    private freedContainer: Container;
    private leakContainer: Container;

    private prevModelList: Model[];

    private shadowG6Instance;

    constructor(engine: Engine, DOMContainer: HTMLElement) {
        this.engine = engine;
        this.layouter = new Layouter(engine);
        this.mainContainer = new MainContainer(engine, DOMContainer, { tooltip: true });
        this.prevModelList = [];

        const options: EngineOptions = this.engine.engineOptions;

        if(options.freedContainer) {
            this.freedContainer = new FreedContainer(engine, options.freedContainer, { fitCenter: true, tooltip: false });
        }

        if(options.leakContainer) {
            this.leakContainer = new LeakContainer(engine, options.leakContainer, { fitCenter: true, tooltip: false });
        }

        this.shadowG6Instance = new SV.G6.Graph({
            container: DOMContainer.cloneNode()
        });
    }

    /**
     * 对每一个 model 在离屏 Canvas 上构建 G6 item，用作布局
     * @param constructList
     */
    private build(modelList: Model[]) {
        modelList.forEach(item => {
            const type = item instanceof Link? 'edge': 'node';
            this.shadowG6Instance.addItem(type, item.cloneProps());
            item.shadowG6Item = this.shadowG6Instance.findById(item.id);
        });
    }

    /**
     * 获取被 free 的节点
     * @param layoutGroupTable 
     * @returns 
     */
    private getFreedModelList(layoutGroupTable: LayoutGroupTable): Model[] {
        let freedList: Model[] = [],
            freedGroup: LayoutGroup = null,
            freedGroupName: string = null,
            removeModels: Model[] = [];

        layoutGroupTable.forEach((group, key) => {
            let freedElements: Model[] = group.element.filter(item => item.freed);

            if(freedElements.length) {
                freedGroupName = key;
                freedList = freedElements;
            }
        });

        freedGroup = layoutGroupTable.get(freedGroupName);

        freedList.forEach(fItem => {
            removeModels.push(...freedGroup.element.splice(freedGroup.element.findIndex(item => item.id === fItem.id), 1));
            removeModels.push(...freedGroup.link.splice(freedGroup.link.findIndex(item => item.element.id === fItem.id || item.target.id === fItem.id)));
            removeModels.push(...freedGroup.pointer.splice(freedGroup.pointer.findIndex(item => item.target.id === fItem.id)));
        });

        removeModels.map(model => {
            const index = freedGroup.modelList.findIndex(item => item.id === model.id);
            freedGroup.modelList.splice(index, 1);
        });

        return freedList;
    }

    /**
     * 获取被泄露的节点
     * @param prevModelList 
     * @param modelList 
     * @returns 
     */
    private getLeakModelList(prevModelList: Model[], modelList: Model[]): Model[] {
        const leakModelList: Model[] = prevModelList.filter(item => !modelList.find(n => n.id === item.id)),
              elements: Element[] = <Element[]>leakModelList.filter(item => item instanceof Element && item.freed === false),
              links: Link[] = <Link[]>leakModelList.filter(item => item instanceof Link),
              elementIds: string[] = [],
              res: Model[] = [];

        elements.forEach(item => {
            elementIds.push(item.id);
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

        res.push(...elements, ...links);

        res.map(item => {
            item.isLeak = true;
        });

        return res;
    }

    // ----------------------------------------------------------------------------------------------

    /**
     * 对主视图进行重新布局
     * @param layoutGroupTable
     */
    reLayout(layoutGroupTable: LayoutGroupTable) {
        this.layouter.layoutAll(this.mainContainer, layoutGroupTable);
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
     * @param containerName
     * @param width 
     * @param height 
     */
    resize(containerName: string, width: number, height: number) {
        if(containerName === 'main') {
            this.mainContainer.getG6Instance().changeSize(width, height);
        }

        if(containerName === 'freed') {
            this.freedContainer.getG6Instance().changeSize(width, height);
        }

        if(containerName === 'leak') {
            this.leakContainer.getG6Instance().changeSize(width, height);
        }
        
    }

    /**
     * 渲染所有视图
     * @param models 
     * @param layoutFn 
     */
    renderAll(layoutGroupTable: LayoutGroupTable) {
        this.shadowG6Instance.clear();

        const modelList = Util.convertGroupTable2ModelList(layoutGroupTable);

        this.build(modelList);

        let freedList = this.getFreedModelList(layoutGroupTable),
            leakModelList  = null;
        
        if(this.leakContainer) {
            leakModelList = this.getLeakModelList(this.prevModelList, modelList);
            this.build(leakModelList);
        }

        if(this.freedContainer && freedList.length) {
            EventBus.emit('onFreed', freedList);
            this.freedContainer.render(freedList);
        }

        // 进行布局（设置model的x，y）
        this.layouter.layoutAll(this.mainContainer, layoutGroupTable);

        this.mainContainer.render(modelList);

        if(this.leakContainer) {
            this.mainContainer.afterRemoveModels(() => {
                
            });

            this.leakContainer.render(leakModelList);

                if(leakModelList.length) {
                    EventBus.emit('onLeak', leakModelList);
                }
        }

        this.prevModelList = modelList;
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











