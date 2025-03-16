self.addEventListener("message", heard);

function heard(message){
    const pixelData = message.data.pixelData;

    const colourPalette = countPixels(pixelData);

    self.postMessage({
        "command": "done",
        colourPalette
    });
}

function countPixels (pixelsData) {
    const pixels32 = new Uint32Array(pixelsData.buffer);
    console.log("Num32", pixels32.length)
    console.log("Pix32", pixels32)
    const colours32 = new Uint32Array(256);
    var palettePos = colours32.length - 1;
    var colour = colours32[palettePos --] = pixels32[0];

    for (var i = 1; i < pixels32.length && palettePos >= 0; i += 1) {
        if(colour !== pixels32[i]){ 
            if (colours32.indexOf(pixels32[i], palettePos) === -1) { // is in the pallet
                colour = colours32[palettePos --] = pixels32[i]; // add it
            }
        }
    }

    const colourPalette = [];
    colours32.reverse();
    const paletteSize = (255 - palettePos) * 4;
    const colours8 = new Uint8Array(colours32.buffer);

    for(i = 0; i < paletteSize; i += 4){
        colourPalette.push(rgbToHex(colours8[i],colours8[i + 1],colours8[i + 2]));
    }

    return colourPalette;
}

const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

const rgbToHex = (r, g, b) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}