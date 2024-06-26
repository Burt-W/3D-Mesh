import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import * as THREE from 'three'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const MyThreeJSComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [colorChanged, setColorChanged] = useState<boolean>(false)
  const scene = useRef<THREE.Scene | null>(null)
  const camera = useRef<THREE.PerspectiveCamera | null>(null)
  const renderer = useRef<THREE.WebGLRenderer | null>(null)
  const mesh = useRef<THREE.Mesh | null>(null)
  const controls = useRef<OrbitControls | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // 初始化场景、相机和渲染器
    scene.current = new THREE.Scene()
    camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.current.position.set(5, 5, 5)

    renderer.current = new THREE.WebGLRenderer({ antialias: true })
    renderer.current.setSize(window.innerWidth, window.innerHeight)
    renderer.current.setClearColor(0x70777a) // 设置背景颜色为 #70777A
    mountRef.current.appendChild(renderer.current.domElement)

    // 添加轨道控制器
    controls.current = new OrbitControls(camera.current, renderer.current.domElement)
    controls.current.enableDamping = true // 启用阻尼效果

    // 添加环境光和方向光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.current.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1).normalize()
    scene.current.add(directionalLight)

    // 添加点光源以减少阴影
    const pointLight1 = new THREE.PointLight(0xffffff, 0.6)
    pointLight1.position.set(-10, 10, 10)
    scene.current.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xffffff, 0.6)
    pointLight2.position.set(10, -10, -10)
    scene.current.add(pointLight2)

    const animate = () => {
      requestAnimationFrame(animate)
      if (controls.current) {
        controls.current.update() // 更新控制器
      }
      if (renderer.current && scene.current && camera.current) {
        renderer.current.render(scene.current, camera.current)
      }
    }
    animate()

    // 窗口大小调整处理
    const handleResize = () => {
      if (camera.current && renderer.current) {
        camera.current.aspect = window.innerWidth / window.innerHeight
        camera.current.updateProjectionMatrix()
        renderer.current.setSize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (selectedFile && scene.current) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const contents = event.target?.result
        if (!contents) {
          console.error('Error reading file')
          return
        }

        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()

        let geometry: THREE.BufferGeometry
        let loader: any
        if (fileExtension === 'ply') {
          if (typeof contents === 'string') {
            console.error('PLYLoader expects ArrayBuffer')
            return
          }
          loader = new PLYLoader()
          geometry = loader.parse(contents as ArrayBuffer)
        } else if (fileExtension === 'stl') {
          loader = new STLLoader()
          geometry = loader.parse(contents as ArrayBuffer)
        } else {
          console.error('Unsupported file format')
          return
        }

        geometry.computeVertexNormals()
        const material = new THREE.MeshStandardMaterial({ color: 0x5090c2 })
        const newMesh = new THREE.Mesh(geometry, material)

        if (mesh.current) {
          scene.current?.remove(mesh.current)
        }

        mesh.current = newMesh
        scene.current.add(newMesh)

        // 计算包围盒并调整相机位置
        const boundingBox = new THREE.Box3().setFromObject(newMesh)
        const center = boundingBox.getCenter(new THREE.Vector3())
        const size = boundingBox.getSize(new THREE.Vector3())

        const maxDim = Math.max(size.x, size.y, size.z)
        const fov = camera.current!.fov * (Math.PI / 180)
        let cameraZ = Math.abs((maxDim / 2) * Math.tan(fov * 2))

        cameraZ *= 1.5 // 增加一些缓冲

        camera.current!.position.set(center.x, center.y, cameraZ)
        camera.current!.lookAt(center)

        if (controls.current) {
          controls.current.target.set(center.x, center.y, center.z)
          controls.current.update()
        }
      }
      reader.readAsArrayBuffer(selectedFile)
    }
  }, [selectedFile])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    if (!mesh.current) return
    const geometry = mesh.current.geometry
    const colors: any[] = []
    const color = new THREE.Color()
    if (colorChanged) {
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        const x = geometry.attributes.position.getX(i)
        const y = geometry.attributes.position.getY(i)
        const z = geometry.attributes.position.getZ(i)
        if (x > 2 && y > 50 && y < 120 && z < 4 && z > -80) {
          color.set('#ED7547') // 根据强度设置颜色
        } else if (y < -65 && z < -100) {
          color.set('#ED7547') // 根据强度设置颜色
        } else {
          color.set(0x5090c2) // 默认颜色
        }
        colors.push(color.r, color.g, color.b)
      }
    } else {
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        color.set(0x5090c2) // 默认颜色
        colors.push(color.r, color.g, color.b)
      }
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    const material = new THREE.MeshStandardMaterial({ vertexColors: true })
    mesh.current.material = material
  }, [colorChanged])

  const handleColorChange = () => {
    setColorChanged(!colorChanged)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100px',
          height: '40px',
          backgroundColor: '#474747',
          color: '#ffffff',
          cursor: 'pointer',
          zIndex: 10,
        }}
        onClick={handleButtonClick}
      >
        选择文件
      </div>
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: '#474747',
          cursor: 'pointer',
          zIndex: 10,
        }}
        onClick={handleColorChange}
      >
        {colorChanged ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" viewBox="0 0 256 256">
            <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" viewBox="0 0 256 256">
            <path d="M228,175a8,8,0,0,1-10.92-3l-19-33.2A123.23,123.23,0,0,1,162,155.46l5.87,35.22a8,8,0,0,1-6.58,9.21A8.4,8.4,0,0,1,160,200a8,8,0,0,1-7.88-6.69l-5.77-34.58a133.06,133.06,0,0,1-36.68,0l-5.77,34.58A8,8,0,0,1,96,200a8.4,8.4,0,0,1-1.32-.11,8,8,0,0,1-6.58-9.21L94,155.46a123.23,123.23,0,0,1-36.06-16.69L39,172A8,8,0,1,1,25.06,164l20-35a153.47,153.47,0,0,1-19.3-20A8,8,0,1,1,38.22,99c16.6,20.54,45.64,45,89.78,45s73.18-24.49,89.78-45A8,8,0,1,1,230.22,109a153.47,153.47,0,0,1-19.3,20l20,35A8,8,0,0,1,228,175Z"></path>
          </svg>
        )}
      </div>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}></div>
    </div>
  )
}

export default MyThreeJSComponent
