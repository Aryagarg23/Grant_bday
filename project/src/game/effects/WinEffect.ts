import * as THREE from 'three';

export class WinEffect {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private sphere?: THREE.Mesh;
  private ribbons: THREE.Mesh[] = [];
  private image?: THREE.Mesh;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isVisible: boolean = false;
  private clickHandler: ((event: MouseEvent) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.camera.position.z = 5;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.createSphere();
    this.createRibbons();
    this.createImage();
  }

  private createSphere() {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100,
      specular: 0x444444,
    });
    
    this.sphere = new THREE.Mesh(geometry, material);
    
    // Add lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    this.scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

  private createRibbons() {
    const ribbonCount = 20;
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];

    for (let i = 0; i < ribbonCount; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -10, 0),
        new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          10,
          (Math.random() - 0.5) * 20
        ),
      ]);

      const geometry = new THREE.TubeGeometry(curve, 20, 0.1, 8, false);
      const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        shininess: 100,
      });

      const ribbon = new THREE.Mesh(geometry, material);
      this.ribbons.push(ribbon);
    }
  }

  private createImage() {
    const geometry = new THREE.PlaneGeometry(8, 4.5); // 16:9 aspect ratio
    const texture = new THREE.TextureLoader().load(
      'https://images.unsplash.com/photo-1531956531700-dc0ee0f1f9a5?w=800&auto=format&fit=crop'
    );
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
    });
    
    this.image = new THREE.Mesh(geometry, material);
    this.image.visible = false;
  }

  private setupClickHandler() {
    this.clickHandler = (event: MouseEvent) => {
      event.preventDefault();

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      if (this.sphere) {
        const intersects = this.raycaster.intersectObject(this.sphere);

        if (intersects.length > 0) {
          this.showImage();
        }
      }
    };

    window.addEventListener('click', this.clickHandler);
  }

  private showImage() {
    if (this.sphere && this.image) {
      this.scene.remove(this.sphere);
      this.sphere = undefined;

      this.image.visible = true;
      this.scene.add(this.image);

      // Fade in the image
      const fadeIn = () => {
        if (this.image && (this.image.material as THREE.MeshBasicMaterial).opacity < 1) {
          (this.image.material as THREE.MeshBasicMaterial).opacity += 0.02;
          requestAnimationFrame(fadeIn);
        }
      };
      fadeIn();

      // Add ribbons with animation
      this.ribbons.forEach((ribbon, index) => {
        setTimeout(() => {
          this.scene.add(ribbon);
          ribbon.position.y = -10;
          
          const animate = () => {
            if (ribbon.position.y < 10) {
              ribbon.position.y += 0.1;
              ribbon.rotation.y += 0.02;
              requestAnimationFrame(animate);
            }
          };
          animate();
        }, index * 100);
      });

      // Remove click handler
      if (this.clickHandler) {
        window.removeEventListener('click', this.clickHandler);
        this.clickHandler = null;
      }
    }
  }

  public show() {
    if (this.sphere) {
      this.scene.add(this.sphere);
      this.isVisible = true;
      this.setupClickHandler();

      // Add text overlay
      const textOverlay = document.createElement('div');
      textOverlay.style.position = 'absolute';
      textOverlay.style.top = '20px';
      textOverlay.style.left = '0';
      textOverlay.style.width = '100%';
      textOverlay.style.textAlign = 'center';
      textOverlay.style.color = 'white';
      textOverlay.style.fontSize = '24px';
      textOverlay.style.fontFamily = 'Arial, sans-serif';
      textOverlay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
      textOverlay.innerHTML = 'Click the sphere for a surprise!';
      document.body.appendChild(textOverlay);

      // Hide the game canvas
      const gameCanvas = document.querySelector('canvas:not([data-engine="three.js"])');
      if (gameCanvas) {
        gameCanvas.style.display = 'none';
      }
    }
  }

  public hide() {
    if (this.sphere) {
      this.scene.remove(this.sphere);
    }
    if (this.image) {
      this.scene.remove(this.image);
      (this.image.material as THREE.MeshBasicMaterial).opacity = 0;
      this.image.visible = false;
    }
    this.ribbons.forEach(ribbon => {
      this.scene.remove(ribbon);
    });
    this.isVisible = false;

    // Show the game canvas
    const gameCanvas = document.querySelector('canvas:not([data-engine="three.js"])');
    if (gameCanvas) {
      gameCanvas.style.display = 'block';
    }

    // Remove text overlay
    const textOverlay = document.querySelector('div');
    if (textOverlay) {
      textOverlay.remove();
    }
  }

  public render() {
    if (!this.isVisible) return;

    if (this.sphere) {
      this.sphere.rotation.y += 0.01;
    }

    this.ribbons.forEach(ribbon => {
      ribbon.rotation.y += 0.02;
    });
    
    this.renderer.render(this.scene, this.camera);
  }

  public cleanup() {
    if (this.clickHandler) {
      window.removeEventListener('click', this.clickHandler);
    }
    this.scene.clear();
    this.renderer.dispose();
  }
}