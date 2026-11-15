const fs = require('fs');
let c = fs.readFileSync('c:/Users/yairj/OneDrive/Escritorio/Trabajos/Carwash/styles.css', 'utf8');

c = c.replace(
    /@media \(max-width: 992px\) \{[\s\S]*?\.dashboard-grid, .finance-grid, .settings-grid \{ grid-template-columns: 1fr; \}\r?\n\}/,
    `@media (max-width: 992px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); box-shadow: var(--shadow-lg); }
    .sidebar-close { display: flex; }
    .main-content { margin-left: 0; }
    .hamburger { display: flex; }
    .dashboard-grid, .finance-grid, .settings-grid { grid-template-columns: 1fr; }
    .modal { padding-left: 1rem; }
}`
);

fs.writeFileSync('c:/Users/yairj/OneDrive/Escritorio/Trabajos/Carwash/styles.css', c, 'utf8');
console.log('done padding');
