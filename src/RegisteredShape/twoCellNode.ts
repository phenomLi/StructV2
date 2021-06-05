import * as G6 from "./../Lib/g6.js";



export default G6.registerNode('two-cell-node', {
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
            name: 'wrapper'
        });

        group.addShape('rect', {
            attrs: {
                x: width / 2,
                y: height / 2,
                width: width / 2,
                height: height,
                fill: cfg.style.fill,
                stroke: cfg.style.stroke
            },
            name: 'left-rect',
            draggable: true
        });

        const style = (cfg.labelCfg && cfg.labelCfg.style) || {};

        if (cfg.label) {
            if(Array.isArray(cfg.label)) {
                let tag = cfg.label[0], data = cfg.label[1];

                group.addShape('text', {
                    attrs: {
                        x: width * (3 / 4), 
                        y: height,
                        textAlign: 'center',
                        textBaseline: 'middle',
                        text: tag,
                        fill: style.fill || '#000',
                        fontSize: style.fontSize || 16,
                        cursor: cfg.style.cursor,
                    },
                    name: 'text',
                    draggable: true
                });

                group.addShape('text', {
                    attrs: {
                        x: width * (5 / 4), 
                        y: height,
                        textAlign: 'center',
                        textBaseline: 'middle',
                        text: data,
                        fill: style.fill || '#000',
                        fontSize: style.fontSize || 16,
                        cursor: cfg.style.cursor,
                    },
                    name: 'text',
                    draggable: true
                });
            }
            else {
                group.addShape('text', {
                    attrs: {
                        x: width * (3 / 4), 
                        y: height,
                        textAlign: 'center',
                        textBaseline: 'middle',
                        text: cfg.label,
                        fill: style.fill || '#000',
                        fontSize: style.fontSize || 16,
                        cursor: cfg.style.cursor,
                    },
                    name: 'text',
                    draggable: true
                });
            }
        }

        return wrapperRect;
    },

    getAnchorPoints() {
        return [
            [0.5, 0],
            [3 / 4, 0.5],
            [0.5, 1],
            [0, 0.5]
        ];
    }
});