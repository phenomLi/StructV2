import { Engine } from "../engine";
import { ConstructedData } from "../Model/modelConstructor";
import { Element, Model, Pointer } from "../Model/modelData";
import { LayoutOptions, PointerOption } from "../options";
import { Bound, BoundingRect } from "./boundingRect";




export class Layouter {
    private engine: Engine;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    /**
     * 将视图调整至画布中心
     * @param nodes
     */
    private fitCenter(models: Model[]) {
        const viewBound: BoundingRect = models.map(item => item.getBound()).reduce((prev, cur) => Bound.union(prev, cur));

        let width = this.engine.getGraphInstance().getWidth(),
            height = this.engine.getGraphInstance().getHeight(),
            centerX = width / 2, centerY = height / 2,
            boundCenterX = viewBound.x + viewBound.width / 2,
            boundCenterY = viewBound.y + viewBound.height / 2,
            dx = centerX - boundCenterX,
            dy = centerY - boundCenterY;

        models.forEach(item => {
            item.set({
                x: item.get('x') + dx,
                y: item.get('y') + dy
            });
        });
    }

    /**
     * 布局外部指针
     * @param pointer 
     */
    private layoutPointer(pointer: { [key: string]: Pointer[] }) {
        Object.keys(pointer).map(name => {
            const options: PointerOption = this.engine.pointerOptions[name],
                  pointerList: Pointer[] = pointer[name],
                  offset = options.offset || 8;

            pointerList.forEach(item => {
                let targetBound: BoundingRect = item.target.getBound();
                item.set({
                    x: targetBound.x + targetBound.width / 2,
                    y: targetBound.y - offset
                });
            });
        });
    }   

    /**
     * 主布局函数
     * @param constructedData 
     * @param modelList
     * @param layoutFn 
     */
    public layout(constructedData: ConstructedData, modelList: Model[], layoutFn: (element: { [ket: string]: Element[] }, layoutOptions: LayoutOptions) => void) {
        const options: LayoutOptions = this.engine.layoutOptions;

        // 首先初始化所有节点的坐标为0，且设定旋转
        modelList.forEach(item => {
            item.G6Item = item.shadowG6Item;

            if(item.modelType === 'element' || item.modelType === 'pointer') {
                item.set('rotation', item.get('rotation'));
                item.set({ x: 0, y: 0 });
            }
        });

        // 布局节点
        layoutFn.call(this.engine, constructedData.element, options);

        // 布局外部指针
        this.layoutPointer(constructedData.pointer);

        // 将视图调整到画布中心
        options.fitCenter && this.fitCenter(modelList);

        modelList.forEach(item => {
            item.G6Item = item.renderG6Item;
        });
    }
}