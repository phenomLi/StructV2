import * as G6 from "./../Lib/g6.js";


export default G6.registerNode('external-pointer', {
    draw(cfg, group) {
        cfg.size = cfg.size || [8, 35];

        const keyShape = group.addShape('path', {
            attrs: {
                path: this.getPath(cfg),
                fill: cfg.style.fill
            },
            name: 'pointer-path'
        });

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            group.addShape('text', {
                attrs: {
                    x: cfg.size[0] + 2, // 居中
                    y: -cfg.size[1],
                    textAlign: 'left',
                    textBaseline: 'middle',
                    text: cfg.label,
                    fill: style.fill || '#000',
                    fontSize: style.fontSize || 16
                },
                name: 'pointer-text-shape'
            });
        }

        return keyShape;
    },
    
    getPath(cfg) {
        let width = cfg.size[0],
            height = cfg.size[1],
            arrowWidth = width + 4,
            arrowHeight = height * 0.3;

        const path = [
            ['M', 0, 0], 
            ['L', -width / 2 - (arrowWidth / 2), -arrowHeight],
            ['L', -width / 2, -arrowHeight],
            ['L', -width / 2, -height],
            ['L', width / 2, -height],
            ['L', width / 2, -arrowHeight],
            ['L', width / 2 + (arrowWidth / 2), -arrowHeight],
            ['Z'], 
        ];

        return path;
    },
});