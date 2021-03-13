
import * as THREE from './three.js-master/build/three.module.js';
// import * as PR from './particleRender.js'
import ParticleRenderer from './particleRender.js';
import { OBJLoader } from './OBJLoader.js';
import shaderLoader from './shaderLoader.js';
import getColorPair from './duneColors.js';

const runSketch = (socket, development, minSound, maxSound, ID, easing, directions) => {
    let [ge, se] = [undefined, undefined];
    
    class GraphicsEngine {
        constructor(ID) {
            this.ID = ID;
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.outerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            const threeJSCanvas = document.getElementById("root");
            // threeJSCanvas.style.transform("translateY(-50px)")
            // document.getElementById("root").style.transform = "rotate(33deg)";

            

            this.renderer.setSize(window.innerWidth, window.outerHeight);
            threeJSCanvas.appendChild(this.renderer.domElement);
            this.camera.position.z = 5;
            this.initSplash();
            this.neighbourLives = {
                left: 1,
                right: 1,
                above: 1,
                below: 1
            }

            this.direction = {
                x: 0,
                y: 0
            }

            this.colors = {
                neutral : "blue",
                active: "green",
                chaos: "grey",
                min: "red",
                max: "yellow",
                neighbours: "cyan",
                black: "black"
            }

            this.live = 0;
            this.chaos = false;

            this.pr = new ParticleRenderer();
            this.startTime = Date.now();
            this.dcolors = getColorPair();
        }

        /* -----------------------------
            INITIALIZE
        ----------------------------- */
        initialize(){
            this.removeEntity(this.splash);
            this.initializeLight();
            if (!development){
                this.initializeParticles();
            }
            this.initializeDev();
        }

        initializeDev(){
            this.addSphere(this.colors.neutral, "current", 1);
            this.addSphere(this.colors.min, "minimum", minSound);
            this.addSphere(this.colors.max, "maximum", maxSound);

            const neighbourSize = 0.05;
            const neighbourOffset = 2.5;

            this.addSphere(this.colors.black, directions.LEFT, neighbourSize, -neighbourOffset, 0);
            this.addSphere(this.colors.black, directions.RIGHT, neighbourSize, neighbourOffset, 0);
            this.addSphere(this.colors.black, directions.ABOVE, neighbourSize, 0, -neighbourOffset);
            this.addSphere(this.colors.black, directions.BELOW, neighbourSize, 0, +neighbourOffset);

        }

        initializeLight(){
            
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-1, 2, 4);
            this.scene.add(light);
              
        }

        initializeParticles(){
            // const material = new THREE.MeshPhongMaterial({
            //     map: this.pr.renderTarget.texture,
            //   });
            const parent = this;
            
            shaderLoader('../static/shaders/galing.vert', '../static/shaders/galing.frag', (vertexShader, fragmentShader)=>{
                const size = 5;
                const height = size* window.outerHeight / window.innerWidth;

                this.uniforms = {
                    time:           { type: "f", value: 0.0 },
                    tex:            { type: "sampler2D", value: this.pr.renderTarget.texture },
                    resolution:     { type:"v2", value: new THREE.Vector2(size, height) },
                    amountMin:      {type: "f", value: 0.076},
                    amountMax:      {type: "f", value: 0.561},
                    soft:           {type: "f", value: -0.26},
                    threshold:      {type: "f", value: 0.27},
                    transform:      {type: "f", value: 11.41},
                    scale:          {type: "f", value: 7.211},
                    offset:         {type: "f", value: 0.93},
                    col1:           {type: "v3", value: new THREE.Vector3(parent.dcolors[0].r, parent.dcolors[0].g, parent.dcolors[0].b) },
                    col2:           {type: "v3", value: new THREE.Vector3(parent.dcolors[1].r, parent.dcolors[1].g, parent.dcolors[1].b) },
                    reposition:     {type: "v2", value: new THREE.Vector2(0, 0)}
                    
                };
                const material = new THREE.ShaderMaterial({
                    uniforms: this.uniforms,
                    vertexShader,
                    fragmentShader
                });
                
                const planeGeometry = new THREE.PlaneGeometry( size, height );
                const plane = new THREE.Mesh(planeGeometry, material);
                const pos = plane.position;
                pos.y = -2;
                this.scene.add(plane);
            }, 
            // progress
            ()=>{}, 
            // error
            (e)=>{console.log(e)})
        }

        initSplash(){
            const texture = new THREE.TextureLoader().load( '../static/media/introscreen.jpg' );
            const size = 12;
            const geometry = new THREE.PlaneGeometry( size , (size* window.outerHeight / window.innerWidth) );
            const material = new THREE.MeshBasicMaterial( { map: texture } );
            this.splash = new THREE.Mesh( geometry, material );
            this.splash.name = "splash";
            this.scene.add( this.splash);
        }

        /* -----------------------------
            ADD
        ----------------------------- */
        // addRotifer(material){
        //     const parent = this;
        //     const loader = new OBJLoader();
        //     loader.load(
        //         // resource URL
        //         './static/models/rotifer.obj',
        //         // called when resource is loaded
        //         function ( object ) {
        //             object = object.children[0]
        //             let geometry = object.geometry;

        //             const wireframe = new THREE.WireframeGeometry( geometry );
        //             material = new THREE.LineBasicMaterial( { color: "white", linewidth: 1} );
        //             parent.rotifer = new THREE.LineSegments( wireframe, material ); 
        //             material.depthTest = false;
                
        //             parent.rotifer.rotateX(Math.PI/2);
        //             parent.scene.add(parent.rotifer)
            
        //         },
        //         ( xhr )=>{},( e )=>{console.log(e)}
        //     );
        // }

        addSphere (color, name, initscale, x, y){
            const geometry = new THREE.SphereGeometry(10,10,10);
            const wireframe = new THREE.WireframeGeometry( geometry );
            const material = new THREE.LineBasicMaterial( { color, linewidth: 1} );
            this[name] = new THREE.LineSegments( wireframe, material );
            this[name].name = name;
            const position = this[name].position;
            position.x = x || 0;
            position.y = y || 0;
            const scale = this[name].scale;
            scale.x = scale.y = scale.z = initscale;
            this.scene.add( this[name]);
            return this[name];
        }

        /* -----------------------------
            REMOVE
        ----------------------------- */
        removeEntity(object) {
            const selectedObject = this.scene.getObjectByName(object.name);
            this.scene.remove( selectedObject );
            this.splash = undefined;
        }
        
        /* -----------------------------
            SOUND
        ----------------------------- */
        updateSound(value) {
            
            if (this.splash){
                this.initialize();
            }
            this.changeScale("current", value);
            let c = this.colors.active;
            if (value < this.getValue("minimum")){
                c = this.colors.neutral;
                this.live -= 1;
            } else if (value > this.getValue("maximum")){
                c = this.colors.chaos;
                this.chaos = true;
                this.live = 0;
            } else {
                // send message that we are active
                this.live += 3;
                socket.emit("activate", ID);
            }

            if (this.current){
                this.current.material.color = new THREE.Color(c);
            }

            
            const surroundChecker = (name)=>{
                if (this.neighbourLives[name] > 0){
                    if (this[name]){
                        this[name].material.color = new THREE.Color(this.colors.neighbours);
                    }
                    this.neighbourLives[name]--;



                } else {
                    if (this[name]){
                        this[name].material.color = new THREE.Color(this.colors.black);
                    }
                }

            }
            surroundChecker(directions.LEFT);
            surroundChecker(directions.RIGHT);
            surroundChecker(directions.ABOVE);
            surroundChecker(directions.BELOW);            
        }

        
        setMinSound(newvalue){
            this.changeScale("minimum", newvalue);
        }

        setMaxSound(newvalue){
            this.changeScale("maximum", newvalue);
        }

        /* -----------------------------
            HELPER FUNCTIONS
        ----------------------------- */
        changeScale(name, value){
            if (this[name]){
                let c = this[name].scale;
                c.x = value;
                c.y = value;
                c.z = value;
            }
        }

        getValue(name){
            if (this[name]){
                return this[name].scale.x;
            } else {
                return 0;
            }
        }

        getElapsedTimeMS(){
            return Date.now()-this.startTime;
        }

        /* -----------------------------
            RENDER / UPDATE
        ----------------------------- */
        render() {

            if (this.live > 100){
                this.live = 100;
            } else if (this.live < 0){
                this.live = 0;
            }

            // draw render target scene to render target
            this.renderer.setRenderTarget(this.pr.renderTarget);
            this.renderer.render(this.pr.scene, this.pr.camera);
            this.renderer.setRenderTarget(null);

            this.renderer.render(this.scene, this.camera);

            // slow down
            setTimeout( ()=>{

                window.requestAnimationFrame(() => this.render());
        
            }, 1000 / 21 );

            // window.requestAnimationFrame(() => this.render());

            if (this.pr){
                this.pr.update(this.chaos, this.live>0);
                this.chaos = false;
            }

            // this.uniforms.time.value = 60. * this.getElapsedTimeMS()/1000;
            if (this.uniforms){
                // this.uniforms.reposition.value.setX(Math.random())

                if (this.neighbourLives){

                    let valx = this.neighbourLives[directions.LEFT]*-1 + this.neighbourLives[directions.RIGHT];
                    let valy = this.neighbourLives[directions.ABOVE]*-1 + this.neighbourLives[directions.BELOW];

                    
                    let dx = valx - this.direction.x;
                    this.direction.x += dx * 0.05;

                    
                    let dy = valy - this.direction.y;
                    this.direction.y += dy * 0.05;

                    // disable surrounds
                    // this.uniforms.reposition.value.setX(this.direction.x / 100.0)
                    // this.uniforms.reposition.value.setY(this.direction.y / 100.0)

                }
                
                this.uniforms.transform.value+=0.001;
                
                // this.uniforms.time.value = 60. * this.getElapsedTimeMS()/1000.;
            }

        };
    }

    const s = (p) => {
        let mic;
        p.easing = easing;
        p.vol = 0;
        p.setup = () => {
            p.noCanvas();
            mic = new p5.AudioIn();    
            mic.start();
        };

        p.draw = () => {
            // p.vol = mic.getLevel();
            if (mic.getLevel()){
                const d = mic.getLevel() - p.vol;
                p.vol += d*p.easing;
                if(ge){
                    ge.updateSound(p.vol);
                }
            } 
        };

        p.touchStarted = ()=>{
            p.getAudioContext().resume();
        }
    };

    const CreateGui = (graphicsEngine, soundEngine)=>{
        const gui = new dat.GUI();
        const settings = {
            mins: minSound,
            maxs: maxSound,
            easing
        }
    
        gui.add(settings, "mins").min(0.0001).max(1).onChange((newValue)=>{
           graphicsEngine.setMinSound(newValue);
           socket.emit("updateMinSound", newValue);
        });
        gui.add(settings, "maxs").min(0.0001).max(1).onChange((newValue)=>{
            graphicsEngine.setMaxSound(newValue);
            socket.emit("updateMaxSound", newValue);
        });
        gui.add(settings, "easing").min(0.0001).max(0.5).onChange((newValue)=>{
            soundEngine.easing = newValue;
            socket.emit("updateEasing", newValue);
        });
        return gui;
    }

    ge = new GraphicsEngine(ID);
    ge.render();
    se = new p5(s);
    const gui = CreateGui(ge, se);

    socket.on("surround", (direction)=>{
        // console.log("I am hearing sound! " + direction);
        // disable surround
        // ge.neighbourLives[direction] += 1.5;
    })
    // startTest()

    if (development) {
        console.log("Running in dev modus, graphics engine created succesfully")
    }
}

export default runSketch;