import { Engine } from "../engine";
import { Util } from "./../Common/util";

export class Behavior {
    private engine: Engine;
    private graphInstance;

    constructor(engine: Engine, graphInstance) {
        this.engine = engine;
        this.graphInstance = graphInstance;

        const interactionOptions = this.engine.interactionOptions,
              selectNode: boolean | string[] = interactionOptions.selectNode;

        if(interactionOptions.dragNode) {
            this.initDragNode();
        }
        
        if(interactionOptions.selectNode) {
            this.initSelectNode(selectNode);
        }
    }

    /**
     * 初始化节点拖拽事件
     */
    private initDragNode() {
        let pointer = null,
            pointerX = null,
            pointerY = null,
            dragStartX = null,
            dragStartY = null;

        this.graphInstance.on('node:dragstart', ev => {
            pointer = this.graphInstance.findById(ev.item.getModel().externalPointerId);
            
            if(pointer) {
                pointerX = pointer.getModel().x,
                pointerY = pointer.getModel().y;
                dragStartX = ev.canvasX;
                dragStartY = ev.canvasY;
            }
        });

        this.graphInstance.on('node:dragend', ev => {
            pointer = null;
            pointerX = null,
            pointerY = null,
            dragStartX = null,
            dragStartY = null;
        });

        this.graphInstance.on('node:drag', ev => {
            if(!pointer) {
                return;
            }

            let dx = ev.canvasX - dragStartX,
                dy = ev.canvasY - dragStartY,
                zoom = this.graphInstance.getZoom();

            pointer.updatePosition({
                x: pointerX + dx / zoom,
                y: pointerY + dy / zoom
            });
        });
    }

    /**
     * 初始化节/边选中
     * @param selectNode
     */
    private initSelectNode(selectNode: boolean | string[]) {
        let defaultHighlightColor = '#f08a5d',
            curSelectItem = null,
            curSelectItemStyle = null;

        if(selectNode === false) {
            return;
        }

        const selectCallback = ev => {
            const item = ev.item,
                  model = item.getModel(),
                  type = item.getType(),
                  name = model.modelName,
                  highlightColor = model.style.selectedColor;

            if(Array.isArray(selectNode) && selectNode.find(item => item === name) === undefined) {
                return;
            }

            if(curSelectItem && curSelectItem !== item) {
                curSelectItem.update({
                    style: curSelectItemStyle
                });
            }

            curSelectItem = item;
            curSelectItemStyle = Util.objectClone(curSelectItem.getModel().style);
            curSelectItem.update({
                style: {
                    ...curSelectItemStyle,
                    [type === 'node'? 'fill': 'stroke']: highlightColor || defaultHighlightColor
                }
            });
        };

        this.graphInstance.on('node:click', selectCallback);
        this.graphInstance.on('edge:click', selectCallback);
        this.graphInstance.on('click', ev => {
            if(curSelectItem === null) {
                return;
            }

            curSelectItem.update({
                style: curSelectItemStyle
            });

            curSelectItem = null;
            curSelectItemStyle = null;
        });
    }

    /**
     * 绑定 G6 事件
     * @param eventName 
     * @param callback 
     */
     public on(eventName: string, callback: Function) {
        if(this.graphInstance) {
            this.graphInstance.on(eventName, callback)
        }
    }
};