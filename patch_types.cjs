const fs = require('fs');
const path = 'src/types/index.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "  farmSize: CompanyFarmSize | null\n  createdAt: string\n}",
  "  farmSize: CompanyFarmSize | null\n  createdAt: string\n  tradeName?: string | null\n  legalName?: string | null\n  normalizedCnpj?: string | null\n  commercialGroupId?: string | null\n  parentCompanyId?: string | null\n}"
);

fs.writeFileSync(path, code);
