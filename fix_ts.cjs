const fs = require('fs');

// Fix NewCompanyModal
let modal = fs.readFileSync('src/components/clients/NewCompanyModal.tsx', 'utf8');
modal = modal.replace('api.get(\'/api/v1/commercial-groups\').then(setGroups)', 'api.get<any[]>(\'/api/v1/commercial-groups\').then(res => setGroups(res))');
modal = modal.replace('api.get(\'/api/v1/companies\').then(setCompanies)', 'api.get<any[]>(\'/api/v1/companies\').then(res => setCompanies(res))');
fs.writeFileSync('src/components/clients/NewCompanyModal.tsx', modal);

// Fix Order type
let types = fs.readFileSync('src/types/index.ts', 'utf8');
if (!types.includes('probability?: number | null')) {
  types = types.replace(
    'priority: OrderPriority',
    'priority: OrderPriority\n  probability?: number | null'
  );
  fs.writeFileSync('src/types/index.ts', types);
}

