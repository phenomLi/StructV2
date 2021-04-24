




class RingArray extends Engine {
    defineOptions() {
        return {
            element: { 
                default: {
                    type: 'rect',
                    label: '[id]',
                    size: [60, 30],
                    style: {
                        stroke: '#333',
                        fill: '#95e1d3'
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
            interaction: {
                dragNode: false
            }
        };
    }

    layout(elements) {
        let arr = elements.default,
            width = arr[0].get('size')[0],
            radius = width * 1.1 / (2 * Math.sin(Math.PI / arr.length)),
            intervalAngle = 2 * Math.PI / arr.length;

        for (let i = 0; i < arr.length; i++) {
            let [x, y] = Vector.rotation(-intervalAngle * i, [0, radius]);

            arr[i].set({x, y});
            arr[i].set('rotation', intervalAngle * i);
        }
    }
} 


const RA = function(container) {
    return{
        engine: new RingArray(container),
        data: [[
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
            { id: 6 },
            { id: 7 }, 
            { id: 8 }, 
            { id: 9 },
            { id: 10 }
        ],
        [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 6 },
            { id: 7 }, 
            { id: 8 }
        ]]
    } 
};