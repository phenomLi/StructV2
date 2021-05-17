import { Engine } from '../engine';
import { G6EdgeModel, G6NodeModel } from '../Model/modelData';
import { Util } from '../Common/util';
import { SV } from '../StructV';
import { Model } from './../Model/modelData';



export interface G6Data {
    nodes: G6NodeModel[];
    edges: G6EdgeModel[];
};


export type g6Behavior = string | { type: string; shouldBegin?: Function; shouldUpdate?: Function; shouldEnd?: Function; };


export class Renderer {
    private engine: Engine;

    private DOMContainer: HTMLElement; // 主可视化视图容器
    private g6Instance; // g6 实例

    private isFirstRender: boolean; // 是否为第一次渲染

    constructor(engine: Engine, DOMContainer: HTMLElement, g6Options: { [key: string]: any }) {
        this.engine = engine;
        this.DOMContainer = DOMContainer;
        this.isFirstRender = true;

        const enable: boolean = this.engine.animationOptions.enable,
              duration: number = this.engine.animationOptions.duration,
              timingFunction: string = this.engine.animationOptions.timingFunction;

        // 初始化g6实例
        this.g6Instance = new SV.G6.Graph({
            container: DOMContainer,
            width: DOMContainer.offsetWidth, 
            height: DOMContainer.offsetHeight,
            groupByTypes: false,
            animate: enable,
            animateCfg: {
                duration: duration,
                easing: timingFunction
            },
            fitView: false,
            modes: {
                default: []
            },
            ...g6Options
        });
    }

    public getIsFirstRender(): boolean {
        return this.isFirstRender;
    }

    public setIsFirstRender(value: boolean) {
        this.isFirstRender = value;
    }

    /**
     * 从视图中移除一个 Model
     * @param model 
     */
    public removeModel(model: Model) {
        this.g6Instance.removeItem(model.renderG6Item);
    }

    /**
     * 渲染函数
     * @param modelList
     */
    public render(modelList: Model[], removeModels: Model[]) {
        let data: G6Data = Util.convertModelList2G6Data(modelList),
            removeData: G6Data = Util.convertModelList2G6Data(removeModels),
            renderData: G6Data = {
                nodes: [...data.nodes, ...removeData.nodes],
                edges: [...data.edges, ...removeData.edges]
            };

        if(this.isFirstRender) {
            this.g6Instance.read(renderData);
        }
        else {
            this.g6Instance.changeData(renderData);
        }

        if(this.engine.layoutOptions.fitView) {
            this.g6Instance.fitView();
        }

        modelList.forEach(item => {
            item.renderG6Item = this.g6Instance.findById(item.id);
            item.G6Item = item.renderG6Item;
        });

        // 把所有连线置顶
        if(this.isFirstRender) {
            this.g6Instance.getEdges().forEach(item => item.toFront());
            this.g6Instance.paint();
        }
    }

    /**
     * 获取 G6 实例
     */
    public getG6Instance() {
        return this.g6Instance;
    }

    /**
     * 销毁
     */
    public destroy() {
        this.g6Instance.destroy();
        this.DOMContainer = null;
    }
}