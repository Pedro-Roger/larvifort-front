const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// I will just carefully replace the end of the Middle Row up to the Bottom Row.
// We know that `    <div style={{ ...blockStyle, minHeight: 380, display: 'flex', flexDirection: 'column' }}>`
// starts the Metas block.

const metasStart = code.indexOf('<h3 style={blockTitle}>Metas Comerciais</h3>');
if (metasStart !== -1) {
  const bottomRowStart = code.indexOf('{/* Bottom Row: Lists */}');
  
  const originalMiddleEnd = code.substring(metasStart, bottomRowStart);
  
  // The correct middle end should be just one closing div after the Metas block.
  const newMiddleEnd = \`<h3 style={blockTitle}>Metas Comerciais</h3>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {pieData.map((_entry, index) => (
                    <Cell key={\\\`cell-\${index}\\\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>78%</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>da meta</div>
            </div>
          </div>
        </div>
      </div>

      \`;
      
  code = code.replace(originalMiddleEnd, newMiddleEnd);
  fs.writeFileSync('src/pages/DashboardPage.tsx', code);
}
