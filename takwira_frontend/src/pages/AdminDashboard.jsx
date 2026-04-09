import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Calendar, MapPin, Users, CheckCircle, XCircle,
  AlertCircle, Activity, Clock, Loader, Eye, RefreshCw,
  TrendingUp, Shield, ChevronDown, ChevronUp, Send, Zap, MessageSquare, Edit2, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateTournamentModal from '../components/CreateTournamentModal';
import './AdminDashboard.css';

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: { label: 'Confirmé', cls: 'confirmed', icon: <CheckCircle size={11} /> },
    pending: { label: 'En attente', cls: 'pending', icon: <AlertCircle size={11} /> },
    cancelled: { label: 'Annulé', cls: 'cancelled', icon: <XCircle size={11} /> },
    open: { label: 'Ouvert', cls: 'open', icon: <Zap size={11} /> },
    ongoing: { label: 'En cours', cls: 'ongoing', icon: <Activity size={11} /> },
    finished: { label: 'Terminé', cls: 'finished', icon: <CheckCircle size={11} /> },
    approved: { label: 'Approuvé', cls: 'confirmed', icon: <CheckCircle size={11} /> },
    rejected: { label: 'Refusé', cls: 'cancelled', icon: <XCircle size={11} /> },
  };
  const s = map[status] || { label: status, cls: 'pending', icon: <AlertCircle size={11} /> };
  return <span className={`adm-badge ${s.cls}`}>{s.icon} {s.label}</span>;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [reservations, setReservations] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [expandedReq, setExpandedReq] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resRes, tourRes, reqRes] = await Promise.all([
        api.get('reservations/'),
        api.get('tournaments/'),
        api.get('tournaments/tournament-requests/'),
      ]);
      setReservations(resRes.data);
      setTournaments(tourRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      toast.error('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await api.patch(`tournaments/tournament-requests/${id}/approve/`, { admin_notes: noteInputs[id] || '' });
      toast.success('Demande approuvée ! Tournoi créé automatiquement.');
      fetchAll();
    } catch {
      toast.error('Erreur lors de l\'approbation.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await api.patch(`tournaments/tournament-requests/${id}/reject/`, { admin_notes: noteInputs[id] || '' });
      toast.success('Demande refusée.');
      fetchAll();
    } catch {
      toast.error('Erreur lors du refus.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditTournament = (t) => {
    setEditingTournament(t);
    setIsTourModalOpen(true);
  };

  const handleDeleteTournament = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce tournoi ?")) {
      try {
        await api.delete(`tournaments/${id}/`);
        toast.success("Tournoi supprimé.");
        fetchAll();
      } catch (err) {
        toast.error("Erreur lors de la suppression du tournoi.");
      }
    }
  };

  const handleEditReservation = async (r) => {
    const status = window.prompt("Entrez le nouveau statut (confirmed, pending, cancelled):", r.status);
    if (status && ['confirmed', 'pending', 'cancelled'].includes(status.toLowerCase())) {
      try {
        await api.patch(`reservations/${r.id}/`, { status: status.toLowerCase() });
        toast.success("Statut de la réservation mis à jour !");
        fetchAll();
      } catch {
        toast.error("Erreur lors de la mise à jour.");
      }
    } else if (status) {
      toast.error("Statut invalide.");
    }
  };

  const handleDeleteReservation = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette réservation ?")) {
      try {
        await api.delete(`reservations/${id}/`);
        toast.success("Réservation supprimée.");
        fetchAll();
      } catch (err) {
        toast.error("Erreur lors de la suppression de la réservation.");
      }
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const stats = [
    {
      label: 'Réservations', value: reservations.length,
      sub: `${reservations.filter(r => r.status === 'confirmed').length} confirmées`,
      icon: <Calendar size={22} />, color: '#2e8b4a', trend: '+12%'
    },
    {
      label: 'Tournois', value: tournaments.length,
      sub: `${tournaments.filter(t => t.status === 'open').length} ouverts`,
      icon: <Trophy size={22} />, color: '#e67e22', trend: '+5%'
    },
    {
      label: 'Demandes tournoi', value: requests.length,
      sub: `${pendingRequests.length} en attente`,
      icon: <Send size={22} />, color: '#8e44ad', trend: pendingRequests.length > 0 ? `⚠ ${pendingRequests.length}` : '✓'
    },
    {
      label: 'Annulations', value: reservations.filter(r => r.status === 'cancelled').length,
      sub: 'Ce mois-ci',
      icon: <XCircle size={22} />, color: '#c0392b', trend: ''
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Activity size={15} /> },
    { id: 'reservations', label: 'Réservations', icon: <Calendar size={15} />, count: reservations.length },
    { id: 'tournaments', label: 'Tournois', icon: <Trophy size={15} />, count: tournaments.length },
    { id: 'requests', label: 'Demandes', icon: <Send size={15} />, count: pendingRequests.length, alert: pendingRequests.length > 0 },
  ];

  if (loading) {
    return (
      <div className="adm-loading">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader size={36} color="var(--green)" />
        </motion.div>
        <p>Chargement du tableau de bord admin...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Admin Hero */}
      <section className="adm-hero">
        <div className="container">
          <motion.div
            className="adm-hero-inner"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="adm-title-row">
              <div className="adm-shield"><Shield size={22} /></div>
              <div>
                <h1 className="adm-title">TABLEAU DE BORD ADMIN</h1>
                <p className="adm-sub">Monitoring complet de la plateforme Takwira</p>
              </div>
            </div>
            <div className="adm-top-right">
              {pendingRequests.length > 0 && (
                <motion.div
                  className="adm-alert-pill"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={() => setActiveTab('requests')}
                >
                  <AlertCircle size={14} />
                  {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente
                </motion.div>
              )}
              <button className="adm-refresh" onClick={fetchAll} title="Actualiser">
                <RefreshCw size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container adm-body">
        {/* Stats Grid */}
        <motion.div
          className="adm-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="adm-stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <div className="adm-stat-header">
                <div className="adm-stat-icon" style={{ background: s.color + '20', color: s.color }}>
                  {s.icon}
                </div>
                {s.trend && (
                  <span className="adm-trend" style={{ color: s.color }}>
                    <TrendingUp size={11} /> {s.trend}
                  </span>
                )}
              </div>
              <div className="adm-stat-val">{s.value}</div>
              <div className="adm-stat-label">{s.label}</div>
              <div className="adm-stat-sub">{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="adm-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`adm-tab ${activeTab === t.id ? 'active' : ''} ${t.alert ? 'alert-tab' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
              {t.count !== undefined && (
                <span className={`adm-tab-count ${t.alert ? 'alert-count' : ''}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="adm-overview">
                <div className="adm-overview-grid">
                  {/* Recent Reservations */}
                  <div className="adm-panel">
                    <div className="adm-panel-header">
                      <h3><Calendar size={16} /> Dernières réservations</h3>
                      <button className="adm-see-all" onClick={() => setActiveTab('reservations')}>
                        Voir tout <Eye size={13} />
                      </button>
                    </div>
                    <div className="adm-panel-list">
                      {reservations.slice(0, 5).map((r, i) => (
                        <motion.div key={r.id} className="adm-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                          <div className="adm-row-icon res-color"><Calendar size={14} /></div>
                          <div className="adm-row-info">
                            <span className="adm-row-title">{r.terrain_name || 'Terrain'}</span>
                            <span className="adm-row-sub">{r.date} · {r.start_time}</span>
                          </div>
                          <StatusBadge status={r.status} />
                        </motion.div>
                      ))}
                      {reservations.length === 0 && <p className="adm-empty-row">Aucune réservation</p>}
                    </div>
                  </div>

                  {/* Pending Requests */}
                  <div className="adm-panel">
                    <div className="adm-panel-header">
                      <h3><Send size={16} /> Demandes en attente</h3>
                      <button className="adm-see-all" onClick={() => setActiveTab('requests')}>
                        Gérer <Eye size={13} />
                      </button>
                    </div>
                    <div className="adm-panel-list">
                      {pendingRequests.length === 0 ? (
                        <div className="adm-all-good">
                          <CheckCircle size={24} color="var(--green)" />
                          <p>Aucune demande en attente</p>
                        </div>
                      ) : (
                        pendingRequests.slice(0, 4).map((r, i) => (
                          <motion.div key={r.id} className="adm-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                            <div className="adm-row-icon req-color"><Send size={14} /></div>
                            <div className="adm-row-info">
                              <span className="adm-row-title">{r.name}</span>
                              <span className="adm-row-sub">par {r.player_name} · {r.start_date}</span>
                            </div>
                            <StatusBadge status={r.status} />
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Tournaments overview */}
                  <div className="adm-panel full-width">
                    <div className="adm-panel-header">
                      <h3><Trophy size={16} /> Tournois actifs</h3>
                      <button className="adm-see-all" onClick={() => setActiveTab('tournaments')}>
                        Voir tout <Eye size={13} />
                      </button>
                    </div>
                    <div className="adm-tournaments-row">
                      {tournaments.filter(t => t.status !== 'finished').slice(0, 4).map((t, i) => (
                        <motion.div key={t.id} className="adm-tour-mini" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                          <div className="adm-tour-mini-icon"><Trophy size={18} /></div>
                          <div className="adm-tour-mini-name">{t.name}</div>
                          <div className="adm-tour-mini-info">
                            <span><Users size={11} /> {t.teams?.length || 0}/{t.max_teams}</span>
                            <span><Calendar size={11} /> {t.start_date}</span>
                          </div>
                          <StatusBadge status={t.status} />
                        </motion.div>
                      ))}
                      {tournaments.filter(t => t.status !== 'finished').length === 0 && (
                        <p className="adm-empty-row">Aucun tournoi actif</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RESERVATIONS */}
            {activeTab === 'reservations' && (
              <div className="adm-list-section">
                <div className="adm-list-header">
                  <h3>Toutes les réservations <span>({reservations.length})</span></h3>
                </div>
                {reservations.length === 0 ? (
                  <div className="adm-empty">Aucune réservation enregistrée</div>
                ) : (
                  <div className="adm-table">
                    <div className="adm-table-head">
                      <span>Terrain</span><span>Joueur</span><span>Date</span><span>Horaire</span><span>Prix</span><span>Statut</span><span>Actions</span>
                    </div>
                    {reservations.map((r, i) => (
                      <motion.div
                        key={r.id}
                        className="adm-table-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <span className="adm-cell-bold">
                          <MapPin size={12} /> {r.terrain_name || 'N/A'}
                        </span>
                        <span>{r.player_name || r.player}</span>
                        <span>{r.date}</span>
                        <span>{r.start_time} — {r.end_time}</span>
                        <span className="adm-price">{r.total_price} TND</span>
                        <span><StatusBadge status={r.status} /></span>
                        <span className="adm-actions-cell">
                          <button className="admin-btn edit" onClick={() => handleEditReservation(r)} title="Modifier"><Edit2 size={16} /></button>
                          <button className="admin-btn delete" onClick={() => handleDeleteReservation(r.id)} title="Supprimer"><Trash2 size={16} /></button>
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TOURNAMENTS */}
            {activeTab === 'tournaments' && (
              <div className="adm-list-section">
                <div className="adm-list-header">
                  <h3>Tous les tournois <span>({tournaments.length})</span></h3>
                </div>
                {tournaments.length === 0 ? (
                  <div className="adm-empty">Aucun tournoi créé</div>
                ) : (
                  <div className="adm-table">
                    <div className="adm-table-head">
                      <span>Nom</span><span>Organisateur</span><span>Terrain</span><span>Dates</span><span>Équipes</span><span>Statut</span><span>Actions</span>
                    </div>
                    {tournaments.map((t, i) => (
                      <motion.div
                        key={t.id}
                        className="adm-table-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <span className="adm-cell-bold"><Trophy size={12} /> {t.name}</span>
                        <span>{t.organizer_name}</span>
                        <span>{t.terrain_name}</span>
                        <span>{t.start_date} → {t.end_date}</span>
                        <span><Users size={12} /> {t.teams?.length || 0}/{t.max_teams}</span>
                        <span><StatusBadge status={t.status} /></span>
                        <span className="adm-actions-cell">
                          <button className="admin-btn edit" onClick={() => handleEditTournament(t)} title="Modifier"><Edit2 size={16} /></button>
                          <button className="admin-btn delete" onClick={() => handleDeleteTournament(t.id)} title="Supprimer"><Trash2 size={16} /></button>
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REQUESTS */}
            {activeTab === 'requests' && (
              <div className="adm-list-section">
                <div className="adm-list-header">
                  <h3>
                    Demandes de création de tournoi
                    {pendingRequests.length > 0 && (
                      <span className="pending-highlight">{pendingRequests.length} en attente</span>
                    )}
                  </h3>
                </div>
                {requests.length === 0 ? (
                  <div className="adm-empty">Aucune demande reçue</div>
                ) : (
                  <div className="adm-requests-list">
                    {requests.map((r, i) => (
                      <motion.div
                        key={r.id}
                        className={`adm-req-card ${r.status}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div className="adm-req-top">
                          <div className="adm-req-left">
                            <div className="adm-req-icon"><Send size={18} /></div>
                            <div className="adm-req-info">
                              <h4>{r.name}</h4>
                              {r.description && <p className="adm-req-desc">{r.description}</p>}
                              <div className="adm-req-meta">
                                <span><Users size={12} /> {r.player_name}</span>
                                <span><MapPin size={12} /> {r.terrain_name}</span>
                                <span><Calendar size={12} /> {r.start_date} → {r.end_date}</span>
                                <span><Trophy size={12} /> Max {r.max_teams} équipes · {r.entry_fee} TND</span>
                              </div>
                            </div>
                          </div>
                          <div className="adm-req-right">
                            <StatusBadge status={r.status} />
                            <span className="adm-req-date">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                            {r.status === 'pending' && (
                              <button
                                className="adm-expand-btn"
                                onClick={() => setExpandedReq(expandedReq === r.id ? null : r.id)}
                              >
                                {expandedReq === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedReq === r.id && r.status === 'pending' && (
                            <motion.div
                              className="adm-req-actions"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="adm-note-input">
                                <MessageSquare size={14} />
                                <input
                                  type="text"
                                  placeholder="Note pour le joueur (optionnel)..."
                                  value={noteInputs[r.id] || ''}
                                  onChange={e => setNoteInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                                />
                              </div>
                              <div className="adm-action-btns">
                                <button
                                  className="adm-btn-approve"
                                  onClick={() => handleApprove(r.id)}
                                  disabled={processingId === r.id}
                                >
                                  {processingId === r.id ? <Loader size={14} /> : <CheckCircle size={14} />}
                                  Approuver & Créer tournoi
                                </button>
                                <button
                                  className="adm-btn-reject"
                                  onClick={() => handleReject(r.id)}
                                  disabled={processingId === r.id}
                                >
                                  {processingId === r.id ? <Loader size={14} /> : <XCircle size={14} />}
                                  Refuser
                                </button>
                              </div>
                            </motion.div>
                          )}
                          {expandedReq === r.id && r.status !== 'pending' && r.admin_notes && (
                            <motion.div
                              className="adm-req-done-note"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <MessageSquare size={13} />
                              <strong>Note admin :</strong> {r.admin_notes}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isTourModalOpen && (
          <CreateTournamentModal
            isOpen={isTourModalOpen}
            onClose={() => setIsTourModalOpen(false)}
            onSuccess={fetchAll}
            editingTournament={editingTournament}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;