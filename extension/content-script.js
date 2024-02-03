let startPoint = null;
let endPoint = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    cleanupEnvironment();
    if (request.action === "displayImage") {
        if (request.message) {
            let img = new Image();
            img.onload = function () {
                let canvas = document.createElement('canvas');
                canvas.id = 'colorPickerCanvas';
                let ctx = canvas.getContext('2d');
                document.body.appendChild(canvas);
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                let width = window.innerWidth;
                let height = window.innerHeight
                if (window.devicePixelRatio > 1) {
                    const ratio = window.devicePixelRatio
                    canvas.width = width * ratio
                    canvas.height = height * ratio

                    canvas.style.width = width + 'px'
                    canvas.style.height = height + 'px'
                    ctx.scale(ratio / 2, ratio / 2)
                } else {
                    canvas.width = width
                    canvas.height = height
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.removeEventListener('click', handleClick);
                canvas.addEventListener('click', handleClick);
            };
            img.src = request.message;
        }
        sendResponse({ status: "Image displayed" });
    }
});

function handleClick(e) {
    let canvas = document.getElementById('colorPickerCanvas');
    canvas.style.cursor = 'crosshair';
    if (!canvas) return;

    let ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.font = '32px Arial';
    let rect = canvas.getBoundingClientRect();

    const ratio = window.devicePixelRatio
    let x = e.clientX;
    let y = e.clientY;
    if (ratio>1) {
        x = e.clientX*2;
        y = e.clientY*2;
    }

    if (startPoint && endPoint) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка холста
        resetPoints();
    }

    if (!startPoint) {
        startPoint = {x, y};
    } else if (!endPoint) {
        endPoint = {x, y};
        drawLine(ctx, startPoint, endPoint);
        let length = calculateDistance(startPoint, endPoint);
        ctx.fillText(length.toFixed(2) + 'px', (startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2);
    }
}

function calculateDistance(point1, point2) {
    let a = point2.x - point1.x;
    let b = point2.y - point1.y;
    let data = null;
    if (window.devicePixelRatio>1) {
        data = Math.sqrt(a * a + b * b)/2;
    }else{
        data = Math.sqrt(a * a + b * b);
    }
    return data;
}

function drawLine(ctx, startPoint, endPoint) {
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
}


function cleanupEnvironment() {
    const existingCanvas = document.getElementById('colorPickerCanvas');
    document.documentElement.style.cursor = 'auto';
    if (existingCanvas) {
        existingCanvas.remove();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cleanupEnvironment(); // Вызов функции очистки
        resetPoints(); // Сброс точек
    }
});

function resetPoints() {
    startPoint = null; // Сброс начальной точки
    endPoint = null;   // Сброс конечной точки
}
