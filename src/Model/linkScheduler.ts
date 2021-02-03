import { ShapeStatus } from "../View/shape";
import { ZrShapeConstructor } from "../View/shapeScheduler";
import { Element } from "./element";
import { Link } from "./link";




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
    public constructLinks(elementList: Element[]) {

    }

    /**
     * 
     * @param linkLabel 
     * @param linkConstructor 
     * @param zrShapeConstructors 
     * @param shapeOptions 
     */
    public setLinkMap(
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

    /**
     * 更新element对应的图形
     */
    public updateShapes() {
        for(let i = 0; i < this.links.length; i++) {
            let link = this.links[i];

            if(link.isDirty) {
                link.renderShape(link.shapes, link.linkStatus);
            }
        }
    }

    public reset() {
        this.links.length = 0;
    }
}