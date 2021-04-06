import * as G6 from "./../Lib/g6.js";


export default G6.registerNode('binary-tree-node', {
    draw(cfg, group) {
        cfg.size = cfg.size || [60, 30];

        const width = cfg.size[0],
              height = cfg.size[1];

        const wrapperRect = group.addShape('rect', {
            attrs: {
                x: width / 2,
                y: height / 2,
                width: width,
                height: height,
                stroke: '#333',
                fill: 'transparent'
            },
            name: 'wrapper'
        });

        group.addShape('rect', {
            attrs: {
                x: width / 4 + width / 2,
                y: height / 2,
                width: width / 2,
                height: height,
                fill: cfg.style.fill
            },
            name: 'mid',
            draggable: true
        });

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            group.addShape('text', {
                attrs: {
                    x: width, // 居中
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
            [0.125, 0.5],
            [0.875, 0.5],
        ];
    },
});