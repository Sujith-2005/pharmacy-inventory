# 🧹 Repository Cleanup Instructions

## Files to Remove Before Deployment

Run these commands to clean up your repository:

### Remove Virtual Environment (if committed)
```powershell
Remove-Item -Recurse -Force backend\venv
```

### Remove Python Cache
```powershell
Get-ChildItem -Path backend -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force
Get-ChildItem -Path backend -Recurse -Filter "*.pyc" | Remove-Item -Force
```

### Remove Node Modules (if committed)
```powershell
Remove-Item -Recurse -Force frontend\node_modules
```

### Remove Build Directories
```powershell
Remove-Item -Recurse -Force frontend\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backend\build -ErrorAction SilentlyContinue
```

## Verify .gitignore

Make sure these are in `.gitignore`:
- `venv/`
- `__pycache__/`
- `node_modules/`
- `*.db`
- `.env`
- `dist/`

## After Cleanup

1. Commit the cleanup:
   ```powershell
   git add .
   git commit -m "Clean up repository for deployment"
   ```

2. Push to GitHub:
   ```powershell
   git push origin main
   ```



