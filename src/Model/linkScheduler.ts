import { ShapeStatus } from "../View/shape";
import { ZrShapeConstructor } from "../View/shapeScheduler";
import { Element, Style } from "./element";
import { Link } from "./link";



export interface LinkOptions {
    style: Style;
};



export class LinkScheduler {
    private links: Link[] = [];
    private prevLinks: Link[] = [];
    private linkMap: { 
        [key: string]: {
            linkConstructor: { new(): Link },
            zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
            shapeOptions: Partial<ShapeStatus>
        } 
    };

    constructor() {

    }

    /**
     * 构建链接模型
     * @param elementList 
     */
    constructLinks(elementList: Element[]) {

    }

    setLinkMap(
        linkLabel: string, 
        linkConstructor: { new(): Link }, 
        zrShapeConstructors: ZrShapeConstructor[] | ZrShapeConstructor,
        shapeOptions: Partial<ShapeStatus>
    ) {
        this.linkMap[linkLabel] = {
            linkConstructor,
            zrShapeConstructors,
            shapeOptions
        };
    }

    reset() {
        this.links.length = 0;
    }
}