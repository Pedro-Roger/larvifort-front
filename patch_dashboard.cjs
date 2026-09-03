const fs = require('fs');
const path = 'src/pages/DashboardPage.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('widgetOrder')) {
  // Add imports
  code = code.replace(
    "import { useCallback, useEffect, useState } from 'react'",
    "import { useCallback, useEffect, useState, useRef } from 'react'\nimport { GripHorizontal } from 'lucide-react'"
  );

  // Default order
  const defaultOrder = "['indicators', 'goals', 'riskyOrders', 'upcomingDeliveries', 'revenueEvolution', 'integrationSummary']";
  
  // Add state
  const stateHooks = `
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('@larvifort/dashboard-order')
      if (saved) return JSON.parse(saved)
    } catch {}
    return ${defaultOrder}
  })
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidget(id)
    e.dataTransfer.effectAllowed = 'move'
    // Optional: make the drag image look better or transparent
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (!draggedWidget || draggedWidget === id) return
    
    setWidgetOrder(prev => {
      const draggedIdx = prev.indexOf(draggedWidget)
      const hoverIdx = prev.indexOf(id)
      const newOrder = [...prev]
      newOrder.splice(draggedIdx, 1)
      newOrder.splice(hoverIdx, 0, draggedWidget)
      return newOrder
    })
  }

  const handleDragEnd = () => {
    setDraggedWidget(null)
    localStorage.setItem('@larvifort/dashboard-order', JSON.stringify(widgetOrder))
  }

  const WidgetWrapper = ({ id, children }: { id: string, children: React.ReactNode }) => {
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, id)}
        onDragOver={(e) => handleDragOver(e, id)}
        onDragEnd={handleDragEnd}
        onDragEnter={(e) => e.preventDefault()}
        style={{
          opacity: draggedWidget === id ? 0.4 : 1,
          transition: 'transform 0.1s ease',
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: '20px',
          border: '1px solid rgba(0,0,0,0.06)',
          position: 'relative',
          cursor: 'grab'
        }}
      >
        <div style={{ position: 'absolute', top: 12, right: 12, color: '#d1d5db', cursor: 'grab' }}>
          <GripHorizontal size={16} />
        </div>
        {children}
      </div>
    )
  }
`;

  code = code.replace(
    "const hasGoal = indicators !== null && indicators.goalsCount > 0",
    "const hasGoal = indicators !== null && indicators.goalsCount > 0\n" + stateHooks
  );

  // We need to replace the static <section> list with dynamic rendering
  // This requires reading the entire JSX and rewriting it, which is complex via regex.
  // I will write a simple python script to parse and replace the dashboard content.
  fs.writeFileSync('patch_dashboard_tmp.js', code);
}
