import { useCallback } from 'react'
import type { TimerMode } from '../types'

function flashScreen(finishedMode: TimerMode) {
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.inset = '0'
  overlay.style.backgroundColor =
    finishedMode === 'work' ? 'rgba(255, 99, 71, 0.6)' : 'rgba(76, 175, 80, 0.6)'
  overlay.style.zIndex = '9999'
  overlay.style.pointerEvents = 'none'
  overlay.style.animation = 'flowstate-flash 1.2s ease-in-out 2'
  document.body.appendChild(overlay)
  overlay.addEventListener('animationend', () => overlay.remove())
}

function showDesktopNotification(finishedMode: TimerMode) {
  if (location.protocol === 'file:') return
  if (!('Notification' in window)) return

  const body =
    finishedMode === 'work'
      ? '作業時間が終了しました！休憩しましょう'
      : '休憩時間が終了しました！次の作業を始めましょう'

  const show = () => {
    const notification = new Notification('FlowState', {
      body,
      requireInteraction: true,
    })
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  if (Notification.permission === 'granted') {
    show()
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') show()
    })
  }
}

/**
 * F-01-4: 通知音は既存版(js/app.js)で無効化されている（`//domElements.notificationSound.play();`）ため、
 * 本バージョンも同様にデスクトップ通知と画面フラッシュのみを行う。
 */
export function useNotification() {
  const notify = useCallback((finishedMode: TimerMode) => {
    flashScreen(finishedMode)
    showDesktopNotification(finishedMode)
  }, [])

  return { notify }
}
