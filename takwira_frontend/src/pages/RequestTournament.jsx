import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, MapPin, Calendar, Users, Send, ArrowLeft, Loader, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DateRangePicker from '../components/DateRangePicker';
import './RequestTournament.css';

const RequestTournament = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [terrains, setTerrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    terrain: '',
    start_date: '',
    end_date: '',
    max_teams: 8,
    entry_fee: 0,
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('terrains/').then(res => setTerrains(res.data)).catch(console.error);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const setStartDate = (date) => setForm(prev => ({ ...prev, start_date: date }));
  const setEndDate = (date) => setForm(prev => ({ ...prev, end_date: date }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.terrain || !form.start_date || !form.end_date) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (new Date(form.end_date) < new Date(form.start_date)) {
      toast.error('La date de fin doit être après la date de début.');
      return;
    }

    setLoading(true);
    try {
      await api.post('tournaments/tournament-requests/', form);
      toast.success('Demande envoyée ! L\'admin examinera votre demande.');
      navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Erreur lors de l\'envoi.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="req-page">
      <section className="req-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button className="req-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Retour
            </button>
            <div className="req-hero-content">
              <div className="req-hero-icon"><Trophy size={28} /></div>
              <div>
                <h1 className="req-title">Demande de création de tournoi</h1>
                <p className="req-sub">Soumettez votre proposition. L'admin l'examinera et la validera.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container req-body">
        <div className="req-layout">
          {/* Form */}
          <motion.form
            className="req-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="form-group">
              <label>Nom du tournoi *</label>
              <div className="input-wrap">
                <Trophy size={16} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Coupe Printemps 2026"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Décrivez votre tournoi, les règles, les récompenses..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Terrain *</label>
              <div className="input-wrap">
                <MapPin size={16} className="input-icon" />
                <select name="terrain" value={form.terrain} onChange={handleChange} required>
                  <option value="">Sélectionner un terrain</option>
                  {terrains.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Dates du tournoi *</label>
              <DateRangePicker
                terrainId={form.terrain}
                startDate={form.start_date}
                endDate={form.end_date}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre max d'équipes</label>
                <div className="input-wrap">
                  <Users size={16} className="input-icon" />
                  <input type="number" name="max_teams" value={form.max_teams} onChange={handleChange} min={2} max={64} />
                </div>
              </div>
              <div className="form-group">
                <label>Frais d'inscription (TND)</label>
                <div className="input-wrap">
                  <DollarSign size={16} className="input-icon" />
                  <input type="number" name="entry_fee" value={form.entry_fee} onChange={handleChange} min={0} step={0.5} />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              className="req-submit-btn"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? <Loader size={18} /> : <Send size={18} />}
              {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
            </motion.button>
          </motion.form>

          {/* Info Panel */}
          <motion.div
            className="req-info-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="req-info-card">
              <h3>Comment ça marche ?</h3>
              <div className="req-steps">
                <div className="req-step">
                  <div className="req-step-num">1</div>
                  <div>
                    <strong>Soumettez votre demande</strong>
                    <p>Remplissez le formulaire avec les détails de votre tournoi.</p>
                  </div>
                </div>
                <div className="req-step">
                  <div className="req-step-num">2</div>
                  <div>
                    <strong>Examen par l'admin</strong>
                    <p>Notre équipe vérifie la disponibilité et la faisabilité.</p>
                  </div>
                </div>
                <div className="req-step">
                  <div className="req-step-num">3</div>
                  <div>
                    <strong>Tournoi créé automatiquement</strong>
                    <p>Si approuvée, votre tournoi est publié et ouvert aux inscriptions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="req-info-card notice">
              <h4>📋 Informations</h4>
              <ul>
                <li>Les demandes sont examinées sous 24–48h</li>
                <li>Vous serez notifié par la plateforme</li>
                <li>Vous pouvez suivre le statut dans votre dashboard</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RequestTournament;