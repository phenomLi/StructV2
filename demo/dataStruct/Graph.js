

class Graph extends Engine {

    defineOptions() {
        return {
            element: { 
                default: {
                    type: 'circle',
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
                    style: {
                        stroke: '#333'
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

    layout(elements, layoutOptions) {
        let nodes = elements.default,
            radius = layoutOptions.radius,
            intervalAngle = 2 * Math.PI / nodes.length;

        for (let i = 0; i < nodes.length; i++) {
            let [x, y] = Vector.rotation(-intervalAngle * i, [0, -radius]);

            nodes[i].set({x, y});
        }
    }
}



const G = function(container) {
    return{
        engine: new Graph(container),
        data: [[
            { id: 1, neighbor: 2 }, 
            { id: 2, neighbor: [ 3, 4, 5 ] }, 
            { id: 3, neighbor: [ 4, 6] }, 
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