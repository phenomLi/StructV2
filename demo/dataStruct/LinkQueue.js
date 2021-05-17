

// G6.registerNode('link-Queue-head', {
//     draw(cfg, group) {
//         cfg.size = cfg.size || [30, 10];

//         const width = cfg.size[0],
//               height = cfg.size[1];

//         const wrapperRect = group.addShape('rect', {
//             attrs: {
//                 x: width / 2,
//                 y: height / 2,
//                 width: width,
//                 height: height,
//                 stroke: cfg.style.stroke,
//                 fill: 'transparent'
//             },
//             name: 'wrapper'
//         });

//         group.addShape('rect', {
//             attrs: {
//                 x: width / 2,
//                 y: height / 2,
//                 width: width,
//                 height: height / 2,
//                 fill: cfg.style.fill,
//                 stroke: cfg.style.stroke
//             },
//             name: 'top-rect'
//         });

//         group.addShape('rect', {
//             attrs: {
//                 x: width / 2,
//                 y: height,
//                 width: width,
//                 height: height / 2,
//                 fill: cfg.style.fill,
//                 stroke: cfg.style.stroke
//             },
//             name: 'bottom-rect'
//         });

//         group.addShape('text', {
//             attrs: {
//                 x: width, 
//                 y: height * (3 / 4),
//                 textAlign: 'center',
//                 textBaseline: 'middle',
//                 text: 'front',
//                 fill: '#000',
//                 fontSize: 16
//             },
//             name: 'front'
//         });

//         group.addShape('text', {
//             attrs: {
//                 x: width, 
//                 y: height * (5 / 4),
//                 textAlign: 'center',
//                 textBaseline: 'middle',
//                 text: 'rear',
//                 fill: '#000',
//                 fontSize: 16
//             },
//             name: 'rear'
//         });

//         return wrapperRect;
//     },

//     getAnchorPoints() {
//         return [
//             [1, 0.25],
//             [1, 0.75]
//         ];
//     }
// });


 class LinkQueue extends Engine {

    defineOptions() {
        return {
            element: { 
                head: {
                    type: 'rect',
                    label: '[label]',
                    size: [60, 40],
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
                    type: 'polyline',
                    sourceAnchor: 1,
                    targetAnchor: 5,
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
                    targetAnchor: 5,
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
            },
            interaction: {
                dragNode: ['node']
            }
        };
    }

    sourcesPreprocess(sources) {
        sources.head[1].external = null;
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
        let head1 = elements.head[0],
            head2 = elements.head[1],
            nodes = elements.node,
            headHeight = head1.get('size')[1];
        
        let roots = nodes.filter(item => item.root).reverse();

        for(let i = 0; i < roots.length; i++) {
            let root = roots[i],
                height = root.get('size')[1];

            root.set('y', root.get('y') + i * (layoutOptions.yInterval + height));
            this.layoutItem(root, null, layoutOptions);
        }

        let x = -50, y = roots.length? roots[roots.length - 1].get('y'): 0,
            nodeHeight = roots.length? roots[roots.length - 1].get('size')[1]: 0;
            
        head1.set({ x, y: y + nodeHeight * 3 });
        head2.set({ x, y: head1.get('y') + headHeight });
    }
}

const data = {
    head: [
        {
            "type": "QPtr",
            "id": 140737338526359,
            "label": "front",
            "front": "node#8358681150976310000",
            "external": [
                "lq"
            ]
        },
        {
            "type": "QPtr",
            "id": 140737338526360,
            "label": "rear",
            "rear": "node#15844482482171916",
            "external": null
        }
    ],
    node: []
}


const LQueue = function(container) {
    return{
        engine: new LinkQueue(container),
        data: [data]
    } 
};


