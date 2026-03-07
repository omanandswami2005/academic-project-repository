# Fix: Internal Server Error on Project Upload

## 🔍 Quick Diagnosis

The error "Internal Server Error. Please try again." usually means one of these issues:

### Most Common Causes:

1. **Multer not installed** ⚠️ (Most Likely)
2. **Database not connected**
3. **Project model not found**
4. **File upload path issue**

## ✅ Step-by-Step Fix

### Step 1: Check if Multer is Installed

Open PowerShell in the `server` folder and run:
```powershell
cd server
npm list multer
```

**If you see "multer" listed:** ✅ Multer is installed  
**If you see an error:** ❌ Multer is NOT installed

### Step 2: Install Multer (if not installed)

```bash
cd server
npm install multer
```

### Step 3: Check Server Console

When you try to upload, check your **server console** (where you ran `npm start`). You should see:

**If multer is missing:**
```
Error: Cannot find module 'multer'
```

**If database is not connected:**
```
Database not connected. Please ensure MongoDB is running on port 27017.
```

**If Project model is missing:**
```
Error: Cannot find module './models/Project'
```

### Step 4: Verify Server is Running

1. Check if server is running on port 5000
2. Test the health endpoint: http://localhost:5000/health
3. Should return: `{"status":"Server is running","database":"connected"}`

### Step 5: Check MongoDB Connection

```bash
# Start MongoDB if not running
net start MongoDB
```

### Step 6: Restart Server

After installing multer or fixing issues:
1. Stop the server (Ctrl+C)
2. Start again: `npm start`
3. Try uploading again

## 🐛 Specific Error Messages

### Error: "Cannot find module 'multer'"
**Solution:**
```bash
cd server
npm install multer
npm start
```

### Error: "Database not connected"
**Solution:**
1. Start MongoDB: `net start MongoDB`
2. Verify it's running
3. Restart server

### Error: "Cannot find module './models/Project'"
**Solution:**
- Check if `server/models/Project.js` exists
- If missing, the file should be there (it was created)

### Error: "EACCES" or "Permission denied"
**Solution:**
- Check if `server/uploads/` directory exists
- If it doesn't, the server will create it automatically
- Make sure you have write permissions

## 🔧 Enhanced Error Logging

I've updated the code to provide better error messages. After restarting the server, you'll see more detailed errors in:

1. **Server Console** - Detailed error logs
2. **Browser Console** (F12) - Check Network tab for response

## 📋 Checklist

Before trying again, verify:

- [ ] Multer is installed (`npm list multer` shows it)
- [ ] MongoDB is running (`net start MongoDB`)
- [ ] Server is running on port 5000
- [ ] `/health` endpoint works
- [ ] `server/models/Project.js` exists
- [ ] Server console shows no errors on startup

## 🧪 Test After Fix

1. **Start Server:**
   ```bash
   cd server
   npm start
   ```

2. **Check Console Output:**
   - Should see: "✅ Database is Connected!"
   - Should see: "🚀 Server running on port 5000"
   - Should NOT see any "Cannot find module" errors

3. **Try Upload Again:**
   - Fill the form
   - Select files (optional)
   - Click "Upload Project"
   - Check server console for any errors

## 💡 Still Not Working?

If you've done all the above and it still doesn't work:

1. **Check Server Console** - Copy the exact error message
2. **Check Browser Console** (F12 → Console tab) - Look for errors
3. **Check Network Tab** (F12 → Network tab) - See the actual API response

The updated code now logs more details, so check your server console for the specific error!
