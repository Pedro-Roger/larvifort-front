import { useEffect, useState } from 'react'
import { Phone, Mail, Building2, StickyNote, Clock, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import type { ClientDetail, Reminder } from '@/types'
import {
  ACTIVITY_TYPE_LABELS,
  CLIENT_POTENTIAL_LABELS,
  CLIENT_STATUS_COLORS,
  CLIENT_STATUS_LABELS,
} from '@/lib/domainLabels'

interface Props {
  detail: ClientDetail | null
}

function formatDue(dueAt: string) {
  return new Date(dueAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ClientDetailPanel({ detail }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    if (!detail?.id) return
    let ignore = false
    api.get<Reminder[]>(`/api/v1/reminders?linked_type=client&linked_id=${detail.id}`)
      .then((data) => { if (!ignore) setReminders(data) })
      .catch(() => { if (!ignore) setReminders([]) })
    // Reset ao trocar/fechar o cliente selecionado (cleanup, não corpo do effect).
    return () => {
      ignore = true
      setReminders([])
    }
  }, [detail?.id])

  if (!detail) {
    return (
      <div style={{
        width: 220, flexShrink: 0,
        borderLeft: '1px solid rgba(0,0,0,0.07)',
        backgroundColor: '#fff',
      }} />
    )
  }

  const label = detail.name ?? detail.whatsapp ?? 'Sem nome'
  const pending = reminders.filter((r) => r.state === 'pendente')

  const row = (icon: React.ReactNode, text: string) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 12, color: '#555', lineHeight: 1.5, wordBreak: 'break-word' }}>{text}</span>
    </div>
  )

  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderLeft: '1px solid rgba(0,0,0,0.07)',
      backgroundColor: '#fff',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Client avatar + name */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#888',
        }}>
          {label.charAt(0).toUpperCase()}
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>{label}</p>
          {detail.company ? (
            <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{detail.company.name}</p>
          ) : (
            <span style={{ fontSize: 10, color: '#bbb', border: '1px solid #e5e7eb', borderRadius: 3, padding: '1px 5px' }}>
              Sem empresa
            </span>
          )}
        </div>

        {/* Status/potencial de carteira */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#fff', borderRadius: 10,
            padding: '2px 8px', backgroundColor: CLIENT_STATUS_COLORS[detail.status],
          }}>
            {CLIENT_STATUS_LABELS[detail.status]}
          </span>
          {detail.potential && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#555', borderRadius: 10,
              padding: '2px 8px', border: '1px solid #e5e7eb',
            }}>
              Potencial {CLIENT_POTENTIAL_LABELS[detail.potential]}
            </span>
          )}
        </div>
      </div>

      {/* Info rows */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {detail.whatsapp  && row(<Phone    size={12} color="#bbb" />, detail.whatsapp)}
        {detail.email     && row(<Mail     size={12} color="#bbb" />, detail.email)}
        {detail.company   && row(<Building2 size={12} color="#bbb" />, detail.company.name)}
        {detail.region    && row(<MapPin   size={12} color="#bbb" />, detail.region)}
        {detail.notes     && row(<StickyNote size={12} color="#bbb" />, detail.notes)}
      </div>

      {/* Reminders */}
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
          Lembretes
        </p>

        {pending.length === 0 && (
          <p style={{ fontSize: 12, color: '#ccc', margin: 0 }}>Nenhum lembrete pendente</p>
        )}

        {pending.map((r) => {
          const overdue = new Date(r.dueAt) < new Date()
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                backgroundColor: overdue ? '#ef4444' : '#F2E600',
              }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#111', margin: '0 0 2px' }}>{r.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} color={overdue ? '#ef4444' : '#bbb'} />
                  <span style={{ fontSize: 10, color: overdue ? '#ef4444' : '#bbb' }}>{formatDue(r.dueAt)}</span>
                  <span style={{ fontSize: 9, color: '#bbb' }}>· {ACTIVITY_TYPE_LABELS[r.type]}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
