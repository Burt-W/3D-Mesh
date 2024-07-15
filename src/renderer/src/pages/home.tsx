import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import * as THREE from 'three'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const MyThreeJSComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [difference, setDifference] = useState<boolean>(false)
  const [calibration, setCalibration] = useState<boolean>(false)
  const [extract, setExtract] = useState<boolean>(false)

  const scene = useRef<THREE.Scene | null>(null)
  const camera = useRef<THREE.PerspectiveCamera | null>(null)
  const renderer = useRef<THREE.WebGLRenderer | null>(null)
  const meshes = useRef<THREE.Mesh[]>([])
  const controls = useRef<OrbitControls | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const prevSelectedFilesCount = useRef(0)

  useEffect(() => {
    if (!mountRef.current) return

    // 初始化场景、相机和渲染器
    scene.current = new THREE.Scene()
    camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.current.position.set(0, 0, 500)

    renderer.current = new THREE.WebGLRenderer({ antialias: true })
    renderer.current.setSize(window.innerWidth, window.innerHeight)
    renderer.current.setClearColor(0x70777a) // 设置背景颜色为 #70777A
    mountRef.current.appendChild(renderer.current.domElement)

    // 添加轨道控制器
    controls.current = new OrbitControls(camera.current, renderer.current.domElement)
    controls.current.enableDamping = true // 启用阻尼效果
    controls.current.target.set(0, 0, 0)
    controls.current.update()

    // 添加坐标系
    // const axesHelper = new THREE.AxesHelper(500)
    // scene.current.add(axesHelper)

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
    if (selectedFiles.length > 0 && scene.current && prevSelectedFilesCount.current < 2) {
      prevSelectedFilesCount.current = prevSelectedFilesCount.current + 1
      selectedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const contents = event.target?.result
          if (!contents) {
            console.error('Error reading file')
            return
          }
          const fileName = file.name
          const fileExtension = file.name.split('.').pop()?.toLowerCase()
          console.log(fileName)
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
          const material = new THREE.MeshStandardMaterial({ color: 0xcecace }) // 默认颜色
          const newMesh = new THREE.Mesh(geometry, material)
          newMesh.name = file.name
          newMesh.position.set(0, 0, 0)
          if (prevSelectedFilesCount.current > 1) {
            meshes.current.forEach(async (mesh) => {
              if (mesh.name === '241408扫描.stl') {
                mesh.position.set(200, 0, 0)
              } else if (mesh.name === '241408.stl') {
                mesh.position.set(-200, 0, 0)
              }
            })
            if (fileName === '241408扫描.stl') {
              newMesh.position.set(200, 0, 0)
            } else if (fileName === '241408.stl') {
              newMesh.position.set(-200, 0, 0)
            }
          }

          scene.current?.add(newMesh)
          meshes.current.push(newMesh)

          // // 计算包围盒并调整相机位置
          // const boundingBox = new THREE.Box3().setFromObject(newMesh)
          // const center = boundingBox.getCenter(new THREE.Vector3())
          // const size = boundingBox.getSize(new THREE.Vector3())

          // const maxDim = Math.max(size.x, size.y, size.z)
          // const fov = camera.current!.fov * (Math.PI / 180)
          // let cameraZ = Math.abs((maxDim / 2) * Math.tan(fov * 2))

          // cameraZ *= 1.5 // 增加一些缓冲

          // camera.current!.position.set(100, 100, cameraZ)
          // camera.current!.lookAt(center)

          // if (controls.current) {
          //   controls.current.target.set(center.x, center.y, center.z)
          //   controls.current.update()
          // }
        }
        reader.readAsArrayBuffer(file)
      })
    }
  }, [selectedFiles])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  useEffect(() => {
    console.log(prevSelectedFilesCount.current)
    meshes.current.forEach(async (mesh) => {
      const geometry = mesh.geometry
      if (calibration) {
        mesh.position.set(0, 0, 0)

        for (let i = 0; i < geometry.attributes.position.count; i++) {
          if (mesh.name === '241408扫描.stl') {
            // color.set('#8EFB4D')
            mesh.rotation.z += (3 * Math.PI) / 4
          }
        }
      } else if (!calibration) {
        await setDifference(false)
        if (mesh.name === '241408扫描.stl') {
          mesh.position.set(200, 0, 0)
          mesh.rotation.z = 0
        } else if (mesh.name === '241408.stl') {
          mesh.position.set(-200, 0, 0)
        }
      }
    })
  }, [calibration])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    meshes.current.forEach((mesh) => {
      const geometry = mesh.geometry
      const colors: any[] = []
      const color = new THREE.Color()
      if (difference) {
        for (let i = 0; i < geometry.attributes.position.count; i++) {
          if (difference && mesh.name === '241408扫描.stl') {
            mesh.rotation.z = 0
            color.set('#8EFB4D')
          } else if (mesh.name === '241408.stl') {
            color.set('#CECACE')
          }
          colors.push(color.r, color.g, color.b)
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        const material = new THREE.MeshStandardMaterial({ vertexColors: true })
        mesh.material = material
      } else if (!difference) {
        for (let i = 0; i < geometry.attributes.position.count; i++) {
          color.set('#CECACE')
          colors.push(color.r, color.g, color.b)
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        const material = new THREE.MeshStandardMaterial({ vertexColors: true })
        mesh.material = material
      }
    })
  }, [difference])

  useEffect(() => {
    if (extract) {
      const loader = new STLLoader()
      loader.load('/tooth.stl', (geometry) => {
        geometry.computeVertexNormals()
        const material = new THREE.MeshStandardMaterial({ color: '#8EFB4D' }) // 默认颜色
        const newMesh = new THREE.Mesh(geometry, material)
        newMesh.name = 'tooth.stl'
        newMesh.position.set(0, 0, 0)
        scene.current?.add(newMesh)
        meshes.current.push(newMesh)
      })
    } else {
      meshes.current
        .filter((mesh) => mesh.name === 'tooth.stl') // 过滤出特定名称的模型
        .forEach((mesh) => {
          scene.current?.remove(mesh)
          mesh.geometry.dispose()
          mesh.material.dispose()
          meshes.current.splice(meshes.current.indexOf(mesh), 1)
        })
    }
  }, [extract])

  const handleRefreshClick = () => {
    window.location.reload()
  }

  const calibrationChange = () => {
    if (prevSelectedFilesCount.current > 1) {
      setCalibration(!calibration)
    }
  }

  const differenceChange = () => {
    if (prevSelectedFilesCount.current > 1 && calibration) {
      setDifference(!difference)
    }
  }

  const extractChange = () => {
    console.log(prevSelectedFilesCount.current)
    const hasScanMesh = meshes.current.some((mesh) => mesh.name === '241408扫描.stl')
    if (prevSelectedFilesCount.current > 0 && prevSelectedFilesCount.current < 2 && !hasScanMesh) {
      setExtract(!extract)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} multiple />
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
          top: '10px',
          left: '130px',
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
        onClick={handleRefreshClick}
      >
        重置界面
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
        onClick={calibrationChange}
        title="配准"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill={calibration ? '#00ff33' : '#ffffff'}
          viewBox="0 0 256 256"
        >
          <path d="M96,72a8,8,0,0,1,8-8A104.11,104.11,0,0,1,208,168a8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88A8,8,0,0,1,96,72ZM240,192H80V32a8,8,0,0,0-16,0V64H32a8,8,0,0,0,0,16H64V200a8,8,0,0,0,8,8H240a8,8,0,0,0,0-16Z"></path>
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: '#474747',
          cursor: 'pointer',
          zIndex: 10,
        }}
        title="差异部分渲染"
        onClick={differenceChange}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill={difference ? '#00ff33' : '#ffffff'}
          viewBox="0 0 256 256"
        >
          <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: '#474747',
          cursor: 'pointer',
          zIndex: 10,
        }}
        title="提取"
        onClick={extractChange}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill={extract ? '#00ff33' : '#ffffff'}
          viewBox="0 0 256 256"
        >
          <path d="M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,190.23a88,88,0,1,1,0-124.46A88.11,88.11,0,0,1,190.23,190.23Zm-24.57-27.89a8,8,0,0,1-11.32,11.32L128,147.31l-26.34,26.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0Zm0-56a8,8,0,0,1-11.32,11.32L128,91.31l-26.34,26.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0Z"></path>
        </svg>
      </div>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}></div>
    </div>
  )
}

export default MyThreeJSComponent
