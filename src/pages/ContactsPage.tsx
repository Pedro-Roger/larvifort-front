import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

type Contact = {
  id: string
  phone: string
  name: string
  profilePictureUrl: string | null
  conversationId: string | null
  assignedUserId: string | null
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get<Contact[]>('/api/v1/contacts')
      .then(setContacts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleStartConversation(contact: Contact) {
    if (contact.conversationId) {
      navigate('/inbox') // Need a way to select the conversation in inbox
      return
    }

    try {
      await api.post<{ conversationId: string }>('/api/v1/contacts/start-conversation', {
        whatsappChatId: contact.id,
        name: contact.name
      })
      navigate('/inbox')
    } catch (err) {
      console.error('Failed to start conversation', err)
    }
  }

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Carregando contatos...</div>
  }

  return (
    <div className="h-full flex flex-col bg-white p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Contatos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contacts.map(contact => (
          <div key={contact.id} className="border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {contact.profilePictureUrl ? (
                <img src={contact.profilePictureUrl} alt={contact.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 font-bold">{contact.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
              <p className="text-sm text-gray-500 truncate">{contact.phone}</p>
            </div>
            <button
              onClick={() => handleStartConversation(contact)}
              className="px-3 py-1.5 bg-black text-[#F2E600] text-sm font-bold rounded-md hover:bg-gray-800 transition-colors"
            >
              {contact.conversationId ? 'Abrir' : 'Iniciar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
