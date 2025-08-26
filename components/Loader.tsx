import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center m-auto text-center p-4">
      <style>
        {`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #22d3ee; } /* cyan-400 */
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-typing {
          animation: typing 2.5s steps(20, end) forwards, blink-caret .75s step-end infinite;
          white-space: nowrap;
          overflow: hidden;
          border-right: .15em solid #22d3ee; /* a blinking cursor */
        }
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 2.5s forwards;
          opacity: 0;
        }
        `}
      </style>
      <div className="font-mono text-2xl md:text-3xl font-bold text-gray-300">
        <h2 className="animate-typing">Glock..... Glock.....</h2>
      </div>
      <p className="mt-4 text-lg text-cyan-400 animate-fade-in-delay">
        Something's Happening
      </p>
    </div>
  );
};
