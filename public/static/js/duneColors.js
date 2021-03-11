const colors = [
    "#816EAF",
    "#50B04F",
    "#B297AA",
    "#E94B4A",
    "#F1C264",
    "#E7A6B1",
    "#F4DEAD",
    "#DC6678",
    "#67667B",
    "#FFD531",
]

const colorsDark = [
    "#24161D",
    "#881721",
    "#312B71",
    "#7D206A",
    "#CF5C20",

]

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16)/255,
      g: parseInt(result[2], 16)/255,
      b: parseInt(result[3], 16)/255
    } : null;
  }

const getColorPair = ()=>{
    let idx1, idx2;

    const getRIDX = (colors)=>Math.floor(colors.length*Math.random());

    idx1 = getRIDX(colors);
    idx2 = getRIDX(colorsDark);
    
    return [hexToRgb(colors[idx1]), hexToRgb(colorsDark[idx2]), colors[idx1]];
}

export default getColorPair;