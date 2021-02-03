import { Util } from "../Common/util";
import { Style } from "../Model/element";
import { Shape } from "./shape";
import { ShapeScheduler } from "./shapeScheduler";



export enum patchType {
    ADD,
    REMOVE,
    POSITION,
    PATH,
    ROTATION,
    SIZE,
    STYLE
}


export interface patchInfo {
    type: number;
    shape: Shape;
}


export class Reconciler {
    private shapeScheduler: ShapeScheduler;

    constructor(shapeScheduler: ShapeScheduler) {
        this.shapeScheduler = shapeScheduler;
    }

    /**
     * 进行图形样式对象的比较
     * @param oldStyle 
     * @param newStyle 
     */
    reconcileStyle(oldStyle: Style, newStyle: Style): {name: string, old: any, new: any }[] {
        let styleName: {name: string, old: any, new: any }[] = [];
        
        Object.keys(newStyle).map(prop => {
            if(newStyle[prop] !== oldStyle[prop]) {
                styleName.push({
                    name: prop,
                    old: oldStyle[prop],
                    new: newStyle[prop]
                });
            }
        });

        return styleName;
    }

    /**
     * 图形间的 differ
     * @param shape 
     */
    reconcileShape(shape: Shape) {
        let patchList: patchInfo[] = [];

        if(shape.isDirty === false) return;

        // 比较图形路径
        if(JSON.stringify(shape.prevShapeStatus) !== JSON.stringify(shape.shapeStatus.points)) {
            patchList.push({
                type: patchType.PATH,
                shape
            });
        }
        
        // 比较图形坐标位置
        if(shape.prevShapeStatus.x !== shape.shapeStatus.x || shape.prevShapeStatus.y !== shape.shapeStatus.y) {
            patchList.push({
                type: patchType.POSITION,
                shape
            });
        }
        
        // 比较旋转角度
        if(shape.prevShapeStatus.rotation !== shape.shapeStatus.rotation) {
            patchList.push({
                type: patchType.ROTATION,
                shape
            });
        }

        // 比较尺寸
        if(shape.prevShapeStatus.width !== shape.shapeStatus.width || shape.prevShapeStatus.height !== shape.shapeStatus.height) {
            patchList.push({
                type: patchType.SIZE,
                shape
            });
        }

        // 比较样式
        let style = this.reconcileStyle(shape.prevShapeStatus.style, shape.shapeStatus.style);
        if(style.length) {
            patchList.push({
                type: patchType.STYLE,
                shape
            });
        }

        // 对变化进行更新
        this.patch(patchList);
    }

    /**
     * 
     * @param container 
     * @param shapeList 
     */
    reconcileShapeList(container: { [key: string]: Shape[] }, shapeList: Shape[]) {
        let patchList: patchInfo[] = [];

        for(let i = 0; i < shapeList.length; i++) {
            let shape = shapeList[i],
                name = shape.type;

            // 若发现存在于新视图模型而不存在于旧视图模型的图形，则该图形都标记为 ADD
            if(container[name] === undefined) {
                patchList.push({
                    type: patchType.ADD,
                    shape
                });
            }
            else {
                let oldShape = container[name].find(item => item.id === shape.id);

                // 若旧图形列表存在对应的图形，进行 shape 间 differ
                if(oldShape) {
                    oldShape.isReconcilerVisited = true;
                    this.reconcileShape(shape);
                }
                // 若发现存在于新视图模型而不存在于旧视图模型的图形，则该图形都标记为 ADD
                else {
                    patchList.push({
                        type: patchType.ADD,
                        shape
                    });
                }
            }
        }

        // 在旧视图容器中寻找未访问过的图形，表明该图形该图形需要移除
        Object.keys(container).forEach(key => {
            container[key].forEach(shape => {
                if(shape.isReconcilerVisited === false) {
                    patchList.push({
                        type: patchType.REMOVE,
                        shape,
                    });
                }

                shape.isReconcilerVisited = false;
            });
        });

        this.patch(patchList);
    }


    /**
     * 对修改的视图进行补丁更新
     * @param patchList 
     */
    patch(patchList: patchInfo[]) {
        let patch: patchInfo, 
            shape: Shape,
            i;

        for(i = 0; i < patchList.length; i++) {
            patch = patchList[i];
            shape = patch.shape;

            switch(patch.type) {
                case patchType.ADD: {
                    this.shapeScheduler.appendShape(shape);
                    this.shapeScheduler.emitAnimation(shape, 'append');
                    break;
                }

                case patchType.REMOVE: {
                    this.shapeScheduler.removeShape(shape);
                    this.shapeScheduler.emitAnimation(shape, 'remove');
                    break;
                }

                case patchType.PATH: {
                    shape.prevShapeStatus.points = shape.shapeStatus.points;
                    this.shapeScheduler.emitAnimation(shape, 'path');
                }

                case patchType.POSITION: {
                    shape.prevShapeStatus.x = shape.shapeStatus.x;
                    shape.prevShapeStatus.y = shape.shapeStatus.y;
                    this.shapeScheduler.emitAnimation(shape, 'position');
                    break;
                }

                case patchType.ROTATION: {
                    shape.prevShapeStatus.rotation = shape.shapeStatus.rotation;
                    this.shapeScheduler.emitAnimation(shape, 'rotation');
                    break;
                }

                case patchType.SIZE: {
                    shape.prevShapeStatus.width = shape.shapeStatus.width;
                    shape.prevShapeStatus.height = shape.shapeStatus.height;
                    this.shapeScheduler.emitAnimation(shape, 'size');
                    break;
                }

                case patchType.STYLE: {
                    shape.prevShapeStatus.style = Util.clone(shape.shapeStatus.style);
                    this.shapeScheduler.emitAnimation(shape, 'style');
                    break;
                }

                default: {
                    break;
                }
            }
        }
    }
}