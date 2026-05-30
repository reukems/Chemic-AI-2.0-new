const fs = require('fs');
let code = fs.readFileSync('src/ui/UIOverlay.tsx', 'utf8');
code = code.replace(
    '<div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-sans overflow-hidden select-none">',
    '<div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-sans overflow-hidden select-none z-50">'
);
fs.writeFileSync('src/ui/UIOverlay.tsx', code);
