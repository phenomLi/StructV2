import { Util } from "./util";
import { BoundingRect, Bound } from "./boundingRect";
import { Element, Model } from "../Model/modelData";



/**
 * model 集合组
 */
export class Group {
    id: string;
    private models: Array<Model | Group> = [];

    constructor(...arg: Array<Model | Group>) {
        this.id = Util.generateId();

        if(arg) {
            this.add(...arg);
        }
    }

    /**
     * 添加element
     * @param arg 
     */
    add(...arg: Array<Model | Group>) {
        arg.map(ele => {
            this.models.push(ele);
        });
    }

    /**
     * 移除 model
     * @param element 
     */
    remove(model: Model | Group) {
        Util.removeFromList(this.models, item => item.id === model.id);
    }

    /**
     * 获取group的包围盒
     */
    getBound(): BoundingRect {
        return this.models.length? 
               Bound.union(...this.models.map(item => item.getBound())): 
               { x: 0, y: 0, width: 0, height: 0 };
    }

    /**
     * 获取具有一定内边距的包围盒
     * @param padding 
     * @returns 
     */
    getPaddingBound(padding: number = 0): BoundingRect {
        const bound = this.getBound();

        bound.x -= padding;
        bound.y -= padding;
        bound.width += padding * 2;
        bound.height += padding * 2;

        return bound;
    }

    /**
     * 位移group
     * @param dx 
     * @param dy 
     */
    translate(dx: number, dy: number) {
        this.models.map(item => {
            if(item instanceof Group) {
                item.translate(dx, dy);
            }
            else {
                item.set('x', item.get('x') + dx);
                item.set('y', item.get('y') + dy);
            }
        });
    }

    /**
     * 清空group
     */
    clear() {
        this.models.length = 0;
    }
}