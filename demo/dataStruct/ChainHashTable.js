




/**
 * 连地址哈希表
 */
 class ChainHashTable extends Engine {

    defineOptions() {
        return {
            element: { 
                head: {
                    type: 'two-cell-node',
                    label: '[id]',
                    size: [70, 40],
                    style: {
                        stroke: '#333',
                        fill: '#b83b5e'
                    }
                },
                node: {
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
                start: { 
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
            },
            interaction: {
                dragNode: ['node']
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
        let headNode = elements.filter(item => item.type === 'head');

        for(let i = 0; i < headNode.length; i++) {
            let node = headNode[i],
                height = node.get('size')[1];

            node.set('y', node.get('y') + i * height);

            if(node.start) {
                let y = node.get('y') + height - node.start.get('size')[1],
                    x = layoutOptions.xInterval * 2.5;

                node.start.set({ x, y });
                this.layoutItem(node.start, null, layoutOptions);
            }
        }
    }

}


const CHT = function(container, options) {
    return{
        engine: new ChainHashTable(container, options),
        data: [
            {
                head: [{
                    id: 0,
                    start: 'node#0'
                }, {
                    id: 2,
                    start: 'node#2'
                }],
                node: [{
                    id: 0,
                    next: 1
                }, {
                    id: 1
                },{
                    id: 2,
                    next: 3
                }, {
                    id: 3
                }]
            },
            {
                head: [{
                    id: 0,
                    start: 'node#0'
                }, {
                    id: 2,
                    start: 'node#2'
                }, {
                    id: 3,
                    start: 'node#4'
                }],
                node: [{
                    id: 0,
                    next: 1
                }, {
                    id: 1
                },{
                    id: 2
                },{
                    id: 4
                }]
            }
        ]
    } 
};


