

SV.registerShape('three-cell-node', {
    draw(cfg, group) {
        cfg.size = cfg.size || [30, 10];

        const width = cfg.size[0],
              height = cfg.size[1];

        const wrapperRect = group.addShape('rect', {
            attrs: {
                x: width / 2,
                y: height / 2,
                width: width,
                height: height,
                stroke: cfg.style.stroke,
                fill: '#eee'
            },
            name: 'wrapper',
            draggable: true
        });

        group.addShape('rect', {
            attrs: {
                x: width / 2,
                y: height / 2,
                width: width / 3,
                height: height,
                fill: cfg.style.fill,
                stroke: cfg.style.stroke
            },
            name: 'left-rect',
            draggable: true
        });

        group.addShape('rect', {
            attrs: {
                x: width * (5 / 6),
                y: height / 2,
                width: width / 3,
                height: height,
                fill: '#eee',
                stroke: cfg.style.stroke
            },
            name: 'mid-rect',
            draggable: true
        });

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            group.addShape('text', {
                attrs: {
                    x: width * (2 / 3), 
                    y: height,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    text: cfg.label,
                    fill: style.fill || '#000',
                    fontSize: style.fontSize || 16
                },
                name: 'text',
                draggable: true
            });
        }

        return wrapperRect;
    },

    getAnchorPoints() {
        return [
            [0, 0.5],
            [0.5, 0.5],
            [0.5, 0],
            [5 / 6, 0.5]
        ];
    }
});



class GeneralizedList extends Engine {

    defineOptions() {
        return {
            element: { 
                tableNode: {
                    type: 'three-cell-node',
                    label: '[tag]',
                    size: [90, 30],
                    style: {
                        stroke: '#333',
                        fill: '#b83b5e'
                    }
                },
                atomNode: {
                    type: 'two-cell-node',
                    label: '[tag]',
                    size: [60, 30],
                    style: {
                        stroke: '#333',
                        fill: '#b83b5e'
                    }
                }
            },
            link: {
                sub: {
                    type: 'line',
                    sourceAnchor: 1,
                    targetAnchor: 2,
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
                    sourceAnchor: 3,
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
            layout: {
                xInterval: 40,
                yInterval: 20,
            }
        };
    }

    /**
     * 对子树进行递归布局
     * @param node 
     * @param parent 
     */
    layoutItem(node, prev, layoutOptions) {
        let [width, height] = node.get('size');

        if(prev) {
            node.set('y', prev.get('y'));
            node.set('x', prev.get('x') + layoutOptions.xInterval + width)
        }

        if(node.next) {
            this.layoutItem(node.next, node, layoutOptions);
        }

        // 存在子节点
        if(node.sub) {
            node.sub.set('y', node.get('y') + layoutOptions.yInterval + height);
            
            // 子结点还是广义表
            if(node.sub.tag === 1) {
                node.sub.set('x', node.get('x'));
                this.layoutItem(node.sub, null, layoutOptions);
            }
            else {
                let subWidth = node.sub.get('size')[0];
                node.sub.set('x', node.get('x') + width - subWidth);
            }
        }
    }   

    layout(elements, layoutOptions) {
        let tableNodes = elements.tableNode,
            tableRootNode = null;

        for(let i = 0; i < tableNodes.length; i++) {
            if(tableNodes[i].root) {
                tableRootNode = tableNodes[i];
                break;
            }
        }

        if(tableRootNode) {
            this.layoutItem(tableRootNode, null, layoutOptions);
        }
    }
}



const GL = function(container) {
    return{
        engine: new GeneralizedList(container),
        data: [{
            "atomNode": [],
            "tableNode": [
                {
                    "id": 6385328,
                    "tag": 1,
                    "root": true,
                    "external": [
                        "gl"
                    ]
                }
            ]
        }]
    } 
};