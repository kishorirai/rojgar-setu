import React from 'react';

const Loader = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center">
    <div className="text-center">
      <svg className="mb-4" width="64" height="64" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#3b82f6" style={{display: 'block', margin: '0 auto'}}>
        <g fill="none" fillRule="evenodd" strokeWidth="4">
          <path d="M42 22c0-11.046-8.954-20-20-20" strokeLinecap="round">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 22 22"
              to="360 22 22"
              dur="1s"
              repeatCount="indefinite" />
          </path>
        </g>
      </svg>
      <p className="text-gray-600 font-medium text-lg">{message}</p>
    </div>
  </div>
);

export default Loader; 