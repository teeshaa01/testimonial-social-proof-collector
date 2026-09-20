import React, { useState, useEffect } from 'react';
import { spaceApi } from '../../api/space.api';
import { SpaceCard } from '../../components/spaces/SpaceCard';
import { SpaceFormModal } from '../../components/spaces/SpaceFormModal';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent } from '../../components/ui/Dialog';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, FolderPlus, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

export const DashboardHome = () => {
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [spaceToDelete, setSpaceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const { success, error } = useToast();

  const fetchSpaces = async () => {
    setIsLoading(true);
    try {
      const res = await spaceApi.getAll();
      setSpaces(res.data.spaces || []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load spaces.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleOpenCreate = () => {
    setSelectedSpace(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (space) => {
    setSelectedSpace(space);
    setIsModalOpen(true);
  };

  const handleDeleteSpace = async () => {
    if (!spaceToDelete) return;
    setIsDeleting(true);
    try {
      await spaceApi.delete(spaceToDelete._id);
      success('Space deleted successfully.');
      setSpaceToDelete(null);
      fetchSpaces();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete space.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Owner'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Spaces Dashboard
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Create spaces, share public collection links, and curate your Wall of Love.
          </p>
        </div>

        <Button
          variant="default"
          size="md"
          onClick={handleOpenCreate}
          className="shadow-sm shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Space</span>
        </Button>
      </div>

      {/* Content section */}
      <div className="pt-8">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Loading your spaces...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div className="py-16 px-4 max-w-lg mx-auto text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No spaces created yet</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
              Create your first testimonial space to generate a dedicated public collection form and start gathering social proof.
            </p>
            <Button variant="default" size="lg" onClick={handleOpenCreate} className="w-full">
              <Plus className="w-4 h-4" />
              <span>Create My First Space</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <SpaceCard
                key={space._id}
                space={space}
                onEdit={handleOpenEdit}
                onDelete={setSpaceToDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <SpaceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        spaceToEdit={selectedSpace}
        onSaved={fetchSpaces}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(spaceToDelete)} onOpenChange={(open) => !open && setSpaceToDelete(null)}>
        <DialogContent
          title="Delete Testimonial Space?"
          description="This action cannot be undone. All collected testimonials within this space will also be permanently deleted."
          className="max-w-md"
        >
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-start gap-3 my-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Confirm permanent deletion</p>
              <p className="mt-0.5">
                You are about to delete <span className="font-bold">"{spaceToDelete?.name}"</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => setSpaceToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={handleDeleteSpace}
              isLoading={isDeleting}
            >
              Delete Space
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
