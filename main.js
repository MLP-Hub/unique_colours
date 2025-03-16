const worker = new Worker('./counter.js');

document.getElementById("img_loader").addEventListener('change', async (e) => {
    this.loadImage(e.target.files);
}, false);

loadImage = (files) => {
    const url = window.URL.createObjectURL(files[0]);
    const img = new Image();
    img.src = url;
    
    img.onload = async () => {
        this.reset();
        const canvas = document.getElementById('image_canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const context = canvas.getContext('2d');  
        context.drawImage(img, 0, 0);  
        const [file] = files;
        const arrayBuffer = await file.arrayBuffer();
        
        decoded = UPNG.decode(arrayBuffer)
        //pixels = decoded.data;
        var pixels_buff = UPNG.toRGBA8(decoded)[0]; 
        pixels = new Int8Array(pixels_buff);
        console.log("Num Pix", pixels.length)
        console.log("Pix", pixels)


        if(pixels.length%4 != 0){
            pixels = pixels.slice(0,-(pixels.length%4));
        }

        window.URL.revokeObjectURL(this.src);
        worker.addEventListener("message", handleWorkerCompletion, false);

        worker.postMessage({
            "pixelData": pixels
        });
    }
}

handleWorkerCompletion = (message) => {
    if(message.data.command == "done") {
        // draw color swatches
        this.drawColours(message.data.colourPalette);
        worker.removeEventListener("message", handleWorkerCompletion);
                
        // hide wait indicator
        // const waitIndicator = document.getElementById("wait-indicator");
        // waitIndicator.classList.add("invisible");
        // waitIndicator.classList.remove("fadein");

        // scroll to color swatch section
        const colourContainer = document.getElementById('colour-count-container'); 
        colourContainer.scrollIntoView({ behavior: 'smooth'});

        const colourCountLabel = document.getElementById('colour-count');
        colourCountLabel.innerText = Object.keys(message.data.colourPalette).length;
    }
}

drawColours = (colourPalette) => {
    let container = document.getElementById("colours-container");

    for(const colour in colourPalette) {
        
        const sect = document.createElement("section");
        sect.classList.add("colour-name-container");

        const colourLabel = document.createElement("span");
        colourLabel.innerHTML = `Hex ${colourPalette[colour]}`;
        colourLabel.style.backgroundColor = colourPalette[colour];
        colourLabel.style.color = invertColor(colourPalette[colour], true);
        sect.appendChild(colourLabel);
        container.appendChild(sect);
    }

    let colourContainer = document.getElementById('colour-count-container');
    colourContainer.classList.remove('invisible');

}

reset = () => {
    let colourContainer = document.getElementById('colour-count-container');
    colourContainer.classList.remove('invisible');

    let container = document.getElementById("colours-container");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const canvas = document.getElementById('image_canvas');
    const context = canvas.getContext('2d');  
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}