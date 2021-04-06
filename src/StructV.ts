import { Engine } from "./engine";
import { Bound } from "./View/boundingRect";
import { Group } from "./View/group";
import externalPointer from "./RegisteredShape/externalPointer";
import * as G6 from "./Lib/g6.js";
import linkListNode from "./RegisteredShape/linkListNode";
import binaryTreeNode from "./RegisteredShape/binaryTreeNode";


export const SV = {
    Engine: Engine,
    Group: Group,
    Bound: Bound,
    G6,
    registeredShape: [
        externalPointer, linkListNode, binaryTreeNode
    ]
};

