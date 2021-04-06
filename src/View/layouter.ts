import { Util } from "../Common/util";
import { Engine } from "../engine";
import { ConstructedData } from "../Model/modelConstructor";
import { Element, Pointer } from "../Model/modelData";
import { LayoutOptions, PointerOption } from "../options";
import { Bound, BoundingRect } from "./boundingRect";




export class Layouter {
    private engine: Engine;
    private containerWidth: number;
    private containerHeight: number;

    constructor(engine: Engine, containerWidth: number, containerHeight: number) {
        this.engine = engine;
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
    }

    /**
     * 将视图调整至画布中心
     * @param nodes
     */
    private fiTCenter(nodes: (Element | Pointer)[]) {
        const viewBound: BoundingRect = nodes.map(item => item.getBound()).reduce((prev, cur) => Bound.union(prev, cur));

        let centerX = this.containerWidth / 2, centerY = this.containerHeight / 2,
            boundCenterX = viewBound.x + viewBound.width / 2,
            boundCenterY = viewBound.y + viewBound.height / 2,
            dx = centerX - boundCenterX,
            dy = centerY - boundCenterY;

        nodes.forEach(item => {
            item.set('x', item.get('x') + dx);
            item.set('y', item.get('y') + dy)
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
                item.set('x', targetBound.x + targetBound.width / 2);
                item.set('y', targetBound.y - offset);
            });
        });
    }   

    /**
     * 主布局函数
     * @param constructedData 
     * @param layoutFn 
     */
    public layout(constructedData: ConstructedData, layoutFn: (element: { [ket: string]: Element[] }, layoutOptions: LayoutOptions) => void) {
        const options: LayoutOptions = this.engine.layoutOptions,
              nodes: (Element | Pointer)[] = [...Util.converterList(constructedData.element), ...Util.converterList(constructedData.pointer)]

        // 布局节点
        layoutFn.call(this.engine, constructedData.element, options);

        // 布局外部指针
        this.layoutPointer(constructedData.pointer);

        // 将视图调整到画布中心
        options.fitCenter && this.fiTCenter(nodes);
    }
}