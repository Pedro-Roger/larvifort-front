import { ChevronLeft, ChevronRight, Lock, Pencil, Zap } from 'lucide-react'
import { useState } from 'react'
import type { BoardStage, Order } from '@/types'
import OrderCard from '@/components/orders/OrderCard'

interface Props {
  stage:              BoardStage
  orders:             Order[]
  advancingId:        string | null
  dragOrderId:        string | null
  hasPermissions:     boolean
  // "Avançar" (mesmo propósito do antigo nextStage): se há próxima coluna
  // no board, card ganha botão de avanço além do drag.
  hasNextStage:       boolean
  // Controles estruturais visíveis só para gestor (spec RBAC: comercial vê
  // o board, mas não altera estrutura do pipeline).
  isGestor:           boolean
  canMoveLeft:        boolean
  canMoveRight:       boolean
  onOpenOrder:        (order: Order) => void
  onAdvanceOrder:     (order: Order) => void
  onDragStartOrder:   (order: Order, e: React.DragEvent) => void
  onDropOrder:        (e: React.DragEvent, stageId: string) => void
  onEditStage:        (stage: BoardStage) => void
  onMoveStage:        (stage: BoardStage, dir: -1 | 1) => void
}

// Coluna do board CRM (spec 2026-08-28, Bloco 2: "comportamento proximo de
// Upsprints na parte de coluna/card"). Sem fonte de verdade própria — o
// board inteiro desce da PipelinePage via props/callbacks. Drag nativo
// HTML5: page decide o dataTransfer (`onDragStartOrder`), column é só o
// drop zone; PATCH/rollback vivem no page, nunca aqui.
export default function BoardColumn({
  stage,
  orders,
  advancingId,
  dragOrderId,
  hasPermissions,
  hasNextStage,
  isGestor,
  canMoveLeft,
  canMoveRight,
  onOpenOrder,
  onAdvanceOrder,
  onDragStartOrder,
  onDropOrder,
  onEditStage,
  onMoveStage,
}: Props) {
  const [dragOver, setDragOver] = useState(false)

  const gestorBtnStyle = (enabled: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.3, padding: 2, display: 'flex', alignItems: 'center',
  })

  return (
    <div
      style={{
        width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column',
        backgroundColor: dragOver ? '#e8e8e8' : '#f2f2f2', borderRadius: 10,
        overflow: 'hidden',
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        onDropOrder(e, stage.id)
      }}
    >

      {/* Header matching screenshot */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: 6,
        marginBottom: 8, backgroundColor: '#f9fafb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 12,
              backgroundColor: stage.color || '#F2E600', color: '#111', letterSpacing: '0.04em'
            }}>
              {stage.name}
            </span>
            {hasPermissions && (
              <span title="Permissões restritas" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <Lock size={9} color="#9ca3af" />
              </span>
            )}
          </div>
          {isGestor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                onClick={() => onMoveStage(stage, -1)} disabled={!canMoveLeft}
              ><ChevronLeft size={14} color={canMoveLeft ? "#888" : "#ccc"} /></button>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                onClick={() => onMoveStage(stage, 1)} disabled={!canMoveRight}
              ><ChevronRight size={14} color={canMoveRight ? "#888" : "#ccc"} /></button>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', marginLeft: 4 }}
                onClick={() => onEditStage(stage)}
              ><Pencil size={12} color="#888" /></button>
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500, letterSpacing: '0.02em', marginTop: 2 }}>
          {orders.length} OPPORTUNITIES
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', display: 'flex', justifyContent: 'space-between', marginTop: 4, fontWeight: 500 }}>
          <span>ANNUALIZED VALUE:</span>
          <span style={{ fontWeight: 600, color: '#374151' }}>
            $ {orders.reduce((acc, o) => acc + (Number(o.value) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            hasNextStage={hasNextStage}
            advancing={advancingId === order.id}
            dragging={dragOrderId === order.id}
            onOpen={onOpenOrder}
            onAdvance={onAdvanceOrder}
            onDragStart={(o, e) => onDragStartOrder(o, e)}
          />
        ))}
        {dragOrderId && orders.length === 0 && (
          <div style={{
            border: '1px dashed #ccc', borderRadius: 8, padding: '14px 10px',
            fontSize: 11, color: '#9ca3af', textAlign: 'center',
          }}>
            Solte aqui
          </div>
        )}
      </div>
    </div>
  )
}
