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
            const offset = 20,
                  indexPosition = cfg.indexPosition || 'bottom',
                  indexPositionMap: { [key: string]: (width: number, height: number) => { x: number, y: number } } = {
                    top: (width: number, height: number) => ({ x: width, y: height / 2 - offset }),
                    right: (width: number, height: number) => ({ x: width * 1.5 + offset, y: height }),
                    bottom: (width: number, height: number) => ({ x: width, y: height * 1.5 + offset }),
                    left: (width: number, height: number) => ({ x: width / 2 - offset, y: height })
                  };

            const { x: indexX, y: indexY } = indexPositionMap[indexPosition](width, height);

            
            group.addShape('text', {
                attrs: {
                    x: indexX, 
                    y: indexY,
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
    },

    getAnchorPoints() {
        return [
            [0.5, 0],
            [1, 0.5],
            [0.5, 1],
            [0, 0.5]
        ];
    }
});