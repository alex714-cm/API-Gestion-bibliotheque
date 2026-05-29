import React from 'react';
import './JButton.css'; 

export default function JButton({ 
  children, 
  type = "button", 
  variant = "primary", 
  className = "", 
  loading = false, 
  icon = null,
  onClick,
  ...props 
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className} shadow-sm d-inline-flex align-items-center justify-content-center gap-2 j-button ${loading ? 'j-button-loading' : ''}`}
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Traitement...</span>
        </>
      ) : (
        <>
          {icon && <i className={`bi bi-${icon}`}></i>}
          {children}
        </>
      )}
    </button>
  );
}
