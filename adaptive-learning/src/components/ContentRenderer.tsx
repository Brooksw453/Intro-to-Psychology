'use client';

import type { SectionContent } from '@/lib/types';
import { renderMarkdown } from '@/lib/renderMarkdown';

interface ContentRendererProps {
  section: SectionContent;
  onAskQuestion?: (blockTitle: string, blockBody: string) => void;
  /** Index of the content block currently being read aloud (offset by 2 for title + objectives) */
  highlightBlockIndex?: number;
}

export default function ContentRenderer({ section, onAskQuestion, highlightBlockIndex }: ContentRendererProps) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="text-sm font-medium text-blue-600 mb-1">
          Section {section.sectionId}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
      </div>

      {/* Learning Objectives */}
      <div className={`bg-blue-50 dark:bg-blue-900/30 border rounded-lg p-5 transition-all duration-300 ${highlightBlockIndex === 1 ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-blue-200 dark:border-blue-800'}`}>
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide mb-3">
          After this section, you should be able to:
        </h3>
        <ul className="space-y-2">
          {section.learningObjectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-200">
              <svg className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* Content Blocks */}
      {section.contentBlocks.map((block, i) => {
        const ttsIndex = i + 2; // offset: 0=title, 1=objectives, 2+=content blocks
        const isHighlighted = highlightBlockIndex === ttsIndex;
        return (
        <div key={i} className={`transition-all duration-300 rounded-lg ${isHighlighted ? 'ring-2 ring-blue-300 dark:ring-blue-700 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
          <div className={block.type === 'summary' ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6' : ''}>
            {block.title && (
              <h3 className={`text-xl font-semibold mb-3 ${
                block.type === 'summary' ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'
              }`}>
                {block.type === 'summary' ? '📋 Summary' : block.title}
              </h3>
            )}
            {!block.title && block.type === 'summary' && (
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">📋 Summary</h3>
            )}
            <div className="max-w-full overflow-hidden [&_pre]:overflow-x-auto [&_code]:break-words [&_table]:block [&_table]:overflow-x-auto [&_img]:max-w-full">{renderMarkdown(block.body)}</div>
          </div>

          {/* Ask about this concept button + section divider */}
          {block.type === 'concept' && block.title && onAskQuestion && (
            <div className="mt-4 mb-2">
              <button
                onClick={() => onAskQuestion(block.title!, block.body)}
                className="inline-flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 bg-green-100 dark:bg-green-900/40 hover:bg-green-200 dark:hover:bg-green-900/60 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 rounded-full border border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600 transition-colors shadow-sm"
                title="Ask about this concept"
                aria-label="Ask about this concept"
              >
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </button>
              <hr className="mt-4 border-gray-200 dark:border-gray-700" />
            </div>
          )}
        </div>
        );
      })}

      {/* Key Terms */}
      <div className={`bg-amber-50 dark:bg-amber-900/30 border rounded-lg p-6 transition-all duration-300 ${highlightBlockIndex === section.contentBlocks.length + 2 ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-200 dark:ring-amber-800' : 'border-amber-200 dark:border-amber-800'}`}>
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300 mb-4">
          📖 Key Terms
        </h3>
        <dl className="grid gap-3">
          {section.keyTerms.map((term, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:gap-2">
              <dt className="font-semibold text-amber-900 dark:text-amber-300 sm:min-w-[180px] flex-shrink-0">
                {term.term}
              </dt>
              <dd className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                {term.definition}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
