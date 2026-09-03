const fs = require('fs');
const path = '../larvifort-api/src/routes/companies.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "const { name, cnpj, email, phone, notes, farm_location, farm_size } = req.body",
  "const { name, cnpj, email, phone, notes, farm_location, farm_size, commercialGroupId, parentCompanyId } = req.body"
);

code = code.replace(
  "farmSize: (farm_size as CompanyFarmSize) || null,",
  "farmSize: (farm_size as CompanyFarmSize) || null,\n        commercialGroupId: commercialGroupId || null,\n        parentCompanyId: parentCompanyId || null,"
);

fs.writeFileSync(path, code);
