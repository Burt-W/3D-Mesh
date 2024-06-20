import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import * as THREE from 'three'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
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

  useEffect(() => {
    if (!mountRef.current) return

    // 初始化场景、相机和渲染器
    scene.current = new THREE.Scene()
    camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
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

    camera.current.position.z = 5

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

    // 清理
    return () => {
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
        if (typeof contents === 'string') return // PLYLoader expects ArrayBuffer

        const loader = new PLYLoader()
        const geometry = loader.parse(contents as ArrayBuffer)
        geometry.computeVertexNormals()
        const material = new THREE.MeshStandardMaterial({ color: 0x5090c2 })
        const newMesh = new THREE.Mesh(geometry, material)

        if (mesh.current) {
          scene.current?.remove(mesh.current)
        }

        mesh.current = newMesh
        scene.current.add(newMesh)
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

  const handleColorChange = () => {
    if (!mesh.current) return

    const geometry = mesh.current.geometry
    const colors: any[] = []
    const color = new THREE.Color()
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i)
      const y = geometry.attributes.position.getY(i)
      const z = geometry.attributes.position.getZ(i)
      if (x > 2 && y > 1) {
        color.setHSL(y / 10, 1.0, 0.5) // 根据强度设置颜色
      } else if (x < 1 && x > 0 && y > 2) {
        color.setHSL(x / 10, 1.0, 0.5) // 根据强度设置颜色
      } else if (x < 0.2 && x > 0 && y > 1 && y < 2) {
        color.setHSL(z / 10, 1.0, 0.5) // 根据强度设置颜色
      } else if (z < 0.0005 && x > 0 && y < 1) {
        color.setHSL(y / 10, 1.0, 0.5)
      } else if (z > 0.0005 && x < -2 && y > 2) {
        color.setHSL(y / 10, 1.0, 0.5)
      } else if (z < 0.0005 && x < -1 && x > -2 && y > 1.5 && y < 2) {
        color.setHSL(y / 10, 1.0, 0.5)
      } else if (z > 0.0005 && x < -1 && x > -2 && y < 0.5) {
        color.setHSL(y / 10, 1.0, 0.5)
      } else {
        color.set(0x5090c2) // 默认颜色
      }
      colors.push(color.r, color.g, color.b)
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    const material = new THREE.MeshStandardMaterial({ vertexColors: true })
    mesh.current.material = material
    setColorChanged(true)
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".ply" />
      <button onClick={handleColorChange}>Change Colors</button>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}></div>
    </div>
  )
}

export default MyThreeJSComponent
