const fs = require('fs');
const file = 'Navbar.module.css';
let c = fs.readFileSync(file, 'utf8');

// Fix 1: The .brand block got mangled with sectionLabel content. 
// Restore .brand to proper state and add back missing rules.
const badBrand = `.brand {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 700;\n  font-size: 1.1rem;\n  color: var(--color-text-strong, #1a1a1a);\n  text-decoration: none;\n  transition: opacity 0.2s ease;\n  color: var(--color-text-muted, #999);\n  font-weight: 700;\n  margin-bottom: 0.5rem;\n  padding-left: 0.5rem;\n  transition: color 0.2s ease;\n}\n\n.sectionLabel:hover,\n.sectionLabel:focus-visible {\n  color: var(--color-primary, var(--color-primary));\n}`;

const goodBrand = `.brand {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 700;\n  font-size: 1.1rem;\n  color: var(--color-text-strong, #1a1a1a);\n  text-decoration: none;\n  transition: opacity 0.2s ease;\n}\n\n.brand:hover {\n  opacity: 0.8;\n}\n\n.brand span {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.25rem;\n}\n\n.closeButton {\n  display: none;\n  border: none;\n  background: rgba(0, 0, 0, 0.06);\n  color: var(--color-text-secondary, #444);\n  font-size: 1.6rem;\n  cursor: pointer;\n  width: 52px;\n  height: 52px;\n  border-radius: 14px;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s ease;\n}\n\n.closeButton:hover {\n  background: rgba(0, 0, 0, 0.1);\n  color: var(--color-text-strong, #1a1a1a);\n}\n\n/* Section Labels */\n.sectionLabel {\n  font-size: 0.7rem;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: var(--color-text-muted, #999);\n  font-weight: 700;\n  margin-bottom: 0.5rem;\n  padding-left: 0.5rem;\n  transition: color 0.2s ease;\n}\n\n.sectionLabel:hover,\n.sectionLabel:focus-visible {\n  color: var(--color-primary, var(--color-primary));\n}`;

if (c.includes(badBrand)) {
  c = c.replace(badBrand, goodBrand);
  fs.writeFileSync(file, c, 'utf8');
  console.log('Fixed!');
} else {
  console.log('Pattern not found. Current brand section:');
  const idx = c.indexOf('.brand {');
  console.log(JSON.stringify(c.substring(idx, idx + 600)));
}
