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
                stroke: '#ddd'
            },
            name: 'wrapper'
        });

        group.addShape('rect', {
            attrs: {
                x: width / 3,
                y: height / 2,
                width: width * (2 / 3),
                height: height,
                fill: cfg.style.fill
            },
            name: 'main-rect'
        });

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            group.addShape('text', {
                attrs: {
                    x: cfg.size[0] + 2, // 居中
                    y: -cfg.size[1],
                    textAlign: 'center',
                    textBaseline: 'middle',
                    text: cfg.label,
                    fill: style.fill || '#000',
                    fontSize: style.fontSize || 16
                },
                name: 'pointer-text-shape',
                draggable: false,
            });
        }

        return wrapperRect;
    },

    update(cfg, item) {
        console.log(88);
    },

    getAnchorPoints() {
        return [
            [0, 0.5],
            [2 / 3, 0.5]
        ];
    }
});