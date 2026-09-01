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
      {/* Header: cor + nome + count + (gestor) edit/reorder */}
      <div style={{
        padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexShrink: 0, gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 9999, flexShrink: 0,
            backgroundColor: stage.color,
          }} />
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase',
            letterSpacing: '0.04em', margin: 0, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {stage.name}
          </p>
          {stage.semanticKey && (
            <span
              title={`Semântica AquaFort: ${stage.semanticKey}`}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <Zap size={9} color="#d97706" />
            </span>
          )}
          {hasPermissions && (
            <span
              title="Coluna com permissões restritas"
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
            >
              <Lock size={9} color="#9ca3af" />
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#999', backgroundColor: '#fff',
            borderRadius: 8, padding: '1px 7px',
          }}>
            {orders.length}
          </span>
          {isGestor && (
            <>
              <button
                style={gestorBtnStyle(canMoveLeft)}
                onClick={() => onMoveStage(stage, -1)}
                disabled={!canMoveLeft}
                title="Mover coluna para a esquerda"
              >
                <ChevronLeft size={12} color="#666" />
              </button>
              <button
                style={gestorBtnStyle(canMoveRight)}
                onClick={() => onMoveStage(stage, 1)}
                disabled={!canMoveRight}
                title="Mover coluna para a direita"
              >
                <ChevronRight size={12} color="#666" />
              </button>
              <button
                style={{ ...gestorBtnStyle(true), marginLeft: 2 }}
                onClick={() => onEditStage(stage)}
                title="Editar coluna"
              >
                <Pencil size={10} color="#666" />
              </button>
            </>
          )}
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
