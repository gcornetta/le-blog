import readingTime from 'reading-time';

export function computePostMetadata(content) {
  const stats = readingTime(content);

   // Split by double newlines — rough way to find paragraphs
  const blocks = content.split(/\n{2,}/);

  // Find the first block that is:
  // - not a heading
  // - not a list
  // - not a blockquote
  // - not a code block
  const firstParagraph = blocks.find(block => {
    const trimmed = block.trim();
    return (
      trimmed &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('- ') &&
      !trimmed.startsWith('* ') &&
      !trimmed.startsWith('>') &&
      !trimmed.startsWith('```')
    );
  }) || '';

  // Clean markdown symbols in that paragraph
  const cleanExcerpt = firstParagraph
    .replace(/[*_`~[\]()>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const excerpt = cleanExcerpt.length < 160
    ? cleanExcerpt + '...'
    : cleanExcerpt.slice(0, 160).trim() + '...';

  return {
    readingTime: Math.max(1, Math.ceil(stats.minutes)) + ' min read',
    excerpt,
  };
}