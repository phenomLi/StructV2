import { Link, Model } from "../../Model/modelData";
import { InteractionOptions, LayoutGroupOptions } from "../../options";
import { Container } from "./container";



/**
 * 主可视化视图
 */
 export class MainContainer extends Container {

    protected initBehaviors(optionsTable: { [key: string]: LayoutGroupOptions }) {
        const dragNodeTable: { [key: string]: boolean | string[] } = { },
              selectNodeTable: { [key: string]: boolean | string[] } = { },
              interactionOptions: InteractionOptions = this.engine.interactionOptions,
              defaultModes = [];

        Object.keys(optionsTable).forEach(item => {
            dragNodeTable[item] = optionsTable[item].behavior.dragNode;
            selectNodeTable[item] = optionsTable[item].behavior.selectNode;
        });

        if(interactionOptions.drag) {
            defaultModes.push('drag-canvas');
        }

        if(interactionOptions.zoom) {
            defaultModes.push('zoom-canvas');
        }

        const dragNodeFilter = node => {
            let model = node.item.getModel();

            if(node.item === null) {
                return false;
            }

            if(model.SVModelType === 'pointer') {
                return false;
            }

            let dragNode = optionsTable[model.SVLayouter].behavior.dragNode;

            if(typeof dragNode === 'boolean') {
                return dragNode;
            } 

            if(Array.isArray(dragNode) && dragNode.indexOf(model.SVModelName) > -1) {
                return true;
            }

            return false;
        }

        const selectNodeFilter = node => {
            let model = node.item.getModel();

            if(node.item === null) {
                return false;
            }

            if(model.SVModelType === 'pointer') {
                return false;
            }

            let selectNode = optionsTable[model.SVLayouter].behavior.selectNode;

            if(typeof selectNode === 'boolean') {
                return selectNode;
            } 

            if(Array.isArray(selectNode) && selectNode.indexOf(model.SVModelName) > -1) {
                return true;
            }

            return false;
        }

        defaultModes.push({
            type: 'drag-node',
            shouldBegin: dragNodeFilter
        });

        defaultModes.push({
            type: 'click-select',
            shouldBegin: selectNodeFilter
        });

        return defaultModes;
    }

    /**
     * 在初始化渲染器之后，修正节点拖拽时，外部指针没有跟着动的问题
     * @param dragNodeTable 
     */
    protected afterInitRenderer() {
        let g6Instance = this.getG6Instance(),
            pointerY = null,
            dragStartX = null,
            dragStartY = null;

        g6Instance.on('node:dragstart', ev => {
            const model = ev.item.getModel(),
                  dragNode = this.engine.optionsTable[model.SVLayouter].behavior.dragNode;

            if(dragNode === false) {
                return;
            }
            
            if(Array.isArray(dragNode) && dragNode.find(item => item === model.SVModelName) === undefined) {
                return;
            }

            pointer = g6Instance.findById(model.externalPointerId);
            
            if(pointer) {
                pointerX = pointer.getModel().x,
                pointerY = pointer.getModel().y;
                dragStartX = ev.canvasX;
                dragStartY = ev.canvasY;
            }
        });

        g6Instance.on('node:dragend', ev => {
            pointer = null;
            pointerX = null,
            pointerY = null,
            dragStartX = null,
            dragStartY = null;
        });

        g6Instance.on('node:drag', ev => {
            if(!pointer) {
                return;
            }

            let dx = ev.canvasX - dragStartX,
                dy = ev.canvasY - dragStartY,
                zoom = g6Instance.getZoom();

            pointer.updatePosition({
                x: pointerX + dx / zoom,
                y: pointerY + dy / zoom
            });
        });
    }

    protected handleChangeModels(models: Model[]) {
        const changeHighlightColor: string = this.interactionOptions.changeHighlight;

        // 第一次渲染的时候不高亮变化的元素
        if(this.renderer.getIsFirstRender()) {
            return;
        }

        if(!changeHighlightColor || typeof changeHighlightColor !== 'string') {
            return;
        }

        models.forEach(item => {
            if(item instanceof Link) {
                item.set('style', {
                    stroke: changeHighlightColor
                });
            }
            else {
                item.set('style', {
                    fill: changeHighlightColor
                });
            }
        });
    }
};