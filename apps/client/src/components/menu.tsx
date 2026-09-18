// components/menu.tsx
import "./menu.css"

export function MenuDrawer({ open, onClose, onShowHelp, onShowScoring }: { 
  open: boolean; 
  onClose: () => void;
  onShowHelp: () => void;
  onShowScoring: () => void;
}) {
  return (
    <>
      <div className={`menu-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`menu-drawer ${open ? "open" : ""}`}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Menu</h2>
        <button className="button-menu-item" onClick={onShowHelp}>How to play</button>
        <button className="button-menu-item" onClick={onShowScoring}>Scoring</button>
      </div>
    </>
  )
}