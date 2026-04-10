import { useEffect, useRef } from 'react'

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  'input',
  'textarea',
  'select',
  'summary',
  '.title',
  '.nav-elem',
  '[data-cursor="interactive"]'
].join(', ')

function CustomCursor() {
  const orbRef = useRef(null)
  const trailRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return undefined
    }

    const orb = orbRef.current
    const trail = trailRef.current
    const particles = particlesRef.current.filter(Boolean)

    if (!orb || !trail || particles.length === 0) {
      return undefined
    }

    const state = {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      orbX: window.innerWidth / 2,
      orbY: window.innerHeight / 2,
      trailX: window.innerWidth / 2,
      trailY: window.innerHeight / 2,
      velocity: 0,
      lastMouseX: window.innerWidth / 2,
      lastMouseY: window.innerHeight / 2,
      isVisible: false,
      isInteractive: false,
      isPressed: false,
      frameId: 0
    }

    document.documentElement.classList.add('has-custom-cursor')

    const setInteractiveState = (value) => {
      state.isInteractive = value
      document.documentElement.classList.toggle('cursor-hovering', value)
    }

    const handleMove = (event) => {
      const deltaX = event.clientX - state.lastMouseX
      const deltaY = event.clientY - state.lastMouseY

      state.mouseX = event.clientX
      state.mouseY = event.clientY
      state.velocity = Math.min(Math.hypot(deltaX, deltaY), 60)
      state.lastMouseX = event.clientX
      state.lastMouseY = event.clientY

      if (!state.isVisible) {
        state.isVisible = true
        document.documentElement.classList.add('cursor-visible')
      }
    }

    const handleLeaveViewport = () => {
      state.isVisible = false
      document.documentElement.classList.remove('cursor-visible')
      setInteractiveState(false)
    }

    const handleDown = () => {
      state.isPressed = true
      document.documentElement.classList.add('cursor-pressed')
    }

    const handleUp = () => {
      state.isPressed = false
      document.documentElement.classList.remove('cursor-pressed')
    }

    const handleOver = (event) => {
      const interactiveTarget = event.target instanceof Element
        ? event.target.closest(INTERACTIVE_SELECTOR)
        : null

      setInteractiveState(Boolean(interactiveTarget))
    }

    const handleOut = (event) => {
      const nextTarget = event.relatedTarget instanceof Element
        ? event.relatedTarget.closest(INTERACTIVE_SELECTOR)
        : null

      if (!nextTarget) {
        setInteractiveState(false)
      }
    }

    const animate = () => {
      state.orbX += (state.mouseX - state.orbX) * 0.24
      state.orbY += (state.mouseY - state.orbY) * 0.24
      state.trailX += (state.mouseX - state.trailX) * 0.11
      state.trailY += (state.mouseY - state.trailY) * 0.11

      const speedScale = 1 + state.velocity / 110
      const stretchX = Math.min(speedScale, 1.8)
      const stretchY = Math.max(0.72, 1.08 - state.velocity / 220)
      const orbScale = state.isPressed ? 0.82 : 1
      const trailScale = state.isInteractive ? 1.35 : 1

      orb.style.transform = `translate3d(${state.orbX}px, ${state.orbY}px, 0) translate(-50%, -50%) scale(${(stretchX * orbScale).toFixed(3)}, ${(stretchY * orbScale).toFixed(3)})`
      trail.style.transform = `translate3d(${state.trailX}px, ${state.trailY}px, 0) translate(-50%, -50%) scale(${trailScale.toFixed(3)})`

      particles.forEach((particle, index) => {
        const offset = (index + 1) * 12
        const blend = 0.06 + index * 0.024
        const x = state.trailX - (state.mouseX - state.trailX) * blend
        const y = state.trailY - (state.mouseY - state.trailY) * blend + offset
        const scale = Math.max(0.45, 0.92 - index * 0.16 + state.velocity / 260)
        const opacity = Math.max(0.16, 0.42 - index * 0.08 + state.velocity / 240)

        particle.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
        particle.style.opacity = opacity.toFixed(3)
      })

      state.velocity *= 0.9
      state.frameId = window.requestAnimationFrame(animate)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerdown', handleDown)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointerleave', handleLeaveViewport)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)

    state.frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(state.frameId)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointerleave', handleLeaveViewport)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      document.documentElement.classList.remove(
        'has-custom-cursor',
        'cursor-visible',
        'cursor-hovering',
        'cursor-pressed'
      )
    }
  }, [])

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div ref={trailRef} className="custom-cursor-trail"></div>
      <div ref={orbRef} className="custom-cursor-orb"></div>
      {[0, 1, 2].map((item, index) => (
        <span
          key={item}
          ref={(element) => {
            particlesRef.current[index] = element
          }}
          className="custom-cursor-particle"
        ></span>
      ))}
    </div>
  )
}

export default CustomCursor
