

/**
 * 二叉树
 */
class BinaryTree extends Engine {
    defineOptions() {
        return {
            element: { 
                default: {
                    type: 'binary-tree-node',
                    size: [60, 30],
                    label: '[id]',
                    style: {
                        fill: '#b83b5e',
                        stroke: "#333",
                        cursor: 'pointer'
                    }
                }
            },
            link: {
                child: { 
                    type: 'line',
                    sourceAnchor: index => index + 1,
                    targetAnchor: 0,
                    style: {
                        stroke: '#333',
                        lineAppendWidth: 6,
                        cursor: 'pointer',
                        endArrow: {
                            path: G6.Arrow.triangle(8, 6, 0), 
                            fill: '#333'
                        },
                        startArrow: {
                            path: G6.Arrow.circle(2, -1), 
                            fill: '#333'
                        }
                    }
                }
            },
            pointer: {
                external: {
                    offset: 14,
                    style: {
                        fill: '#f08a5d'
                    }
                }
            },
            layout: {
                xInterval: 40,
                yInterval: 40,
                fitCenter: true
            },
            animation: {
                enable: true,
                duration: 750,
                timingFunction: 'easePolyOut'
            }
        };
    }

    /**
     * 对子树进行递归布局
     */
    layoutItem(node, parent, index, layoutOptions) {
        // 次双亲不进行布局
        if(!node) {
            return null;
        }

        let bound = node.getBound(),
            width = bound.width,
            height = bound.height,
            group = new Group(node);

        if(parent) {
            node.set('y', parent.get('y') + layoutOptions.yInterval + height);

            // 左节点
            if(index === 0) {
                node.set('x', parent.get('x') - layoutOptions.xInterval / 2 - width / 2);
            }

            // 右结点
            if(index === 1) {
                node.set('x', parent.get('x') + layoutOptions.xInterval / 2 + width / 2);
            }
        }

        if(node.child && (node.child[0] || node.child[1])) {
            let leftChild = node.child[0],
                rightChild = node.child[1],
                leftGroup = this.layoutItem(leftChild, node, 0, layoutOptions),
                rightGroup = this.layoutItem(rightChild, node, 1, layoutOptions),
                intersection = null,
                move = 0;
            
            // 处理左右子树相交问题
            if(leftGroup && rightGroup) {
                intersection = Bound.intersect(leftGroup.getBound(), rightGroup.getBound());
                move = 0;

                if(intersection && intersection.width > 0) {
                    move = (intersection.width + layoutOptions.xInterval) / 2;
                    leftGroup.translate(-move, 0);
                    rightGroup.translate(move, 0);
                }
            }

            if(leftGroup) {
                group.add(leftGroup);
            }

            if(rightGroup) {
                group.add(rightGroup)
            }
        }
       
        return group;
    }   

    /**
     * 布局函数
     * @param {*} elements 
     * @param {*} layoutOptions 
     */
    layout(elements, layoutOptions) {
        let nodes = elements.default,
            rootNodes = [],
            node,
            root,
            lastRoot,
            treeGroup = new Group(),
            i;

        for(i = 0; i < nodes.length; i++) {
            node = nodes[i];
            
            if(node.root) {
                rootNodes.push(node);
            }
        }
        
        for(i = 0; i < rootNodes.length; i++) {
            root = rootNodes[i];

            root.subTreeGroup = this.layoutItem(root, null, i, layoutOptions);

            if(lastRoot) {
                let curBound = root.subTreeGroup.getBound(),
                    lastBound = lastRoot.subTreeGroup.getBound();
               
                let move = lastBound.x + lastBound.width + layoutOptions.xInterval - curBound.x;
                root.subTreeGroup.translate(move, 0);
            }

            lastRoot = root;
            treeGroup.add(root);
        }
    }
};


const BTree = function(container) {
    return{
        engine: new BinaryTree(container),
        data: [[
            { id: 1, child: [2, 3], root: true, external: ['treeA', 'gear'] }, 
            { id: 2, child: [null, 6] }, 
            { id: 3, child: [5, 4] },
            { id: 4, external: 'foo' },
            { id: 5 },
            { id: 6, external: 'bar', child: [null, 7] },
            { id: 7 },
            { id: 8, child: [9, 10], root: true },
            { id: 9, child: [11, null] },
            { id: 10 },
            { id: 11 }
        ],
        [
            { id: 1, child: [2, 3], root: true, external: 'treeA' }, 
            { id: 2, external: 'gear' }, 
            { id: 3, child: [5, 4] },
            { id: 4, external: 'foo' },
            { id: 5, child: [12, 13] },
            { id: 12 }, { id: 13 }
        ]]
    } 
};




