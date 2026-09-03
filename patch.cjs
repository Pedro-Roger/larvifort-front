const fs = require('fs');
const path = '../larvifort-api/src/routes/companies.ts';
let code = fs.readFileSync(path, 'utf8');

const lookupCode = `
// POST /api/v1/companies/lookup-cnpj
router.post("/lookup-cnpj", async (req, res) => {
  const orgId = req.organizationId!
  const { cnpj } = req.body
  if (!cnpj) return res.status(400).json({ error: "CNPJ é obrigatório" })
  
  const normalizedCnpj = cnpj.replace(/\\D/g, "")
  if (normalizedCnpj.length !== 14) {
    return res.status(400).json({ error: "CNPJ inválido" })
  }

  try {
    const existing = await prisma.company.findFirst({
      where: { organizationId: orgId, normalizedCnpj }
    })
    if (existing) {
      return res.status(409).json({ error: "CNPJ já cadastrado neste tenant", companyId: existing.id })
    }
    
    // Mocking external API call
    res.json({
      name: "EMPRESA DE TESTE LTDA",
      tradeName: "Empresa de Teste",
      cnpj: cnpj,
      normalizedCnpj: normalizedCnpj,
      status: "ATIVA",
      email: "contato@empresateste.com.br",
      phone: "11999999999"
    })
  } catch (err) {
    console.error("[companies] POST /lookup-cnpj", err)
    res.status(500).json({ error: "Erro interno ao buscar CNPJ" })
  }
})

// POST /api/v1/companies
`;

code = code.replace('// POST /api/v1/companies\nrouter.post("/",', lookupCode + 'router.post("/",');

const normalizedCode = `
    const normalizedCnpj = cnpj ? cnpj.replace(/\\D/g, "") : null
    if (normalizedCnpj) {
      const existing = await prisma.company.findFirst({
        where: { organizationId: orgId, normalizedCnpj }
      })
      if (existing) {
        return res.status(409).json({ error: "CNPJ já cadastrado neste tenant" })
      }
    }

    const co = await prisma.company.create({
`;
code = code.replace('    const co = await prisma.company.create({', normalizedCode);

code = code.replace('cnpj: cnpj || null,', 'cnpj: cnpj || null,\n        normalizedCnpj,');

fs.writeFileSync(path, code);
