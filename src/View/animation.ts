import { Model } from "../Model/modelData";
import { SV } from "../StructV";


export type animationConfig = {
    duration: number;
    timingFunction: string;
    payload?: any;
    callback?: Function;
}


/**
 * 动画表
 */
export const Animations = {
 
    /**
     * 添加节点 / 边时的动画效果
     * @param model 
     * @param animationConfig
     */
    animate_append(model: Model, animationConfig: animationConfig) {
        const G6Item = model.G6Item,
              type = G6Item.getType(),
              group = G6Item.getContainer(),
              Mat3 = SV.Mat3,
              animateCfg = {
                  duration: animationConfig.duration,
                  easing: animationConfig.timingFunction,
                  callback: animationConfig.callback
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
     * @param animationConfig
     */
    animate_remove(model: Model, animationConfig: animationConfig) {
        const G6Item = model.G6Item,
              type = G6Item.getType(),
              group = G6Item.getContainer(),
              Mat3 = SV.Mat3,
              animateCfg = {
                  duration: animationConfig.duration,
                  easing: animationConfig.timingFunction,
                  callback: animationConfig.callback
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
    },

    /**
     * 移动节点 / 边的动画
     * @param model 
     * @param animationConfig 
     */
    animate_moveTo(model: Model, animationConfig: animationConfig) {
        const G6Item = model.G6Item,
              group = G6Item.getContainer(),
              Mat3 = SV.Mat3,
              target = animationConfig.payload,
              animateCfg = {
                  duration: animationConfig.duration,
                  easing: animationConfig.timingFunction,
                  callback: animationConfig.callback
              };
              
        let matrix = Mat3.clone(group.getMatrix());

        Mat3.translate(matrix, matrix, [target.x, target.y]);
        group.animate({ opacity: 0, matrix }, animateCfg);
    }
    
};


















