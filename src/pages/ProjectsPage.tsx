import { useEffect, useState } from 'react';
import { Plus, GitBranch, Edit, Trash2, MoreVertical, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { projectsService } from '@/services/kanban/projectsService';
import { boardsService } from '@/services/kanban/boardsService';
import { useProjectStore } from '@/store/kanban/projectStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Project } from '@/types/kanban';

export default function ProjectsPage() {
  const { projects, setProjects, setCurrentProject } = useProjectStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectsService.list();
      const withBoards = await Promise.all(
        data.map(async (p) => {
          try {
            const boards = await boardsService.list(p.id);
            return { ...p, boards };
          } catch {
            return { ...p, boards: [] };
          }
        })
      );
      setProjects(withBoards);
    } catch {
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    try {
      await projectsService.create({ name: newProjectName.trim(), description: newProjectDesc || undefined });
      toast.success('Projeto criado');
      setCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      loadProjects();
    } catch {
      toast.error('Erro ao criar projeto');
    }
  };

  const handleUpdate = async () => {
    if (!editProject) return;
    try {
      await projectsService.update(editProject.id, { name: newProjectName, description: newProjectDesc || undefined });
      toast.success('Projeto atualizado');
      setEditProject(null);
      loadProjects();
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir projeto e todos seus quadros?')) return;
    try {
      await projectsService.delete(id);
      toast.success('Projeto excluído');
      loadProjects();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const openEdit = (project: Project) => {
    setEditProject(project);
    setNewProjectName(project.name);
    setNewProjectDesc(project.description || '');
  };

  const openCreate = () => {
    setEditProject(null);
    setNewProjectName('');
    setNewProjectDesc('');
    setCreateDialogOpen(true);
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[hsl(222,47%,11%)] dark:text-[hsl(214,40%,96%)]">Projetos</h1>
        <Button onClick={openCreate} className="h-9">
          <Plus className="w-4 h-4 mr-1.5" /> Novo Projeto
        </Button>
      </div>

      <Input
        placeholder="Buscar projetos..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-[hsl(217,33%,17%)] rounded-lg border border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)] p-4 animate-pulse space-y-3">
              <div className="h-5 bg-[hsl(214,32%,95%)] dark:bg-[hsl(217,33%,20%)] rounded w-3/4" />
              <div className="h-3 bg-[hsl(214,32%,95%)] dark:bg-[hsl(217,33%,20%)] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)]">
          {search ? 'Nenhum projeto encontrado' : 'Nenhum projeto. Crie o primeiro!'}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => {
                setCurrentProject(project.id);
                const defaultBoard = project.boards?.find(b => b.isDefault) || project.boards?.[0];
                if (defaultBoard) navigate(`/kanban/${defaultBoard.id}`);
              }}
              onEdit={() => openEdit(project)}
              onDelete={() => handleDelete(project.id)}
              onOpenBoard={(boardId) => navigate(`/kanban/${boardId}`)}
            />
          ))}
        </div>
      )}

      <Dialog open={createDialogOpen || !!editProject} onOpenChange={v => { if (!v) { setCreateDialogOpen(false); setEditProject(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
            <DialogDescription>
              {editProject ? 'Altere as informações do projeto.' : 'Crie um projeto para agrupar quadros.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); editProject ? handleUpdate() : handleCreate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proj-name">Nome *</Label>
              <Input id="proj-name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proj-desc">Descrição</Label>
              <Textarea id="proj-desc" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setCreateDialogOpen(false); setEditProject(null); }}>
                Cancelar
              </Button>
              <Button type="submit">{editProject ? 'Atualizar' : 'Criar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectCard({ project, onClick, onEdit, onDelete, onOpenBoard }: {
  project: Project;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenBoard: (boardId: string) => void;
}) {
  const defaultBoard = project.boards?.find(b => b.isDefault) || project.boards?.[0];

  return (
    <div
      className="bg-white dark:bg-[hsl(217,33%,17%)] rounded-lg border border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)] p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-150 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)] dark:text-[hsl(214,40%,96%)] truncate">{project.name}</h3>
            <p className="text-xs text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)]">{project.boards?.length || 0} quadro(s)</p>
          </div>
        </div>
        {(project as Project & { visibility?: string }).visibility === 'private' && (
          <Lock className="w-3.5 h-3.5 text-[hsl(215,16%,47%)]" />
        )}
      </div>

      {project.description && (
        <p className="text-xs text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] line-clamp-2 mb-3">{project.description}</p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {project.boards?.slice(0, 3).map(b => (
          <Button
            key={b.id}
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={e => { e.stopPropagation(); onOpenBoard(b.id); }}
          >
            {b.name}
          </Button>
        ))}
        {project.boards && project.boards.length > 3 && (
          <Badge variant="secondary" className="h-7 text-xs">+{project.boards.length - 3}</Badge>
        )}
      </div>

      <div className="pt-3 border-t border-[hsl(214,32%,95%)] dark:border-[hsl(217,33%,20%)] flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(214,32%,95%)]"
          onClick={e => { e.stopPropagation(); onEdit(); }}
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(214,32%,95%)]"
              onClick={e => e.stopPropagation()}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {defaultBoard && (
              <DropdownMenuItem onClick={e => { e.stopPropagation(); onOpenBoard(defaultBoard.id); }}>
                <ArrowRight className="h-3.5 w-3.5 mr-2" /> Abrir quadro padrão
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[hsl(0,84%,60%)]" onClick={e => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir projeto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
