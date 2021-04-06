


let cur = BTree(document.getElementById('container'));

cur.engine.render(cur.data[0]);

document.getElementById('btn').addEventListener('click', e => {
    cur.engine.render(cur.data[1]);
});