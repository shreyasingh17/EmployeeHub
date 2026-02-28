import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  it('highlights matching tokens', () => {
    const pipe = new HighlightPipe();
    const result = pipe.transform('Asha Kumar', 'asha');
    expect(result).toContain('<mark>Asha</mark>');
  });

  it('escapes html before highlighting', () => {
    const pipe = new HighlightPipe();
    const result = pipe.transform('<img src=x>', 'img');
    expect(result).toContain('&lt;<mark>img</mark> src=x&gt;');
  });
});
