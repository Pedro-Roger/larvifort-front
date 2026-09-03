# Auditoria Completa - LarviFort CRM

## 1. Frontend
- **Framework:** React 19 com Vite
- **TypeScript:** Sim (v6.x)
- **Roteamento:** `react-router-dom` (v7)
- **Gerenciamento de Estado:** `zustand` (v5)
- **Biblioteca de UI & Design System:** Baseado em Tailwind CSS (v4) e Radix UI (Shadcn UI).
- **Componentes Atuais:** `lucide-react` para ícones, `sonner` para toasts.
- **Estruturas de Tabela/Gráficos:** Não há dependências pesadas de gráficos ou tabelas complexas (ex: recharts, ag-grid) instaladas no `package.json` base. Precisaremos adicionar.
- **Server-state & Cache:** Atualmente não há React Query ou SWR configurado no package.json.

## 2. Backend
- **Framework:** Node.js com Express
- **Arquitetura:** REST API (inferido), baseada em Services e Controllers.
- **ORM:** Prisma (v5.22)
- **Banco de Dados:** PostgreSQL (pg)
- **Autenticação:** `@auth/express`, `bcryptjs`.
- **Módulos Identificados:** 
  - Usuários/Auth (RBAC `comercial` vs `gestor`)
  - Evolution API (WhatsApp)
  - Clientes (B2C) e Companies (B2B)
  - Pedidos e Funil Comercial (Pipelines)
  - Planejamento (Sincronização com AquaFort)
  - Mensagens e Conversas (WhatsApp)
  - Lembretes (Atividades)
  - Metas

## 3. Banco de Dados (Prisma Schema)
- **Multi-tenancy:** Implementado via `organizationId` em todas as tabelas principais.
- **Empresas (Company):** Contém nome, CNPJ, localização de fazenda, tamanho.
- **Contatos (CompanyContact):** Vinculado à `Company`.
- **Clientes (Client):** Pode estar vinculado à `Company`, possui whatsapp, região, status.
- **Pedidos (Order):** Vinculados ao `Client` (via `clientId`), não diretamente à `Company`. Possui `commercialStage`, `quantityMillions`, `value`, `priority`.
- **Pipeline:** Tabelas `Pipeline` e `PipelineStage` gerenciando o Kanban/Funil.
- **WhatsApp:** Tabelas `Conversation` e `Message` (Deduplicação de mensagens via índice parcial configurado em SQL).
- **Atividades/Agendamento:** Tabela `Reminder` (`ActivityType`: ligacao, reuniao, visita, tarefa). Relacionamento polimórfico (`linkedType`, `linkedId`).
- **Metas:** Tabela `Goal` (por `userId` e `period`).

## 4. Integração e Associação Atual
- **Como um pedido é associado ao cliente:** Atualmente, `Order` possui um `clientId` obrigatório, apontando para a tabela `Client`. A tabela `Client`, por sua vez, possui um `companyId` opcional apontando para `Company`.
- **Migração sem quebrar histórico:** Não podemos apagar a tabela `Client` de imediato. A transição ideal envolve manter a estrutura de `Order -> Client -> Company`, ou permitir que `Order` aponte diretamente para `Company` (adicionando `companyId` em `Order` e migrando os dados históricos, preenchendo o `companyId` com base no `Client.companyId`).

## 5. Débitos Técnicos e Problemas
- A separação entre `Client` e `Company` parece ambígua. `Client` concentra as conversas e os pedidos. O Customer 360 pede foco na Empresa (Company e CommercialGroup).
- `Reminder` utiliza polimorfismo (`linkedType`/`linkedId`), o que no PostgreSQL impede Foreign Keys reais. Isso é um risco de integridade.
- `Order` e `Client` concentram muita informação que, no novo modelo, deve ser agregada via `CommercialGroup` e `Company`.
- Faltam estruturas para `CommercialGroup`, matriz/filial, campos customizados e automações.

## 6. Proposta de Integração
- Introduzir `CommercialGroup` e vinculá-lo a `Company`.
- Adicionar suporte a Matriz/Filial (auto-relacionamento em `Company`).
- Adicionar `companyId` na `Order` para migração direta sem passar pelo `Client` (ou reforçar que todo `Client` B2B deve ter um `Company`).
- Reaproveitar `Reminder` para Atividades/Agendamento, possivelmente convertendo o polimorfismo em colunas com FKs reais (`companyId`, `opportunityId`, etc.).
- Reaproveitar a tabela `Goal` atual, expandindo seus tipos.
- Aproveitar as tabelas `Conversation` e `Message` para as interações de WhatsApp, conectando-as à `Company`.
