'use client';

import { useMemo, useEffect } from 'react';
import { useTextToSpeech, type TTSBlock, type TTSMediaMetadata } from '@/hooks/useTextToSpeech';
import { stripMarkdown } from '@/lib/stripMarkdown';
import { courseConfig } from '@/lib/course.config';
import type { SectionContent } from '@/lib/types';

interface TTSControllerProps {
  section: SectionContent;
  courseName?: string;
  onBlockIndexChange?: (index: number) => void;
  onChunkIndexChange?: (index: number) => void;
  onClose: () => void;
}

export default function TTSController({ section, courseName, onBlockIndexChange, onChunkIndexChange, onClose }: TTSControllerProps) {
  const blocks: TTSBlock[] = useMemo(() => {
    const result: TTSBlock[] = [];

    // Section title
    result.push({
      label: section.title,
      text: `Section ${section.sectionId}: ${section.title}`,
    });

    // Learning objectives
    if (section.learningObjectives.length > 0) {
      result.push({
        label: 'Learning Objectives',
        text: 'Learning objectives: ' + section.learningObjectives.join('. ') + '.',
      });
    }

    // Content blocks
    for (const block of section.contentBlocks) {
      const title = block.title || (block.type === 'summary' ? 'Summary' : 'Content');
      const plainBody = stripMarkdown(block.body);
      result.push({
        label: title,
        text: block.title ? `${block.title}. ${plainBody}` : plainBody,
      });
    }

    // Key terms
    if (section.keyTerms.length > 0) {
      const termsText = section.keyTerms
        .map(t => `${t.term}: ${t.definition}`)
        .join('. ');
      result.push({
        label: 'Key Terms',
        text: 'Key terms. ' + termsText,
      });
    }

    return result;
  }, [section]);

  const mediaMetadata: TTSMediaMetadata = useMemo(() => ({
    title: `${section.sectionId}: ${section.title}`,
    artist: courseName || courseConfig.title,
  }), [section, courseName]);

  const {
    isPlaying,
    isPaused,
    isSupported,
    currentBlockIndex,
    currentChunkIndex,
    totalBlocks,
    currentBlockLabel,
    play,
    pause,
    resume,
    stop,
    skipForward,
    skipBack,
    rateLabel,
    cycleRate,
  } = useTextToSpeech(blocks, mediaMetadata);

  // Notify parent of block and chunk changes for highlighting
  useEffect(() => {
    if (isPlaying) {
      onBlockIndexChange?.(currentBlockIndex);
      onChunkIndexChange?.(currentChunkIndex);
    }
  }, [currentBlockIndex, currentChunkIndex, isPlaying, onBlockIndexChange, onChunkIndexChange]);

  // Clean up on close
  function handleClose() {
    stop();
    onClose();
  }

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg px-4 py-3 safe-bottom">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        {/* Skip back */}
        <button
          onClick={skipBack}
          disabled={!isPlaying || currentBlockIndex <= 0}
          aria-label="Previous block"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => {
            if (!isPlaying) play();
            else if (isPaused) resume();
            else pause();
          }}
          aria-label={!isPlaying ? 'Play' : isPaused ? 'Resume' : 'Pause'}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
        >
          {!isPlaying || isPaused ? (
            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>

        {/* Skip forward */}
        <button
          onClick={skipForward}
          disabled={!isPlaying || currentBlockIndex >= totalBlocks - 1}
          aria-label="Next block"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Block info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {currentBlockLabel}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isPlaying ? `${currentBlockIndex + 1} of ${totalBlocks}` : `${totalBlocks} sections`}
          </div>
        </div>

        {/* Speed control */}
        <button
          onClick={cycleRate}
          aria-label={`Playback speed: ${rateLabel}`}
          className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {rateLabel}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          aria-label="Close audio player"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
