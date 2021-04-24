

/**
 * 单链表
 */
class LinkList extends Engine {
    defineOptions() {
        return {
            element: { 
                default: {
                    type: 'link-list-node',
                    label: '[id]',
                    size: [60, 30],
                    style: {
                        stroke: '#333',
                        fill: '#b83b5e'
                    }
                }
            },
            link: {
                next: { 
                    type: 'line',
                    sourceAnchor: 1,
                    targetAnchor: 0,
                    style: {
                        stroke: '#333',
                        endArrow: {
                            path: G6.Arrow.triangle(8, 6, 0), 
                            fill: '#333'
                        },
                        startArrow: {
                            path: G6.Arrow.circle(2, -1), 
                            fill: '#333'
                        }
                    }
                },
                loopNext: {
                    type: 'arc',
                    curveOffset: 50,
                    sourceAnchor: 1,
                    targetAnchor: 3,
                    style: {
                        stroke: '#333',
                        endArrow: {
                            path: G6.Arrow.triangle(6, 6, -2), 
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
                    offset: 8,
                    style: {
                        fill: '#f08a5d'
                    }
                }
            },
            layout: {
                xInterval: 50,
                yInterval: 50
            }
        };
    }


    /**
     * 对子树进行递归布局
     * @param node 
     * @param parent 
     */
    layoutItem(node, prev, layoutOptions) {
        if(!node) {
            return null;
        }

        let width = node.get('size')[0];

        if(prev) {
            node.set('y', prev.get('y'));
            node.set('x', prev.get('x') + layoutOptions.xInterval + width);
        }

        if(node.next) {
            this.layoutItem(node.next, node, layoutOptions);
        }
    }   


    layout(elements, layoutOptions) {
        let nodes = elements.default,
            rootNodes = [],
            node,
            i;

        for(i = 0; i < nodes.length; i++) {
            node = nodes[i];
            
            if(node.root) {
                rootNodes.push(node);
            }
        }

        for(i = 0; i < rootNodes.length; i++) {
            let root = rootNodes[i],
                height = root.get('size')[1];

            root.set('y', root.get('y') + i * (layoutOptions.yInterval + height));
            this.layoutItem(root, null, layoutOptions);
        }
    }
}


const LList = function(container) {
    return{
        engine: new LinkList(container),
        data: [[
            { id: 1, root: true, next: 2, external: ['gg'] },
            { id: 2, next: 3 },
            { id: 3, next: 4 },
            { id: 4, next: 5 },
            { id: 5, loopNext: 6 },
            { id: 6, root: true, next: 7 },
            { id: 7, next: 8 }, 
            { id: 8, next: 4 }, 
            { id: 9, root: true, next: 10 },
            { id: 10 }
        ],
        [
            { id: 1, root: true, next: 2, external: ['gg'] },
            { id: 2, next: 3 },
            { id: 3, next: 6 },
            { id: 6, next: 7 },
            { id: 7, next: 8 }, 
            { id: 8 }
        ]]
    } 
};


