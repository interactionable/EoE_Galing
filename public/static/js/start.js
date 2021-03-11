import runSketch from './sketch.js'
        
let settings = undefined;
let ID;
const socket = io();

function run(){
    const element = document.getElementById("buttonContainer");
    if (element){
        element.remove();
    }
    if (settings){
        runSketch(socket, 
            settings.development, 
            settings.minSound, 
            settings.maxSound,
            ID,
            settings.easing,
            settings.directions)
    } else {
        console.error("settings not found");
    }
}

function openFullscreen() {
    var elem = document.getElementById("root");
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
    }
    elem.style.width = '100%';
    elem.style.height = '100%';
    // elem.style.transform = "tanslateY(500px)"
    // console.log("fuck")
    run()
}

if (document.addEventListener) {
    document.addEventListener('fullscreenchange', exitHandler, false);
    document.addEventListener('mozfullscreenchange', exitHandler, false);
    document.addEventListener('MSFullscreenChange', exitHandler, false);
    document.addEventListener('webkitfullscreenchange', exitHandler, false);
}

function exitHandler() {
    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
        document.getElementById("root").remove();
        document.body.innerHTML += '<div style="margin: 10px"><h1 style="color: white"> app closed, please refresh </h1></div>';
    }
}
ID = window.location.pathname.replace("/", "");
socket.emit("hello", ID); 
socket.on("settings", (s) => {
    settings = s;
    if (s && s.development){
        run();
    }
})

const btn = document.getElementById("buttonfs")
btn.onclick = ()=>{
    openFullscreen();
}