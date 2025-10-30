import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Image, Plus, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  nom: string;
}

interface TicketType {
  id?: string;
  nom: string;
  description: string;
  prix: number;
  quantite_disponible: number;
  avantages: string[];
}

const EventFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    lieu: '',
    ville: '',
    date_debut: '',
    date_fin: '',
    category_id: '',
    image_urls: [''],
    capacite_totale: 0,
    statut: 'brouillon' as 'brouillon' | 'publie' | 'annule',
    tags: [] as string[],
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      nom: 'Standard',
      description: '',
      prix: 0,
      quantite_disponible: 0,
      avantages: [''],
    },
  ]);

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, nom')
        .order('nom');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const fetchEvent = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;

      setFormData({
        titre: eventData.titre,
        description: eventData.description,
        lieu: eventData.lieu,
        ville: eventData.ville,
        date_debut: eventData.date_debut,
        date_fin: eventData.date_fin,
        category_id: eventData.category_id,
        image_urls: eventData.image_urls || [''],
        capacite_totale: eventData.capacite_totale,
        statut: eventData.statut,
        tags: eventData.tags || [],
      });

      const { data: ticketData, error: ticketError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', id);

      if (ticketError) throw ticketError;

      if (ticketData && ticketData.length > 0) {
        setTicketTypes(
          ticketData.map((t) => ({
            id: t.id,
            nom: t.nom,
            description: t.description || '',
            prix: parseFloat(t.prix),
            quantite_disponible: t.quantite_disponible,
            avantages: t.avantages || [''],
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Erreur lors du chargement de l\'événement');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventPayload = {
        ...formData,
        organisateur_id: user?.id,
        image_urls: formData.image_urls.filter((url) => url.trim() !== ''),
      };

      let eventId = id;

      if (id) {
        const { error } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([eventPayload])
          .select()
          .single();

        if (error) throw error;
        eventId = data.id;
      }

      for (const ticket of ticketTypes) {
        const ticketPayload = {
          event_id: eventId,
          nom: ticket.nom,
          description: ticket.description,
          prix: ticket.prix,
          quantite_disponible: ticket.quantite_disponible,
          quantite_vendue: 0,
          avantages: ticket.avantages.filter((a) => a.trim() !== ''),
        };

        if (ticket.id) {
          const { error } = await supabase
            .from('ticket_types')
            .update(ticketPayload)
            .eq('id', ticket.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('ticket_types')
            .insert([ticketPayload]);

          if (error) throw error;
        }
      }

      toast.success(id ? 'Événement mis à jour avec succès' : 'Événement créé avec succès');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = () => {
    setFormData({ ...formData, image_urls: [...formData.image_urls, ''] });
  };

  const removeImageUrl = (index: number) => {
    const newUrls = formData.image_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, image_urls: newUrls });
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...formData.image_urls];
    newUrls[index] = value;
    setFormData({ ...formData, image_urls: newUrls });
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        nom: '',
        description: '',
        prix: 0,
        quantite_disponible: 0,
        avantages: [''],
      },
    ]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, field: string, value: any) => {
    const newTickets = [...ticketTypes];
    (newTickets[index] as any)[field] = value;
    setTicketTypes(newTickets);
  };

  const addAdvantage = (ticketIndex: number) => {
    const newTickets = [...ticketTypes];
    newTickets[ticketIndex].avantages.push('');
    setTicketTypes(newTickets);
  };

  const removeAdvantage = (ticketIndex: number, advantageIndex: number) => {
    const newTickets = [...ticketTypes];
    newTickets[ticketIndex].avantages = newTickets[ticketIndex].avantages.filter((_, i) => i !== advantageIndex);
    setTicketTypes(newTickets);
  };

  const updateAdvantage = (ticketIndex: number, advantageIndex: number, value: string) => {
    const newTickets = [...ticketTypes];
    newTickets[ticketIndex].avantages[advantageIndex] = value;
    setTicketTypes(newTickets);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            {id ? 'Modifier l\'événement' : 'Créer un événement'}
          </h1>
          <p className="text-gray-600 mt-2">Remplissez les informations de votre événement</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Informations générales</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'événement *</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  placeholder="Ex: Festival Jazz in Paris 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent resize-none"
                  placeholder="Décrivez votre événement..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lieu *</label>
                  <input
                    type="text"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                    placeholder="Ex: Parc de la Villette"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                    placeholder="Ex: Paris"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                  <input
                    type="datetime-local"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin *</label>
                  <input
                    type="datetime-local"
                    value={formData.date_fin}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacité totale *</label>
                  <input
                    type="number"
                    value={formData.capacite_totale}
                    onChange={(e) => setFormData({ ...formData, capacite_totale: parseInt(e.target.value) })}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                    placeholder="Ex: 5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images (URLs)</label>
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.image_urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une image</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-secondary-600 hover:text-secondary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                    placeholder="Ajouter un tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold text-gray-900">Types de billets</h2>
              <button
                type="button"
                onClick={addTicketType}
                className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un type</span>
              </button>
            </div>

            <div className="space-y-6">
              {ticketTypes.map((ticket, ticketIndex) => (
                <div key={ticketIndex} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">Type {ticketIndex + 1}</h3>
                    {ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(ticketIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                      <input
                        type="text"
                        value={ticket.nom}
                        onChange={(e) => updateTicketType(ticketIndex, 'nom', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                        placeholder="Ex: Standard, VIP"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€) *</label>
                      <input
                        type="number"
                        value={ticket.prix}
                        onChange={(e) => updateTicketType(ticketIndex, 'prix', parseFloat(e.target.value))}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantité disponible *</label>
                    <input
                      type="number"
                      value={ticket.quantite_disponible}
                      onChange={(e) => updateTicketType(ticketIndex, 'quantite_disponible', parseInt(e.target.value))}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={ticket.description}
                      onChange={(e) => updateTicketType(ticketIndex, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avantages</label>
                    {ticket.avantages.map((avantage, advantageIndex) => (
                      <div key={advantageIndex} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={avantage}
                          onChange={(e) => updateAdvantage(ticketIndex, advantageIndex, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                          placeholder="Ex: Accès VIP"
                        />
                        {ticket.avantages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAdvantage(ticketIndex, advantageIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addAdvantage(ticketIndex)}
                      className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-700 text-sm font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ajouter un avantage</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg font-semibold hover:from-secondary-600 hover:to-accent-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Enregistrement...' : id ? 'Mettre à jour' : 'Créer l\'événement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;
