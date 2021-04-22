

G6.registerNode('link-Queue-head', {
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
                fill: 'transparent'
            },
            name: 'wrapper'
        });

        group.addShape('rect', {
            attrs: {
                x: width / 2,
                y: height / 2,
                width: width,
                height: height / 2,
                fill: cfg.style.fill,
                stroke: cfg.style.stroke
            },
            name: 'top-rect'
        });

        group.addShape('rect', {
            attrs: {
                x: width / 2,
                y: height,
                width: width,
                height: height / 2,
                fill: cfg.style.fill,
                stroke: cfg.style.stroke
            },
            name: 'bottom-rect'
        });

        group.addShape('text', {
            attrs: {
                x: width, 
                y: height * (3 / 4),
                textAlign: 'center',
                textBaseline: 'middle',
                text: 'front',
                fill: '#000',
                fontSize: 16
            },
            name: 'front'
        });

        group.addShape('text', {
            attrs: {
                x: width, 
                y: height * (5 / 4),
                textAlign: 'center',
                textBaseline: 'middle',
                text: 'rear',
                fill: '#000',
                fontSize: 16
            },
            name: 'rear'
        });

        return wrapperRect;
    },

    getAnchorPoints() {
        return [
            [1, 0.25],
            [1, 0.75]
        ];
    }
});


 class LinkQueue extends Engine {
    defineOptions() {
        return {
            element: { 
                head: {
                    type: 'link-Queue-head',
                    label: '[id]',
                    size: [60, 80],
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
                front: {
                    type: 'line',
                    sourceAnchor: 0,
                    targetAnchor: 0,
                    style: {
                        stroke: '#333',
                        endArrow: {
                            path: G6.Arrow.triangle(8, 6, 0), 
                            fill: '#333'
                        }
                    }
                },
                rear: {
                    type: 'polyline',
                    sourceAnchor: 1,
                    targetAnchor: 3,
                    style: {
                        stroke: '#333',
                        endArrow: {
                            path: G6.Arrow.triangle(8, 6, 0), 
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
        let head = elements.head[0];

        if(head.front) {
            let d = head.get('size')[1] / 2 - head.front.get('size')[1],
                x = layoutOptions.xInterval * 2.5,
                y = head.front.get('size')[1] / 2 + 1.5 * d;

            head.front.set({ x, y });
        }

        if(head.front.next) {
            this.layoutItem(head.front.next, head.front, layoutOptions);
        }
    }
}




const LQueue = function(container) {
    return{
        engine: new LinkQueue(container),
        data: [{
            head: [{
                type: "QPtr",
                id: 44,
                front: 'node#1',
                rear: 'node#13'
            }],
            node: [
                {
                    id: 1,
                    next: 12,
                    root: true
                },
                {
                    id: 12,
                    next: 13
                },
                {
                    id: 13,
                    next: null
                }
            ]
        }]
    } 
};


