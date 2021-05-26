import { Engine } from "./engine";
import { Bound } from "./Common/boundingRect";
import { Group } from "./Common/group";
import externalPointer from "./RegisteredShape/externalPointer";
import * as G6 from "./Lib/g6.js";
import linkListNode from "./RegisteredShape/linkListNode";
import binaryTreeNode from "./RegisteredShape/binaryTreeNode";
import twoCellNode from "./RegisteredShape/twoCellNode";
import { Vector } from "./Common/vector";
import indexedNode from "./RegisteredShape/indexedNode";
import { EngineOptions, Layouter } from "./options";


export interface StructV {
    (DOMContainer: HTMLElement, engineOptions: EngineOptions): Engine;
    Group: typeof Group;
    Bound: typeof Bound;
    Vector: typeof Vector,
    Mat3: any;
    G6: any;

    registeredShape: any[];

    registeredLayouter: { [key: string]: Layouter },

    registerShape: Function,

    /**
     * 注册一个布局器
     * @param name 
     * @param layouter 
     */
    registerLayouter(name: string, layouter);
}


export const SV: StructV = function(DOMContainer: HTMLElement, engineOptions: EngineOptions = { }) {
    return new Engine(DOMContainer, engineOptions);
}

SV.Group = Group;
SV.Bound = Bound;
SV.Vector = Vector;
SV.Mat3 = G6.Util.mat3;
SV.G6 = G6;

SV.registeredLayouter = {};
SV.registeredShape = [
    externalPointer, 
    linkListNode, 
    binaryTreeNode, 
    twoCellNode,
    indexedNode
];

SV.registerShape = G6.registerNode;
SV.registerLayouter = function(name: string, layouter) {
    SV.registeredLayouter[name] = layouter;
};


