# Install Node.js and Run the Application

## 📥 Step 1: Download Node.js

I've opened the official Node.js website in your browser: **https://nodejs.org/**

1. **Download the LTS (Long Term Support) version**
   - Look for the green "LTS" button
   - This is the most stable version
   - Currently Node.js v20.x.x or v22.x.x

2. **Choose Windows Installer (.msi)**
   - Make sure to download the `.msi` installer for Windows
   - It should say "Recommended for Most Users"

## 🔧 Step 2: Install Node.js

1. **Run the installer** you just downloaded
2. **Follow the installation wizard:**
   - Click "Next" on the welcome screen
   - Accept the license agreement
   - Keep the default installation location (usually `C:\Program Files\nodejs`)
   - **IMPORTANT**: Check the box that says "Add to PATH" (it should be checked by default)
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

3. **RESTART YOUR COMPUTER** ⚠️
   - This is CRITICAL for PATH changes to take effect
   - Close this terminal and restart your computer

## ✅ Step 3: Verify Installation

After restarting, open a NEW PowerShell terminal:

```powershell
node --version
npm --version
```

You should see version numbers like:
```
v20.10.0
10.2.3
```

## 🚀 Step 4: Run the Application

Navigate to your project:

```powershell
cd "C:\Users\varsh\Downloads\Faculty Grading System"
```

Run the application:

```powershell
npm install
npm run dev
```

## 🎉 Step 5: Open in Browser

The terminal will show:
```
VITE v6.3.5  ready in 2.3s
➜  Local:   http://localhost:3000/
```

Open that URL in your browser!

## 🎯 What You'll See

### Login Page
- **Faculty/Admin toggle buttons** at the top
- Click **Faculty** to see faculty login
- Click **Admin** to see admin login

### Faculty Dashboard (After login)
- Your existing grading interface
- Section management
- Paper grading

### Admin Dashboard (After login)
- Statistics cards
- Papers & Assignments tab
- Faculty Management tab
- Course Management tab
- Correction Reports tab

## ❓ Troubleshooting

### "npm is still not recognized" after restart
- Node.js may not have been added to PATH properly
- Reinstall Node.js and make sure "Add to PATH" is checked
- Check if Node.js installed to `C:\Program Files\nodejs\`

### "Port 3000 is already in use"
- Another app is using port 3000
- The server will automatically use another port (3001, 3002, etc.)
- Use the URL shown in the terminal

### "Missing dependencies" errors
- Run `npm install` again
- Make sure you're in the project directory

## 📋 Quick Checklist

- [ ] Downloaded Node.js LTS from nodejs.org
- [ ] Ran the installer
- [ ] Checked "Add to PATH"
- [ ] Restarted computer
- [ ] Opened NEW PowerShell terminal
- [ ] Verified with `node --version`
- [ ] Navigated to project directory
- [ ] Ran `npm install`
- [ ] Ran `npm run dev`
- [ ] Opened URL in browser

## 🎊 Success!

Once you see the login page with Faculty/Admin toggle buttons, you're all set!

**Tip**: The application runs locally on your computer. No internet needed (except for the initial npm install).




