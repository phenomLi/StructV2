

class Stack extends Engine {
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

    layout(elements, layoutOptions) {
        let blocks = elements.default;

        for(let i = 1; i < blocks.length; i++) {
            let item = blocks[i],
                prev = blocks[i - 1],
                height = item.get('size')[1];

            item.set('y', prev.get('y') + height);
        }
    }
} 




const St = function(container) {
    return{
        engine: new Stack(container),
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