import { Model } from "../Model/modelData";
import { SV } from "../StructV";



/**
 * 动画表
 */
export const Animations = {
 
    /**
     * 添加节点 / 边时的动画效果
     * @param model 
     * @param duration 
     * @param timingFunction 
     * @param callback 
     */
    animate_append(model: Model, duration: number, timingFunction: string, callback: Function = null) {
        const G6Item = model.G6Item,
              type = G6Item.getType(),
              group = G6Item.getContainer(),
              Mat3 = SV.Mat3,
              animateCfg = {
                  duration: duration,
                  easing: timingFunction,
                  callback
              };

        if(type === 'node') {
            let matrix = group.getMatrix(),
                targetMatrix = Mat3.clone(matrix);

            Mat3.scale(matrix, matrix, [0, 0]);
            Mat3.scale(targetMatrix, targetMatrix, [1, 1]);

            group.attr({ opacity: 0, matrix });
            group.animate({ opacity: 1, matrix: targetMatrix }, animateCfg);
        }

        if(type === 'edge') {
            const line = group.get('children')[0],
                  length = line.getTotalLength();

            line.attr({ lineDash: [0, length], opacity: 0 });
            line.animate({ lineDash: [length, 0], opacity: 1 }, animateCfg);
        }
    },

    /**
     * 移除节点 / 边时的动画效果
     * @param model 
     * @param duration 
     * @param timingFunction 
     * @param callback 
     */
     animate_remove(model: Model, duration: number, timingFunction: string, callback: Function = null) {
        const G6Item = model.G6Item,
              type = G6Item.getType(),
              group = G6Item.getContainer(),
              Mat3 = SV.Mat3,
              animateCfg = {
                  duration: duration,
                  easing: timingFunction,
                  callback
              };

        if(type === 'node') {
            let matrix = Mat3.clone(group.getMatrix());

            Mat3.scale(matrix, matrix, [0, 0]);
            group.animate({ opacity: 0, matrix }, animateCfg);
        }

        if(type === 'edge') {
            const line = group.get('children')[0],
                  length = line.getTotalLength();

            line.animate({ lineDash: [0, length], opacity: 0 }, animateCfg);
        }
    }
    
};


















