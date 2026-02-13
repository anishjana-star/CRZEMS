import React from 'react';

const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`p-4 border rounded bg-white shadow-sm ${className}`}>
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
