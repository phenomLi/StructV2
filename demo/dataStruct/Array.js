




class Arrays extends Engine {
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
            interaction: {
                dragNode: false
            }
        };
    }

    layout(elements, layoutOptions) {
        let arr = elements.default;

        for(let i = 0; i < arr.length; i++) {
            let width = arr[i].get('size')[0];

            if(i > 0) {
                arr[i].set('x', arr[i - 1].get('x') + width);
            }
        }
    }
} 


const A = function(container) {
    return{
        engine: new Arrays(container),
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