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


export class ViewManager {
    private engine: Engine;
    private layouter: Layouter;
    private mainContainer: Container;
    private freedContainer: Container;
    private leakContainer: Container;

    private prevLayoutGroupTable: LayoutGroupTable;

    private shadowG6Instance;

    constructor(engine: Engine, DOMContainer: HTMLElement) {
        this.engine = engine;
        this.layouter = new Layouter(engine);
        this.mainContainer = new MainContainer(engine, DOMContainer);
        this.prevLayoutGroupTable = null;

        const options: EngineOptions = this.engine.engineOptions;

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
    private build(layoutGroupTable: LayoutGroupTable) {
        layoutGroupTable.forEach(group => {
            group.element.map(item => item.cloneProps()).forEach(item => this.shadowG6Instance.addItem('node', item));
            group.pointer.map(item => item.cloneProps()).forEach(item => this.shadowG6Instance.addItem('node', item));
            group.link.map(item => item.cloneProps()).forEach(item => this.shadowG6Instance.addItem('edge', item));
            
            group.element.forEach(item => {
                item.shadowG6Item = this.shadowG6Instance.findById(item.id);
            });
            group.pointer.forEach(item => {
                item.shadowG6Item = this.shadowG6Instance.findById(item.id);
            });
            group.link.forEach(item => {
                item.shadowG6Item = this.shadowG6Instance.findById(item.id);
            });
        });
    }

    /**
     * 获取被 free 的节点
     * @param layoutGroupTable 
     * @returns 
     */
    private getFreedConstructList(layoutGroupTable: LayoutGroupTable): Model[] {
        let freedList: Model[] = [],
            freedGroup = null,
            freedGroupName = null;

        for(let group in layoutGroupTable) {
            let freedElements: Model[] = layoutGroupTable[group].element.filter(item => item.freed);

            if(freedElements.length) {
                freedGroupName = group;
                break;
            }
        }

        freedGroup = layoutGroupTable[freedGroupName];

        freedList.forEach(fItem => {
            freedGroup.element.splice(freedGroup.element.findIndex(item => item.id === fItem.id), 1);
            freedGroup.link.splice(freedGroup.link.findIndex(item => item.element.id === fItem.id || item.target.id === fItem.id));
            freedGroup.pointer.splice(freedGroup.pointer.findIndex(item => item.target.id === fItem.id));
        });

        return freedList;
    }

    /**
     * 获取被泄露的节点
     * @param constructList 
     * @param prevConstructList
     * @returns 
     */
    private getLeakConstructList(prevLayoutGroupTable: LayoutGroupTable, layoutGroupTable: LayoutGroupTable): LayoutGroupTable {
        const leakLayoutGroupTable = new Map<string, LayoutGroup>();

        prevLayoutGroupTable.forEach((item, groupName) => {
            let prevGroup = item,
                curGroup = layoutGroupTable.get(groupName),
                elements: Element[] = [],
                links: Link[] = [],
                elementIds: string[] = [];

            if(curGroup) {
                elements = prevGroup.element.filter(item => !curGroup.element.find(n => n.id === item.id)).filter(item => item.freed === false),
                links = prevGroup.link.filter(item => !curGroup.link.find(n => n.id === item.id)),
                elementIds = elements.map(item => item.id);
            }

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

            leakLayoutGroupTable.set(groupName, {
                element: elements,
                link: links,
                pointer: [],
                layouter: prevGroup.layouter,
                options: prevGroup.options,
                modelList: [...elements, ...links]
            });
        });

        return leakLayoutGroupTable;
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

        this.build(layoutGroupTable);

        let freedList = this.getFreedConstructList(layoutGroupTable),
            leakLayoutGroupTable = null;
        
        if(this.leakContainer && this.prevLayoutGroupTable) {
            leakLayoutGroupTable = this.getLeakConstructList(this.prevLayoutGroupTable, layoutGroupTable);
            this.build(leakLayoutGroupTable);
        }

        if(this.freedContainer) {
            this.freedContainer.render(freedList);
        }

        // 进行布局（设置model的x，y）
        this.layouter.layoutAll(this.mainContainer, layoutGroupTable);

        const modelList: Model[] = Util.convertGroupTable2ModelList(layoutGroupTable);
        this.mainContainer.render(modelList);

        if(this.leakContainer && this.prevLayoutGroupTable) {
            this.mainContainer.afterRemoveModels(() => {
                this.leakContainer.render(Util.convertGroupTable2ModelList(leakLayoutGroupTable));
            });
        }

        this.prevLayoutGroupTable = layoutGroupTable;
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











