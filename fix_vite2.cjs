const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

const metasStart = code.indexOf('<h3 style={blockTitle}>Metas Comerciais</h3>');
if (metasStart !== -1) {
  const bottomRowStart = code.indexOf('{/* Bottom Row: Lists */}');
  const originalMiddleEnd = code.substring(metasStart, bottomRowStart);
  
  const newMiddleEnd = '<h3 style={blockTitle}>Metas Comerciais</h3>\n' +
    '          <div style={{ flex: 1, minHeight: 0, position: \'relative\' }}>\n' +
    '            <ResponsiveContainer width="100%" height="100%">\n' +
    '              <RechartsPie>\n' +
    '                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">\n' +
    '                  {pieData.map((_entry, index) => (\n' +
    '                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />\n' +
    '                  ))}\n' +
    '                </Pie>\n' +
    '                <Tooltip />\n' +
    '              </RechartsPie>\n' +
    '            </ResponsiveContainer>\n' +
    '            <div style={{ position: \'absolute\', top: \'50%\', left: \'50%\', transform: \'translate(-50%, -50%)\', textAlign: \'center\' }}>\n' +
    '              <div style={{ fontSize: 28, fontWeight: 700, color: \'#111\' }}>78%</div>\n' +
    '              <div style={{ fontSize: 13, color: \'#6b7280\' }}>da meta</div>\n' +
    '            </div>\n' +
    '          </div>\n' +
    '        </div>\n' +
    '      </div>\n\n      ';
      
  code = code.replace(originalMiddleEnd, newMiddleEnd);
  fs.writeFileSync('src/pages/DashboardPage.tsx', code);
}
