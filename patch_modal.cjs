const fs = require('fs');
const path = 'src/components/clients/NewCompanyModal.tsx';
let code = fs.readFileSync(path, 'utf8');

// Update form state
code = code.replace(
  "farm_location: '', farm_size: '',",
  "farm_location: '', farm_size: '', commercial_group_id: '', parent_company_id: '',"
);

// Add useEffect to fetch groups
const groupsHook = `
  const [groups, setGroups] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])

  import { useEffect } from 'react'
  useEffect(() => {
    api.get('/api/v1/commercial-groups').then(setGroups).catch(() => {})
    api.get('/api/v1/companies').then(setCompanies).catch(() => {})
  }, [])
`;

// Insert the hooks right after const [isCnpjVerified
code = code.replace(
  "const [isCnpjVerified, setIsCnpjVerified] = useState(false)",
  "const [isCnpjVerified, setIsCnpjVerified] = useState(false)\n" + groupsHook
);

// Fix the import at the top because we just injected one in the middle, actually let's just do it cleanly
code = code.replace("import { useEffect } from 'react'", "");
code = code.replace("import { useState } from 'react'", "import { useState, useEffect } from 'react'");

// Add fields to payload
code = code.replace(
  "farm_size:     form.farm_size || null,",
  "farm_size:     form.farm_size || null,\n        commercialGroupId: form.commercial_group_id || null,\n        parentCompanyId: form.parent_company_id || null,"
);

// Add select inputs for groups and parent company before the cancel button
const inputs = `
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Grupo Comercial (Opcional)</label>
            <select
              value={form.commercial_group_id}
              onChange={(e) => set('commercial_group_id', e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="">Nenhum grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Empresa Matriz (Opcional)</label>
            <select
              value={form.parent_company_id}
              onChange={(e) => set('parent_company_id', e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}
            >
              <option value="">Nenhuma (Esta é a matriz)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
`;

code = code.replace("{error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}", inputs + "\n          {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}");

fs.writeFileSync(path, code);
