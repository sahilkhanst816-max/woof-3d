import React, { useEffect, useRef } from 'react'
import * as THREE from "three"
import { useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture, useAnimations } from '@react-three/drei'
import gsap from "gsap";
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger)

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const Dog = ({ isMobile = false }) => {

    const model = useGLTF(asset("/models/dog.drc.glb"))

    const { camera, gl, size } = useThree()

    useEffect(() => {
        // Camera and renderer adjustments based on size / mobile
        if (!camera) return

        // Move camera further back to avoid any perceived zoom when scene moves
        if (size.width <= 768 || isMobile) {
            camera.position.set(0, 0, 2.0)
            camera.fov = 60
            gl.setPixelRatio(1)
        } else {
            camera.position.set(0, 0, 1.2)
            camera.fov = 50
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
        }
        camera.updateProjectionMatrix()

        gl.toneMapping = THREE.ReinhardToneMapping
        try {
          gl.outputColorSpace = THREE.SRGBColorSpace
        } catch (e) {}
    }, [camera, gl, size.width, isMobile])

    const { actions } = useAnimations(model.animations, model.scene)

    useEffect(() => {
        actions["Take 001"]?.play()
    }, [actions])



    const [normalMap] = (useTexture([asset("/dog_normals.jpg"),]))
        .map(texture => {
            texture.flipY = false
            texture.colorSpace = THREE.SRGBColorSpace
            return texture
        })

    const [branchMap, branchNormalMap] = (useTexture([asset("/branches_diffuse.jpeg"), asset("/branches_normals.jpeg")]))
        .map(texture => {
            texture.colorSpace = THREE.SRGBColorSpace
            return texture
        })

    const [
        mat1,
        mat2,
        mat3,
        mat4,
        mat5,
        mat6,
        mat7,
        mat8,
        mat9,
        mat10,
        mat11,
        mat12,
        mat13,
        mat14,
        mat15,
        mat16,
        mat17,
        mat18,
        mat19,
        mat20
    ] = (useTexture([
        asset("/matcap/mat-1.png"),
        asset("/matcap/mat-2.png"),
        asset("/matcap/mat-3.png"),
        asset("/matcap/mat-4.png"),
        asset("/matcap/mat-5.png"),
        asset("/matcap/mat-6.png"),
        asset("/matcap/mat-7.png"),
        asset("/matcap/mat-8.png"),
        asset("/matcap/mat-9.png"),
        asset("/matcap/mat-10.png"),
        asset("/matcap/mat-11.png"),
        asset("/matcap/mat-12.png"),
        asset("/matcap/mat-13.png"),
        asset("/matcap/mat-14.png"),
        asset("/matcap/mat-15.png"),
        asset("/matcap/mat-16.png"),
        asset("/matcap/mat-17.png"),
        asset("/matcap/mat-18.png"),
        asset("/matcap/mat-19.png"),
        asset("/matcap/mat-20.png"),
    ])).map(texture => {
        texture.colorSpace = THREE.SRGBColorSpace
        return texture
    })

    const material = useRef({
        uMatcap1: { value: mat19 },
        uMatcap2: { value: mat2 },
        uProgress: { value: 1.0 }
    })

    // Use simpler materials on mobile for performance
    const dogMaterial = isMobile
        ? new THREE.MeshStandardMaterial({ metalness: 0.2, roughness: 0.8 })
        : new THREE.MeshMatcapMaterial({ normalMap: normalMap, matcap: mat2 })

    const branchMaterial = isMobile
        ? new THREE.MeshStandardMaterial({ map: branchMap, normalMap: branchNormalMap })
        : new THREE.MeshMatcapMaterial({ normalMap: branchNormalMap, map: branchMap })

    function onBeforeCompile(shader) {
        shader.uniforms.uMatcapTexture1 = material.current.uMatcap1
        shader.uniforms.uMatcapTexture2 = material.current.uMatcap2
        shader.uniforms.uProgress = material.current.uProgress

        // Store reference to shader uniforms for GSAP animation

        shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `
        )

        shader.fragmentShader = shader.fragmentShader.replace(
            "vec4 matcapColor = texture2D( matcap, uv );",
            `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `
        )
    }

    dogMaterial.onBeforeCompile = onBeforeCompile

    model.scene.traverse((child) => {
        if (child.name.includes("DOG")) {
            child.material = dogMaterial
        } else {
            child.material = branchMaterial
        }
    })

    const dogModel = useRef(model)

    // Ensure ref points to the latest model
    useEffect(() => {
        dogModel.current = model
    }, [model])
    // Set initial pose (position/rotation/scale) responsively so framing matches across screens
    useEffect(() => {
        if (!model || !model.scene) return

        if (size.width <= 768 || isMobile) {
            model.scene.position.set(0.12, -0.18, 0)
            model.scene.scale.setScalar(0.6)
            model.scene.rotation.set(0, Math.PI / 3.9, 0)
        } else if (size.width <= 1200) {
            model.scene.position.set(0.18, -0.32, 0)
            model.scene.scale.setScalar(0.75)
            model.scene.rotation.set(0, Math.PI / 3.9, 0)
        } else {
            model.scene.position.set(0.25, -0.55, 0)
            model.scene.scale.setScalar(0.85)
            model.scene.rotation.set(0, Math.PI / 3.9, 0)
        }

        model.scene.updateMatrixWorld()
    }, [model, size.width, isMobile])


    useGSAP(() => {

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#section-1",
                endTrigger: "#section-4",
                start: "top top",
                end: "bottom bottom",
                scrub: true
            }
        })

        const p = () => dogModel.current?.scene?.position
        const r = () => dogModel.current?.scene?.rotation
        if (!p() || !r()) return

        const zMove1 = (size.width <= 768 || isMobile) ? 0.5 : 0.75
        const yMove1 = (size.width <= 768 || isMobile) ? 0.06 : 0.1
        const xMove = (size.width <= 768 || isMobile) ? 0.25 : 0.5
        const zMove2 = (size.width <= 768 || isMobile) ? 0.4 : 0.8

        // compute fresh references at timeline execution time
        tl
            .to(p(), { z: p().z - zMove1, y: p().y + yMove1 })
            .to(r(), { x: r().x + (Math.PI / 15) })
            .to(r(), { y: r().y - Math.PI }, "third")
            .to(p(), { x: p().x - xMove, z: p().z + 0.6, y: p().y - 0.05 }, "third")
            .to(p(), { z: p().z - zMove2 })
            .to(r(), { x: r().x - (Math.PI / 15), y: r().y + (Math.PI / 2) })

    }, [size.width, isMobile])

    useEffect(() => {

        document.querySelector(`.title[img-title="tomorrowland"]`).addEventListener("mouseenter", () => {
            material.current.uMatcap1.value = mat19
            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.3,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        })
        document.querySelector(`.title[img-title="navy-pier"]`).addEventListener("mouseenter", () => {

            material.current.uMatcap1.value = mat8

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.3,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        })
        document.querySelector(`.title[img-title="msi-chicago"]`).addEventListener("mouseenter", () => {

            material.current.uMatcap1.value = mat9

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.3,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        })
        document.querySelector(`.title[img-title="phone"]`).addEventListener("mouseenter", () => {

            material.current.uMatcap1.value = mat12

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.3,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        })
        document.querySelector(`.title[img-title="kikk"]`).addEventListener("mouseenter", () => {

            material.current.uMatcap1.value = mat10

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.3,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        })
        document.querySelector(`.title[img-title="kennedy"]`).addEventListener("mouseenter", () => {

            material.current.uMatcap1.value = mat8

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.3,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        })
        document.querySelector(`.title[img-title="opera"]`).addEventListener("mouseenter", () => {

            material.current.uMatcap1.value = mat13

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.3,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        })
        document.querySelector(`.titles`).addEventListener("mouseleave", () => {

            material.current.uMatcap1.value = mat2

            gsap.to(material.current.uProgress, {
                value: 0.0,
                duration: 0.3,
                onComplete: () => {
                    material.current.uMatcap2.value = material.current.uMatcap1.value
                    material.current.uProgress.value = 1.0
                }
            })
        })

    }, [])


    return (
        <>
            <primitive
                object={model.scene}
                position={[0.15, -0.4, 0]}
                rotation={[0, Math.PI / 3.9, 0]}
                scale={isMobile ? 0.6 : 0.85}
            />
            <directionalLight position={[0, 5, 5]} color={0xFFFFFF} intensity={10} />
        </>
    )
}

export default Dog
