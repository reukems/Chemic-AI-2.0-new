const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
    "import UIOverlay from './ui/UIOverlay';",
    "import UIOverlay from './ui/UIOverlay';\nimport ReactionPopup from './ui/ReactionPopup';"
);

content = content.replace(
    "          <UIOverlay />\n        </>\n      )}",
    "          <UIOverlay />\n          <ReactionPopup />\n        </>\n      )}"
);

fs.writeFileSync('src/App.tsx', content);
