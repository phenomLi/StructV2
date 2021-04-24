import { Engine } from '../engine';
import { Element, G6EdgeModel, G6NodeModel, Link, Pointer } from '../Model/modelData';
import { ConstructedData } from '../Model/modelConstructor';
import { Util } from '../Common/util';
import { Animations } from './animation';
import { SV } from '../StructV';
import { Model } from './../Model/modelData';



export interface G6Data {
    nodes: G6NodeModel[];
    edges: G6EdgeModel[];
};



export class Renderer {
    private engine: Engine;
    private DOMContainer: HTMLElement;
    private animations: Animations;
    private isFirstRender: boolean;
    private prevRenderData: G6Data;
    private graphInstance;
    private shadowGraphInstance;
    private modelList: Model[];

    constructor(engine: Engine, DOMContainer: HTMLElement) {
        this.engine = engine;
        this.DOMContainer = DOMContainer;
        this.isFirstRender = true;
        this.modelList = [];
        this.prevRenderData = {
            nodes: [],
            edges: []
        };

        const enable: boolean = this.engine.animationOptions.enable === undefined? true: this.engine.animationOptions.enable,
              duration: number = this.engine.animationOptions.duration,
              timingFunction: string = this.engine.animationOptions.timingFunction;

        this.graphInstance = new SV.G6.Graph({
            container: DOMContainer,
            width: DOMContainer.offsetWidth, 
            height: DOMContainer.offsetHeight,
            groupByTypes: false,
            animate: enable,
            animateCfg: {
                duration: duration,
                easing: timingFunction
            },
            fitView: this.engine.layoutOptions.fitView,
            modes: {
                default: this.initBehaviors()
            }
        });

        this.shadowGraphInstance = new SV.G6.Graph({
            container: DOMContainer.cloneNode()
        });

        this.animations = new Animations(duration, timingFunction);
    }

    /**
     * 初始化交互行为
     * @returns 
     */
    private initBehaviors() {
        const interactionOptions = this.engine.interactionOptions,
              dragNode: boolean | string[] = interactionOptions.dragNode,
              dragNodeFilter = node => {
                  let model = node.item.getModel();

                  if(node.item === null) {
                      return false;
                  }

                  if(model.modelType === 'pointer') {
                      return false;
                  }

                  if(typeof dragNode === 'boolean') {
                      return dragNode;
                  } 

                  if(Array.isArray(dragNode) && dragNode.indexOf(model.modelName) > -1) {
                      return true;
                  }

                  return false;
              }

        const modeMap = {
            drag: 'drag-canvas',
            zoom: 'zoom-canvas',
            dragNode: {
                type: 'drag-node',
                shouldBegin: node => dragNodeFilter(node)
            }
        },
        defaultModes = [];

        Object.keys(interactionOptions).forEach(item => {
            if(interactionOptions[item] && modeMap[item] !== undefined) {
                defaultModes.push(modeMap[item]);
            }
        });

        return defaultModes;
    }

    /**
     * 对比上一次和该次 G6Data 找出新添加的节点和边
     * @param prevData 
     * @param data 
     */
    private diffAppendItems(prevData: G6Data, data: G6Data): G6Data {
        return {
            nodes: data.nodes.filter(item => !prevData.nodes.find(n => n.id === item.id)),
            edges: data.edges.filter(item => !prevData.edges.find(e => e.id === item.id))
        };
    }   

    /**
     * 对比上一次和该次 G6Data 找出被删除的节点和边
     * @param prevData 
     * @param data 
     */
    private diffRemoveItems(prevData: G6Data, data: G6Data): G6Data {
        return {
            nodes: prevData.nodes.filter(item => !data.nodes.find(n => n.id === item.id)),
            edges: prevData.edges.filter(item => !data.edges.find(e => e.id === item.id))
        };
    }   

    /**
     * 查找被释放的节点
     * @param constructedData 
     */
    private findFreedItems(constructedData: ConstructedData): G6NodeModel[] {
        return Util.converterList(constructedData.element).filter(item => item.free).map(item => item.G6Item);
    }

    /**
     * 处理新增的 G6Item（主要是动画）
     * @param appendData 
     */
    private handleAppendItems(appendData: G6Data) {
        const appendItems = [
            ...appendData.nodes.map(item => this.graphInstance.findById(item.id)),
            ...appendData.edges.map(item => this.graphInstance.findById(item.id))
        ];

        appendItems.forEach(item => {
            this.animations.append(item);
        });
    }

    /**
     * 处理被移除的 G6Item（主要是动画）
     * @param removeData 
     */
    private handleRemoveItems(removeData: G6Data) {
        const removeItems = [
            ...removeData.nodes.map(item => this.graphInstance.findById(item.id)),
            ...removeData.edges.map(item => this.graphInstance.findById(item.id))
        ];

        removeItems.forEach(item => {
            this.animations.remove(item, () => {
                this.graphInstance.removeItem(item);
            });
        });
    }

    /**
     * 处理被 free 的 G6Item
     * @param freedItems 
     */
    private handleFreedItems(freedItems: G6NodeModel[]) { }

    /**
     * 构建 G6 元素
     * @param constructedData 
     */
    public build(constructedData: ConstructedData) {
        let elementList: Element[] = Util.converterList(constructedData.element),
            linkList: Link[] = Util.converterList(constructedData.link),
            pointerList: Pointer[] = Util.converterList(constructedData.pointer),
            nodeList = [...elementList.map(item => item.cloneProps()), ...pointerList.map(item => item.cloneProps())],
            edgeList = linkList.map(item => item.cloneProps());

        this.modelList = [...elementList, ...linkList, ...pointerList];

        const data: G6Data = {
            nodes: <G6NodeModel[]>nodeList,
            edges: <G6EdgeModel[]>edgeList
        };

        this.shadowGraphInstance.clear();
        this.shadowGraphInstance.read(data);

        this.modelList.forEach(item => {
            item.shadowG6Item = this.shadowGraphInstance.findById(item.id);
        });
    }

    /**
     * 渲染函数
     * @param constructedData
     */
    public render(constructedData: ConstructedData) {
        let data: G6Data = Util.convertG6Data(constructedData),
            freedItems = this.findFreedItems(constructedData),
            renderData: G6Data = null,
            appendData: G6Data = null,
            removeData: G6Data = null;

        appendData = this.diffAppendItems(this.prevRenderData, data);
        removeData = this.diffRemoveItems(this.prevRenderData, data);
        renderData = {
            nodes: [...data.nodes, ...removeData.nodes],
            edges: [...data.edges, ...removeData.edges]
        };
        
        this.prevRenderData = data;

        if(this.isFirstRender) {
            this.graphInstance.read(renderData);
        }
        else {
            this.graphInstance.changeData(renderData);
        }

        this.handleAppendItems(appendData);
        this.handleRemoveItems(removeData);

        if(this.engine.layoutOptions.fitView) {
            this.graphInstance.fitView();
        }

        this.modelList.forEach(item => {
            item.renderG6Item = this.graphInstance.findById(item.id);
            item.G6Item = item.renderG6Item;
        });

        if(this.isFirstRender) {
            this.graphInstance.getEdges().forEach(item => item.toFront());
            this.graphInstance.paint();
        }

        if(this.isFirstRender) {
            this.isFirstRender = false;
        }
    }

    /**
     * 获取 model 队列
     */
    getModelList(): Model[] {
        return this.modelList;
    }

    /**
     * 获取 G6 实例
     */
    public getGraphInstance() {
        return this.graphInstance;
    }
}