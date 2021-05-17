




class Arrays extends Engine {
    defineOptions() {
        return {
            element: { 
                default: {
                    type: 'indexed-node',
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
        let arr = elements,
            width = arr[0].get('size')[0];

        for(let i = 0; i < arr.length; i++) {
            arr[i].set('x', i * width);
        }
    }
} 




const A = function(container) {
    return{
        engine: new Arrays(container),
        data: [[
            { id: 1, index: 0 },
            { id: 2, index: 1 },
            { id: 3, index: 2 },
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
            { id: 6, external: 'A' },
            { id: 7 }, 
            { id: 8 },
            { id: 12 }
        ]]
    } 
};