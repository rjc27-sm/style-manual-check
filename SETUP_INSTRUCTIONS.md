# Setting up Style Manual Check with Claude Code

Follow these steps to continue developing Style Manual Check using Claude Code.

## Step 1: Install Claude Code

Open Terminal (Mac) or Command Prompt/PowerShell (Windows) and run:

```
npm install -g @anthropic-ai/claude-code
```

If you don't have npm installed, you'll need to install Node.js first from https://nodejs.org (download the LTS version).

After installation, verify it worked:

```
claude --version
```

## Step 2: Set up your project folder

1. **Download** the `style-manual-check.zip` file

2. **Create a folder** where you want to keep the project, for example:
   - Windows: `C:\Projects\style-manual-check`
   - Mac: `~/Projects/style-manual-check`

3. **Unzip** the contents of `style-manual-check.zip` into that folder

4. **Verify** the folder structure looks like this:
   ```
   style-manual-check/
   ├── CLAUDE.md
   ├── README.md
   ├── demo.html
   ├── src/
   │   ├── rules.js
   │   └── spellings.js
   └── docs/
       ├── PROJECT_HISTORY.md
       └── style-checker-complete-word-list.docx
   ```

## Step 3: Start Claude Code

1. Open Terminal (Mac) or Command Prompt (Windows)

2. Navigate to your project folder:
   ```
   cd C:\Projects\style-manual-check
   ```
   or on Mac:
   ```
   cd ~/Projects/style-manual-check
   ```

3. Start Claude Code:
   ```
   claude
   ```

4. Claude will automatically read the `CLAUDE.md` file and understand the project context

## Step 4: Continue development

Once Claude Code is running, you can ask it to:

- "Let's continue building the Word add-in"
- "Show me the current rules"
- "Add a new rule for [something]"
- "Update the complete word list document"
- "Set up the Office.js add-in scaffold"

Claude Code will edit files directly on your computer, so changes persist between sessions.

## Testing the demo

To test the current demo in a browser:

**Option A: Simple Python server (recommended)**

1. Open Terminal/Command Prompt in the project folder
2. Run: `python -m http.server 8000` (or `python3 -m http.server 8000` on Mac)
3. Open http://localhost:8000/demo.html in your browser

**Option B: VS Code Live Server**

1. Install VS Code and the "Live Server" extension
2. Open the project folder in VS Code
3. Right-click `demo.html` and select "Open with Live Server"

## Tips for working with Claude Code

- **Be specific**: "Add a rule to check for passive voice" is better than "improve the checker"
- **Ask for explanations**: "Explain how the title case detection works"
- **Request tests**: "Add some test cases for the new rule"
- **Review changes**: Claude Code shows you what it's changing - review before accepting

## Getting help

If you get stuck:
- Ask Claude Code: "Help me understand what's in this project"
- Check the CLAUDE.md file for project context
- Check docs/PROJECT_HISTORY.md for past decisions
