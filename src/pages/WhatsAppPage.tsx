import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { QrCode, RefreshCw, Send, Wifi, WifiOff } from 'lucide-react'
import AppSidebar from '@/components/layout/AppSidebar'
import { whatsappApi, type WhatsAppQr, type WhatsAppStatus } from '@/lib/api'

const emptyCompanies: [] = []

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [qr, setQr] = useState<WhatsAppQr | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [number, setNumber] = useState('')
  const [text, setText] = useState('Teste LarviFort CRM')
  const [lastResult, setLastResult] = useState<string | null>(null)

  async function loadStatus() {
    setLoading(true)
    try {
      const next = await whatsappApi.status()
      setStatus(next)
      if (!next.configured) setQr(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  async function createInstance() {
    setBusy(true)
    try {
      await whatsappApi.createInstance()
      toast.success('Instância criada')
      await loadStatus()
      await loadQr()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar instância')
    } finally {
      setBusy(false)
    }
  }

  async function loadQr() {
    setBusy(true)
    try {
      setQr(await whatsappApi.qr())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao buscar QR Code')
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    setBusy(true)
    setLastResult(null)
    try {
      const result = await whatsappApi.testMessage(number, text)
      setLastResult(`Enviado em ${new Date(result.sentAt).toLocaleString('pt-BR')}`)
      toast.success('Mensagem enviada')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem'
      setLastResult(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  async function disconnect() {
    setBusy(true)
    try {
      await whatsappApi.disconnect()
      setQr(null)
      toast.success('WhatsApp desconectado')
      await loadStatus()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao desconectar')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void loadStatus()
  }, [])

  const connected = status?.connectionState === 'open'
  const label = loading
    ? 'Carregando'
    : !status?.configured
      ? 'Sem instância'
      : connected
        ? 'Conectado'
        : status.error
          ? 'Erro'
          : 'Aguardando conexão'

  return (
    <div style={{ height: '100vh', display: 'flex', backgroundColor: '#f5f5f2', color: '#171717' }}>
      <AppSidebar
        companies={emptyCompanies}
        sidebarView="all-clients"
        selectedCompanyId={null}
        onSelectCompany={() => {}}
        onViewAllClients={() => {}}
        onViewReminders={() => {}}
        onAddCompany={() => {}}
      />

      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: 28 }}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
            <div>
              <h1 style={{ fontSize: 24, lineHeight: 1.15, margin: 0, fontWeight: 700 }}>WhatsApp</h1>
              <p style={{ margin: '6px 0 0', color: '#666', fontSize: 14 }}>Evolution API local</p>
            </div>
            <button onClick={loadStatus} disabled={busy || loading} title="Atualizar" style={iconButtonStyle}>
              <RefreshCw size={17} />
            </button>
          </header>

          <section style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ ...statusIconStyle, backgroundColor: connected ? '#dcfce7' : '#fee2e2', color: connected ? '#166534' : '#991b1b' }}>
                  {connected ? <Wifi size={18} /> : <WifiOff size={18} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>
                  <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>
                    {status?.instance?.instanceName ?? 'Nenhuma instância cadastrada'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!status?.configured && (
                  <button onClick={createInstance} disabled={busy || loading} style={primaryButtonStyle}>Criar instância</button>
                )}
                {status?.configured && !connected && (
                  <button onClick={loadQr} disabled={busy || loading} style={primaryButtonStyle}>Mostrar QR</button>
                )}
                {status?.configured && (
                  <button onClick={disconnect} disabled={busy || loading} style={secondaryButtonStyle}>Desconectar</button>
                )}
              </div>
            </div>
            {status?.error && <p style={errorStyle}>{status.error}</p>}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) minmax(320px, 1fr)', gap: 16, marginTop: 16 }}>
            <section style={panelStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <QrCode size={18} />
                <h2 style={sectionTitleStyle}>Conexão</h2>
              </div>
              {qr?.base64 ? (
                <img src={qr.base64} alt="QR Code WhatsApp" style={{ width: '100%', maxWidth: 320, aspectRatio: '1', objectFit: 'contain', display: 'block' }} />
              ) : (
                <div style={qrPlaceholderStyle}>QR Code</div>
              )}
              {qr?.code && <p style={{ marginTop: 12, fontSize: 12, color: '#666', wordBreak: 'break-all' }}>{qr.code}</p>}
            </section>

            <section style={panelStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Send size={18} />
                <h2 style={sectionTitleStyle}>Teste de envio</h2>
              </div>
              <label style={labelStyle}>Número</label>
              <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="5585999999999" style={inputStyle} />
              <label style={labelStyle}>Mensagem</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              <button onClick={sendTest} disabled={busy || !status?.configured} style={{ ...primaryButtonStyle, marginTop: 12 }}>Enviar teste</button>
              {lastResult && <p style={{ margin: '12px 0 0', color: '#444', fontSize: 13 }}>{lastResult}</p>}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #e5e5e0',
  borderRadius: 8,
  padding: 18,
}

const iconButtonStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  border: '1px solid #d9d9d3',
  borderRadius: 8,
  backgroundColor: '#fff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

const primaryButtonStyle: React.CSSProperties = {
  height: 38,
  border: 'none',
  borderRadius: 8,
  backgroundColor: '#111',
  color: '#F2E600',
  fontWeight: 700,
  padding: '0 14px',
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  backgroundColor: '#f2f2ee',
  color: '#333',
}

const statusIconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
}

const qrPlaceholderStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 320,
  aspectRatio: '1',
  border: '1px dashed #cfcfc8',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888',
  backgroundColor: '#fafaf7',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  margin: '12px 0 6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #d9d9d3',
  borderRadius: 8,
  padding: '10px 11px',
  fontSize: 14,
  outline: 'none',
}

const errorStyle: React.CSSProperties = {
  margin: '14px 0 0',
  padding: '10px 12px',
  backgroundColor: '#fef2f2',
  color: '#991b1b',
  borderRadius: 8,
  fontSize: 13,
}
