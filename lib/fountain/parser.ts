import { JSONContent } from '@tiptap/core';

export interface FountainElement {
  type: 'scene-heading' | 'character' | 'dialogue' | 'action' | 'transition' | 'centered';
  content: string;
}

/**
 * Parses Fountain text into structured elements
 */
function parseFountainText(fountainText: string): FountainElement[] {
  const lines = fountainText.split('\n');
  const elements: FountainElement[] = [];
  let inDialogue = false;
  let currentDialogue: string[] = [];
  let currentCharacter = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';

    // Empty line
    if (!line) {
      if (inDialogue && currentDialogue.length > 0) {
        elements.push({
          type: 'dialogue',
          content: currentDialogue.join('\n'),
        });
        currentDialogue = [];
        inDialogue = false;
      }
      continue;
    }

    // Scene heading (INT./EXT. at start of line)
    if (/^(INT\.|EXT\.|INT\s|EXT\s)/i.test(line)) {
      if (inDialogue) {
        elements.push({
          type: 'dialogue',
          content: currentDialogue.join('\n'),
        });
        currentDialogue = [];
        inDialogue = false;
      }
      elements.push({
        type: 'scene-heading',
        content: line.toUpperCase(),
      });
      continue;
    }

    // Transition (ends with TO: or IN: or OUT:)
    if (/^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO|SMASH CUT|MATCH CUT|WIPE TO|IRIS):?$/i.test(line)) {
      if (inDialogue) {
        elements.push({
          type: 'dialogue',
          content: currentDialogue.join('\n'),
        });
        currentDialogue = [];
        inDialogue = false;
      }
      elements.push({
        type: 'transition',
        content: line.toUpperCase(),
      });
      continue;
    }

    // Character name (uppercase, not all caps action, and next line is dialogue)
    const isUppercase = line === line.toUpperCase() && line.length > 0;
    const isNotAction = !/^[A-Z\s]+$/.test(line) || line.length < 20;
    const nextLineIsDialogue = nextLine && nextLine.length > 0 && !nextLine.startsWith('INT.') && !nextLine.startsWith('EXT.');

    if (isUppercase && isNotAction && nextLineIsDialogue && !inDialogue) {
      if (currentDialogue.length > 0) {
        elements.push({
          type: 'dialogue',
          content: currentDialogue.join('\n'),
        });
        currentDialogue = [];
      }
      currentCharacter = line;
      elements.push({
        type: 'character',
        content: line,
      });
      inDialogue = true;
      continue;
    }

    // Dialogue (after character name, until empty line or next element)
    if (inDialogue) {
      currentDialogue.push(line);
      continue;
    }

    // Centered text (wrapped in ^)
    if (line.startsWith('^') && line.endsWith('^')) {
      elements.push({
        type: 'centered',
        content: line.slice(1, -1).trim(),
      });
      continue;
    }

    // Action/description (default)
    elements.push({
      type: 'action',
      content: line,
    });
  }

  // Handle remaining dialogue
  if (inDialogue && currentDialogue.length > 0) {
    elements.push({
      type: 'dialogue',
      content: currentDialogue.join('\n'),
    });
  }

  return elements;
}

/**
 * Converts Fountain text to Tiptap JSON
 */
export function parseFountainToTiptap(fountainText: string): JSONContent {
  const elements = parseFountainText(fountainText);
  const content: JSONContent[] = [];

  for (const element of elements) {
    switch (element.type) {
      case 'scene-heading':
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: element.content,
              marks: [{ type: 'bold' }],
            },
          ],
        });
        break;

      case 'character':
        content.push({
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            {
              type: 'text',
              text: element.content,
              marks: [{ type: 'bold' }],
            },
          ],
        });
        break;

      case 'dialogue':
        content.push({
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            {
              type: 'text',
              text: element.content,
            },
          ],
        });
        break;

      case 'transition':
        content.push({
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [
            {
              type: 'text',
              text: element.content,
              marks: [{ type: 'bold' }],
            },
          ],
        });
        break;

      case 'centered':
        content.push({
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            {
              type: 'text',
              text: element.content,
            },
          ],
        });
        break;

      case 'action':
      default:
        content.push({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: element.content,
            },
          ],
        });
        break;
    }
  }

  return {
    type: 'doc',
    content,
  };
}

/**
 * Converts Tiptap JSON back to Fountain text
 */
export function parseTiptapToFountain(tiptapJSON: JSONContent): string {
  if (!tiptapJSON.content) {
    return '';
  }

  const lines: string[] = [];

  for (const node of tiptapJSON.content) {
    const textAlign = node.attrs?.textAlign;
    const isBold = node.marks?.some((m) => m.type === 'bold');
    const text = extractText(node);

    if (!text) {
      lines.push('');
      continue;
    }

    // Scene heading (heading level 2, bold, uppercase)
    if (node.type === 'heading' && node.attrs?.level === 2 && isBold) {
      lines.push(text.toUpperCase());
      continue;
    }

    // Transition (right-aligned, bold)
    if (textAlign === 'right' && isBold) {
      lines.push(text.toUpperCase());
      continue;
    }

    // Character (center-aligned, bold, uppercase)
    if (textAlign === 'center' && isBold && text === text.toUpperCase()) {
      lines.push(text);
      continue;
    }

    // Dialogue (center-aligned, not bold)
    if (textAlign === 'center' && !isBold) {
      lines.push(text);
      continue;
    }

    // Centered text (wrapped in ^)
    if (textAlign === 'center' && !isBold && !text.includes('\n')) {
      lines.push(`^${text}^`);
      continue;
    }

    // Action/description (default)
    lines.push(text);
  }

  return lines.join('\n');
}

/**
 * Recursively extracts text from a Tiptap node
 */
function extractText(node: JSONContent): string {
  if (node.type === 'text' && node.text) {
    return node.text;
  }

  if (node.content) {
    return node.content.map(extractText).join('');
  }

  return '';
}

