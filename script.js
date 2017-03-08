var N = 40;
var p = 0.7;
var globalMatrix;
var globalArr;
var from = -1;

function resetColors() {
    globalArr.forEach(function (id) {
        var td = getElm(id);
        td.style.backgroundColor = attrVal(td, 'color');
    })
}

(function createTable() {
    var table = document.getElementById('table');

    for (var i = 0; i < N; i++) {
        var tr = elm('tr');

        for (var j = 0; j < N; j++) {
            var td = elm('td');

            td.addEventListener('click', function() {
                from = parseInt(attrVal(this, 'idx'));
                this.style.transform = 'scale(1.5)';
            });

            td.addEventListener('mouseover', function () {
                this.style.transform = 'scale(1.6)';
                this.style.borderRadius = '50%';
                this.style.zIndex = '100';

                if (this.style.backgroundColor !== 'white') {
                    var idx = attrVal(this, 'idx');

                    if (globalMatrix && globalArr && (from !== -1) && (idx !== from)) {
                        resetColors();
                        createPath(parseInt(attrVal(this, 'idx')));
                    }
                }
            });
            td.addEventListener('mouseout', function() {
                if (attrVal(this, 'idx') !== from) {
                    this.style.transform = 'scale(1)';
                    this.style.borderRadius = '0';
                    this.style.zIndex = '0';
                }
            });

            td.id = i + ':' + j;
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }
})();

function fillRandom() {
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            var elm = getElm(i + ':' + j);
            elm.style.backgroundColor = 'white';
            elm.innerHTML = '';

            if (Math.random() < p) {
                elm.style.backgroundColor = 'black';
            }
        }
    }
}

function findClusters() {
    var k = 0;
    var watched = [];

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            var td = getElm(i + ':' + j);
            var color = td.style.backgroundColor;

            watched.push(td);

            if (color == 'black') {

                var left = getLeft(i, j);
                var top = getTop(i, j);

                if (left == -1 && top == -1) {
                    td.setAttribute('cluster', k++);

                } else if (left !== -1 && top !== -1) {
                    if (left < top) {
                        mergeClusters(i, j, left, top, watched);

                    } else {
                        mergeClusters(i, j, top, left, watched);
                    }


                } else if (left !== -1) {
                    td.setAttribute('cluster', left);

                } else if (top !== -1) {
                    td.setAttribute('cluster', top);
                }
            }
        }
    }

    var colors = [];

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            var td = getElm(i + ':' + j);

            if (td.style.backgroundColor == 'black') {
                var cNum = parseInt(td.getAttribute('cluster'));

                if (!containsCnum(colors, cNum)) {
                    colors.push({cNum: cNum, color: getRandomColor()});
                }
            }
        }
    }

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            var td = getElm(i + ':' + j);

            if (td.style.backgroundColor == 'black') {
                var cNum = parseInt(td.getAttribute('cluster'));
                var color = getColorByCnum(colors, cNum);
                td.style.backgroundColor = color;
                td.setAttribute('color', color)
            }
        }
    }
}

function mergeClusters(i, j, less, bigger, watched) {
    getElm(i + ':' + j).setAttribute('cluster', less);

    var rColor = getRandomColor();

    watched.forEach(function (td) {
        var cNum = parseInt(td.getAttribute('cluster'));

        if (cNum == less || cNum == bigger) {
            td.setAttribute('cluster', less);
        }
    });
}

function getLeft(i, j) {
    var td = getElm(i + ':' + (j - 1));

    if (!td || (td.style.backgroundColor == 'white')) {
        return -1;

    } else {
        return parseInt(td.getAttribute('cluster'));
    }
}

function getTop(i, j) {
    var td = getElm((i - 1) + ':' + j);

    if (!td || (td.style.backgroundColor == 'white')) {
        return -1;

    } else {
        return parseInt(td.getAttribute('cluster'));
    }
}

function markCells() {
    var start = new Date().getTime();
    var tdArr = [];

    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            var td = getElm(i + ':' + j);

            if (td.style.backgroundColor !== 'white') {
                td.innerHTML = tdArr.length;
                td.setAttribute('idx', tdArr.length);
                tdArr.push(attrVal(td, 'id'));
            }
        }
    }

    makeMatrix(tdArr);

    var end = new Date().getTime();
    console.log('Finished in: ' + (end - start));
}

function makeMatrix(arr) {
    var matrix = [];
    for (var i = 0; i < arr.length; i++) {
        matrix[i] = new Array(arr.length);
    }

    for (var i = 0; i < arr.length; i++) {

        var td = getElm(arr[i]);

        var tdData = getPointData(td);

        var left = getElm(tdData.i + ':' + (tdData.j - 1));
        var top = getElm((tdData.i - 1) + ':' + tdData.j);
        var right = getElm(tdData.i + ':' + (tdData.j + 1));
        var bottom = getElm((tdData.i + 1) + ':' + tdData.j);

        [left, top, right, bottom].forEach(function (n) {
            if (n) {
                var nData = getPointData(n);

                if (n.style.backgroundColor !== 'white') {
                    if (attrVal(n, 'cluster') == attrVal(td, 'cluster')) {

                        matrix[tdData.idx][nData.idx] = Number.MIN_VALUE;
                        matrix[nData.idx][tdData.idx] = Number.MIN_VALUE;
                    }
                }
            }
        });
    }

    for (var i = 0; i < arr.length; i++) {
        var first = getElm(arr[i]),
            firstPointData = getPointData(first);

        for (var j = 0; j < arr.length; j++) {
            var second = getElm(arr[j]);

            if (i !== j && attrVal(first, 'cluster') !== attrVal(second, 'cluster')) {
                var secondPointData = getPointData(second);

                var distance = getDistance(firstPointData, secondPointData);

                if (!matrix[i][j]) {
                    matrix[i][j] = distance;
                    matrix[j][i] = distance;
                }
            }
        }
    }
    globalMatrix = matrix;
    globalArr = arr;
}

function createPath(toIdx) {
    var path = dijkstra(globalMatrix, from, toIdx);

    path.forEach(function (idx) {
        getElm(globalArr[idx]).style.backgroundColor = 'red';
    });
}

function dijkstra(matrix, s, t) {
    var d = new Array(matrix.length);
    var visited = new Array(matrix.length);
    var p = new Array(matrix.length);

    for (var i = 0; i < matrix.length; i++) {
        d[i] = Number.MAX_VALUE;
        visited[i] = false;
    }

    d[s] = 0;
    p[s] = s;

    for (var i = 0; i < matrix.length; i++) {
        var v = null;

        for (var j = 0; j < matrix.length; j++) {
            if (!visited[j] && (v == null || d[j] < d[v])) {
                v = j;
            }
        }

        if (d[v] == Number.MAX_VALUE) {
            break;
        }

        visited[v] = true;

        for (var j = 0; j < matrix.length; j++) {
            var edgeLen = matrix[v][j];

            if (d[v] + edgeLen < d[j]) {
                d[j] = d[v] + edgeLen;
                p[j] = p[v] + ',' + j + ',';
            }
        }
    }

    var pathStr = p[t];

    var path = pathStr.split(',');

    return path.filter(function (el) {
        return !isNaN(parseInt(el));

    }).map(function (el) {
        return parseInt(el);
    });
}

function getElm(id) {
    return document.getElementById(id);
}

function elm(type) {
    return document.createElement(type);
}

function getDistance(p1, p2) {
    return Math.abs(p1.i - p2.i) + Math.abs(p1.j - p2.j);
}

function getPointData(p) {
    return {
        i: parseInt(attrVal(p, 'id').split(':')[0]),
        j: parseInt(attrVal(p, 'id').split(':')[1]),
        idx: parseInt(attrVal(p, 'idx'))
    }
}

function attrVal(el, what) {
    return el.getAttribute(what);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function getColorByCnum(colors, cNum) {
    for (var i = 0; i < colors.length; i++) {
        if (colors[i].cNum == cNum) {
            return colors[i].color;
        }
    }
}

function containsCnum(colors, cNum) {
    for (var i = 0; i < colors.length; i++) {
        if (colors[i].cNum == cNum) return true;
    }

    return false;
}