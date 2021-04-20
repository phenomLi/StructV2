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
                fill: 'transparent'
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

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            group.addShape('text', {
                attrs: {
                    x: width * (3 / 4), 
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
            [0, 0.5],
            [3 / 4, 0.5]
        ];
    }
});