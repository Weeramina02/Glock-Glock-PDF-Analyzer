import React from 'react';
import type { AnalysisResult } from '../types';
import { Loader } from './Loader';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ResultPanelProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  onGenerateMore: () => void;
  isGeneratingMore: boolean;
}

const WelcomeMessage: React.FC = () => (
    <div className="text-center p-8">
        <BookOpenIcon className="w-16 h-16 mx-auto text-gray-600" />
        <h3 className="mt-4 text-xl font-semibold text-gray-400">Analysis Results</h3>
        <p className="mt-2 text-gray-500">Your document summary, generated questions, and web references will appear here once the analysis is complete.</p>
    </div>
);

const renderSummary = (text: string) => {
  if (!text) return null;
  // Split by the bold markdown syntax.
  const parts = text.split('**');
  return parts.map((part, index) => {
    // Every odd-indexed part is a "bolded heading"
    if (index % 2 === 1) {
      return (
        <strong key={index} className="text-cyan-300 font-semibold block mt-4 first:mt-0 mb-1">
          {part}
        </strong>
      );
    }
    // Regular text parts
    return part;
  });
};


export const ResultPanel: React.FC<ResultPanelProps> = ({ result, isLoading, error, onGenerateMore, isGeneratingMore }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[500px] flex flex-col">
      {isLoading && <Loader />}
      
      {error && !isLoading && (
        <div className="text-center text-red-400 m-auto p-4 bg-red-900/20 rounded-lg">
          <h3 className="font-bold text-lg">Analysis Failed</h3>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && !result && <WelcomeMessage />}

      {result && !isLoading && !error && (
        <div className="animate-fade-in space-y-8">
          {/* Summary Section */}
          <div>
            <h3 className="text-xl font-semibold text-cyan-400 flex items-center mb-3">
              <BookOpenIcon className="w-6 h-6 mr-2" />
              Summary
            </h3>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              {renderSummary(result.summary)}
            </div>
          </div>

          {/* Questions Section */}
          {result.questions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 flex items-center mb-3">
                <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
                Generated Questions
              </h3>
              <ul className="space-y-4">
                {result.questions.map((q, i) => (
                  <li key={i} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 whitespace-pre-wrap">{q}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <button
                  onClick={onGenerateMore}
                  disabled={isGeneratingMore}
                  className="w-full flex items-center justify-center bg-cyan-600/80 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                      Generate More Questions
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Web References Section */}
          {result.references.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 flex items-center mb-3">
                <LinkIcon className="w-6 h-6 mr-2" />
                Web References
              </h3>
              <div className="space-y-2">
                {result.references.map((ref, i) => (
                  <a
                    key={i}
                    href={ref.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-900/50 p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <p className="text-cyan-400 font-medium truncate">{ref.title}</p>
                    <p className="text-gray-500 text-sm truncate">{ref.uri}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
