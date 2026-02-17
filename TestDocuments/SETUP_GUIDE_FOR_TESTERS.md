# Style Manual Check — Tester Setup Guide

## What is this?

Style Manual Check is a Word add-in that scans your document for common style issues based on the Australian Government Style Manual. It runs as a side panel inside Word.

This guide will help you install it on your personal Windows laptop for testing purposes.

---

## Is this safe?

**Yes.** Here is what you need to know:

- **Everything runs on your own computer.** The add-in does not send your document text anywhere — no internet servers, no cloud services, no AI. All the checking happens locally in your browser engine inside Word.
- **It only reads your document text.** It does not modify your document unless you click a "Fix" button on a specific issue. You are always in control.
- **The code is open source.** You can view every line at the GitHub link below. There are no hidden components.
- **Node.js is a standard tool** used by millions of developers worldwide. It is published by the OpenJS Foundation (a Linux Foundation project). You are installing it from its official website.
- **You can remove everything afterwards.** The uninstall steps are at the end of this guide.

The only slightly unusual thing you will see is a prompt to "trust a security certificate." This is a developer certificate that lets Word talk to the local server running on your own machine. It never leaves your computer.

---

## What you will install

1. **Node.js** — a tool that runs JavaScript outside a web browser (about 70 MB)
2. **The Style Manual Check project files** — downloaded as a ZIP from GitHub (about 2 MB, expands to ~200 MB after setup)

That's it. No other software is needed.

---

## Step-by-step instructions

### Step 1: Install Node.js

1. Open your web browser and go to: **https://nodejs.org**
2. You will see two big green buttons. Click the one on the LEFT that says **"LTS"** (Long Term Support). This downloads an installer file.
3. Open the downloaded file (it will be called something like `node-v22.x.x-x64.msi`).
4. Click **Next** through the installer, accepting the defaults. You do not need to change any settings.
5. Click **Install**, then **Finish**.

**How to check it worked:**

1. Press the **Windows key** on your keyboard (the flag icon, bottom-left).
2. Type **powershell** and press **Enter**. A blue/dark window will open — this is the terminal.
3. Type the following and press **Enter**:
   ```
   node --version
   ```
4. You should see a version number like `v22.13.1`. If you see this, Node.js is installed correctly.

**Leave this terminal window open — you will use it in the next steps.**

---

### Step 2: Download the project

1. Open your web browser and go to: **https://github.com/rjc27-sm/style-manual-check**
2. Click the green **"<> Code"** button (near the top-right of the page).
3. In the dropdown that appears, click **"Download ZIP"**.
4. Open your **Downloads** folder and find the file `style-manual-check-master.zip`.
5. **Right-click** the ZIP file and choose **"Extract All..."**
6. Choose your **Documents** folder as the destination (or anywhere you like), and click **Extract**.

You should now have a folder called `style-manual-check-master` containing the project files.

---

### Step 3: Install the project dependencies

Go back to the terminal window you opened earlier (the blue/dark window). If you closed it, open it again by pressing the **Windows key**, typing **powershell**, and pressing **Enter**.

Type the following commands **one at a time**, pressing **Enter** after each one. Wait for each command to finish before typing the next.

**Command 1** — navigate to the project folder:
```
cd "$HOME\Documents\style-manual-check-master\StyleManualCheck"
```

> **Note:** If you extracted the ZIP to a different location, adjust the path above. The folder you need to be in is the one that contains a file called `package.json`.

**Command 2** — install the project dependencies:
```
npm install
```

This will take 1–3 minutes. You will see a lot of text scrolling past — this is normal. It is downloading the standard libraries the project needs. When it finishes, you will see your cursor blinking on a new line, ready for the next command.

> You may see some yellow "WARN" messages. These are harmless and can be ignored.

---

### Step 4: Start the add-in

In the same terminal window, type:

```
npm start
```

**What will happen:**

1. You may see a prompt asking **"Allow this app to make changes to your device?"** — click **Yes**. This is installing a local security certificate so Word can communicate with the local server.
2. You may see a browser window open briefly with a certificate warning — you can close it.
3. **Microsoft Word will open automatically** with the add-in loaded.

> **If Word does not open automatically**, don't worry. See the "Manual loading" section below.

You should see a **"Style check"** button on the **Home tab** of the Word ribbon (in a group labelled "Aus Gov" on the right-hand side). Click it to open the checking panel.

**Important: Leave the terminal window open while you are testing.** It is running the local server that powers the add-in. If you close it, the add-in will stop working.

---

### Step 5: Test the add-in

1. Open one of the test documents from the `TestDocuments` folder (or paste the text from one into a new Word document).
2. Click the **"Style check"** button on the Home tab.
3. Click **"Check document"** in the panel that appears.
4. Review the issues found. You can click on each one to navigate to it in the document.

---

## If Word did not open automatically

If `npm start` did not open Word with the add-in, you can load it manually:

1. First, make sure the server is running. Go back to the terminal and run:
   ```
   npm run dev-server
   ```
   Leave this running.

2. Open **Microsoft Word** and create a new blank document.
3. Go to **Insert** (on the ribbon) > **My Add-ins** (or **Get Add-ins**) > **My Add-ins** tab.
4. Click **Manage My Add-ins** at the bottom, then **Upload My Add-in**.
5. Click **Browse** and navigate to:
   ```
   Documents\style-manual-check-master\StyleManualCheck\manifest.xml
   ```
6. Click **Upload**. The add-in should now appear on the Home tab.

> You only need to do this once. Word will remember the add-in for future sessions (as long as the server is running).

---

## When you are finished testing

### Stop the add-in

1. Go to the terminal window and press **Ctrl + C**. If it asks "Terminate batch job?", type **Y** and press **Enter**.
2. Close the terminal window.

### Uninstall everything (optional)

If you want to remove everything from your computer:

1. **Remove the project files:** Delete the `style-manual-check-master` folder from your Documents folder.

2. **Remove Node.js:** Go to **Settings > Apps > Installed apps**, find **Node.js**, and click **Uninstall**.

3. **Remove the developer certificate:** Open PowerShell and run:
   ```
   npx office-addin-dev-certs uninstall
   ```
   (Do this *before* uninstalling Node.js if you want to use this command.)

4. **Remove the sideloaded add-in from Word:** Open Word, go to **Insert > My Add-ins**, right-click the Style Manual Check add-in, and choose **Remove**.

---

## Troubleshooting

**"npm is not recognized"**
Close the terminal and open a new one. If that doesn't work, restart your computer — Node.js needs to add itself to your system path, which sometimes requires a restart.

**"EACCES" or permission errors**
Right-click PowerShell and choose **"Run as administrator"**, then try the command again.

**The add-in panel is blank or shows an error**
Make sure the terminal window is still open and the server is running. If you see errors in the terminal, try stopping it (Ctrl + C) and running `npm start` again.

**Word says "We can't open this add-in from localhost"**
The security certificate may not have installed correctly. In the terminal, run:
```
npx office-addin-dev-certs install
```
Then try `npm start` again.

**I see "SEC_ERROR_UNKNOWN_ISSUER" or a certificate warning**
This is expected the first time. The dev certificate is self-signed (it's only for your machine). Accept the warning or click "Advanced > Accept the Risk."

---

## Giving feedback

As you test, please note:

- **False positives** — issues flagged that should not be (e.g. a proper noun flagged as a capitalisation error)
- **Missed issues** — things you expected to be caught but were not
- **Confusing suggestions** — where the suggestion text is unclear or unhelpful
- **Anything unexpected** — crashes, odd behaviour, layout problems

Please record the **document text that triggered the issue** and the **rule name** shown in the panel.

---

## Questions?

Contact [your name/email here] if you get stuck at any step.
