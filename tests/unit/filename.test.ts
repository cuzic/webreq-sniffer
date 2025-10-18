/**
 * Unit Tests for Filename Utilities
 */

import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '@/lib/filename';

describe('Filename Utilities', () => {
  describe('sanitizeFilename', () => {
    it('should remove Windows reserved characters', () => {
      expect(sanitizeFilename('file<test>.txt')).toBe('file_test.txt');
      expect(sanitizeFilename('file:name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('path/to/file.txt')).toBe('path_to_file.txt');
      expect(sanitizeFilename('path\\to\\file.txt')).toBe('path_to_file.txt');
      expect(sanitizeFilename('file|name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('file?name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('file*name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('file"name.txt')).toBe('file_name.txt');
    });

    it('should replace multiple spaces with single space then underscore', () => {
      expect(sanitizeFilename('file   name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('file  test  name.txt')).toBe('file_test_name.txt');
    });

    it('should replace spaces with underscores', () => {
      expect(sanitizeFilename('my file name.txt')).toBe('my_file_name.txt');
      expect(sanitizeFilename('video title here.mp4')).toBe('video_title_here.mp4');
    });

    it('should replace multiple consecutive underscores with single underscore', () => {
      expect(sanitizeFilename('file___name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('test____video.mp4')).toBe('test_video.mp4');
    });

    it('should remove leading dots', () => {
      expect(sanitizeFilename('.hidden')).toBe('hidden');
      expect(sanitizeFilename('...file.txt')).toBe('file.txt');
      expect(sanitizeFilename('.bashrc')).toBe('bashrc');
    });

    it('should preserve dots in extension', () => {
      expect(sanitizeFilename('file.tar.gz')).toBe('file.tar.gz');
      expect(sanitizeFilename('archive.backup.zip')).toBe('archive.backup.zip');
    });

    it('should remove leading and trailing underscores', () => {
      expect(sanitizeFilename('_file.txt')).toBe('file.txt');
      expect(sanitizeFilename('file_.txt')).toBe('file.txt');
      expect(sanitizeFilename('___file___.txt')).toBe('file.txt');
    });

    it('should trim whitespace', () => {
      expect(sanitizeFilename('  file.txt  ')).toBe('file.txt');
      expect(sanitizeFilename('\tfile.txt\n')).toBe('file.txt');
    });

    it('should return "unnamed" for empty filename', () => {
      expect(sanitizeFilename('')).toBe('unnamed');
      expect(sanitizeFilename('   ')).toBe('unnamed');
      expect(sanitizeFilename('___')).toBe('unnamed');
      expect(sanitizeFilename('...')).toBe('unnamed');
    });

    it('should enforce 255 character limit', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBe(255);
      expect(result.endsWith('.txt')).toBe(true);
    });

    it('should preserve extension when truncating long filenames', () => {
      const longName = 'video_' + 'title_'.repeat(50) + 'end.mp4';
      const result = sanitizeFilename(longName);
      expect(result.length).toBe(255);
      expect(result.endsWith('.mp4')).toBe(true);
    });

    it('should handle long filenames without extension', () => {
      const longName = 'x'.repeat(300);
      const result = sanitizeFilename(longName);
      expect(result.length).toBe(255);
    });

    it('should handle complex real-world examples', () => {
      // YouTube-style title
      expect(sanitizeFilename('How to: Use Chrome Extension API | Tutorial #1')).toBe(
        'How_to_Use_Chrome_Extension_API_Tutorial_1'
      );

      // Video title with special characters
      expect(sanitizeFilename('Movie (2024) - "The Best" [1080p].mp4')).toBe(
        'Movie_2024_-_The_Best_1080p.mp4'
      );

      // Filename with multiple issues
      expect(sanitizeFilename('  ...<>test::file||name??.txt  ')).toBe('test_file_name.txt');
    });

    it('should handle filenames with only invalid characters', () => {
      expect(sanitizeFilename('|||')).toBe('unnamed');
      expect(sanitizeFilename('<<<>>>')).toBe('unnamed');
      expect(sanitizeFilename('???***')).toBe('unnamed');
    });

    it('should handle edge cases', () => {
      expect(sanitizeFilename('a')).toBe('a');
      expect(sanitizeFilename('1.txt')).toBe('1.txt');
      expect(sanitizeFilename('_._')).toBe('unnamed');
    });
  });
});
