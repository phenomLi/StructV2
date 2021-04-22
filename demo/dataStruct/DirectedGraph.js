


class DirectedGraph extends Graph {
    defineOptions() {
        return {
            element: { 
                default: {
                    label: '[id]',
                    size: 30,
                    style: {
                        stroke: '#333',
                        fill: '#b83b5e'
                    }
                }
            },
            link: {
                neighbor: { 
                    type: 'line',
                    style: {
                        stroke: '#333',
                        endArrow: {
                            path: G6.Arrow.triangle(8, 6, 0), 
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
                radius: 150
            }
        };
    }
}



const DG = function(container) {
    return{
        engine: new DirectedGraph(container),
        data: [[
            { id: 1, neighbor: 2 }, 
            { id: 2, neighbor: [ 3, 4, 5 ] }, 
            { id: 3, neighbor: [ 4, 6 ] }, 
            { id: 4, neighbor: 5 }, 
            { id: 5, neighbor: 6 },
            { id: 6, neighbor: 1 }
        ],
        [
            { id: 1, neighbor: 3 }, 
            { id: 3 }, 
            { id: 4, neighbor: 5 }, 
            { id: 5, neighbor: 6 },
            { id: 6, neighbor: 1 }
        ]]
    } 
};

