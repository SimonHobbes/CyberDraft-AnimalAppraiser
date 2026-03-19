import { useState, useRef, useEffect } from 'react'

export default function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)

  if (!text) return null

  const updatePos = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      // Position above the icon, centered
      let left = rect.left + rect.width / 2
      const top = rect.top - 8

      // Prevent horizontal overflow (popup max is ~320px)
      const maxW = window.innerWidth
      if (left - 160 < 10) left = 170
      if (left + 160 > maxW - 10) left = maxW - 170

      setPos({ top, left })
    }
  }

  return (
    <span className="tooltip-wrapper">
      <button
        ref={btnRef}
        type="button"
        className="info-icon"
        onMouseEnter={() => { updatePos(); setShow(true) }}
        onMouseLeave={() => setShow(false)}
        onClick={() => { updatePos(); setShow(!show) }}
        aria-label="提示信息"
      >
        !
      </button>
      {show && (
        <span
          className="info-popup"
          role="tooltip"
          style={{
            position: 'fixed',
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {text}
        </span>
      )}
    </span>
  )
}
