import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, Eye, EyeOff, Image } from 'lucide-react';
import { useEventsStore, Event } from '../../stores/eventsStore';

const eventTypes = [
  "Entraînement",
  "Compétition",
  "Tournoi",
  "Réunion",
  "Événement Spécial"
];

export default function Events() {
  const { events, addEvent, deleteEvent, updateEvent } = useEventsStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: eventTypes[0],
    description: '',
    isPublic: true,
    backgroundImage: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent(formData);
    setFormData({
      title: '',
      date: '',
      time: '',
      type: eventTypes[0],
      description: '',
      isPublic: true,
      backgroundImage: ''
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      deleteEvent(id);
    }
  };

  const toggleVisibility = (event: Event) => {
    updateEvent(event.id, { isPublic: !event.isPublic });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wot-gold">Calendrier des Événements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" strokeWidth={1.5} />
          Nouvel Événement
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-wot-light/80 mb-2">
                Titre
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                         text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-wot-light/80 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wot-light/80 mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wot-light/80 mb-2">
                  Type
                </label>
                <select
                  className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light focus:outline-none focus:border-wot-gold"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-wot-light/80 mb-2">
                Description
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                         text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold
                         resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wot-light/80 mb-2">
                Image de fond (URL)
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  className="flex-1 px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
                  placeholder="https://example.com/image.jpg"
                  value={formData.backgroundImage}
                  onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                />
                {formData.backgroundImage && (
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <img 
                      src={formData.backgroundImage} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1624687943971-e86af76d57de?q=80&w=2070';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="rounded border-wot-gold/20 bg-wot-dark text-wot-gold 
                         focus:ring-wot-gold focus:ring-offset-wot-dark"
              />
              <label htmlFor="isPublic" className="text-sm text-wot-light/80">
                Afficher sur le site public
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Créer l'événement
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div 
            key={event.id}
            className="relative group overflow-hidden rounded-lg"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${event.backgroundImage || 'https://images.unsplash.com/photo-1624687943971-e86af76d57de?q=80&w=2070'})`,
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-wot-darker via-wot-darker/90 to-wot-darker/70" />
            
            {/* Content */}
            <div className="relative p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-wot-goldLight">{event.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleVisibility(event)}
                    className="p-1.5 text-wot-light/60 hover:text-wot-gold transition-colors"
                    title={event.isPublic ? "Masquer du site public" : "Afficher sur le site public"}
                  >
                    {event.isPublic ? 
                      <Eye className="h-5 w-5" strokeWidth={1.5} /> :
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              
              <div>
                <span className="px-2 py-1 text-xs rounded-full bg-wot-gold/20 text-wot-gold">
                  {event.type}
                </span>
              </div>
              
              <p className="text-wot-light/80">{event.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-wot-light/60">
                  <CalendarIcon className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {event.date}
                </div>
                <div className="flex items-center text-wot-light/60">
                  <Clock className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  {event.time}
                </div>
                <div className="flex items-center text-wot-light/60">
                  <MapPin className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Discord ATFR
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}