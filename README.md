# ACOSAT Online Portal – Starter

This is a clean starter project for the American College of Science and Technology Online Student Portal.

## How to run

1. Open this folder in VS Code
2. Open the terminal inside VS Code and run:

```bash
npm install
npm run dev
```

3. Open http://localhost:3000 in your browser

You will be redirected to the Login page.

## Folder Structure

```
app/
├── login/page.tsx               ← Login page (ready)
├── student/
│   ├── dashboard/page.tsx
│   ├── courses/page.tsx
│   ├── grades/page.tsx
│   ├── payments/page.tsx
│   └── certificates/page.tsx
├── lecturer/
│   ├── dashboard/page.tsx
│   └── grades/page.tsx
└── admin/
    └── dashboard/page.tsx

components/layout/               ← We will put Sidebar & Header here later
lib/utils.ts                     ← Helper for class names
```

## Next Steps

After you run the project successfully, tell me and I will give you the code for the Student Dashboard.
