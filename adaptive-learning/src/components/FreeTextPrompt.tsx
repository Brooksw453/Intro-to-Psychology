'use client';

import { useState } from 'react';
import type { FreeTextPrompt as FreeTextPromptType } from '@/lib/types';

interface FreeTextPromptProps {
  prompt: FreeTextPromptType;
  chapterId: number;
  sectionId: string;
  onResult: (passed: boolean, score: number) => void;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function FreeTextPrompt({
  prompt,
  chapterId,
  sectionId,
  onResult,
}: FreeTextPromptProps) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(response);
  const meetsMinimum = wordCount >= prompt.minWords;
  const passed = evaluation ? evaluation.score >= 70 : false;

  async function handleSubmit() {
    if (!meetsMinimum) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/free-text/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          sectionId,
          promptId: prompt.id,
          responseText: response,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setEvaluation(data.evaluation);
      setLoading(false);
    } catch (err) {
      setError('Failed to evaluate response. Please try again.');
      setLoading(false);
      console.error(err);
    }
  }

  function handleContinue() {
    if (evaluation) {
      onResult(passed, evaluation.score);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Written Response
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Demonstrate your understanding by responding to the prompt below.
          Your response will be evaluated by AI. You need 70% or higher to proceed.
        </p>
      </div>

      {/* Prompt */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-5">
        <p className="text-indigo-900 dark:text-indigo-200 leading-relaxed">{prompt.prompt}</p>
        <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
          Minimum {prompt.minWords} words required.
        </p>
      </div>

      {/* Response textarea */}
      <div>
        <label htmlFor="free-text-response" className="sr-only">Your written response</label>
        <textarea
          id="free-text-response"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={!!evaluation}
          rows={8}
          aria-describedby="word-count"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-600 dark:disabled:text-gray-400 resize-y text-gray-900 dark:text-white dark:bg-gray-700 dark:placeholder-gray-400 text-base sm:text-sm"
          placeholder="Type your response here..."
        />
        <div className="flex justify-between mt-2">
          <span id="word-count" className={`text-sm ${meetsMinimum ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {wordCount} word{wordCount !== 1 ? 's' : ''}
            {!meetsMinimum && ` (${prompt.minWords - wordCount} more needed)`}
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      {!evaluation && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!meetsMinimum || loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Evaluating...
              </span>
            ) : (
              'Submit for Evaluation'
            )}
          </button>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div role="status" aria-live="polite" className={`rounded-lg border p-6 ${
          passed ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">
              {passed ? '✅ Well done!' : '📝 Needs improvement'}
            </h4>
            <span className={`text-2xl font-bold ${
              passed ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'
            }`}>
              {evaluation.score}%
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">{evaluation.feedback}</p>

          {evaluation.strengths.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Strengths:</h5>
              <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-400 space-y-1">
                {evaluation.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.improvements.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">Areas for improvement:</h5>
              <ul className="list-disc list-inside text-sm text-orange-700 dark:text-orange-400 space-y-1">
                {evaluation.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            {passed ? (
              <button
                onClick={handleContinue}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Complete Section
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEvaluation(null);
                    setError(null);
                  }}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  Revise & Resubmit
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
