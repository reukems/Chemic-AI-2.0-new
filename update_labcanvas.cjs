const fs = require('fs');
let content = fs.readFileSync('src/engine/LabCanvas.tsx', 'utf-8');

content = content.replace("import React from 'react';", "import React, { useState } from 'react';");

const newContainersRender = `                {/* Make containers pointer-events-auto so they can still be interacted with over the board */}
                {containers.map(c => (
                    <div key={c.id} className="pointer-events-auto">
                        <LabContainer
                            id={c.id}
                            isDragging={draggingContainerId === c.id}
                            onDragStart={() => setDraggingContainerId(c.id)}
                            onDragEnd={() => setDraggingContainerId(null)}
                            draggingContainerId={draggingContainerId}
                        />
                    </div>
                ))}`;

content = content.replace(
    "{/* Make containers pointer-events-auto so they can still be interacted with over the board */}\n                {containers.map(c => (\n                    <div key={c.id} className=\"pointer-events-auto\">\n                        <LabContainer id={c.id} />\n                    </div>\n                ))}",
    newContainersRender
);

content = content.replace(
    "const handleDrop = (e: React.DragEvent) => {",
    "const [draggingContainerId, setDraggingContainerId] = useState<number | null>(null);\n\n    const handleDrop = (e: React.DragEvent) => {"
);

fs.writeFileSync('src/engine/LabCanvas.tsx', content);
