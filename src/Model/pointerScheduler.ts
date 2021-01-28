import { ShapeStatus } from "../View/shape";
import { ZrShapeConstructor } from "../View/shapeScheduler";
import { Element, Style } from "./element";
import { Pointer } from "./pointer";


export interface PointerOptions {
    style: Style;
};





export class PointerScheduler {
    private pointers: Pointer[] = [];
    private prevPointers: Pointer[] = [];
    private pointerMap: { 
        [key: string]: {
            pointerConstructor: { new(): Pointer },
            zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
            shapeOptions: Partial<ShapeStatus>
        }
    };

    constructor() {
        
    }

    /**
     * 构建指针模型
     * @param elementList 
     */
    constructPointers(elementList: Element[]) {

    }

    setPointerMap(
        pointerLabel: string, 
        pointerConstructor: { new(): Pointer },
        zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
        shapeOptions: Partial<ShapeStatus>
    ) {
        this.pointerMap[pointerLabel] = {
            pointerConstructor,
            zrShapeConstructors,
            shapeOptions
        };
    }

    
    reset() {
        this.pointers.length = 0;
    }
};