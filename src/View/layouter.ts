import { Bound, BoundingRect } from '../Common/boundingRect';
import { Group } from '../Common/group';
import { Vector } from '../Common/vector';
import { Engine } from '../engine';
import { LayoutGroupTable } from '../Model/modelConstructor';
import { Element, Model, Pointer } from '../Model/modelData';
import { LayoutOptions, PointerOption, ViewOptions } from '../options';
import { Container } from './container/container';


export class Layouter {
    private engine: Engine; 
    private viewOptions: ViewOptions;

    constructor(engine: Engine) {
        this.engine = engine;
        this.viewOptions = this.engine.viewOptions;
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
     * @param pointerOptions
     */
    private layoutPointer(pointers: Pointer[], pointerOptions: { [key: string]: PointerOption }) {
        pointers.forEach(item => {
            const options: PointerOption = pointerOptions[item.getType()],
                  offset = options.offset || 8,
                  anchor = item.anchor || 0;

            let target = item.target,
                targetBound: BoundingRect = target.getBound(),
                anchorPosition = item.target.G6Item.getAnchorPoints()[anchor],
                center: [number, number] = [targetBound.x + targetBound.width / 2, targetBound.y + targetBound.height / 2],
                pointerPosition: [number, number],
                pointerEndPosition: [number, number];

            anchorPosition = [anchorPosition.x, anchorPosition.y];

            let anchorVector = Vector.subtract(anchorPosition, center),
                angle = 0, len = Vector.length(anchorVector) + offset;

            if(anchorVector[0] === 0) {
                angle = anchorVector[1] > 0? -Math.PI: 0;
            }
            else {
                angle = Math.sign(anchorVector[0]) * (Math.PI / 2 - Math.atan(anchorVector[1] / anchorVector[0]));
            }

            const pointerHeight = item.get('size')[1];

            anchorVector = Vector.normalize(anchorVector);
            pointerPosition = Vector.location(center, anchorVector, len);
            pointerEndPosition = Vector.location(center, anchorVector, pointerHeight + len);
            pointerEndPosition = Vector.subtract(pointerEndPosition, pointerPosition);

            item.set({
                x: pointerPosition[0],
                y: pointerPosition[1],
                rotation: angle,
                pointerEndPosition
            });
        });
    }   

    /**
     * 将视图调整至画布中心
     * @param container
     * @param models
     */
    private fitCenter(container: Container, group: Group) {
        let width = container.getG6Instance().getWidth(),
            height = container.getG6Instance().getHeight(),
            viewBound: BoundingRect = group.getBound(),
            centerX = width / 2, centerY = height / 2,
            boundCenterX = viewBound.x + viewBound.width / 2,
            boundCenterY = viewBound.y + viewBound.height / 2,
            dx = centerX - boundCenterX,
            dy = centerY - boundCenterY;

        group.translate(dx, dy);
    }

    /**
     * 对每个组内部的model进行布局
     * @param layoutGroupTable
     */
    private layoutModels(layoutGroupTable: LayoutGroupTable): Group[] {
        const modelGroupList: Group[] = [];

        layoutGroupTable.forEach(group => {
            const options: LayoutOptions = group.options.layout,
                  modelList: Model[] = group.modelList,
                  modelGroup: Group = new Group();
        
            modelList.forEach(item => {
                modelGroup.add(item);
            });
            
            this.initLayoutValue(group.element, group.pointer); // 初始化布局参数
            group.layouter.layout(group.element, options);  // 布局节点
            modelGroupList.push(modelGroup);
        });

        layoutGroupTable.forEach(group => {
            this.layoutPointer(group.pointer, group.options.pointer);  // 布局外部指针
        });

        return modelGroupList;
    }

    /**
     * 对所有组进行相互布局
     * @param container 
     * @param modelGroupTable 
     */
    private layoutGroups(container: Container, modelGroupList: Group[]): Group {
        let wrapperGroup: Group = new Group(),
            group: Group,
            prevBound: BoundingRect, 
            bound: BoundingRect,
            boundList: BoundingRect[] = [],
            maxHeight: number = -Infinity,
            dx = 0, dy = 0;
        
        // 左往右布局
        for(let i = 0; i < modelGroupList.length; i++) {
            group = modelGroupList[i],
            bound = group.getPaddingBound(this.viewOptions.groupPadding);

            if(prevBound) {
                dx = prevBound.x + prevBound.width - bound.x;
            }
            else {
                dx = bound.x;
            }

            if(bound.height > maxHeight) {
                maxHeight = bound.height;
            }

            group.translate(dx, 0);
            Bound.translate(bound, dx, 0);
            boundList.push(bound);
            wrapperGroup.add(group);
            prevBound = bound;
        }

        // 居中对齐布局
        for(let i = 0; i < modelGroupList.length; i++) {
            group = modelGroupList[i];
            bound = boundList[i];

            dy = maxHeight / 2 - bound.height / 2;
            group.translate(0, dy);
            Bound.translate(bound, 0, dy);
        }

        return wrapperGroup;
    }

    /**
     * 布局
     * @param container 
     * @param layoutGroupTable 
     */
    public layoutAll(container: Container, layoutGroupTable: LayoutGroupTable) {
        layoutGroupTable.forEach(item => {
            item.modelList.forEach(model => {
                model.G6Item = model.shadowG6Item;
            });
        });

        const modelGroupList: Group[] = this.layoutModels(layoutGroupTable);

        const wrapperGroup: Group = this.layoutGroups(container, modelGroupList);
        this.fitCenter(container, wrapperGroup);

        layoutGroupTable.forEach(item => {
            item.modelList.forEach(model => {
                model.G6Item = model.renderG6Item;
            });
        });
    }

}