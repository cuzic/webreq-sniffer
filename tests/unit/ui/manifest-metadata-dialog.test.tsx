/**
 * Manifest Metadata Dialog Tests
 * TDD for displaying parsed manifest information
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManifestMetadataDialog } from '@/popup/components/ManifestMetadataDialog';
import type { ManifestMetadata } from '@/types';

// Mock fetchAndParseManifest
vi.mock('@/lib/manifest-parser', () => ({
  fetchAndParseManifest: vi.fn(),
}));

import { fetchAndParseManifest } from '@/lib/manifest-parser';

describe('ManifestMetadataDialog', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock to prevent unmocked calls
    vi.mocked(fetchAndParseManifest).mockResolvedValue(null);
  });

  const mockHLSMetadata: ManifestMetadata = {
    type: 'hls',
    title: 'Test Video Stream',
    targetDuration: 10,
    variants: [
      {
        url: '720p.m3u8',
        bandwidth: 2500000,
        resolution: '1280x720',
        label: '720p',
        codecs: 'avc1.64001f,mp4a.40.2',
      },
      {
        url: '1080p.m3u8',
        bandwidth: 5000000,
        resolution: '1920x1080',
        label: '1080p',
        codecs: 'avc1.640028,mp4a.40.2',
        frameRate: 30,
      },
    ],
  };

  const mockDASHMetadata: ManifestMetadata = {
    type: 'dash',
    title: 'DASH Stream',
    segmentPattern: 'segment_$Number$.m4s',
    variants: [
      {
        url: 'video_720p',
        bandwidth: 3000000,
        resolution: '1280x720',
        label: '720p',
        codecs: 'avc1.4d401f',
      },
    ],
  };

  describe('Dialog Display', () => {
    it('should not render when closed', () => {
      render(<ManifestMetadataDialog url="" open={false} onOpenChange={() => {}} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog when open', () => {
      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display manifest URL in dialog title', () => {
      render(
        <ManifestMetadataDialog
          url="https://example.com/video/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(screen.getByText(/master\.m3u8/)).toBeInTheDocument();
    });

    it('should call onOpenChange when close button clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while fetching', async () => {
      vi.mocked(fetchAndParseManifest).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });
    });

    it('should fetch manifest when dialog opens', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(fetchAndParseManifest).toHaveBeenCalledWith('https://example.com/master.m3u8');
      });
    });
  });

  describe('HLS Metadata Display', () => {
    it('should display HLS manifest type', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/HLS/i)).toBeInTheDocument();
      });
    });

    it('should display title when available', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Video Stream')).toBeInTheDocument();
      });
    });

    it('should display target duration', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/10.*seconds/i)).toBeInTheDocument();
      });
    });

    it('should display variant count', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/stream variants \(2\)/i)).toBeInTheDocument();
      });
    });

    it('should display variant details in a table', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        // Check for 720p variant
        expect(screen.getByText('720p')).toBeInTheDocument();
        expect(screen.getByText('1280x720')).toBeInTheDocument();
        expect(screen.getByText('2.5 Mbps')).toBeInTheDocument();

        // Check for 1080p variant
        expect(screen.getByText('1080p')).toBeInTheDocument();
        expect(screen.getByText('1920x1080')).toBeInTheDocument();
        expect(screen.getByText('5.0 Mbps')).toBeInTheDocument();
      });
    });

    it('should display codecs when available', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/avc1\.64001f/)).toBeInTheDocument();
      });
    });

    it('should display frame rate when available', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/30.*fps/i)).toBeInTheDocument();
      });
    });
  });

  describe('DASH Metadata Display', () => {
    it('should display DASH manifest type', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockDASHMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/manifest.mpd"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('DASH (MPEG-DASH)')).toBeInTheDocument();
      });
    });

    it('should display segment pattern', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockDASHMetadata);

      render(
        <ManifestMetadataDialog
          url="https://example.com/manifest.mpd"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/segment_\$Number\$\.m4s/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      vi.mocked(fetchAndParseManifest).mockRejectedValue(new Error('Network error'));

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/error.*loading/i)).toBeInTheDocument();
      });
    });

    it('should display message when no metadata returned', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(null);

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/no.*metadata/i)).toBeInTheDocument();
      });
    });

    it('should handle manifest without variants', async () => {
      const metadataWithoutVariants: ManifestMetadata = {
        type: 'hls',
      };

      vi.mocked(fetchAndParseManifest).mockResolvedValue(metadataWithoutVariants);

      render(
        <ManifestMetadataDialog
          url="https://example.com/media.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/no.*variant.*streams/i)).toBeInTheDocument();
      });
    });
  });

  describe('Interaction', () => {
    it('should refetch when URL changes', async () => {
      vi.mocked(fetchAndParseManifest).mockResolvedValue(mockHLSMetadata);

      const { rerender } = render(
        <ManifestMetadataDialog
          url="https://example.com/video1.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(fetchAndParseManifest).toHaveBeenCalledWith('https://example.com/video1.m3u8');
      });

      // Change URL
      rerender(
        <ManifestMetadataDialog
          url="https://example.com/video2.m3u8"
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(fetchAndParseManifest).toHaveBeenCalledWith('https://example.com/video2.m3u8');
      });
    });

    it('should not fetch when dialog is closed', () => {
      vi.mocked(fetchAndParseManifest).mockClear();

      render(
        <ManifestMetadataDialog
          url="https://example.com/master.m3u8"
          open={false}
          onOpenChange={() => {}}
        />
      );

      expect(fetchAndParseManifest).not.toHaveBeenCalled();
    });
  });
});
