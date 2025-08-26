import React, { useState, useCallback } from 'react';
import { analyzeContent, generateMoreQuestions } from './services/geminiService';
import type { AnalysisResult, ApiImage } from './types';
import { InputPanel } from './components/InputPanel';
import { ResultPanel } from './components/ResultPanel';

const App: React.FC = () => {
  const [pdfText, setPdfText] = useState<string>('');
  const [images, setImages] = useState<ApiImage[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!pdfText.trim() && images.length === 0) {
      setError('Please provide some text or at least one image to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeContent(pdfText, images);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred during analysis.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pdfText, images]);

  const handleGenerateMoreQuestions = useCallback(async () => {
    if (!result) return;

    setIsGeneratingMore(true);
    setError(null);

    try {
      const newQuestions = await generateMoreQuestions(pdfText, images, result.questions);
      setResult(prevResult => prevResult ? { ...prevResult, questions: [...prevResult.questions, ...newQuestions] } : null);
    } catch (err) {
      setError(err instanceof Error ? `Failed to generate more questions: ${err.message}` : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsGeneratingMore(false);
    }
  }, [pdfText, images, result]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Glock Glock PDF Analyzer
            </h1>
            <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
                Paste text and upload key images from your PDF to generate summaries, questions, and discover related web content.
            </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <InputPanel
            pdfText={pdfText}
            setPdfText={setPdfText}
            images={images}
            setImages={setImages}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          <ResultPanel
            result={result}
            isLoading={isLoading}
            error={error}
            onGenerateMore={handleGenerateMoreQuestions}
            isGeneratingMore={isGeneratingMore}
          />
        </div>
      </main>
      <footer className="text-center py-4 border-t border-gray-800">
        <p className="text-sm text-gray-500">
          Created by Weeramina
        </p>
      </footer>
    </div>
  );
};

export default App;