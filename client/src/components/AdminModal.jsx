import '../styles/AdminModal.css';
export default function AdminModal({ title, children, onClose }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}