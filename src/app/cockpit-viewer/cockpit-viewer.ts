import { Component, ElementRef, OnInit, ViewChild, OnDestroy, ApplicationRef, createComponent, EnvironmentInjector, Type } from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import html2canvas from 'html2canvas';
import { LogScreen } from '../screens/log-screen/log-screen';
import { MainScreen } from '../screens/main-screen/main-screen';
import { ShipModuleScreen } from '../screens/ship-module-screen/ship-module-screen';

@Component({
    selector: 'app-cockpit-viewer',
    standalone: true,
    imports: [],
    templateUrl: './cockpit-viewer.html',
    styleUrl: './cockpit-viewer.scss',
})

export class CockpitViewerComponent implements OnInit, OnDestroy {
    @ViewChild('canvas', { static: true })
    private canvasRef! : ElementRef<HTMLCanvasElement>;

    private renderer! : THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private controls!: OrbitControls;
    private animationId?: number;
    private debugInterval?: number;
    private videos: HTMLVideoElement[] = [];
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private hoveredScreen: THREE.Mesh | null = null;
    private screenMeshes: THREE.Mesh[] = [];
    private originalCameraPosition: THREE.Vector3 = new THREE.Vector3();
    private originalCameraRotation: THREE.Euler = new THREE.Euler();
    private originalControlsTarget: THREE.Vector3 = new THREE.Vector3();
    private isAnimatingCamera: boolean = false;
    private targetCameraPosition: THREE.Vector3 = new THREE.Vector3();
    private targetControlsTarget: THREE.Vector3 = new THREE.Vector3();
    private screenCanvases: Map<string, HTMLCanvasElement> = new Map();
    private screenTextures: Map<string, THREE.CanvasTexture> = new Map();
    private screenRoutes: Map<string, string> = new Map([
        ['Plane_1', '/ship-modules'],
        ['Plane_2', '/logs'],
        ['Plane_3', '/main']
    ]);
    private liRoutes: Record<string, string> = {
        home: '/home',
        projects: '/projects',
        skills: '/skills',
        about: '/about',
        contact: '/contact'
    };
    private interactivePlanes: THREE.Mesh[] = [];
    private hoveredPlane: THREE.Mesh | null = null;
    private hoverTextures: Map<number, THREE.CanvasTexture> = new Map(); // Cache de texturas pre-renderizadas
    private isPreRenderingTextures: boolean = false;

    constructor(
        private appRef: ApplicationRef,
        private injector: EnvironmentInjector,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initScene();
        this.loadModel();
        this.animate();
        this.setupMouseEvents();
        // this.startCameraDebug(); // Desactivado temporalmente
    }

    ngOnDestroy(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.debugInterval) {
            clearInterval(this.debugInterval);
        }
        // Limpiar videos
        this.videos.forEach(video => {
            video.pause();
            video.src = '';
        });
        this.renderer.dispose();
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
        window.removeEventListener('click', this.onMouseClick.bind(this));
    }

    private initScene(): void {
        // Crear la escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // Crear cámara por defecto (será reemplazada por la cámara del modelo)
        const canvas = this.canvasRef.nativeElement;
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );

        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = false; // Desactivar sombras

        // Luz ambiental suave para que los modelos sean visibles sin reflejos direccionales
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);

        // Controles de órbita
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Posicionar cámara por defecto
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);


        // Manejar resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    private loadModel(): void {
        const loader = new GLTFLoader();

        // Reemplaza con la ruta a tu modelo
        loader.load(
            '/assets/cockpit.glb',
            (gltf: any) => {
                console.log('Modelo cargado:', gltf);

                // Agregar el modelo a la escena
                this.scene.add(gltf.scene);

                // Listar todas las cámaras disponibles primero
                this.listAllCameras(gltf.scene);

                // Listar todos los objetos para encontrar la esfera
                this.listAllObjects(gltf.scene);

                // Convertir texturas de imagen a video textures
                this.setupVideoTextures(gltf.scene);

                // Agregar luz puntual muy suave en el cockpit con tonos cálidos (naranja/dorado)
                const cockpitLight = new THREE.PointLight(0xffb366, 0.5, 8); // Color cálido (naranja-dorado), intensidad aumentada a 0.5, distancia 8
                cockpitLight.position.set(0, 1.5, -11); // Posición cerca del cockpit
                this.scene.add(cockpitLight);
                console.log('💡 Luz cálida agregada en el cockpit');

                // BUSCAR Y USAR LA CÁMARA ESPECÍFICA DEL MODELO
                const sceneCamera = this.findCameraByName(gltf.scene, 'Camera'); // Cambia 'Camera' por el nombre de tu cámara

                if (sceneCamera) {
                    console.log('✅ Usando cámara del modelo:', sceneCamera.name);
                    this.camera = sceneCamera as THREE.PerspectiveCamera;

                    // Actualizar aspect ratio
                    this.camera.aspect = this.canvasRef.nativeElement.clientWidth /
                        this.canvasRef.nativeElement.clientHeight;
                    this.camera.updateProjectionMatrix();

                    // Actualizar controles con la nueva cámara
                    this.controls.object = this.camera;

                    // Configurar posición y rotación deseada
                    this.camera.position.set(0.010, 1.178, -12.362);
                    this.camera.rotation.set(-3.047, 0.001, 3.142);
                    this.controls.target.set(0, 0, 0);

                    // PRIMERO actualizar los controles para aplicar la posición
                    this.controls.update();

                    // Guardar posición original de la cámara
                    this.originalCameraPosition.copy(this.camera.position);
                    this.originalCameraRotation.copy(this.camera.rotation);
                    this.originalControlsTarget.copy(this.controls.target);

                    // DESPUÉS aplicar restricciones sin mover la cámara
                    this.applyControlRestrictions();

                    console.log('📹 Posición inicial de la cámara configurada:');
                    console.log('   Position:', this.camera.position);
                    console.log('   Rotation:', this.camera.rotation);
                    console.log('   FOV:', this.camera.fov);
                } else {
                    console.warn('⚠️ No se encontró la cámara "Camera" en el modelo');
                    console.warn('📹 Usando cámara por defecto con tu posición personalizada');
                    // Posicionar cámara por defecto en la posición deseada
                    this.camera.position.set(0.010, 1.178, -12.362);
                    this.camera.rotation.set(-3.047, 0.001, 3.142);
                    this.controls.target.set(0, 0, 0);

                    // PRIMERO actualizar los controles
                    this.controls.update();

                    // Guardar posición original de la cámara
                    this.originalCameraPosition.copy(this.camera.position);
                    this.originalCameraRotation.copy(this.camera.rotation);
                    this.originalControlsTarget.copy(this.controls.target);

                    // DESPUÉS aplicar restricciones
                    this.applyControlRestrictions();
                }

                // Buscar y almacenar las pantallas (Plane1, Plane2, Plane3)
                this.findScreens(gltf.scene);


                // Configurar contenido de las pantallas
                this.setupScreenContent();

            },
            (progress: any) => {
                const percent = (progress.loaded / progress.total) * 100;
                console.log(`Cargando: ${percent.toFixed(2)}%`);
            },
            (error: any) => {
                console.error('Error al cargar el modelo:', error);
                console.warn('Por favor, coloca tu archivo cockpit.glb en la carpeta portfolio/src/assets/');
                console.warn('La escena continuará con los objetos de prueba.');
            }
        );
    }

    private setupScreenContent(): void {
        console.log('🖥️ CONFIGURANDO CONTENIDO DE PANTALLAS...');

        this.screenMeshes.forEach((mesh) => {
            // Definir componente según el nombre de la pantalla
            let component: Type<any> | null = null;
            switch (mesh.name) {
                case 'Plane_1':
                    component = ShipModuleScreen;
                    break;
                case 'Plane_2':
                    // Usar imagen en lugar de componente
                    this.loadImageToScreen(mesh, 'assets/cockpit_modules.jpg');
                    break;
                case 'Plane_3':
                    component = MainScreen;
                    break;
                default:
                    console.warn(`No se encontró componente para: ${mesh.name}`);
            }

            if (component) {
                // Crear canvas y textura para esta pantalla usando el componente Angular
                this.createScreenTextureFromComponent(mesh, component);

                // Si es la pantalla principal, crear planos interactivos para los LI
                if (mesh.name === 'Plane_3') {
                    setTimeout(() => {
                        this.createInteractivePlanesForMainScreen(mesh);
                        // Pre-renderizar texturas de hover para respuesta instantánea
                        this.preRenderHoverTextures();
                    }, 1000); // Esperar a que se renderice
                }
            }
        });

        console.log('✅ Contenido de pantallas configurado');
    }

    private getProjectsContent(): string {
        return `
      <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 40px; font-family: 'Segoe UI', Arial, sans-serif; height: 100%; box-sizing: border-box;">
        <h1 style="margin: 0 0 30px 0; font-size: 48px; font-weight: 600; border-bottom: 3px solid #4a90e2; padding-bottom: 15px;">
          📂 Proyectos
        </h1>

        <div style="display: flex; flex-direction: column; gap: 25px;">
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; border-left: 4px solid #4a90e2;">
            <h2 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 500;">E-Commerce Platform</h2>
            <p style="margin: 0 0 12px 0; font-size: 20px; opacity: 0.9;">Sistema completo de comercio electrónico</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <span style="background: #4a90e2; padding: 6px 14px; border-radius: 20px; font-size: 16px;">Angular</span>
              <span style="background: #4a90e2; padding: 6px 14px; border-radius: 20px; font-size: 16px;">Node.js</span>
              <span style="background: #4a90e2; padding: 6px 14px; border-radius: 20px; font-size: 16px;">MongoDB</span>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; border-left: 4px solid #4a90e2;">
            <h2 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 500;">Dashboard Analytics</h2>
            <p style="margin: 0 0 12px 0; font-size: 20px; opacity: 0.9;">Panel de visualización de datos en tiempo real</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <span style="background: #4a90e2; padding: 6px 14px; border-radius: 20px; font-size: 16px;">React</span>
              <span style="background: #4a90e2; padding: 6px 14px; border-radius: 20px; font-size: 16px;">D3.js</span>
              <span style="background: #4a90e2; padding: 6px 14px; border-radius: 20px; font-size: 16px;">TypeScript</span>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; border-left: 4px solid #4a90e2;">
            <h2 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 500;">Mobile App</h2>
            <p style="margin: 0 0 12px 0; font-size: 20px; opacity: 0.9;">Aplicación móvil multiplataforma</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <span style="background: #4a90e2; padding: 6px 14px; border-radius: 20px; font-size: 16px;">Flutter</span>
              <span style="background: #4a90e2; padding: 6px 14px; border-radius: 20px; font-size: 16px;">Firebase</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    private getAboutContent(): string {
        return `
      <div style="background: linear-gradient(135deg, #134e5e 0%, #71b280 100%); color: white; padding: 40px; font-family: 'Segoe UI', Arial, sans-serif; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
        <div style="text-align: center;">
          <div style="width: 120px; height: 120px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; font-size: 60px;">
            👨‍💻
          </div>

          <h1 style="margin: 0 0 15px 0; font-size: 56px; font-weight: 600;">
            Matías Developer
          </h1>

          <h2 style="margin: 0 0 25px 0; font-size: 32px; font-weight: 400; opacity: 0.9;">
            Full Stack Developer
          </h2>

          <p style="font-size: 24px; line-height: 1.6; opacity: 0.95; max-width: 600px; margin: 0 auto;">
            Desarrollador apasionado por crear experiencias web innovadoras y funcionales.
            Especializado en tecnologías modernas y arquitecturas escalables.
          </p>

          <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center; font-size: 22px;">
            <span style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px;">
              🎯 3+ años experiencia
            </span>
            <span style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px;">
              🚀 15+ proyectos
            </span>
          </div>
        </div>
      </div>
    `;
    }

    private getSkillsContent(): string {
        return `
      <div style="background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 40px; font-family: 'Segoe UI', Arial, sans-serif; height: 100%; box-sizing: border-box;">
        <h1 style="margin: 0 0 30px 0; font-size: 48px; font-weight: 600; border-bottom: 3px solid #3498db; padding-bottom: 15px;">
          🛠️ Skills & Contacto
        </h1>

        <div style="margin-bottom: 35px;">
          <h2 style="margin: 0 0 20px 0; font-size: 36px; font-weight: 500;">Frontend</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">Angular</div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">React</div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">Vue.js</div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">TypeScript</div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">Three.js</div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">CSS3</div>
          </div>
        </div>

        <div style="margin-bottom: 35px;">
          <h2 style="margin: 0 0 20px 0; font-size: 36px; font-weight: 500;">Backend</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">Node.js</div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">Python</div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; text-align: center; font-size: 20px;">MongoDB</div>
          </div>
        </div>

        <div>
          <h2 style="margin: 0 0 20px 0; font-size: 36px; font-weight: 500;">📬 Contacto</h2>
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 22px;">
            <div style="background: rgba(255,255,255,0.15); padding: 15px 20px; border-radius: 10px;">
              📧 matias@developer.com
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 20px; border-radius: 10px;">
              💼 linkedin.com/in/matias
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 15px 20px; border-radius: 10px;">
              🐙 github.com/matias
            </div>
          </div>
        </div>
      </div>
    `;
    }

    private getDefaultContent(screenName: string): string {
        return `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; font-family: Arial, sans-serif; height: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
        <h1 style="font-size: 48px;">${screenName}</h1>
      </div>
    `;
    }

    private createScreenTexture(mesh: THREE.Mesh, htmlContent: string): void {
        console.log(`   🎨 Creando textura para: "${mesh.name}"`);
        console.log(`   📝 Nombre exacto del mesh:`, mesh.name);
        console.log(`   📝 Tipo de dato:`, typeof mesh.name);
        console.log(`   📝 Longitud del nombre:`, mesh.name?.length);

        // Verificar geometría y UVs
        if (mesh.geometry) {
            const hasUVs = mesh.geometry.attributes['uv'] !== undefined;
            console.log(`   📐 Geometría tiene UVs:`, hasUVs);
            if (!hasUVs) {
                console.warn(`   ⚠️ La geometría de "${mesh.name}" NO tiene UVs - generando UVs automáticamente...`);

                // Generar UVs planos automáticamente
                this.generatePlaneUVs(mesh.geometry);

                console.log(`   ✅ UVs generados para "${mesh.name}"`);
            }
        }

        // Crear canvas offscreen
        const canvas = document.createElement('canvas');
        canvas.width = 2048;  // Mayor resolución para mejor calidad
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('   ❌ No se pudo obtener contexto 2D');
            return;
        }

        console.log(`   📝 Material actual:`, mesh.material);

        // Renderizar contenido en el canvas ANTES de crear la textura
        this.renderHTMLToCanvas(canvas, ctx, htmlContent, mesh.name);

        console.log(`   🎨 Canvas renderizado, verificando contenido...`);

        // Verificar que el canvas tenga contenido
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const hasContent = imageData.data.some(value => value !== 0);
        console.log(`   🔍 Canvas tiene contenido visible:`, hasContent);

        // Crear textura del canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        texture.flipY = true; // Invertir verticalmente
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        // Rotar la textura -90 grados para corregir orientación
        texture.rotation = -Math.PI / 2;
        texture.center.set(0.5, 0.5); // Centro de rotación

        console.log(`   ✅ Textura de canvas creada`);

        // REEMPLAZAR COMPLETAMENTE el material con uno nuevo
        const newMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide, // Visible desde ambos lados
            transparent: false,
            opacity: 1
        });

        // Dispose del material anterior si existe
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat: any) => mat.dispose());
            } else {
                mesh.material.dispose();
            }
        }

        // Asignar nuevo material
        mesh.material = newMaterial;
        mesh.material.needsUpdate = true;

        // Forzar visibilidad y renderizado
        mesh.visible = true;
        mesh.frustumCulled = false; // Evitar que se oculte por culling
        mesh.renderOrder = 999; // Renderizar al final

        console.log(`   ✅ Material reemplazado con textura de canvas`);
        console.log(`   📊 Canvas size: ${canvas.width}x${canvas.height}`);
        console.log(`   🎨 Material final:`, mesh.material);
        console.log(`   🖼️ Textura aplicada:`, (mesh.material as THREE.MeshBasicMaterial).map);
        console.log(`   👁️ Mesh visible:`, mesh.visible);
        console.log(`   📐 Mesh position:`, mesh.position);
        console.log(`   📐 World position:`, mesh.getWorldPosition(new THREE.Vector3()));

        // Guardar referencias
        this.screenCanvases.set(mesh.name, canvas);
        this.screenTextures.set(mesh.name, texture);

        console.log(`   ✅ Textura creada y aplicada correctamente a ${mesh.name}`);
    }

    private createScreenTextureFromComponent(mesh: THREE.Mesh, component: Type<any>): void {
        console.log(`   🎨 Creando textura desde componente para: "${mesh.name}"`);

        // Verificar geometría y UVs
        if (mesh.geometry) {
            const hasUVs = mesh.geometry.attributes['uv'] !== undefined;
            console.log(`   📐 Geometría tiene UVs:`, hasUVs);
            if (!hasUVs) {
                console.warn(`   ⚠️ La geometría de "${mesh.name}" NO tiene UVs - generando UVs automáticamente...`);
                this.generatePlaneUVs(mesh.geometry);
                console.log(`   ✅ UVs generados para "${mesh.name}"`);
            }
        }

        // Crear un contenedor temporal en el DOM para renderizar el componente
        const hostElement = document.createElement('div');
        hostElement.style.position = 'fixed';
        hostElement.style.top = '0';
        hostElement.style.left = '0';
        hostElement.style.width = '2048px';
        hostElement.style.height = '2048px';
        hostElement.style.overflow = 'hidden';
        hostElement.style.zIndex = '-1000';
        hostElement.style.pointerEvents = 'none';
        document.body.appendChild(hostElement);

        // Crear el componente dinámicamente
        const componentRef = createComponent(component, {
            environmentInjector: this.injector,
            hostElement: hostElement
        });

        // Adjuntar al ApplicationRef para que Angular lo detecte
        this.appRef.attachView(componentRef.hostView);

        // Forzar detección de cambios
        componentRef.changeDetectorRef.detectChanges();

        // Esperar a que el DOM se actualice y los estilos se apliquen
        setTimeout(() => {
            // Crear canvas
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 2048;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            if (!ctx) {
                console.error('   ❌ No se pudo obtener contexto 2D');
                this.cleanup(componentRef, hostElement);
                return;
            }

            // Renderizar el componente a canvas usando html2canvas
            this.renderDOMToCanvasSimple(hostElement, canvas, ctx).then(() => {
                // Crear textura del canvas
                const texture = new THREE.CanvasTexture(canvas);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.needsUpdate = true;
                texture.flipY = true;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.rotation = -Math.PI / 2;
                texture.center.set(0.5, 0.5);

                // Crear y aplicar material
                const newMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: false,
                    opacity: 1
                });

                // Dispose del material anterior si existe
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(mat => mat.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }

                // Asignar nuevo material
                mesh.material = newMaterial;
                mesh.material.needsUpdate = true;
                mesh.visible = true;
                mesh.frustumCulled = false;
                mesh.renderOrder = 999;

                // Guardar referencias
                this.screenCanvases.set(mesh.name, canvas);
                this.screenTextures.set(mesh.name, texture);

                console.log(`   ✅ Textura creada y aplicada desde componente a ${mesh.name}`);

                // Limpiar DESPUÉS de un pequeño delay para asegurar que la textura se aplicó
                setTimeout(() => {
                    this.cleanup(componentRef, hostElement);
                }, 100);
            }).catch(error => {
                console.error('   ❌ Error al renderizar componente a canvas:', error);
                this.cleanup(componentRef, hostElement);
            });
        }, 500);
    }

    private loadImageToScreen(mesh: THREE.Mesh, imagePath: string): void {
        console.log(`   🖼️ Cargando imagen para pantalla: ${mesh.name} desde ${imagePath}`);

        const textureLoader = new THREE.TextureLoader();

        textureLoader.load(
            imagePath,
            (texture: THREE.Texture) => {
                // Configurar la textura
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.flipY = true;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;

                // Crear material con la textura
                const newMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    transparent: false,
                    opacity: 1
                });

                // Dispose del material anterior si existe
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(mat => mat.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }

                // Asignar nuevo material
                mesh.material = newMaterial;
                mesh.material.needsUpdate = true;
                mesh.visible = true;
                mesh.frustumCulled = false;
                mesh.renderOrder = 999;

                console.log(`   ✅ Imagen cargada y aplicada a ${mesh.name}`);
            },
            (progress: ProgressEvent) => {
                const percent = (progress.loaded / progress.total) * 100;
                console.log(`   📥 Cargando imagen para ${mesh.name}: ${percent.toFixed(2)}%`);
            },
            (err: unknown) => {
                console.error(`   ❌ Error al cargar imagen para ${mesh.name}:`, err);
            }
        );
    }

    private async renderDOMToCanvasSimple(element: HTMLElement, targetCanvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<void> {
        try {
            // Usar html2canvas para renderizar el elemento
            const renderedCanvas = await html2canvas(element, {
                width: 2048,
                height: 2048,
                scale: 1,
                backgroundColor: null,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            // Copiar el canvas renderizado al canvas objetivo
            ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
            ctx.drawImage(renderedCanvas, 0, 0, 2048, 2048);

            console.log('   ✅ Canvas renderizado con html2canvas');
        } catch (error) {
            console.error('   ❌ Error al renderizar con html2canvas:', error);
            throw error;
        }
    }


    private cleanup(componentRef: any, hostElement: HTMLElement): void {
        // Limpiar el componente
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();

        // Remover el elemento del DOM
        if (hostElement.parentNode) {
            hostElement.parentNode.removeChild(hostElement);
        }
    }

    private renderHTMLToCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, _htmlContent: string, screenName: string): void {
        console.log(`   🎨 Renderizando contenido para: ${screenName}`);

        // Limpiar canvas completamente
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Escala para resolución 2048x2048 (el doble de 1024)
        const scale = canvas.width / 1024;

        // MODO SIMPLE DE PRUEBA: texto grande y claro para validar que se vea algo
        const simpleTestMode = true; // cambia a false cuando quieras volver al contenido detallado
        if (simpleTestMode) {
            console.log(`   🎨 MODO PRUEBA ACTIVADO para "${screenName}"`);
            console.log(`   🔍 Comparando: "${screenName}" === "Plane_1"? ${screenName === 'Plane_1'}`);
            console.log(`   🔍 Comparando: "${screenName}" === "Plane_2"? ${screenName === 'Plane_2'}`);
            console.log(`   🔍 Comparando: "${screenName}" === "Plane_3"? ${screenName === 'Plane_3'}`);

            // Fondo de color según pantalla con texto de ejemplo
            let bgColor, title, lines;

            if (screenName === 'Plane_1') {
                bgColor = '#1e3c72'; // Azul oscuro
                title = 'PROYECTOS';
                lines = [
                    'E-Commerce Platform',
                    'Angular • Node.js • MongoDB',
                    '',
                    'Dashboard Analytics',
                    'React • D3.js • TypeScript',
                    '',
                    'Mobile App',
                    'Flutter • Firebase'
                ];
                console.log(`   🔴 Aplicando contenido PROYECTOS para Plane_1`);
            } else if (screenName === 'Plane_2') {
                bgColor = '#134e5e'; // Verde azulado
                title = 'SOBRE MI';
                lines = [
                    '',
                    'Matias Developer',
                    'Full Stack Developer',
                    '',
                    'Desarrollador apasionado',
                    'por crear experiencias',
                    'web innovadoras',
                    '',
                    '3+ años experiencia',
                    '15+ proyectos'
                ];
                console.log(`   🟢 Aplicando contenido SOBRE MI para Plane_2`);
            } else if (screenName === 'Plane_3') {
                bgColor = '#2c3e50'; // Azul grisáceo
                title = 'SKILLS';
                lines = [
                    'Frontend:',
                    'Angular • React • Vue.js',
                    'TypeScript • Three.js',
                    '',
                    'Backend:',
                    'Node.js • Python • MongoDB',
                    '',
                    'Contacto:',
                    'matias@developer.com',
                    'github.com/matias'
                ];
                console.log(`   🔵 Aplicando contenido SKILLS para Plane_3`);
            } else {
                bgColor = '#FFFF00'; // AMARILLO
                title = screenName;
                lines = ['Nombre no reconocido'];
                console.log(`   🟡 Nombre no coincide: "${screenName}"`);
            }

            // Dibujar fondo
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dibujar título
            ctx.fillStyle = 'white';
            ctx.font = `bold ${100 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(title, canvas.width / 2, 80 * scale);

            // Dibujar línea debajo del título
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(canvas.width * 0.2, 220 * scale, canvas.width * 0.6, 4 * scale);

            // Dibujar líneas de contenido
            ctx.font = `${50 * scale}px Arial`;
            ctx.fillStyle = 'white';
            let yPosition = 300 * scale;

            lines.forEach((line) => {
                if (line === '') {
                    yPosition += 40 * scale; // Espacio extra para líneas vacías
                } else {
                    ctx.fillText(line, canvas.width / 2, yPosition);
                    yPosition += 70 * scale;
                }
            });

            console.log(`   ✅ Canvas de prueba dibujado con contenido para "${screenName}"`);
            return;
        }

        // Fondo con gradiente según la pantalla
        let gradient;
        if (screenName === 'Plane_1') {
            gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#1e3c72');
            gradient.addColorStop(1, '#2a5298');
        } else if (screenName === 'Plane_2') {
            gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#134e5e');
            gradient.addColorStop(1, '#71b280');
        } else {
            gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#2c3e50');
            gradient.addColorStop(1, '#3498db');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        console.log(`   ✅ Fondo aplicado para ${screenName}`);

        // Configurar propiedades de texto globales
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';


        if (screenName === 'Plane_1') {
            // PROYECTOS
            ctx.fillStyle = 'white';
            ctx.font = `bold ${60 * scale}px Arial, sans-serif`;
            ctx.fillText('📂 PROYECTOS', canvas.width / 2, 60 * scale);

            console.log(`   📝 Dibujando título: PROYECTOS`);

            // Proyectos
            const projects = [
                { name: 'E-Commerce Platform', tech: 'Angular • Node.js', y: 180 },
                { name: 'Dashboard Analytics', tech: 'React • D3.js', y: 380 },
                { name: 'Mobile App', tech: 'Flutter • Firebase', y: 580 }
            ];

            projects.forEach(proj => {
                const y = proj.y * scale;

                // Fondo del proyecto
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(60 * scale, y, canvas.width - 120 * scale, 150 * scale);

                // Nombre del proyecto
                ctx.fillStyle = 'white';
                ctx.font = `bold ${40 * scale}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText(proj.name, 80 * scale, y + 30 * scale);

                // Tecnologías
                ctx.font = `${28 * scale}px Arial`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillText(proj.tech, 80 * scale, y + 85 * scale);
            });

        } else if (screenName === 'Plane_2') {
            // SOBRE MÍ
            // Círculo avatar
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, 180 * scale, 80 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Emoji
            ctx.font = `${80 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('👨‍💻', canvas.width / 2, 140 * scale);

            console.log(`   📝 Dibujando perfil`);

            // Nombre
            ctx.font = `bold ${70 * scale}px Arial`;
            ctx.fillStyle = 'white';
            ctx.fillText('Matías Developer', canvas.width / 2, 320 * scale);

            // Rol
            ctx.font = `${40 * scale}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText('Full Stack Developer', canvas.width / 2, 410 * scale);

            // Descripción
            ctx.font = `${28 * scale}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            const desc = 'Desarrollador apasionado por crear';
            const desc2 = 'experiencias web innovadoras';
            ctx.fillText(desc, canvas.width / 2, 500 * scale);
            ctx.fillText(desc2, canvas.width / 2, 540 * scale);

            // Stats
            ctx.font = `${26 * scale}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(200 * scale, 640 * scale, 280 * scale, 60 * scale);
            ctx.fillRect(540 * scale, 640 * scale, 280 * scale, 60 * scale);

            ctx.fillStyle = 'white';
            ctx.fillText('🎯 3+ años', 340 * scale, 670 * scale);
            ctx.fillText('🚀 15+ proyectos', 680 * scale, 670 * scale);

        } else if (screenName === 'Plane_3') {
            // SKILLS & CONTACTO
            ctx.fillStyle = 'white';
            ctx.font = `bold ${48 * scale}px Arial`;
            ctx.fillText('🛠️ SKILLS', canvas.width / 2, 60 * scale);

            console.log(`   📝 Dibujando skills`);

            // Frontend Skills
            ctx.font = `bold ${45 * scale}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillText('Frontend', 80 * scale, 180 * scale);

            const frontendSkills = ['Angular', 'React', 'Vue.js', 'TypeScript', 'Three.js', 'CSS3'];
            frontendSkills.forEach((skill, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const x = 80 * scale + col * 300 * scale;
                const y = 250 * scale + row * 90 * scale;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(x, y, 260 * scale, 70 * scale);

                ctx.fillStyle = 'white';
                ctx.font = `${28 * scale}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(skill, x + 130 * scale, y + 43 * scale);
            });

            // Backend Skills
            ctx.textAlign = 'left';
            ctx.font = `bold ${45 * scale}px Arial`;
            ctx.fillText('Backend', 80 * scale, 480 * scale);

            const backendSkills = ['Node.js', 'Python', 'MongoDB'];
            backendSkills.forEach((skill, i) => {
                const x = 80 * scale + i * 300 * scale;
                const y = 550 * scale;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(x, y, 260 * scale, 70 * scale);

                ctx.fillStyle = 'white';
                ctx.font = `${28 * scale}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(skill, x + 130 * scale, y + 43 * scale);
            });

            // Contacto
            ctx.textAlign = 'left';
            ctx.font = `bold ${45 * scale}px Arial`;
            ctx.fillText('📬 Contacto', 80 * scale, 680 * scale);

            const contacts = ['📧 matias@developer.com', '💼 linkedin.com/in/matias', '🐙 github.com/matias'];
            contacts.forEach((contact, i) => {
                const y = 750 * scale + i * 80 * scale;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(80 * scale, y, canvas.width - 160 * scale, 60 * scale);

                ctx.fillStyle = 'white';
                ctx.font = `${26 * scale}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText(contact, 100 * scale, y + 38 * scale);
            });
        }

        console.log(`   ✅ Contenido renderizado en canvas para: ${screenName}`);
    }

    private findScreens(object: THREE.Object3D): void {
        console.log('🖥️ BUSCANDO PANTALLAS...');

        const allMeshes: string[] = [];
        const planesFound: string[] = [];

        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const meshName = child.name || 'Sin nombre';
                allMeshes.push(meshName);

                // Buscar CUALQUIER mesh que contenga "plane" en su nombre (case insensitive)
                if (meshName.toLowerCase().includes('plane')) {
                    planesFound.push(meshName);
                    this.screenMeshes.push(child);
                    console.log(`   ✅ Pantalla encontrada: "${child.name}"`);
                    console.log(`      Posición:`, child.position);
                    console.log(`      Posición mundial:`, child.getWorldPosition(new THREE.Vector3()));
                    console.log(`      Tiene geometría:`, !!child.geometry);
                    console.log(`      Tiene material:`, !!child.material);
                    console.log(`      Visible:`, child.visible);
                    console.log(`      Parent:`, child.parent?.name || 'scene');

                    // Información adicional del material
                    if (child.material) {
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        materials.forEach((mat: any) => {
                            console.log(`      Material type:`, mat.type);
                            console.log(`      Material side:`, mat.side === THREE.DoubleSide ? 'DoubleSide' : mat.side === THREE.FrontSide ? 'FrontSide' : 'BackSide');
                        });
                    }
                }
            }
        });

        console.log('═══════════════════════════════════════');
        console.log('📋 TODOS LOS MESHES EN EL MODELO:');
        console.log(allMeshes);
        console.log('═══════════════════════════════════════');

        if (planesFound.length > 0) {
            console.log('🎯 Planes encontrados:', planesFound);
        }

        if (this.screenMeshes.length === 0) {
            console.warn('   ⚠️ NO SE ENCONTRARON PANTALLAS');
            console.warn('   💡 Meshes disponibles:', allMeshes.join(', '));
            console.warn('   💡 ¿Cuál de estos meshes quieres usar como pantallas?');
        } else {
            console.log(`   🎯 Total de pantallas encontradas: ${this.screenMeshes.length}`);
        }
    }


    private generatePlaneUVs(geometry: THREE.BufferGeometry): void {
        const positions = geometry.attributes['position'];
        if (!positions) {
            console.error('No se pueden generar UVs: la geometría no tiene posiciones');
            return;
        }

        const count = positions.count;
        const uvs = new Float32Array(count * 2);

        // Obtener el bounding box para normalizar las coordenadas
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;

        if (!bbox) {
            console.error('No se puede calcular bounding box');
            return;
        }

        const sizeX = bbox.max.x - bbox.min.x;
        const sizeY = bbox.max.y - bbox.min.y;
        const sizeZ = bbox.max.z - bbox.min.z;

        // Determinar qué ejes usar basándose en cuál dimensión es más pequeña (el plano)
        let uIndex: number, vIndex: number;
        if (sizeX < sizeY && sizeX < sizeZ) {
            // Plano YZ
            uIndex = 2; // Z
            vIndex = 1; // Y
        } else if (sizeY < sizeX && sizeY < sizeZ) {
            // Plano XZ
            uIndex = 0; // X
            vIndex = 2; // Z
        } else {
            // Plano XY
            uIndex = 0; // X
            vIndex = 1; // Y
        }

        const axes = [
            { min: bbox.min.x, max: bbox.max.x, size: sizeX },
            { min: bbox.min.y, max: bbox.max.y, size: sizeY },
            { min: bbox.min.z, max: bbox.max.z, size: sizeZ }
        ];

        // Generar UVs normalizados
        for (let i = 0; i < count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            const coords = [x, y, z];

            const u = (coords[uIndex] - axes[uIndex].min) / axes[uIndex].size;
            const v = (coords[vIndex] - axes[vIndex].min) / axes[vIndex].size;

            uvs[i * 2] = u;
            uvs[i * 2 + 1] = v;
        }

        // Asignar los UVs a la geometría
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        console.log(`   📐 UVs generados: ${count} vértices`);
    }

    private createInteractivePlanesForMainScreen(screenMesh: THREE.Mesh): void {
        console.log('🎯 Creando planos interactivos para la pantalla principal (MODO AJUSTE MANUAL)...');

        // --- Limpieza fuerte: eliminar cualquier plano interactivo previo de la escena ---
        // (por si esta función se llama más de una vez o si quedaron meshes colgados)
        const leftovers: THREE.Object3D[] = [];
        this.scene.traverse((obj) => {
            if (obj.name?.startsWith('interactive_li_')) {
                leftovers.push(obj);
            }
        });

        leftovers.forEach((obj) => {
            obj.removeFromParent();
            const mesh = obj as unknown as THREE.Mesh;
            if (mesh && (mesh as any).isMesh) {
                mesh.geometry?.dispose?.();
                const mat = mesh.material as any;
                if (Array.isArray(mat)) mat.forEach((m: any) => m?.dispose?.());
                else mat?.dispose?.();
            }
        });

        // --- Limpieza de nuestro array ---
        this.interactivePlanes.forEach((plane) => {
            plane.removeFromParent();
            plane.geometry.dispose();
            (plane.material as THREE.Material).dispose();
        });
        this.interactivePlanes = [];

        // Asegurar matrices
        screenMesh.updateMatrixWorld(true);

        // --- Parámetros para iteración rápida (vamos ajustando estos contigo) ---
        const DEBUG_OPACITY = 0.06;
        const SHOW_DEBUG_COLORS = false; // pon true si quieres ver colores de guía
        const NORMAL_OFFSET = 0.02;
        const GLOBAL_SHIFT_FACTOR = -0.09; // Desplaza todos los planos un poco hacia abajo en el eje de apilado

        // (alto > ancho)
        const PLANE_WIDTH_FACTOR = 0.12; // antes 0.10, un poco más ancho
        const PLANE_HEIGHT_FACTOR = 0.85;

        // Separación vertical entre items: subimos un poco para que se noten separados
        const ITEM_SPACING_FACTOR = 0.11;

        const EXTRA_ROT_Z = 0;

        // --- Medidas / ejes de la pantalla (en mundo) ---
        const geometry = screenMesh.geometry;
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;

        const localWidth = bbox.max.x - bbox.min.x;
        const localHeight = bbox.max.y - bbox.min.y;

        const worldScale = new THREE.Vector3();
        screenMesh.getWorldScale(worldScale);

        const worldWidth = localWidth * worldScale.x;
        const worldHeight = localHeight * worldScale.y;

        const screenWorldPos = new THREE.Vector3();
        const screenWorldQuat = new THREE.Quaternion();
        screenMesh.getWorldPosition(screenWorldPos);
        screenMesh.getWorldQuaternion(screenWorldQuat);

        const screenUp = new THREE.Vector3(0, 1, 0).applyQuaternion(screenWorldQuat).normalize();
        const screenRight = new THREE.Vector3(1, 0, 0).applyQuaternion(screenWorldQuat).normalize();
        const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(screenWorldQuat).normalize();

        console.log('   📏 Screen world size approx:', { worldWidth, worldHeight });

        const planeWidth = Math.max(0.001, worldWidth * PLANE_WIDTH_FACTOR);
        const planeHeight = Math.max(0.001, worldHeight * PLANE_HEIGHT_FACTOR);

        // Items (orden de arriba a abajo): EXACTAMENTE 3
        // Para agregar otro ítem en el futuro, añade aquí otro objeto { name: 'nuevo', idx: 3, color: 0xff00ff }
        const liItems = [
            { name: 'home', idx: 0, color: 0xffffff },
            { name: 'projects', idx: 1, color: 0xff0000 },
            { name: 'skills', idx: 2, color: 0x00ff00 },
            { name: 'about', idx: 3, color: 0x0000ff },
            { name: 'contact', idx: 4, color: 0xffff00 }
        ] as const;

        liItems.forEach((item) => {
            // Guard: si por algún motivo ya existe un mesh con ese nombre, lo removemos antes.
            const existing = this.scene.getObjectByName(`interactive_li_${item.name}`);
            if (existing) {
                existing.removeFromParent();
            }

            const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
            const planeMaterial = new THREE.MeshBasicMaterial({
                color: SHOW_DEBUG_COLORS ? item.color : 0x111111,
                transparent: true,
                opacity: DEBUG_OPACITY,
                side: THREE.DoubleSide,
                depthTest: true,
                depthWrite: false
            });

            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.name = `interactive_li_${item.name}`;
            plane.userData = { type: 'interactive_li', index: item.idx, label: item.name };

            // Posición base: centro de pantalla + offset hacia afuera
            const basePos = screenWorldPos.clone()
                .add(screenNormal.clone().multiplyScalar(NORMAL_OFFSET))
                .add(screenRight.clone().multiplyScalar(GLOBAL_SHIFT_FACTOR * worldHeight));

            // Offset vertical: usamos screenRight para que se apilen uno debajo del otro (más separados)
            const offset = (1 - item.idx) * (ITEM_SPACING_FACTOR * worldHeight);
            const pos = basePos.clone().add(screenRight.clone().multiplyScalar(offset));

            plane.position.copy(pos);

            plane.quaternion.copy(screenWorldQuat);
            if (EXTRA_ROT_Z !== 0) plane.rotateZ(EXTRA_ROT_Z);

            this.scene.add(plane);
            this.interactivePlanes.push(plane);
        });

        console.log(`🎯 Planos interactivos en escena (debería ser 3): ${this.interactivePlanes.length}`);

        // Chequeo extra: contar en escena por nombre
        let sceneCount = 0;
        this.scene.traverse((obj) => {
            if (obj.name?.startsWith('interactive_li_')) sceneCount++;
        });
        console.log(`🎯 Conteo total en escena (interactive_li_*): ${sceneCount}`);
    }

    private setupMouseEvents(): void {
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('click', this.onMouseClick.bind(this));
        console.log('🖱️ Event listeners de mouse configurados');
    }

    private onMouseClick(event: MouseEvent): void {
        console.log('🖱️ CLICK DETECTADO - Probando raycasting...');

        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        console.log('   📍 Posición del mouse (normalizada):', { x: this.mouse.x, y: this.mouse.y });
        console.log('   📹 Posición de la cámara:', this.camera.position);
        console.log('   🎯 Ray origin:', this.raycaster.ray.origin);
        console.log('   ➡️ Ray direction:', this.raycaster.ray.direction);
        console.log('   🖥️ Pantallas disponibles:', this.screenMeshes.length);

        // Click sobre planos interactivos (LIs)
        const planeIntersects = this.raycaster.intersectObjects(this.interactivePlanes, false);
        if (planeIntersects.length > 0) {
            const clickedPlane = planeIntersects[0].object as THREE.Mesh;
            const label = clickedPlane.userData['label'];
            const route = label ? this.liRoutes[label] : undefined;
            if (route) {
                console.log(`   🚀 Navegando por LI "${label}" a:`, route);
                this.router.navigate([route]);
            } else {
                console.warn(`   ⚠️ No hay ruta configurada para LI "${label}". Actualiza liRoutes.`);
            }
            return; // No seguimos probando pantallas
        }

        // Probar intersección con TODOS los objetos de la escena
        const allIntersects = this.raycaster.intersectObjects(this.scene.children, true);
        console.log('   🌍 Intersecciones con TODA la escena:', allIntersects.length);

        if (allIntersects.length > 0) {
            console.log('   ✅ Objetos detectados:');
            allIntersects.slice(0, 5).forEach((intersect, i) => {
                console.log(`      ${i + 1}. ${intersect.object.name || 'Sin nombre'} - distancia: ${intersect.distance.toFixed(2)}`);
            });
        }

        // Probar intersección solo con las pantallas
        const screenIntersects = this.raycaster.intersectObjects(this.screenMeshes, true);
        console.log('   🖥️ Intersecciones con pantallas:', screenIntersects.length);

        if (screenIntersects.length > 0) {
            const clickedScreen = screenIntersects[0].object as THREE.Mesh;
            console.log('   🎯 ¡PANTALLA DETECTADA!:', clickedScreen.name);

            // Obtener la ruta correspondiente
            const route = this.screenRoutes.get(clickedScreen.name);
            if (route && route!=='/main') {
                console.log('   🚀 Navegando a:', route);
                this.router.navigate([route]);
            } else {
                console.warn('   ⚠️ No se encontró ruta para la pantalla:', clickedScreen.name);
            }
        } else {
            console.log('   ❌ No se detectaron pantallas');

            // Mostrar información de las pantallas
            console.log('   📋 Info de las pantallas:');
            this.screenMeshes.forEach((mesh, i) => {
                const worldPos = new THREE.Vector3();
                mesh.getWorldPosition(worldPos);
                console.log(`      ${i + 1}. ${mesh.name}:`);
                console.log(`         Posición mundial:`, worldPos);
                console.log(`         Visible:`, mesh.visible);
                console.log(`         Tiene geometría:`, !!mesh.geometry);
            });
        }
    }

    private onMouseMove(event: MouseEvent): void {
        // Convertir posición del mouse a coordenadas normalizadas (-1 a +1)
        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Actualizar raycaster desde la cámara hacia el mouse
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Hacer raycasting sobre los planos interactivos (ahora son objetos en la escena)
        const planeIntersects = this.raycaster.intersectObjects(this.interactivePlanes, false);

        if (planeIntersects.length > 0) {
            const intersectedPlane = planeIntersects[0].object as THREE.Mesh;

            // Si es un plano diferente al que ya está en hover
            if (this.hoveredPlane !== intersectedPlane) {
                this.hoveredPlane = intersectedPlane;
                this.updateMainScreenWithHover(intersectedPlane.userData['index']);
            }
        } else if (this.hoveredPlane !== null) {
            // Si no hay hover sobre planos pero había uno activo
            this.hoveredPlane = null;
            this.updateMainScreenWithHover(-1); // Sin hover
        }

        // Verificar intersecciones con las pantallas (recursivo = true para buscar en hijos también)
        const intersects = this.raycaster.intersectObjects(this.screenMeshes, true);

        // Debug: mostrar info cada ciertos frames (reducir spam)
        if (Math.random() < 0.02) { // 2% de probabilidad
            console.log('🖱️ Mouse Debug:', {
                normalized: { x: this.mouse.x.toFixed(2), y: this.mouse.y.toFixed(2) },
                screenMeshes: this.screenMeshes.length,
                intersects: intersects.length,
                rayOrigin: this.raycaster.ray.origin,
                rayDirection: this.raycaster.ray.direction
            });

            if (intersects.length > 0) {
                console.log('   🎯 INTERSECCIÓN DETECTADA:', intersects[0].object.name, 'distancia:', intersects[0].distance);
            }
        }

        if (intersects.length > 0) {
            const intersectedScreen = intersects[0].object as THREE.Mesh;

            // Si es una pantalla diferente a la que ya está en hover
            if (this.hoveredScreen !== intersectedScreen) {
                console.log(`🎯 ✅ Hover detectado en: ${intersectedScreen.name}`);
                this.hoveredScreen = intersectedScreen;
                this.focusOnScreen(intersectedScreen);
            }
        } else {
            // Si no hay hover y había una pantalla seleccionada
            if (this.hoveredScreen !== null) {
                console.log(`👋 Hover perdido, volviendo a posición original`);
                this.hoveredScreen = null;
                this.returnToOriginalPosition();
            }
        }
    }

    private focusOnScreen(screen: THREE.Mesh): void {
        console.log(`📹 Enfocando en pantalla: ${screen.name}`);

        // Obtener posición mundial de la pantalla
        const screenWorldPosition = new THREE.Vector3();
        screen.getWorldPosition(screenWorldPosition);

        console.log('   Posición de la pantalla:', screenWorldPosition);
        console.log('   Posición original de cámara:', this.originalCameraPosition);

        // Calcular el vector DESDE la cámara HACIA la pantalla
        const directionToScreen = new THREE.Vector3();
        directionToScreen.subVectors(screenWorldPosition, this.originalCameraPosition).normalize();

        console.log('   Dirección hacia la pantalla:', directionToScreen);

        // Hacer un pequeño acercamiento en esa dirección (HACIA ADELANTE)
        const zoomDistance = 0.3; // Solo 0.3 unidades hacia adelante
        this.targetCameraPosition.copy(this.originalCameraPosition).add(
            directionToScreen.multiplyScalar(zoomDistance)
        );

        // Mantener el mismo target (no cambiar hacia dónde mira)
        this.targetControlsTarget.copy(this.originalControlsTarget);

        this.isAnimatingCamera = true;
        console.log('   📹 Nueva posición de cámara:', this.targetCameraPosition);
        console.log('   🎯 Target (sin cambios):', this.targetControlsTarget);
        console.log('   📏 Distancia de acercamiento:', zoomDistance);
    }

    private returnToOriginalPosition(): void {
        console.log('📹 Volviendo a posición original');
        this.targetCameraPosition.copy(this.originalCameraPosition);
        this.targetControlsTarget.copy(this.originalControlsTarget);
        this.isAnimatingCamera = true;
    }

    private isUpdatingHover: boolean = false;

    private async preRenderHoverTextures(): Promise<void> {
        if (this.isPreRenderingTextures) return;
        this.isPreRenderingTextures = true;

        console.log('🎨 Pre-renderizando texturas de hover...');

        const items = ['HOME', 'PROJECTS', 'SKILLS', 'ABOUT', 'CONTACT'];

        // Renderizar textura para cada estado (incluyendo sin hover = -1)
        for (let hoveredIndex = -1; hoveredIndex < items.length; hoveredIndex++) {
            const canvas = await this.renderMainScreenCanvas(hoveredIndex);
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
            texture.flipY = true;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.rotation = -Math.PI / 2;
            texture.center.set(0.5, 0.5);
            this.hoverTextures.set(hoveredIndex, texture);
            console.log(`   ✅ Textura pre-renderizada para index: ${hoveredIndex}`);
        }

        this.isPreRenderingTextures = false;
        console.log('✅ Todas las texturas de hover pre-renderizadas');
    }

    private async renderMainScreenCanvas(hoveredIndex: number): Promise<HTMLCanvasElement> {
        return new Promise((resolve, reject) => {
            // Crear un contenedor temporal en el DOM
            const hostElement = document.createElement('div');
            hostElement.style.position = 'fixed';
            hostElement.style.top = '0';
            hostElement.style.left = '0';
            hostElement.style.width = '2048px';
            hostElement.style.height = '2048px';
            hostElement.style.overflow = 'hidden';
            hostElement.style.zIndex = '-1000';
            hostElement.style.pointerEvents = 'none';
            document.body.appendChild(hostElement);

            // Crear el HTML del componente con hover aplicado
            const items = ['HOME', 'PROJECTS', 'SKILLS', 'ABOUT', 'CONTACT'];
            const listHTML = items.map((item, index) => {
                const color = index === hoveredIndex ? 'cyan' : 'red';
                return `<li class="main__options-li" style="color: ${color}; cursor: pointer; margin: 20px 0;">[ ${item} ]</li>`;
            }).join('');

            hostElement.innerHTML = `
        <div class="screen-container" style="background: #000; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12rem; font-family: monospace;">
          <ul class="main__options" style="list-style: none; text-align: center; padding: 0; margin: 0;">
            <p style="margin-bottom: 60px; color: #fff;">SELECT MODULE</p>
            ${listHTML}
          </ul>
        </div>
      `;

            // Crear canvas
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 2048;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            if (!ctx) {
                document.body.removeChild(hostElement);
                reject(new Error('No se pudo obtener contexto 2D'));
                return;
            }

            // Renderizar a canvas
            html2canvas(hostElement, {
                width: 2048,
                height: 2048,
                scale: 1,
                backgroundColor: '#000000',
                logging: false,
                useCORS: true,
                allowTaint: true
            }).then(renderedCanvas => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(renderedCanvas, 0, 0, 2048, 2048);
                document.body.removeChild(hostElement);
                resolve(canvas);
            }).catch(error => {
                document.body.removeChild(hostElement);
                reject(error);
            });
        });
    }

    private updateMainScreenWithHover(hoveredIndex: number): void {
        // Si ya tenemos las texturas pre-renderizadas, simplemente cambiar
        const texture = this.hoverTextures.get(hoveredIndex);

        if (texture) {
            // Actualización instantánea usando textura pre-renderizada
            const mainScreen = this.screenMeshes.find(m => m.name === 'Plane_3');
            if (mainScreen && mainScreen.material instanceof THREE.MeshBasicMaterial) {
                mainScreen.material.map = texture;
                mainScreen.material.needsUpdate = true;
            }
        } else if (!this.isPreRenderingTextures) {
            // Si aún no están pre-renderizadas, hacerlo ahora (fallback)
            console.log('⚠️ Texturas no pre-renderizadas, renderizando ahora...');
            this.updateMainScreenWithHoverLegacy(hoveredIndex);
        }
    }

    private updateMainScreenWithHoverLegacy(hoveredIndex: number): void {
        // Versión legacy (lenta) como fallback
        if (this.isUpdatingHover) return;
        this.isUpdatingHover = true;

        console.log(`🎨 Actualizando pantalla con hover en index: ${hoveredIndex}`);

        // Crear un contenedor temporal en el DOM
        const hostElement = document.createElement('div');
        hostElement.style.position = 'fixed';
        hostElement.style.top = '0';
        hostElement.style.left = '0';
        hostElement.style.width = '2048px';
        hostElement.style.height = '2048px';
        hostElement.style.overflow = 'hidden';
        hostElement.style.zIndex = '-1000';
        hostElement.style.pointerEvents = 'none';
        document.body.appendChild(hostElement);

        // Crear el HTML del componente con hover aplicado
        const items = ['HOME', 'PROJECTS', 'SKILLS', 'ABOUT', 'CONTACT'];
        const listHTML = items.map((item, index) => {
            const color = index === hoveredIndex ? 'cyan' : 'red';
            return `<li class="main__options-li" style="color: ${color}; cursor: pointer; margin: 20px 0;">[ ${item} ]</li>`;
        }).join('');

        hostElement.innerHTML = `
      <div class="screen-container" style="background: #000; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12rem; font-family: monospace;">
        <ul class="main__options" style="list-style: none; text-align: center; padding: 0; margin: 0;">
          <p style="margin-bottom: 60px; color: #fff;">SELECCIONAR MODULOl</p>
          ${listHTML}
        </ul>
      </div>
    `;

        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
            document.body.removeChild(hostElement);
            this.isUpdatingHover = false;
            return;
        }

        // Renderizar a canvas
        html2canvas(hostElement, {
            width: 2048,
            height: 2048,
            scale: 1,
            backgroundColor: '#000000',
            logging: false,
            useCORS: true,
            allowTaint: true
        }).then(renderedCanvas => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(renderedCanvas, 0, 0, 2048, 2048);

            // Buscar la pantalla principal (Plane_3) y actualizar su textura
            const mainScreen = this.screenMeshes.find(m => m.name === 'Plane_3');
            if (mainScreen) {
                const texture = this.screenTextures.get(mainScreen.name);
                if (texture) {
                    texture.image = canvas;
                    texture.needsUpdate = true;
                    console.log(`   ✅ Textura actualizada`);
                }
            }

            // Limpiar
            document.body.removeChild(hostElement);
            this.isUpdatingHover = false;
        }).catch(error => {
            console.error('   ❌ Error al renderizar hover:', error);
            document.body.removeChild(hostElement);
            this.isUpdatingHover = false;
        });
    }

    private updateCameraAnimation(): void {
        if (!this.isAnimatingCamera) return;

        const lerpFactor = 0.05; // Velocidad de la animación (más bajo = más suave)

        // Interpolar posición de la cámara
        this.camera.position.lerp(this.targetCameraPosition, lerpFactor);

        // Interpolar target de los controles
        this.controls.target.lerp(this.targetControlsTarget, lerpFactor);

        // Verificar si llegamos al destino (con un pequeño margen de error)
        const distanceToTarget = this.camera.position.distanceTo(this.targetCameraPosition);
        const targetDistance = this.controls.target.distanceTo(this.targetControlsTarget);

        if (distanceToTarget < 0.01 && targetDistance < 0.01) {
            // Llegamos al destino
            this.camera.position.copy(this.targetCameraPosition);
            this.controls.target.copy(this.targetControlsTarget);
            this.isAnimatingCamera = false;
            console.log('   ✅ Animación completada');
        }
    }

    private findCameraByName(object: THREE.Object3D, cameraName: string): THREE.Camera | null {
        let foundCamera: THREE.Camera | null = null;

        object.traverse((child) => {
            if (child instanceof THREE.Camera && child.name === cameraName) {
                foundCamera = child;
            }
        });

        return foundCamera;
    }

    private listAllCameras(object: THREE.Object3D): void {
        const cameras: Array<{name: string, position: THREE.Vector3}> = [];
        object.traverse((child) => {
            if (child instanceof THREE.Camera) {
                cameras.push({
                    name: child.name || 'Sin nombre',
                    position: child.position.clone()
                });
            }
        });
        console.log('📹 Cámaras disponibles en el modelo:', cameras.length);
        cameras.forEach((cam, index) => {
            console.log(`   ${index + 1}. "${cam.name}" en posición:`, cam.position);
        });
    }

    private listAllObjects(object: THREE.Object3D): void {
        console.log('🔍 OBJETOS EN EL MODELO:');
        console.log('═══════════════════════════════════════');
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                console.log(`📦 Mesh: "${child.name || 'Sin nombre'}"`);
                console.log(`   Geometría: ${child.geometry.type}`);

                if (child.material) {
                    const material = Array.isArray(child.material) ? child.material[0] : child.material;
                    console.log(`   Material: ${material.type}`);

                    // Verificar si tiene textura
                    if ('map' in material && material.map) {
                        console.log(`   ✅ Tiene textura (map)`);
                    }
                    if ('emissiveMap' in material && material.emissiveMap) {
                        console.log(`   ✅ Tiene emissiveMap`);
                    }
                }
            }
        });
        console.log('═══════════════════════════════════════');
    }

    private setupVideoTextures(object: THREE.Object3D): void {
        console.log('🎥 CONFIGURANDO VIDEO TEXTURES...');
        console.log('🔍 Buscando objeto "Sphere"...');

        object.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name === 'Sphere') {
                console.log('✅ ¡Objeto "Sphere" encontrado!');

                const materials = Array.isArray(child.material) ? child.material : [child.material];

                materials.forEach((material: any) => {
                    console.log('   Material type:', material.type);

                    // Buscar texturas que puedan ser videos
                    const textureProperties = ['map', 'emissiveMap'];

                    textureProperties.forEach(propName => {
                        if (material[propName]) {
                            console.log(`   ✅ Encontrada textura en propiedad: ${propName}`);

                            // Aplicar video directamente
                            const videoUrl = '/assets/space.mp4';
                            console.log(`   🎬 Aplicando video: ${videoUrl}`);
                            this.replaceTextureWithVideo(material, propName, videoUrl, child.name);
                        }
                    });
                });
            }
        });

        console.log('🎥 Configuración de video completada');
    }

    private _getVideoUrlFromImage(imageUrl: string): string | null {
        // Si la imagen viene del modelo empaquetado, intentar con un video en assets
        // Puedes personalizar esto según el nombre de tu archivo de video

        // Intentar extraer el nombre del archivo
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const nameWithoutExt = filename.split('.')[0];

        console.log(`   Buscando video para: ${nameWithoutExt}`);

        // Lista de posibles nombres de video a intentar
        const possibleVideoNames = [
            '/assets/space.mp4',
            '/assets/background.mp4',
            '/assets/video.mp4',
            '/assets/space-background.mp4',
            `/assets/${nameWithoutExt}.mp4`,
        ];

        // Por ahora retornamos el primero para probar
        return possibleVideoNames[0];
    }

    private replaceTextureWithVideo(material: any, propName: string, videoUrl: string, meshName: string): void {
        console.log(`   📹 Creando elemento de video...`);

        const video = document.createElement('video');
        video.src = videoUrl;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.autoplay = true;

        // Guardar referencia al video
        this.videos.push(video);

        console.log(`   📹 Video configurado: loop=${video.loop}, muted=${video.muted}`);

        // Intentar reproducir cuando esté listo
        video.addEventListener('loadeddata', () => {
            console.log(`   ✅ ¡Video cargado exitosamente!`);
            console.log(`   ℹ️  Duración: ${video.duration.toFixed(2)}s, Tamaño: ${video.videoWidth}x${video.videoHeight}`);

            video.play().then(() => {
                console.log(`   ▶️ ¡VIDEO REPRODUCIÉNDOSE EN "${meshName}"!`);
            }).catch((error) => {
                console.warn(`   ⚠️ Autoplay bloqueado:`, error.message);
                console.log(`   💡 Haz clic en la pantalla para iniciar la reproducción`);

                // Agregar listener para reproducir con clic del usuario
                const playOnClick = () => {
                    console.log('   🖱️ Click detectado, iniciando video...');
                    video.play().then(() => {
                        console.log('   ▶️ ¡Video iniciado!');
                    }).catch(e => console.error('   ❌ Error al reproducir:', e));
                };

                document.addEventListener('click', playOnClick, { once: true });
            });
        });

        video.addEventListener('error', (e) => {
            console.error(`   ❌ ERROR al cargar video desde ${videoUrl}`);
            console.error(`   ❌ Detalles:`, e);
            console.log(`   💡 Verifica que el archivo existe en: portfolio/src/assets/space.mp4`);
        });

        video.addEventListener('playing', () => {
            console.log(`   ▶️ El video está reproduciéndose ahora`);
        });

        // Cargar el video
        console.log(`   📥 Cargando video desde: ${videoUrl}`);
        video.load();

        // Crear textura de video
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;

        // Copiar propiedades de la textura original
        const originalTexture = material[propName];
        if (originalTexture) {
            videoTexture.wrapS = originalTexture.wrapS;
            videoTexture.wrapT = originalTexture.wrapT;
            videoTexture.repeat.copy(originalTexture.repeat);
            videoTexture.offset.copy(originalTexture.offset);
            videoTexture.rotation = originalTexture.rotation;
            console.log(`   📋 Propiedades copiadas de textura original`);
        }

        // Reemplazar la textura
        material[propName] = videoTexture;
        material.needsUpdate = true;

        console.log(`   ✅ Textura "${propName}" REEMPLAZADA con VideoTexture`);
        console.log(`   🎬 El video debería empezar a reproducirse pronto...`);
    }

    private applyControlRestrictions(): void {
        console.log('🔒 Aplicando restricciones a los controles...');

        // Calcular distancia actual desde la cámara al target
        const currentDistance = this.camera.position.distanceTo(this.controls.target);
        console.log('   📏 Distancia actual al target:', currentDistance.toFixed(3));

        // Calcular los ángulos actuales de la cámara respecto al target
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.controls.target);

        // Ángulo polar (vertical): ángulo desde el eje Y positivo
        const currentPolarAngle = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

        // Ángulo azimutal (horizontal): ángulo en el plano XZ
        const currentAzimuthalAngle = Math.atan2(offset.x, offset.z);

        console.log('   📐 Ángulos actuales:');
        console.log('      Polar (vertical):', (currentPolarAngle * 180 / Math.PI).toFixed(2), '°');
        console.log('      Azimutal (horizontal):', (currentAzimuthalAngle * 180 / Math.PI).toFixed(2), '°');

        // Restricciones de zoom - muy limitadas
        this.controls.enableZoom = true;
        this.controls.minDistance = currentDistance - 0.3; // Solo 0.3 unidades de zoom
        this.controls.maxDistance = currentDistance + 0.3; // Solo 0.5 unidades de contra-zoom
        this.controls.zoomSpeed = 0.2; // Velocidad de zoom muy lenta

        // Restricciones de paneo - muy limitadas
        this.controls.enablePan = true;
        this.controls.panSpeed = 0.05; // Paneo muy muy lento
        this.controls.screenSpacePanning = true;

        // Restricciones de rotación vertical (arriba/abajo) - RELATIVAS a la posición actual
        const polarRange = 0.03; // ±0.05 radianes = ±2.86 grados
        this.controls.minPolarAngle = currentPolarAngle - polarRange;
        this.controls.maxPolarAngle = currentPolarAngle + polarRange;

        // Restricciones de rotación horizontal (izquierda/derecha) - RELATIVAS a la posición actual
        const azimuthalRange = 0.02; // ±0.1 radianes = ±5.73 grados
        this.controls.minAzimuthAngle = currentAzimuthalAngle - azimuthalRange;
        this.controls.maxAzimuthAngle = currentAzimuthalAngle + azimuthalRange;

        // Velocidad de rotación muy lenta
        this.controls.rotateSpeed = 0.15;

        console.log('   ✅ Restricciones aplicadas RELATIVAS a la posición actual:');
        console.log('      Zoom: desde', this.controls.minDistance.toFixed(3), 'hasta', this.controls.maxDistance.toFixed(3));
        console.log('      Rotación vertical: ±2.86°');
        console.log('      Rotación horizontal: ±5.73°');
        console.log('      Velocidades: zoom=0.2, pan=0.05, rotate=0.15');
    }

    private animate(): void {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.updateCameraAnimation(); // Actualizar animación de cámara

        // Actualizar texturas de canvas en cada frame
        this.screenTextures.forEach((texture) => {
            texture.needsUpdate = true;
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    private onWindowResize(): void {
        const canvas = this.canvasRef.nativeElement;
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
}
