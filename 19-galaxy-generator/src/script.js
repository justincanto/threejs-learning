import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const paramaters = {
    count: 10000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
}

let particleGeometry = null
let particleMaterial = null
let particles = null

const generateGalaxy = () => {
    if(particles !== null) {
        particleGeometry.dispose()
        particleMaterial.dispose()
        scene.remove(particles)
    }

    particleGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(paramaters.count * 3)
    const colors = new Float32Array(paramaters.count * 3)

    const colorInside = new THREE.Color(paramaters.insideColor)
    const colorOutside = new THREE.Color(paramaters.outsideColor)

    for(let i = 0 ; i < paramaters.count ; i++){
        const i3 = i * 3
        const radius = Math.random() * paramaters.radius
        const spinAngle = radius * paramaters.spin
        const brancheAngle = (i % paramaters.branches) / paramaters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), paramaters.randomnessPower) * (Math.random() < .5 ? 1 : -1) 
        const randomY = Math.pow(Math.random(), paramaters.randomnessPower) * (Math.random() < .5 ? 1 : -1) 
        const randomZ = Math.pow(Math.random(), paramaters.randomnessPower) * (Math.random() < .5 ? 1 : -1) 

        positions[i3] = Math.cos(brancheAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = 0 + randomY
        positions[i3 + 2] = Math.sin(brancheAngle + spinAngle) * radius + randomZ
        
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / paramaters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    particleMaterial = new THREE.PointsMaterial({
        size: paramaters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    particles = new THREE.Points(particleGeometry, particleMaterial)

    scene.add(particles)
}
generateGalaxy()

gui.add(paramaters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy)
gui.add(paramaters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(paramaters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(paramaters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(paramaters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(paramaters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(paramaters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(paramaters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(paramaters, 'outsideColor').onFinishChange(generateGalaxy)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()