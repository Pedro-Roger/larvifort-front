const fs = require('fs');
const path = '../larvifort-api/src/app.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('commercialGroupsRouter')) {
  code = code.replace(
    'import companiesRouter from "./routes/companies"',
    'import companiesRouter from "./routes/companies"\nimport commercialGroupsRouter from "./routes/commercial-groups"'
  );
  
  code = code.replace(
    'app.use("/api/v1/companies", companiesRouter)',
    'app.use("/api/v1/companies", companiesRouter)\napp.use("/api/v1/commercial-groups", commercialGroupsRouter)'
  );
  fs.writeFileSync(path, code);
}
