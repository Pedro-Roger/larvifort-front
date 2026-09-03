const fs = require('fs');
let code = fs.readFileSync('patch_dashboard_tmp.js', 'utf8');

const widgetsRender = `
            {/* Customizable Widgets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 32px' }}>
              {widgetOrder.map(widgetId => {
                switch(widgetId) {
                  case 'indicators':
                    return (
                      <WidgetWrapper key="indicators" id="indicators">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                          <IndicatorCard label="Pedidos em aberto" value={String(indicators.ordersOpenCount)} />
                          <IndicatorCard label="Pedidos criados no período" value={String(indicators.ordersCreatedInPeriod)} />
                          <IndicatorCard label="Volume realizado" value={formatMillions(indicators.realizedVolumeMillions)} />
                          <IndicatorCard label="Receita realizada" value={formatCurrency(indicators.realizedRevenue)} />
                        </div>
                      </WidgetWrapper>
                    );
                  case 'goals':
                    return (
                      <WidgetWrapper key="goals" id="goals">
                        {!hasGoal ? (
                          <p style={{ fontSize: 13, color: '#bbb', margin: 0 }}>
                            {isGestor ? 'Nenhuma meta cadastrada neste período.' : 'Você ainda não tem meta cadastrada neste período.'}
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>
                              {isGestor ? \`Meta do time (\${indicators.goalsCount} vendedor\${indicators.goalsCount === 1 ? '' : 'es'})\` : 'Minha meta'}
                            </p>
                            <ProgressBar
                              label="Receita"
                              valueLabel={\`\${formatCurrency(indicators.realizedRevenue)} / \${formatCurrency(indicators.revenueTarget!)}\`}
                              progress={indicators.revenueProgress!}
                            />
                            <ProgressBar
                              label="Volume (PLs)"
                              valueLabel={\`\${formatMillions(indicators.realizedVolumeMillions)} / \${formatMillions(indicators.volumeTargetMillions!)}\`}
                              progress={indicators.volumeProgress!}
                            />
                          </div>
                        )}
                      </WidgetWrapper>
                    );
                  case 'riskyOrders':
                    return (
                      <WidgetWrapper key="riskyOrders" id="riskyOrders">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={16} color="#d97706" />
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Pedidos em risco {data.riskyOrders.total > 0 && \`(\${data.riskyOrders.total})\`}</h3>
                          </div>
                          {data.riskyOrders.total > 0 && (
                            <button onClick={() => navigate('/agenda')} style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Ver na Agenda</button>
                          )}
                        </div>
                        {data.riskyOrders.items.length === 0 ? (
                          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Nenhum pedido em risco.</p>
                        ) : (
                          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                            {data.riskyOrders.items.map(({ alertType, order, planning }) => (
                              <button key={order.id} onClick={() => setDetailOrderId(order.id)} style={previewCardStyle}>
                                <span style={{ alignSelf: 'flex-start', fontSize: 10, fontWeight: 600, color: '#fff', borderRadius: 10, padding: '2px 8px', backgroundColor: ORDER_ALERT_TYPE_COLORS[alertType] }}>{ORDER_ALERT_TYPE_LABELS[alertType]}</span>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '8px 0 4px' }}>{order.client?.name ?? 'Cliente removido'}</p>
                                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{order.product} · {formatMillions(order.quantityMillions)} PLs</p>
                                {planning.expectedDate && <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Previsão: {formatDate(planning.expectedDate)}</p>}
                              </button>
                            ))}
                          </div>
                        )}
                      </WidgetWrapper>
                    );
                  case 'upcomingDeliveries':
                    return (
                      <WidgetWrapper key="upcomingDeliveries" id="upcomingDeliveries">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CalendarClock size={16} color="#059669" />
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Entregas (próx. {data.upcomingDeliveries.horizonDays} dias) {data.upcomingDeliveries.total > 0 && \`(\${data.upcomingDeliveries.total})\`}</h3>
                          </div>
                          {data.upcomingDeliveries.total > 0 && (
                            <button onClick={() => navigate('/pedidos')} style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Ver pedidos</button>
                          )}
                        </div>
                        {data.upcomingDeliveries.items.length === 0 ? (
                          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Nenhuma entrega prevista.</p>
                        ) : (
                          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                            {data.upcomingDeliveries.items.map((order) => (
                              <button key={order.id} onClick={() => setDetailOrderId(order.id)} style={previewCardStyle}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>{order.client?.name ?? 'Cliente removido'}</p>
                                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{order.product} · {formatMillions(order.quantityMillions)} PLs</p>
                                <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Desejada: {formatDate(order.desiredDeliveryDate)}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </WidgetWrapper>
                    );
                  case 'revenueEvolution':
                    return (
                      <WidgetWrapper key="revenueEvolution" id="revenueEvolution">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <TrendingUp size={16} color="#6366f1" />
                          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Evolução comercial ({data.revenueEvolution.length} meses)</h3>
                        </div>
                        <div style={{ maxWidth: 640 }}>
                          <RevenueEvolutionBars points={data.revenueEvolution} />
                        </div>
                      </WidgetWrapper>
                    );
                  case 'integrationSummary':
                    if (!data.integrationSummary) return null;
                    return (
                      <WidgetWrapper key="integrationSummary" id="integrationSummary">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Cable size={16} color="#4f46e5" />
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Integração AquaFort</h3>
                          </div>
                          <button onClick={() => navigate('/integracao')} style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Ver detalhes</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480 }}>
                          <span style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, backgroundColor: INTEGRATION_OVERALL_STATUS_COLORS[data.integrationSummary.overallStatus] }} />
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{INTEGRATION_OVERALL_STATUS_LABELS[data.integrationSummary.overallStatus]}</p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
                              {data.integrationSummary.counts.total} planejamentos · {data.integrationSummary.counts.sincronizacaoPendente} pendentes
                            </p>
                          </div>
                        </div>
                      </WidgetWrapper>
                    );
                  default:
                    return null;
                }
              })}
            </div>
`;

// Replace the old hardcoded sections
code = code.replace(/<div style=\{\{ display: 'flex', flexDirection: 'column', gap: 32, padding: '24px 32px' \}\}>[\s\S]*?<\/div>\s*<\/div>\s*\{detailOrderId/m, widgetsRender + "\n          </div>\n        )}\n      </div>\n\n      {detailOrderId");

fs.writeFileSync('src/pages/DashboardPage.tsx', code);
