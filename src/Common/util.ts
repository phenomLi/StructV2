import * as zrender from "zrender";




/**
 * 工具函数
 */
export const Util = {

    /**
     * 生成唯一id
     */
    generateId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    /**
     * 扩展对象
     * @param origin 原对象 
     * @param ext 扩展的对象
     */
    extends(origin, ext) {
        zrender.util.extend(origin, ext);
    },

    /**
     * 合并对象
     * @param origin 
     * @param dest 
     */
    merge(origin, dest) {
        zrender.util.merge(origin, dest, true);
    },

    /**
     * 从列表中移除元素
     * @param list 移除列表
     * @param fn 移除判断规则
     */
    removeFromList<T>(list: T[], fn: (item: T) => boolean) {
        for(let i = 0; i < list.length; i++) {
            fn(list[i]) && list.splice(i, 1) && i--;
        }
    },

    /**
     * 从一个由数组组成的路径中获取几何中心
     * @param path 
     */
    getPathCenter(path: Array<[number, number]>): [number, number] {
        let maxX = -Infinity,
            minX = Infinity,
            maxY = -Infinity,
            minY = Infinity;

        path.map(item => {
            if(item[0] > maxX) maxX = item[0];
            if(item[0] < minX) minX = item[0];
            if(item[1] > maxY) maxY = item[1];
            if(item[1] < minY) minY = item[1];
        });

        return [(maxX + minX) / 2, (maxY + minY) / 2];
    },

    /**
     * 断言函数
     * @param assertFn 
     * @param errorText 
     */
    assert(condition: boolean, errorText: string): void | never {
        if(condition) {
            throw errorText;
        }
    },

    /**
     * 获取类的名称
     * @param classConstructor 
     */
    getClassName(classConstructor): string {
        return classConstructor.prototype.constructor.toString().split(' ')[1];
    },

    /**
     * 文本解析
     * @param text 
     */
    textParser(text: string): string[] | string {
        let fieldReg = /\[[^\]]*\]/g;

        if(fieldReg.test(text)) {
            let contents = text.match(fieldReg),
                values = contents.map(item => item.replace(/\[|\]/g, ''));
            return values;
        }
        else {
            return text;
        }
    },

    /**
     * 牵制某个值
     * @param value 
     */
    clamp(value: number, max: number, min: number): number {
        if(value <= max && value >= min) return value;
        if(value > max) return max;
        if(value < min) return min;
    }
};

