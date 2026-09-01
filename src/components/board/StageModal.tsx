import { useState } from 'react'
import { Archive, Lock, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { ORDER_STAGES, type OrderStage, type PipelineStage } from '@/types'
import { ORDER_STAGE_LABELS } from '@/lib/domainLabels'
import type { ColumnFormula, ColumnPermission } from '@/types'

const COLOR_SWATCHES = [
  '#6b7280', '#d97706', '#3b82f6', '#8b5cf6', '#f59e0b', '#0ea5e9',
  '#22c55e', '#059669', '#6d28d9', '#0d9488', '#e11d48', '#111111',
] as const

interface Props {
  stage:    PipelineStage | null // null = criar nova coluna
  onClose:  () => void
  onSaved:  (stage: PipelineStage) => void
  onArchived: (stage: PipelineStage) => void
  onDeleted:  (stageId: string) => void
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#aaa',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '7px 10px', fontSize: 13, color: '#111',
  border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6,
  outline: 'none', backgroundColor: '#f9fafb', fontFamily: 'inherit',
}

// Modal de coluna (gestor) — criar/editar/arquivar/remover. semantic_key =
// vínculo AquaFort: mostra o que a automação dispara; renomear a coluna é
// seguro porque o vínculo é por chave, não por nome (spec Bloco 1).
export default function StageModal({ stage, onClose, onSaved, onArchived, onDeleted }: Props) {
  const isNew = stage === null
  const [name, setName]               = useState(stage?.name ?? '')
  const [color, setColor]             = useState(stage?.color ?? '#6b7280')
  const [semanticKey, setSemanticKey] = useState<OrderStage | ''>(stage?.semanticKey ?? '')
  const [saving, setSaving]           = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [permissions, setPermissions] = useState<ColumnPermission[]>([])
  const [showPermissions, setShowPermissions] = useState(false)
  const [newGranteeType, setNewGranteeType] = useState<'role' | 'user'>('role')
  const [newGranteeId, setNewGranteeId] = useState('')
  const [newPermissions, setNewPermissions] = useState({ view: false, move: false, edit: false, manage: false })
  const [permissionsLoading, setPermissionsLoading] = useState(false)

  // Formulas state
  const [formulas, setFormulas] = useState<ColumnFormula[]>([])
  const [showFormulas, setShowFormulas] = useState(false)
  const [formulaName, setFormulaName] = useState('')
  const [formulaExpression, setFormulaExpression] = useState('')
  const [formulaResultType, setFormulaResultType] = useState('number')
  const [formulasLoading, setFormulasLoading] = useState(false)
  const [formulaSaving, setFormulaSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        name:         name.trim(),
        color,
        semanticKey:  semanticKey === '' ? null : semanticKey,
      }
      const result = isNew
        ? await api.post<{ stage: PipelineStage }>('/api/v1/pipelines/default/stages', payload)
        : await api.patch<{ stage: PipelineStage }>(`/api/v1/pipeline-stages/${stage!.id}`, payload)
      onSaved(result.stage)
      toast.success(isNew ? 'Coluna criada.' : 'Coluna atualizada.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar coluna')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!stage) return
    setSaving(true)
    try {
      const result = await api.patch<{ stage: PipelineStage }>(`/api/v1/pipeline-stages/${stage.id}`, { isActive: false })
      onArchived(result.stage)
      toast.success('Coluna arquivada.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao arquivar coluna')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!stage) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSaving(true)
    try {
      await api.delete<void>(`/api/v1/pipeline-stages/${stage.id}`)
      onDeleted(stage.id)
      toast.success('Coluna removida.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover coluna')
    } finally {
      setSaving(false)
    }
  }

  async function fetchPermissions() {
    if (!stage) return
    setPermissionsLoading(true)
    try {
      const data = await api.get<ColumnPermission[]>(`/api/v1/pipeline-stages/${stage.id}/permissions`)
      setPermissions(data)
    } catch {
      // silent
    } finally {
      setPermissionsLoading(false)
    }
  }

  async function handleAddPermission() {
    if (!stage) return
    try {
      const permission = await api.post<ColumnPermission>(`/api/v1/pipeline-stages/${stage.id}/permissions`, {
        granteeType: newGranteeType,
        granteeId: newGranteeId || null,
        permissions: newPermissions,
      })
      setPermissions((prev) => [...prev, permission])
      setNewGranteeId('')
      setNewPermissions({ view: false, move: false, edit: false, manage: false })
      toast.success('Permissão adicionada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar permissão')
    }
  }

async function handleDeletePermission(permissionId: string) {
     if (!stage) return
     try {
       await api.delete<void>(`/api/v1/pipeline-stages/permissions/${permissionId}`)
       setPermissions((prev) => prev.filter((p) => p.id !== permissionId))
       toast.success('Permissão removida')
     } catch (err) {
       toast.error(err instanceof Error ? err.message : 'Erro ao remover permissão')
     }
   }

   async function fetchFormulas() {
     if (!stage) return
     setFormulasLoading(true)
     try {
       const data = await api.get<ColumnFormula[]>(`/api/v1/pipeline-stages/${stage.id}/formulas`)
       setFormulas(data)
     } catch {
       // silent
     } finally {
       setFormulasLoading(false)
     }
   }

   async function handleAddFormula() {
     if (!stage) return
     setFormulaSaving(true)
     try {
       const formula = await api.post<ColumnFormula>(`/api/v1/pipeline-stages/${stage.id}/formulas`, {
         name: formulaName.trim(),
         expression: formulaExpression.trim(),
         resultType: formulaResultType,
         isActive: true,
       })
       setFormulas((prev) => [...prev, formula])
       setFormulaName('')
       setFormulaExpression('')
       setFormulaSaving(false)
       toast.success('Fórmula adicionada')
     } catch (err) {
       toast.error(err instanceof Error ? err.message : 'Erro ao adicionar fórmula')
       setFormulaSaving(false)
     }
   }

   async function handleDeleteFormula(formulaId: string) {
     if (!stage) return
     try {
       await api.delete<void>(`/api/v1/pipeline-stages/formulas/${formulaId}`)
       setFormulas((prev) => prev.filter((f) => f.id !== formulaId))
       toast.success('Fórmula removida')
     } catch (err) {
       toast.error(err instanceof Error ? err.message : 'Erro ao remover fórmula')
     }
   }

   return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: 360, maxWidth: 'calc(100vw - 32px)',
        backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>
            {isNew ? 'Nova coluna' : 'Editar coluna'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={16} color="#6b7280" />
          </button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nome</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aprovado, FUP, Conversão"
            />
          </div>

          <div>
            <label style={labelStyle}>Cor da coluna</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 22, height: 22, borderRadius: 9999, backgroundColor: c,
                    border: color === c ? '2px solid #111' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                />
              ))}
            </div>
            <input style={inputStyle} value={color} onChange={(e) => setColor(e.target.value)} placeholder="#3b82f6" />
          </div>

          <div>
            <label style={labelStyle}>Semântica AquaFort</label>
            <select style={inputStyle} value={semanticKey} onChange={(e) => setSemanticKey(e.target.value as OrderStage | '')}>
              <option value="">Sem semântica (coluna extra)</option>
              {ORDER_STAGES.map((s) => (
                <option key={s} value={s}>{ORDER_STAGE_LABELS[s]}</option>
              ))}
            </select>
            <p style={{ fontSize: 10, color: '#bbb', margin: '4px 0 0' }}>
              Com semântica: automações do AquaFort disparam a partir da coluna (ex: aprovado → sincroniza).
              Sem semântica: só organização visual.
            </p>
          </div>

          {stage && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={labelStyle}>Permissões de coluna</label>
                <button
                  type="button"
                  onClick={() => { setShowPermissions(!showPermissions); if (!showPermissions) fetchPermissions() }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Lock size={12} color="#6b7280" />
                  <span style={{ fontSize: 11, color: '#6b7280' }}>
                    {showPermissions ? 'Ocultar' : `${permissions.length} permissão(ões)`}
                  </span>
                </button>
              </div>

              {showPermissions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {permissionsLoading ? (
                    <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>Carregando...</p>
                  ) : permissions.length === 0 ? (
                    <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>Nenhuma permissão configurada — gestores e comerciais da própria carteira têm acesso padrão.</p>
                  ) : (
                    permissions.map((p) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '4px 8px', backgroundColor: '#fafafa', borderRadius: 6 }}>
                        <span>
                          {p.granteeType === 'role' ? 'Todos os comerciais' : `Usuário ${p.granteeId?.slice(0, 8)}...`}
                          — {Object.entries(p.permissions as Record<string, boolean>).filter(([, v]) => v).map(([k]) => k).join(', ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePermission(p.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#ef4444' }}
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))
                  )}

                  <div style={{ padding: 8, backgroundColor: '#fafafa', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <select
                      style={{ ...inputStyle, padding: '4px 8px', fontSize: 11 }}
                      value={newGranteeType}
                      onChange={(e) => setNewGranteeType(e.target.value as 'role' | 'user')}
                    >
                      <option value="role">Por role (todos os comerciais)</option>
                      <option value="user">Por usuário</option>
                    </select>
                    {newGranteeType === 'user' && (
                      <input
                        style={inputStyle}
                        placeholder="ID do usuário"
                        value={newGranteeId}
                        onChange={(e) => setNewGranteeId(e.target.value)}
                      />
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(['view', 'move', 'edit', 'manage'] as const).map((action) => (
                        <label key={action} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                          <input
                            type="checkbox"
                            checked={newPermissions[action]}
                            onChange={(e) => setNewPermissions((prev) => ({ ...prev, [action]: e.target.checked }))}
                          />
                          {action}
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPermission}
                      disabled={saving}
                      style={{
                        padding: '4px 10px', fontSize: 11, fontWeight: 600,
                        backgroundColor: '#F2E600', border: 'none', borderRadius: 6,
                        cursor: 'pointer', alignSelf: 'flex-start',
                      }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {stage && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={labelStyle}>Fórmulas da coluna</label>
                <button
                  type="button"
                  onClick={() => { setShowFormulas(!showFormulas); if (!showFormulas) fetchFormulas() }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={12} color="#6b7280" />
                  <span style={{ fontSize: 11, color: '#6b7280' }}>
                    {showFormulas ? 'Ocultar' : `${formulas.length} fórmula(s)`}
                  </span>
                </button>
              </div>

              {showFormulas && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formulasLoading ? (
                    <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>Carregando...</p>
                  ) : (
                    <>
                      {formulas.length === 0 ? (
                        <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>Nenhuma fórmula configurada para esta coluna.</p>
                      ) : (
                        formulas.map((f) => (
                          <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '4px 8px', backgroundColor: '#fafafa', borderRadius: 6 }}>
                            <span>
                              <strong>{f.name}</strong> ({f.resultType})
                              <br />
                              <code style={{ fontSize: 10, color: '#6b7280' }}>{f.expression}</code>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteFormula(f.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#ef4444' }}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))
                      )}

                      <div style={{ padding: 8, backgroundColor: '#fafafa', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input
                          style={inputStyle}
                          placeholder="Nome da fórmula (ex: Receita Líquida)"
                          value={formulaName}
                          onChange={(e) => setFormulaName(e.target.value)}
                        />
                        <input
                          style={inputStyle}
                          placeholder="Expressão (ex: quantityMillions * value)"
                          value={formulaExpression}
                          onChange={(e) => setFormulaExpression(e.target.value)}
                        />
                        <select
                          style={{ ...inputStyle, padding: '4px 8px', fontSize: 11 }}
                          value={formulaResultType}
                          onChange={(e) => setFormulaResultType(e.target.value)}
                        >
                          <option value="number">Número</option>
                          <option value="currency">Moeda</option>
                          <option value="percentage">Percentual</option>
                          <option value="text">Texto</option>
                          <option value="date">Data</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddFormula}
                          disabled={formulaSaving}
                          style={{
                            padding: '4px 10px', fontSize: 11, fontWeight: 600,
                            backgroundColor: '#F2E600', border: 'none', borderRadius: 6,
                            cursor: 'pointer', alignSelf: 'flex-start',
                          }}
                        >
                          Adicionar fórmula
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            style={{
              padding: '9px 14px', fontSize: 13, fontWeight: 600, color: '#111',
              backgroundColor: !name.trim() ? '#f3f4f6' : '#F2E600',
              border: 'none', borderRadius: 7,
              cursor: !name.trim() ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Salvando...' : isNew ? 'Criar coluna' : 'Salvar'}
          </button>

          {!isNew && (
            <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <button
                onClick={handleArchive}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, flex: 1,
                  padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#6b7280',
                  backgroundColor: '#f3f4f6', border: 'none', borderRadius: 7,
                  cursor: 'pointer', justifyContent: 'center',
                }}
              >
                <Archive size={11} /> Arquivar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, flex: 1,
                  padding: '7px 10px', fontSize: 12, fontWeight: 600, color: '#fff',
                  backgroundColor: confirmDelete ? '#dc2626' : '#f87171',
                  border: 'none', borderRadius: 7, cursor: 'pointer', justifyContent: 'center',
                }}
              >
                <Trash2 size={11} /> {confirmDelete ? 'Confirmar remoção' : 'Remover'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
