import  "./style.css";
import * as THREE from "three";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
import gsap from "gsap";

class Site{

    //constructor is used to store data for the animation of pictures
    constructor({dom}){
        this.time=0;
        this.container=dom;
        this.width=window.innerWidth;
        this.height=window.innerHeight;
        this.images=[...document.querySelectorAll(".images img")];
        this.material;
        this.imageStore=[];
        this.UstartIndex=0;
        this.UEndIndex=1;
    
    //The full view of picture is scene 
    this.scene = new THREE.Scene();

    //The point of view  to you see the picture  
    //This value always 70 to 75 + 100 is the near point to see the things +  2000 is the far point
    this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 100, 2000 );
    
    
    //to set the camera postion 200
    this.camera.position.z = 200;


    //This is used to calculate the actual element image size and set the proper image size
    this.camera.fov=2 * Math.atan(this.height / 2 / 200) * (180 / Math.PI);
    
    
    //this is printer to copy thee image on paper
    this.renderer = new THREE.WebGLRenderer({
        antialias:true,
        alpha:true,
    }   
    );


    //This line code is used to hd clear picture in printer
    this.renderer.setPixelRatio(window.devicePixelRatio);

   //This line code is used to set the printer height and width of image
    this.renderer.setSize( this.width, this.height );

    //Container is used to attach printer picture
    this.container.appendChild(this.renderer.domElement );

    //This is used to print image 
    this.renderer.render(this.scene,this.camera);


    this.addImages();
    this.resize();
    this.SetupResize();
    this.setPosition();
    this.hoverOverLinks();
    this.render();

    }

    //When window ups and downs it manages the size
    resize(){
        this.width=this.container.offsetWidth;
        this.height=this.container.offsetHeight;
        this.renderer.setSize(this.width,this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.setPosition();

    }

    //this is used to set actual place of your image
    setPosition(){
        this.imageStore.forEach((img) =>{
          const bounds= img.img.getBoundingClientRect();
          
          //this equation is used to set  the x axis and y axis of image
          img.mesh.position.y= -bounds.top + this.height/2 - bounds.height/2;
          img.mesh.position.x=bounds.left - this.width/2 + bounds.width/2;

        });
    }
    

    //this is used to  makeshore when the resize function is work it proper works
    SetupResize(){
        window.addEventListener("resize",this.resize.bind(this));
    }

    

    
    //add images
    addImages(){
        //This is used to the copy in paper of all images
        const textureLoader=new THREE.TextureLoader();
          
        //to load the texture of all images
        const textures=this.images.map((img) => textureLoader.load(img.src));

         //load the texture one by one image
        const uniforms={
            uTime:{value:0},
            uTimeline:{value:0.2},
            UstartIndex:{value:0},
            UEndIndex:{value:1},
            uImage1:{value:textures[0]},
            uImage2:{value:textures[1]},
            uImage3:{value:textures[2]},
            uImage4:{value:textures[3]},
        };

    




        //This is used to [imagine] print the thin copy image on paper
        this.material=new THREE.ShaderMaterial({
            uniforms:uniforms,
            vertexShader:vertex,
            fragmentShader:fragment,
            transparent:true,
        });


        //Get image information  on every image 
        //Image paste on mesh ..
        this.images.forEach(img => {
            //this is used to find location of image
            const bounds= img.getBoundingClientRect();

            //this is used to  make the geometry shape of your image exmaple cube square plan 
            const geometry=new THREE.PlaneGeometry(bounds.width,bounds.height);

            //mesh is print image on thin copy paper
            const mesh=new THREE.Mesh(geometry,this.material);


            //mesh add
            this.scene.add(mesh);

            //save information 
            this.imageStore.push({
                img:img,
                mesh:mesh,
                top:bounds.top,
                left:bounds.left,
                right:bounds.right,
                width:bounds.width,
                height:bounds.height,
            })
        })
 
    }


    hoverOverLinks(){
        const links=document.querySelectorAll(".links a");
        links.forEach((link,i)=>{

            link.addEventListener("mouseover",(e)=>{
                this.material.uniforms.uTimeline.value=0.0;
                gsap.to(this.material.uniforms.uTimeline,{
                    value:4.0,
                    duration:2,
                    onStart:()=>{
                        this.UEndIndex=i;
                        this.material.uniforms.UstartIndex.value=this.UstartIndex;
                        this.material.uniforms.UEndIndex.value=this.UEndIndex;
                        this.UstartIndex=this.UEndIndex;
                    },
                });
            });
        });
    }

    

    //this is used to infinite work
    render(){
        this.time+= 0.1;
        this.material.uniforms.uTime.value= this.time;
       
        this.renderer.render( this.scene, this.camera );
        window.requestAnimationFrame(this.render.bind(this));
    }
};
new Site({
    dom: document.querySelector(".canvas"),
});





