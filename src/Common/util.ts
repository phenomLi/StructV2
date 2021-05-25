import { LayoutGroup, LayoutGroupTable } from "../Model/modelConstructor";
import { G6EdgeModel, G6NodeModel, Link, Model } from "../Model/modelData";
import { SV } from "../StructV";
import { G6Data } from "../View/renderer";


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
     * 乞丐版对象克隆
     * @param obj 
     */
    objectClone<T extends Object>(obj: T): T {
        return obj? JSON.parse(JSON.stringify(obj)): { };
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
    },

    /**
     * 
     * @param groupTable 
     * @returns 
     */
    convertGroupTable2ModelList(groupTable: LayoutGroupTable): Model[] {
        const list: Model[] = [];

        groupTable.forEach(item => {
            list.push(...item.modelList);
        });

        return list;
    },

    /**
     * G6 data 转换器
     * @param layoutGroup 
     * @returns 
     */
    convertG6Data(layoutGroup: LayoutGroup): G6Data {
        let nodes = [...layoutGroup.element, ...layoutGroup.pointer],
            edges = layoutGroup.link;

        return { 
            nodes: nodes.map(item => item.cloneProps()) as G6NodeModel[], 
            edges: edges.map(item => item.cloneProps()) as G6EdgeModel[]
        };
    },

    /**
     * 将 modelList 转换到 G6Data
     * @param modelList
     */
    convertModelList2G6Data(modelList: Model[]): G6Data {
        return {
            nodes: <G6NodeModel[]>(modelList.filter(item => !(item instanceof Link)).map(item => item.cloneProps())),
            edges: <G6EdgeModel[]>(modelList.filter(item => item instanceof Link).map(item => item.cloneProps()))
        }
    },

    /**
     * 计算旋转矩阵
     * @param matrix 
     * @param rotation 
     */
    calcRotateMatrix(matrix: number[], rotation: number): number[] {
        const Mat3 = SV.G6.Util.mat3;
        Mat3.rotate(matrix, matrix, rotation);
        return matrix;
    }
};

