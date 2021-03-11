import * as THREE from './three.js-master/build/three.module.js';

class ParticleRenderer {
    constructor(){
          noise.seed(Math.random());
          this.resolution = 30;
          this.particles = new Array(20);
          this.offset = 2;
          this.variance = 5;
          this.colorOffset = 2;
          this.currentZPosition = Math.floor(Math.random()*1234);
          
          this.scene = new THREE.Scene();
          this.scene.background = new THREE.Color('black');
          this.material = new THREE.MeshPhongMaterial({color: "white"});
          this.geometry = new THREE.CircleGeometry(0.02, 5);
          this.zspeed = 0.0002;

          // render target  
            const width = 512;
            const height = 512;
            this.renderTarget = new THREE.WebGLRenderTarget(width, height);
          

          // add camera
          {
              const rtFov = 75;
              const rtAspect = width / height;
              const rtNear = 0.1;
              const rtFar = 5;
              this.camera = new THREE.PerspectiveCamera(rtFov, rtAspect, rtNear, rtFar);
              this.camera.position.z = 2;
          }

          // add light
          {
              const color = 0xFFFFFF;
              const intensity = 1;
              const light = new THREE.DirectionalLight(color, intensity);
              light.position.set(-1, 2, 4);
              this.scene.add(light);
          }

          // initialize particles
          for(let i = 0; i < this.resolution; i++){
              const pa = new Array(this.resolution);
              for (let p =0; p < this.resolution; p++){
                  pa[p] = this.createParticle(i/this.resolution, p/this.resolution);
              }
              this.particles[i] = pa;
          }

    }


      getPosV(x, y){
          return noise.perlin3(x, y, this.currentZPosition);
      }

      setPos(position, x, y){
        position.x = this.getPosV(x*this.variance + this.colorOffset, y*this.variance + this.colorOffset)*this.offset;
        position.y = this.getPosV(x*this.variance, y*this.variance)*this.offset;
      }

      createParticle(x, y){ //normalizedXY
            const sphere = new THREE.Mesh(this.geometry, this.material);
            this.scene.add(sphere);
            this.setPos(sphere.position, x, y);
          return sphere;
      }

      update(chaos, alive){
          if (chaos){
            this.currentZPosition+=this.zspeed*1000;
          } else if (alive){
            this.currentZPosition+=this.zspeed;
          } else {
            this.currentZPosition+=this.zspeed/100;
          }
          
          for (let x = 0; x < this.resolution; x++){
              for (let y = 0; y < this.resolution; y++){
                  const pos = this.particles[x][y].position;  
                  this.setPos(pos, x/this.resolution, y/this.resolution);
              }
          }
       
      }
}


// function main() {
//     const canvas = document.querySelector('#c');
//     const renderer = new THREE.WebGLRenderer({canvas});

//     const pr = new ParticleRenderer();

//     const fov = 75;
//     const aspect = 2;  // the canvas default
//     const near = 0.1;
//     const far = 5;
//     const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//     camera.position.z = 2;
  
//     const scene = new THREE.Scene();
  
//     {
//       const color = 0xFFFFFF;
//       const intensity = 1;
//       const light = new THREE.DirectionalLight(color, intensity);
//       light.position.set(-1, 2, 4);
//       scene.add(light);
//     }
  
//     const material = new THREE.MeshPhongMaterial({
//       map: pr.renderTarget.texture,
//     });

//     const planeGeometry = new THREE.PlaneGeometry( 2, 2 );

//     const plane = new THREE.Mesh(planeGeometry, material);
//     scene.add(plane);
  
    
  
//     function render(time) {
//       time *= 0.001;

  
//       // draw render target scene to render target
//       renderer.setRenderTarget(pr.renderTarget);
//       renderer.render(pr.scene, pr.camera);
//       renderer.setRenderTarget(null);
  
      
  
//       // render the scene to the canvas
//       renderer.render(scene, camera);
  
//       requestAnimationFrame(render);
//     }
  
//     requestAnimationFrame(render);
//   }
  
//   main();

export default ParticleRenderer;


  