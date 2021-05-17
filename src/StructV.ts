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


export const SV = {
    Engine: Engine,
    Group: Group,
    Bound: Bound,
    Vector: Vector,
    Mat3: G6.Util.mat3,
    G6,
    registeredShape: [
        externalPointer, 
        linkListNode, 
        binaryTreeNode, 
        twoCellNode,
        indexedNode
    ],
    registerShape: G6.registerNode
};

