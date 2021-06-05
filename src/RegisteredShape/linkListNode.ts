import * as G6 from "./../Lib/g6.js";


export default G6.registerNode('link-list-node', {
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
                stroke: cfg.style.stroke || '#333',
                fill: '#eee',
                cursor: cfg.style.cursor
            },
            name: 'wrapper'
        });

        group.addShape('rect', {
            attrs: {
                x: width / 2,
                y: height / 2,
                width: width * (2 / 3),
                height: height,
                fill: cfg.style.fill,
                stroke: cfg.style.stroke || '#333',
                cursor: cfg.style.cursor
            },
            name: 'main-rect',
            draggable: true
        });

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            group.addShape('text', {
                attrs: {
                    x: width * (5 / 6), 
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
            [0.5, 0],
            [5 / 6, 0],
            [5 / 6, 0.5],
            [1, 0.5],
            [5 / 6, 1],
            [0.5, 1],
            [0, 0.5]
        ];
    }
});