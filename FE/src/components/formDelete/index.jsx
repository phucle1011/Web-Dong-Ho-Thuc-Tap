import React from 'react';
import ReactDOM from 'react-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function FormDelete({ isOpen, onClose, onConfirm, message, idToDelete }) {
  if (!isOpen) return null;
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };
  const boxStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
    maxWidth: '28rem',
    width: '90%',
    textAlign: 'center',
  };
  const btnBase = {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    color: 'white',
  };

  return ReactDOM.createPortal(
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <FaExclamationTriangle
  className="block mx-auto mb-2 text-red-600"
  style={{ fontSize: '2.5rem' }}
/>

        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600 }}>
          Xác nhận xóa
        </h3>
        <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
          {message || 'Bạn có chắc chắn muốn xóa mục này?'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onConfirm(idToDelete)}
            style={{ ...btnBase, backgroundColor: '#dc2626' }}
          >
            Xóa
          </button>
          <button
            onClick={onClose}
            style={{ ...btnBase, backgroundColor: '#6b7280' }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}
