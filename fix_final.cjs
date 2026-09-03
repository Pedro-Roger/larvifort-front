const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// There are extra `</div>` tags.
// Let's just remove the `      </div>\n\n      {/* Bottom Row: Lists */}`
// and replace it with `\n\n      {/* Bottom Row: Lists */}`
code = code.replace(/<\/div>\n\s*<\/div>\n\s*\{\/\* Bottom Row: Lists \*\/\}/, "</div>\n\n      {/* Bottom Row: Lists */}");

fs.writeFileSync('src/pages/DashboardPage.tsx', code);
