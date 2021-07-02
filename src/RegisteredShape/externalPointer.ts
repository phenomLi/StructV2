import * as G6 from "./../Lib/g6.js";


export default G6.registerNode('external-pointer', {
    draw(cfg, group) {
        const keyShape = group.addShape('path', {
            attrs: {
                path: this.getPath(cfg),
                fill: cfg.style.fill,
                matrix: cfg.style.matrix
            },
            name: 'pointer-path'
        });

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            const text = group.addShape('text', {
                attrs: {
                    x: 0, 
                    y: 0,
                    textAlign: 'left',
                    textBaseline: 'middle',
                    text: cfg.label,
                    fill: style.fill || '#000',
                    fontSize: style.fontSize || 16,
                    stroke: '#fff',
                    lineWidth: 6
                },
                name: 'pointer-text-shape'
            });

            const { width: textWidth } = text.getBBox();

            // 旋转文字
            const pointerEndPosition = cfg.pointerEndPosition;
            if(pointerEndPosition) {
                let textX = pointerEndPosition[0] - textWidth / 2,
                    textY = pointerEndPosition[1];

                text.attr({ 
                    x: textX,
                    y: textY
                });
            }
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
    }
});