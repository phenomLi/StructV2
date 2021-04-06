import { SV } from "../StructV";



/**
 * 动画表
 */
export class Animations {
    private duration: number;
    private timingFunction: string;
    private mat3 = SV.G6.Util.mat3;

    constructor(duration: number, timingFunction: string) {
        this.duration = duration;
        this.timingFunction = timingFunction;
    }

    /**
     * 添加节点 / 边时的动画效果
     * @param G6Item 
     * @param callback 
     */
    append(G6Item, callback: Function = null) {
        const type = G6Item.getType(),
              group = G6Item.getContainer(),
              animateCfg = {
                  duration: this.duration,
                  easing: this.timingFunction,
                  callback
              };

        if(type === 'node') {
            let mat3 = this.mat3,
                matrix = group.getMatrix(),
                targetMatrix = mat3.clone(matrix);

            mat3.scale(matrix, matrix, [0, 0]);
            mat3.scale(targetMatrix, targetMatrix, [1, 1]);

            group.attr({ opacity: 0, matrix });
            group.animate({ opacity: 1, matrix: targetMatrix }, animateCfg);
        }

        if(type === 'edge') {
            const line = group.get('children')[0],
                  length = line.getTotalLength();

            line.attr({ lineDash: [0, length], opacity: 0 });
            line.animate({ lineDash: [length, 0], opacity: 1 }, animateCfg);
        }
    }

    /**
     * 移除节点 / 边时的动画效果
     * @param G6Item 
     * @param callback 
     */
    remove(G6Item, callback: Function = null) {
        const type = G6Item.getType(),
              group = G6Item.getContainer(),
              animateCfg = {
                  duration: this.duration,
                  easing: this.timingFunction,
                  callback
              };

        if(type === 'node') {
            let mat3 = this.mat3,
                matrix = mat3.clone(group.getMatrix());

            mat3.scale(matrix, matrix, [0, 0]);
            group.animate({ opacity: 0, matrix }, animateCfg);
        }

        if(type === 'edge') {
            const line = group.get('children')[0],
                  length = line.getTotalLength();

            line.animate({ lineDash: [0, length], opacity: 0 }, animateCfg);
        }
    }
    
};


















