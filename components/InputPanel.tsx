
import React from 'react';
import type { ApiImage } from '../types';
import { ImageUpload } from './ImageUpload';
import { SparklesIcon } from './icons/SparklesIcon';

interface InputPanelProps {
  pdfText: string;
  setPdfText: (text: string) => void;
  images: ApiImage[];
  setImages: (images: ApiImage[]) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  pdfText,
  setPdfText,
  images,
  setImages,
  onAnalyze,
  isLoading,
}) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col space-y-6">
      <div>
        <label htmlFor="pdf-text" className="block text-sm font-medium text-gray-300 mb-2">
          Paste Text from PDF
        </label>
        <textarea
          id="pdf-text"
          rows={12}
          className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 placeholder-gray-500"
          placeholder="Paste a large section of text from your PDF document here for analysis..."
          value={pdfText}
          onChange={(e) => setPdfText(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-2">For best results, provide as much relevant text as possible.</p>
      </div>

      <ImageUpload images={images} setImages={setImages} disabled={isLoading} />

      <button
        onClick={onAnalyze}
        disabled={isLoading || (!pdfText.trim() && images.length === 0)}
        className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Analyze Document
          </>
        )}
      </button>
    </div>
  );
};
