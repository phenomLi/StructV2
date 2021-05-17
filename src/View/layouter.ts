import { Bound, BoundingRect } from '../Common/boundingRect';
import { Engine } from '../engine';
import { ConstructList } from '../Model/modelConstructor';
import { Element, Model, Pointer } from '../Model/modelData';
import { LayoutOptions, PointerOption } from '../options';
import { Container } from './container/container';


export class Layouter {
    private engine: Engine;

    constructor(engine: Engine) {
        this.engine = engine;
    }


    /**
     * 初始化布局参数
     * @param elements 
     * @param pointers 
     */
     private initLayoutValue(elements: Element[], pointers: Pointer[]) {
        [...elements, ...pointers].forEach(item => {
            item.set('rotation', item.get('rotation'));
            item.set({ x: 0, y: 0 });
        });
    }

    /**
     * 布局外部指针
     * @param pointer 
     */
    private layoutPointer(pointers: Pointer[]) {
        pointers.forEach(item => {
            const options: PointerOption = this.engine.pointerOptions[item.getType()],
                  offset = options.offset || 8,
                  anchor = options.anchor || 0;

            let target = item.target,
                targetBound: BoundingRect = item.target.getBound(),
                anchorPosition = item.target.G6Item.getAnchorPoints()[anchor];

            item.set({
                x: targetBound.x + targetBound.width / 2,
                y: targetBound.y - offset
            });
        });
    }   

    /**
     * 将视图调整至画布中心
     * @param container
     * @param models
     */
     private fitCenter(container: Container, models: Model[]) {
        if(models.length === 0) {
            return;
        }   

        const viewBound: BoundingRect = models.map(item => item.getBound()).reduce((prev, cur) => Bound.union(prev, cur));

        let width = container.getG6Instance().getWidth(),
            height = container.getG6Instance().getHeight(),
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
     * 进行布局
     * @param container 
     * @param constructList 
     * @param layoutFn 
     */
    public layout(container: Container, constructList: ConstructList, layoutFn: (elements: Element[], layoutOptions: LayoutOptions) => void) {
        const options: LayoutOptions = this.engine.layoutOptions,
              modelList: Model[] = [...constructList.element, ...constructList.pointer, ...constructList.link];
        
        // 首先初始化所有节点的坐标为0，且设定旋转
        modelList.forEach(item => {
            item.G6Item = item.shadowG6Item;
        });
        
        // 初始化布局参数
        this.initLayoutValue(constructList.element, constructList.pointer);
        // 布局节点
        layoutFn(constructList.element, options);
        // 布局外部指针
        this.layoutPointer(constructList.pointer);

        // 将视图调整到画布中心
        options.fitCenter && this.fitCenter(container, modelList);

        modelList.forEach(item => {
            item.G6Item = item.renderG6Item;
        });
    }

}