# Shared Architecture: Word and PowerPoint Add-ins

This document describes an architecture that allows the Style Manual Check tool to work as both a Microsoft Word and PowerPoint add-in, sharing as much code as possible.

## Architecture overview

```
style-manual-check/
├── src/
│   ├── core/                    # Shared rule engine (100% reusable)
│   │   ├── rules.js             # Rule definitions (existing)
│   │   ├── spellings.js         # Word dictionaries (existing)
│   │   └── checker.js           # checkText() function (extract from rules.js)
│   │
│   ├── adapters/                # Document access abstraction layer
│   │   ├── document-adapter.js  # Interface definition
│   │   ├── word-adapter.js      # Word-specific Office.js code
│   │   ├── powerpoint-adapter.js# PowerPoint-specific Office.js code
│   │   └── demo-adapter.js      # Browser demo (textarea)
│   │
│   ├── ui/                      # Shared UI components
│   │   ├── taskpane.html        # Main task pane structure
│   │   ├── taskpane.css         # Styles (from demo.html)
│   │   ├── taskpane.js          # UI logic (app-agnostic)
│   │   └── components/          # Reusable UI pieces
│   │       ├── issue-card.js
│   │       ├── summary-stats.js
│   │       └── filter-dropdown.js
│   │
│   └── app/                     # Application entry points
│       ├── word/
│       │   └── index.js         # Word add-in initialisation
│       ├── powerpoint/
│       │   └── index.js         # PowerPoint add-in initialisation
│       └── demo/
│           └── index.js         # Browser demo initialisation
│
├── manifests/
│   ├── word-manifest.xml        # Word-only manifest
│   ├── powerpoint-manifest.xml  # PowerPoint-only manifest
│   └── unified-manifest.json    # Combined manifest (optional)
│
├── demo.html                    # Browser demo (existing, update to use new structure)
├── CLAUDE.md
└── README.md
```

## Layer 1: Core rule engine (100% shared)

The existing `rules.js` and `spellings.js` require no changes. They work on plain text strings and return issue objects.

### Issue object structure

```javascript
{
  found: "organize",           // The problematic text
  suggestion: "organise",      // What to show the user
  autoFix: "organise",         // Replacement text (or null if manual fix)
  position: 145,               // Character offset in the text block
  rule: {
    id: "spelling-ize",
    name: "-ize to -ise spelling",
    category: "spelling",
    description: "Australian English uses -ise endings...",
    link: "https://www.stylemanual.gov.au/..."
  }
}
```

### checker.js (extract from rules.js)

```javascript
// src/core/checker.js

/**
 * Run all rules against a text string
 * @param {string} text - Plain text to check
 * @returns {Array} - Array of issue objects, sorted by position
 */
function checkText(text) {
  const issues = [];
  for (const rule of RULES) {
    const ruleIssues = rule.check(text);
    issues.push(...ruleIssues);
  }
  return issues.sort((a, b) => a.position - b.position);
}

/**
 * Run all rules against multiple text blocks
 * @param {Array<{id: string, text: string}>} blocks - Text blocks with IDs
 * @returns {Array} - Issues with block references
 */
function checkTextBlocks(blocks) {
  const allIssues = [];
  for (const block of blocks) {
    const issues = checkText(block.text);
    issues.forEach(issue => {
      issue.blockId = block.id;
      issue.blockText = block.text;
    });
    allIssues.push(...issues);
  }
  return allIssues;
}

export { checkText, checkTextBlocks };
```

## Layer 2: Document adapters (abstraction layer)

The adapter layer abstracts the differences between Word and PowerPoint document access.

### Interface definition

```javascript
// src/adapters/document-adapter.js

/**
 * Document Adapter Interface
 *
 * All adapters must implement these methods to provide consistent
 * document access regardless of the Office application.
 */
class DocumentAdapter {
  /**
   * Get the name of the application
   * @returns {string} - 'word', 'powerpoint', or 'demo'
   */
  getAppName() { throw new Error('Not implemented'); }

  /**
   * Extract all text blocks from the document
   * @returns {Promise<Array<TextBlock>>}
   *
   * TextBlock structure:
   * {
   *   id: string,          // Unique identifier for this block
   *   text: string,        // Plain text content
   *   type: string,        // 'paragraph', 'heading', 'shape', 'slide-title', etc.
   *   location: object,    // App-specific location data for navigation
   *   metadata: object     // Additional info (slide number, shape name, etc.)
   * }
   */
  async getTextBlocks() { throw new Error('Not implemented'); }

  /**
   * Replace text within a specific block
   * @param {string} blockId - The block to modify
   * @param {string} oldText - Text to find
   * @param {string} newText - Replacement text
   * @returns {Promise<boolean>} - Success status
   */
  async replaceInBlock(blockId, oldText, newText) { throw new Error('Not implemented'); }

  /**
   * Navigate to and highlight a specific block
   * @param {string} blockId - The block to navigate to
   * @returns {Promise<void>}
   */
  async navigateToBlock(blockId) { throw new Error('Not implemented'); }

  /**
   * Get display-friendly location string
   * @param {TextBlock} block
   * @returns {string} - e.g., "Paragraph 5" or "Slide 3, Shape 2"
   */
  getLocationString(block) { throw new Error('Not implemented'); }
}

export { DocumentAdapter };
```

### Word adapter

```javascript
// src/adapters/word-adapter.js

import { DocumentAdapter } from './document-adapter.js';

class WordAdapter extends DocumentAdapter {
  getAppName() {
    return 'word';
  }

  async getTextBlocks() {
    const blocks = [];

    await Word.run(async (context) => {
      const body = context.document.body;
      const paragraphs = body.paragraphs;
      paragraphs.load('items');
      await context.sync();

      for (let i = 0; i < paragraphs.items.length; i++) {
        const para = paragraphs.items[i];
        para.load('text,style');
        await context.sync();

        if (para.text.trim()) {
          blocks.push({
            id: `para-${i}`,
            text: para.text,
            type: para.style?.includes('Heading') ? 'heading' : 'paragraph',
            location: { paragraphIndex: i },
            metadata: { style: para.style }
          });
        }
      }
    });

    return blocks;
  }

  async replaceInBlock(blockId, oldText, newText) {
    const index = parseInt(blockId.replace('para-', ''));

    await Word.run(async (context) => {
      const paragraphs = context.document.body.paragraphs;
      paragraphs.load('items');
      await context.sync();

      const para = paragraphs.items[index];
      const searchResults = para.search(oldText, { matchCase: true });
      searchResults.load('items');
      await context.sync();

      if (searchResults.items.length > 0) {
        searchResults.items[0].insertText(newText, Word.InsertLocation.replace);
      }
      await context.sync();
    });

    return true;
  }

  async navigateToBlock(blockId) {
    const index = parseInt(blockId.replace('para-', ''));

    await Word.run(async (context) => {
      const paragraphs = context.document.body.paragraphs;
      paragraphs.load('items');
      await context.sync();

      const para = paragraphs.items[index];
      para.select();
      await context.sync();
    });
  }

  getLocationString(block) {
    if (block.type === 'heading') {
      return `Heading (${block.metadata.style})`;
    }
    return `Paragraph ${block.location.paragraphIndex + 1}`;
  }
}

export { WordAdapter };
```

### PowerPoint adapter

```javascript
// src/adapters/powerpoint-adapter.js

import { DocumentAdapter } from './document-adapter.js';

class PowerPointAdapter extends DocumentAdapter {
  getAppName() {
    return 'powerpoint';
  }

  async getTextBlocks() {
    const blocks = [];

    await PowerPoint.run(async (context) => {
      const slides = context.presentation.slides;
      slides.load('items');
      await context.sync();

      for (let slideIndex = 0; slideIndex < slides.items.length; slideIndex++) {
        const slide = slides.items[slideIndex];
        const shapes = slide.shapes;
        shapes.load('items');
        await context.sync();

        for (let shapeIndex = 0; shapeIndex < shapes.items.length; shapeIndex++) {
          const shape = shapes.items[shapeIndex];

          // Use safe method that returns null if shape has no text
          const textFrame = shape.getTextFrameOrNullObject();
          textFrame.load('hasText,textRange');
          await context.sync();

          if (!textFrame.isNullObject && textFrame.hasText) {
            textFrame.textRange.load('text');
            await context.sync();

            const text = textFrame.textRange.text;
            if (text.trim()) {
              // Load shape name for better identification
              shape.load('name,id');
              await context.sync();

              blocks.push({
                id: `slide-${slideIndex}-shape-${shapeIndex}`,
                text: text,
                type: this._inferShapeType(shape.name, shapeIndex),
                location: {
                  slideIndex: slideIndex,
                  shapeIndex: shapeIndex,
                  shapeId: shape.id
                },
                metadata: {
                  shapeName: shape.name,
                  slideNumber: slideIndex + 1
                }
              });
            }
          }
        }
      }
    });

    return blocks;
  }

  _inferShapeType(shapeName, shapeIndex) {
    const nameLower = (shapeName || '').toLowerCase();
    if (nameLower.includes('title')) return 'slide-title';
    if (nameLower.includes('subtitle')) return 'slide-subtitle';
    if (nameLower.includes('content') || nameLower.includes('text')) return 'text-box';
    if (shapeIndex === 0) return 'slide-title';  // First shape is often title
    return 'shape';
  }

  async replaceInBlock(blockId, oldText, newText) {
    const [slideIndex, shapeIndex] = this._parseBlockId(blockId);

    await PowerPoint.run(async (context) => {
      const slide = context.presentation.slides.getItemAt(slideIndex);
      const shape = slide.shapes.getItemAt(shapeIndex);
      const textFrame = shape.textFrame;
      textFrame.load('textRange');
      await context.sync();

      const textRange = textFrame.textRange;
      textRange.load('text');
      await context.sync();

      // Replace text (Office.js doesn't have find/replace, so we replace entire content)
      const updatedText = textRange.text.replace(oldText, newText);
      textRange.text = updatedText;
      await context.sync();
    });

    return true;
  }

  async navigateToBlock(blockId) {
    const [slideIndex, shapeIndex] = this._parseBlockId(blockId);

    await PowerPoint.run(async (context) => {
      const slide = context.presentation.slides.getItemAt(slideIndex);
      const shape = slide.shapes.getItemAt(shapeIndex);

      // Navigate to slide and select shape
      slide.load('id');
      await context.sync();

      // Select the shape's text
      const textRange = shape.textFrame.textRange;
      textRange.setSelected();
      await context.sync();
    });
  }

  _parseBlockId(blockId) {
    // Format: "slide-{n}-shape-{m}"
    const match = blockId.match(/slide-(\d+)-shape-(\d+)/);
    return [parseInt(match[1]), parseInt(match[2])];
  }

  getLocationString(block) {
    const slideNum = block.metadata.slideNumber;
    const type = block.type;

    if (type === 'slide-title') {
      return `Slide ${slideNum} title`;
    } else if (type === 'slide-subtitle') {
      return `Slide ${slideNum} subtitle`;
    }
    return `Slide ${slideNum}, ${block.metadata.shapeName || 'shape'}`;
  }
}

export { PowerPointAdapter };
```

### Demo adapter (for browser testing)

```javascript
// src/adapters/demo-adapter.js

import { DocumentAdapter } from './document-adapter.js';

class DemoAdapter extends DocumentAdapter {
  constructor(textareaElement) {
    super();
    this.textarea = textareaElement;
  }

  getAppName() {
    return 'demo';
  }

  async getTextBlocks() {
    const text = this.textarea.value;
    // Treat entire textarea as one block for simplicity
    // Could split by paragraphs if needed
    return [{
      id: 'demo-text',
      text: text,
      type: 'document',
      location: {},
      metadata: {}
    }];
  }

  async replaceInBlock(blockId, oldText, newText) {
    this.textarea.value = this.textarea.value.replace(oldText, newText);
    return true;
  }

  async navigateToBlock(blockId) {
    this.textarea.focus();
  }

  getLocationString(block) {
    return 'Document';
  }
}

export { DemoAdapter };
```

## Layer 3: Shared UI (taskpane)

The task pane UI is application-agnostic. It receives an adapter and uses it for all document operations.

### taskpane.js

```javascript
// src/ui/taskpane.js

import { checkTextBlocks } from '../core/checker.js';

class StyleManualTaskPane {
  constructor(adapter) {
    this.adapter = adapter;
    this.issues = [];
    this.fixedCount = 0;
    this.currentFilter = 'all';

    this.bindElements();
    this.bindEvents();
    this.updateAppName();
  }

  bindElements() {
    this.elements = {
      scanBtn: document.getElementById('scanBtn'),
      summary: document.getElementById('summary'),
      issueCount: document.getElementById('issueCount'),
      fixedCount: document.getElementById('fixedCount'),
      issuesContainer: document.getElementById('issuesContainer'),
      issuesList: document.getElementById('issuesList'),
      filterSelect: document.getElementById('filterSelect'),
      emptyState: document.getElementById('emptyState'),
      appName: document.getElementById('appName')
    };
  }

  bindEvents() {
    this.elements.scanBtn.addEventListener('click', () => this.scan());
    this.elements.filterSelect.addEventListener('change', (e) => {
      this.currentFilter = e.target.value;
      this.render();
    });
  }

  updateAppName() {
    if (this.elements.appName) {
      const names = { word: 'Word', powerpoint: 'PowerPoint', demo: 'Demo' };
      this.elements.appName.textContent = names[this.adapter.getAppName()] || '';
    }
  }

  async scan() {
    this.elements.scanBtn.disabled = true;
    this.elements.scanBtn.textContent = 'Scanning...';

    try {
      const blocks = await this.adapter.getTextBlocks();
      this.issues = checkTextBlocks(blocks);

      // Add unique IDs and location strings
      this.issues.forEach((issue, i) => {
        issue.id = `issue-${i}`;
        issue.locationString = this.adapter.getLocationString(
          blocks.find(b => b.id === issue.blockId)
        );
      });

      this.render();
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Failed to scan document: ' + error.message);
    } finally {
      this.elements.scanBtn.disabled = false;
      this.elements.scanBtn.textContent = 'Scan document';
    }
  }

  async acceptFix(issueId) {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue || !issue.autoFix) return;

    try {
      await this.adapter.replaceInBlock(issue.blockId, issue.found, issue.autoFix);
      this.issues = this.issues.filter(i => i.id !== issueId);
      this.fixedCount++;
      this.render();
    } catch (error) {
      console.error('Fix failed:', error);
      alert('Failed to apply fix: ' + error.message);
    }
  }

  ignoreIssue(issueId) {
    this.issues = this.issues.filter(i => i.id !== issueId);
    this.render();
  }

  async fixAllOfType(ruleId) {
    const toFix = this.issues.filter(i => i.rule.id === ruleId && i.autoFix);

    for (const issue of toFix) {
      try {
        await this.adapter.replaceInBlock(issue.blockId, issue.found, issue.autoFix);
        this.fixedCount++;
      } catch (error) {
        console.error('Fix failed for issue:', issue, error);
      }
    }

    this.issues = this.issues.filter(i => !(i.rule.id === ruleId && i.autoFix));
    this.render();
  }

  async navigateToIssue(issueId) {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) return;

    try {
      await this.adapter.navigateToBlock(issue.blockId);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }

  render() {
    // ... (rendering logic from demo.html, with location strings added)
  }
}

export { StyleManualTaskPane };
```

## Layer 4: Application entry points

Each Office application has its own entry point that initialises Office.js and creates the appropriate adapter.

### Word entry point

```javascript
// src/app/word/index.js

import { WordAdapter } from '../../adapters/word-adapter.js';
import { StyleManualTaskPane } from '../../ui/taskpane.js';

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    const adapter = new WordAdapter();
    const taskPane = new StyleManualTaskPane(adapter);
    window.taskPane = taskPane;  // For debugging
  }
});
```

### PowerPoint entry point

```javascript
// src/app/powerpoint/index.js

import { PowerPointAdapter } from '../../adapters/powerpoint-adapter.js';
import { StyleManualTaskPane } from '../../ui/taskpane.js';

Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    const adapter = new PowerPointAdapter();
    const taskPane = new StyleManualTaskPane(adapter);
    window.taskPane = taskPane;
  }
});
```

## Manifest configuration

### Option A: Separate manifests

Create separate manifest files for Word and PowerPoint:

**Word manifest (manifests/word-manifest.xml)**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:type="TaskPaneApp">
  <Id>style-manual-check-word</Id>
  <Version>1.0.0</Version>
  <ProviderName>Australian Government</ProviderName>
  <DefaultLocale>en-AU</DefaultLocale>
  <DisplayName DefaultValue="Style Manual Check"/>
  <Description DefaultValue="Check documents against the Australian Government Style Manual"/>

  <Hosts>
    <Host Name="Document"/>  <!-- Word -->
  </Hosts>

  <DefaultSettings>
    <SourceLocation DefaultValue="https://your-host/word/taskpane.html"/>
  </DefaultSettings>

  <Permissions>ReadWriteDocument</Permissions>

  <VersionOverrides xmlns="http://schemas.microsoft.com/office/taskpaneappversionoverrides" xsi:type="VersionOverridesV1_0">
    <Hosts>
      <Host xsi:type="Document">
        <DesktopFormFactor>
          <ExtensionPoint xsi:type="PrimaryCommandSurface">
            <OfficeTab id="TabHome">
              <Group id="StyleManualGroup">
                <Label resid="GroupLabel"/>
                <Control xsi:type="Button" id="StyleCheckButton">
                  <Label resid="ButtonLabel"/>
                  <Icon>
                    <bt:Image size="16" resid="Icon16"/>
                    <bt:Image size="32" resid="Icon32"/>
                    <bt:Image size="80" resid="Icon80"/>
                  </Icon>
                  <Action xsi:type="ShowTaskpane">
                    <TaskpaneId>StyleManualTaskPane</TaskpaneId>
                    <SourceLocation resid="TaskpaneUrl"/>
                  </Action>
                </Control>
              </Group>
            </OfficeTab>
          </ExtensionPoint>
        </DesktopFormFactor>
      </Host>
    </Hosts>
    <Resources>
      <bt:Urls>
        <bt:Url id="TaskpaneUrl" DefaultValue="https://your-host/word/taskpane.html"/>
      </bt:Urls>
      <bt:ShortStrings>
        <bt:String id="GroupLabel" DefaultValue="Style Manual"/>
        <bt:String id="ButtonLabel" DefaultValue="Check Style"/>
      </bt:ShortStrings>
    </Resources>
  </VersionOverrides>
</OfficeApp>
```

**PowerPoint manifest (manifests/powerpoint-manifest.xml)**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:type="TaskPaneApp">
  <Id>style-manual-check-powerpoint</Id>
  <Version>1.0.0</Version>
  <ProviderName>Australian Government</ProviderName>
  <DefaultLocale>en-AU</DefaultLocale>
  <DisplayName DefaultValue="Style Manual Check"/>
  <Description DefaultValue="Check presentations against the Australian Government Style Manual"/>

  <Hosts>
    <Host Name="Presentation"/>  <!-- PowerPoint -->
  </Hosts>

  <Requirements>
    <Sets>
      <Set Name="PowerPointApi" MinVersion="1.4"/>  <!-- Required for TextFrame access -->
    </Sets>
  </Requirements>

  <DefaultSettings>
    <SourceLocation DefaultValue="https://your-host/powerpoint/taskpane.html"/>
  </DefaultSettings>

  <Permissions>ReadWriteDocument</Permissions>

  <!-- VersionOverrides similar to Word, with Host xsi:type="Presentation" -->
</OfficeApp>
```

### Option B: Unified manifest (JSON format)

Microsoft's newer unified manifest format supports multiple hosts in one file:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/teams/v1.17/MicrosoftTeams.schema.json",
  "manifestVersion": "1.17",
  "version": "1.0.0",
  "id": "style-manual-check",
  "packageName": "gov.au.stylemanual.check",
  "developer": {
    "name": "Australian Government",
    "websiteUrl": "https://www.stylemanual.gov.au",
    "privacyUrl": "https://www.stylemanual.gov.au/privacy",
    "termsOfUseUrl": "https://www.stylemanual.gov.au/terms"
  },
  "name": {
    "short": "Style Manual Check",
    "full": "Australian Government Style Manual Check"
  },
  "description": {
    "short": "Check documents against the Style Manual",
    "full": "Check Word documents and PowerPoint presentations against the Australian Government Style Manual guidelines."
  },
  "extensions": [
    {
      "requirements": {
        "capabilities": [
          { "name": "Mailbox", "minVersion": "1.1" }
        ]
      },
      "runtimes": [
        {
          "id": "TaskPaneRuntime",
          "type": "general",
          "code": { "page": "https://your-host/taskpane.html" }
        }
      ],
      "ribbons": [
        {
          "contexts": ["mailRead", "mailCompose", "document", "presentation"],
          "tabs": [
            {
              "id": "StyleManualTab",
              "label": "Style Manual",
              "groups": [
                {
                  "id": "StyleManualGroup",
                  "label": "Check",
                  "controls": [
                    {
                      "id": "StyleCheckButton",
                      "type": "button",
                      "label": "Check Style",
                      "actionId": "showTaskPane"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Build and development

### Recommended tooling

For a production setup, consider using:

1. **Yeoman generator** - `yo office` scaffolds the project structure
2. **Webpack** - Bundles modules for browser consumption
3. **TypeScript** - Optional but helpful for Office.js type checking
4. **Office Add-in Debugger** - VS Code extension for debugging

### Simple development setup (no build step)

For initial development, you can avoid a build step by using ES modules:

```html
<!-- taskpane.html -->
<script type="module">
  import { StyleManualTaskPane } from './ui/taskpane.js';
  import { WordAdapter } from './adapters/word-adapter.js';

  Office.onReady((info) => {
    const adapter = new WordAdapter();
    new StyleManualTaskPane(adapter);
  });
</script>
```

### Development workflow

1. **Start with browser demo** - Test rule changes quickly in demo.html
2. **Test in Word** - Sideload the Word add-in to test Office.js integration
3. **Test in PowerPoint** - Sideload the PowerPoint add-in
4. **Test cross-platform** - Verify on Windows, Mac, and web versions

## Known limitations

### PowerPoint-specific

| Limitation | Impact | Workaround |
|------------|--------|------------|
| No speaker notes access | Cannot check notes for style issues | Document this limitation; notes must be checked manually |
| No find/replace API | Must replace entire text range content | Replace full `textRange.text` property |
| No paragraph iteration | Cannot identify individual paragraphs within a shape | Treat each shape as one text block |
| Requires API 1.4+ | Won't work on iPad or older Office versions | Set minimum requirement in manifest |

### Word vs PowerPoint differences

| Feature | Word | PowerPoint |
|---------|------|------------|
| Text structure | Paragraphs, tables, headers | Slides, shapes, text frames |
| Find/replace | Native `search()` method | Manual string replacement |
| Navigation | `paragraph.select()` | `textRange.setSelected()` |
| Heading detection | Style-based | Shape name/position heuristics |
| Speaker notes | Not applicable | Not supported by API |

## Migration path

### Phase 1: Refactor existing code

1. Extract `checkText()` into `src/core/checker.js`
2. Move `rules.js` and `spellings.js` to `src/core/`
3. Create `DemoAdapter` to work with existing demo.html
4. Verify demo still works

### Phase 2: Build Word add-in

1. Create `WordAdapter` implementation
2. Create Word entry point and manifest
3. Extract UI code from demo.html into `src/ui/`
4. Test sideloading on Word desktop

### Phase 3: Build PowerPoint add-in

1. Create `PowerPointAdapter` implementation
2. Create PowerPoint entry point and manifest
3. Add slide/shape location display to UI
4. Test sideloading on PowerPoint desktop

### Phase 4: Polish and deploy

1. Add error handling and loading states
2. Test on all platforms (Windows, Mac, web)
3. Document the speaker notes limitation
4. Deploy to shared hosting or admin-managed deployment

## Summary

This architecture provides:

- **100% code reuse** for the rule engine
- **~90% code reuse** for the UI
- **Clean separation** between document access and business logic
- **Easy testing** via the browser demo
- **Future extensibility** for Outlook, Excel, or other Office apps

The adapter pattern means adding a new Office application only requires implementing the `DocumentAdapter` interface - no changes to rules or UI code.
