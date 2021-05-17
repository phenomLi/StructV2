import { Link, Model } from "../../Model/modelData";
import { Container } from "./container";



/**
 * 主可视化视图
 */
 export class MainContainer extends Container {

    protected initBehaviors() {
        const interactionOptions = this.interactionOptions,
              dragNode: boolean | string[] = interactionOptions.dragNode,
              dragNodeFilter = node => {
                  let model = node.item.getModel();

                  if(node.item === null) {
                      return false;
                  }

                  if(model.modelType === 'pointer') {
                      return false;
                  }

                  if(typeof dragNode === 'boolean') {
                      return dragNode;
                  } 

                  if(Array.isArray(dragNode) && dragNode.indexOf(model.modelName) > -1) {
                      return true;
                  }

                  return false;
              }

        const modeMap = {
            drag: 'drag-canvas',
            zoom: 'zoom-canvas',
            dragNode: {
                type: 'drag-node',
                shouldBegin: node => dragNodeFilter(node)
            }
        },
        defaultModes = [];

        Object.keys(interactionOptions).forEach(item => {
            if(interactionOptions[item] && modeMap[item] !== undefined) {
                defaultModes.push(modeMap[item]);
            }
        });

        return defaultModes;
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