const fs = require('fs');
const path = '../larvifort-api/src/routes/companies.ts';
let code = fs.readFileSync(path, 'utf8');

const analyticsEndpoint = `
// GET /api/v1/companies/:id/analytics
router.get("/:id/analytics", async (req, res) => {
  const orgId = req.organizationId!
  const { id } = req.params

  try {
    const orders = await prisma.order.findMany({
      where: { companyId: id, organizationId: orgId },
      select: {
        value: true,
        commercialStage: true,
        createdAt: true
      }
    })

    let totalOrders = 0
    let wonOrders = 0
    let totalRevenue = 0
    let openPipelineCount = 0
    let lastPurchase: Date | null = null

    for (const o of orders) {
      totalOrders++
      // Consider "entregue" or "pronto" as won/historical purchase
      if (['entregue', 'pronto', 'aprovado', 'disponibilidade', 'reservado', 'producao'].includes(o.commercialStage)) {
        wonOrders++
        totalRevenue += Number(o.value) || 0
        if (!lastPurchase || o.createdAt > lastPurchase) {
          lastPurchase = o.createdAt
        }
      } else {
        openPipelineCount++
      }
    }

    const ticketMedio = wonOrders > 0 ? totalRevenue / wonOrders : 0

    res.json({
      totalRevenue,
      totalOrders,
      wonOrders,
      ticketMedio,
      lastPurchase,
      openPipelineCount
    })
  } catch (err) {
    console.error("[companies] GET /:id/analytics", err)
    res.status(500).json({ error: "Erro interno" })
  }
})

`;

// insert before "export default router"
code = code.replace(/export default router/, analyticsEndpoint + 'export default router');
fs.writeFileSync(path, code);
