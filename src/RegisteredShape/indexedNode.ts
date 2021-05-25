import * as G6 from "./../Lib/g6.js";


export default G6.registerNode('indexed-node', {
    draw(cfg, group) {
        cfg.size = cfg.size || [30, 10];

        const width = cfg.size[0],
              height = cfg.size[1],
              disable = cfg.disable === undefined? false: cfg.disable;

        const rect = group.addShape('rect', {
            attrs: {
                x: width / 2,
                y: height / 2,
                width: width,
                height: height,
                stroke: cfg.style.stroke || '#333',
                fill: disable? '#ccc': cfg.style.fill,
                cursor: cfg.style.cursor, 
            },
            name: 'wrapper'
        });

        if (cfg.label) {
            const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            group.addShape('text', {
                attrs: {
                    x: width, 
                    y: height,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    text: cfg.label,
                    fill: style.fill || '#000',
                    fontSize: style.fontSize || 16
                },
                name: 'text'
            });
        }

        if(cfg.index !== undefined) {
            group.addShape('text', {
                attrs: {
                    x: width, 
                    y: height + 30,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    text: cfg.index.toString(),
                    fill: '#bbb',
                    fontSize: 14,
                    fontStyle: 'italic'
                },
                name: 'index-text'
            });
        }

        return rect;
    }
});