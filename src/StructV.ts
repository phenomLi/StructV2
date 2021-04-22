import { Engine } from "./engine";
import { Bound } from "./View/boundingRect";
import { Group } from "./View/group";
import externalPointer from "./RegisteredShape/externalPointer";
import * as G6 from "./Lib/g6.js";
import linkListNode from "./RegisteredShape/linkListNode";
import binaryTreeNode from "./RegisteredShape/binaryTreeNode";
import twoCellNode from "./RegisteredShape/twoCellNode";
import { Vector } from "./Common/vector";


export const SV = {
    Engine: Engine,
    Group: Group,
    Bound: Bound,
    Vector: Vector,
    G6,
    registeredShape: [
        externalPointer, linkListNode, binaryTreeNode, twoCellNode
    ]
};

