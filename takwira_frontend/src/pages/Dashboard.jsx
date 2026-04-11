import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Calendar, MapPin, Clock, CheckCircle, XCircle,
    AlertCircle, Plus, Users, ArrowRight, Activity, Star,
    ChevronRight, Loader, Send, CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const StatusBadge = ({ status }) => {
    const map = {
        confirmed: { label: 'Confirmé', cls: 'confirmed', icon: <CheckCircle size={12} /> },
        pending: { label: 'En attente', cls: 'pending', icon: <AlertCircle size={12} /> },
        cancelled: { label: 'Annulé', cls: 'cancelled', icon: <XCircle size={12} /> },
        open: { label: 'Ouvert', cls: 'confirmed', icon: <CheckCircle size={12} /> },
        ongoing: { label: 'En cours', cls: 'pending', icon: <Activity size={12} /> },
        finished: { label: 'Terminé', cls: 'cancelled', icon: <Star size={12} /> },
        approved: { label: 'Approuvé', cls: 'confirmed', icon: <CheckCircle size={12} /> },
        rejected: { label: 'Refusé', cls: 'cancelled', icon: <XCircle size={12} /> },
    };
    const s = map[status] || { label: status, cls: 'pending', icon: <AlertCircle size={12} /> };
    return (
        <span className={`status-badge ${s.cls}`}>
            {s.icon} {s.label}
        </span>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('reservations');
    const [reservations, setReservations] = useState([]);
    const [myTournaments, setMyTournaments] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [resRes, tourRes, reqRes] = await Promise.all([
                    api.get('reservations/'),
                    api.get('tournaments/'),
                    api.get('tournaments/tournament-requests/'),
                ]);
                setReservations(resRes.data);
                // Filter tournaments where the user is a captain of a team
                const myId = user?.user_id || user?.id; // Handle both token and API data
                const joined = tourRes.data.filter(t =>
                    t.teams?.some(team => team.captain === myId)
                );
                setMyTournaments(joined);
                setMyRequests(reqRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    const handleCancel = async (id) => {
        if (!window.confirm('Annuler cette réservation ?')) return;
        setCancellingId(id);
        try {
            await api.patch(`reservations/${id}/cancel/`);
            setReservations(prev =>
                prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
            );
            toast.success('Réservation annulée.');
        } catch {
            toast.error('Erreur lors de l\'annulation.');
        } finally {
            setCancellingId(null);
        }
    };

    const isPast = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resDate = new Date(dateStr);
        return resDate < today;
    };

    const resLimit = user?.max_reservations || (user?.subscription_plan_name === 'free' ? 3 : 9999);
    const resCount = user?.monthly_reservation_count || 0;

    const stats = [
        { label: 'Réservations (Mois)', value: `${resCount}/${resLimit > 1000 ? '∞' : resLimit}`, icon: <Calendar size={20} />, color: 'var(--green)' },
        { label: 'Tournois rejoints', value: myTournaments.length, icon: <Trophy size={20} />, color: '#e67e22' },
        ...(user?.can_create_tournament ? [{ label: 'Demandes tournoi', value: myRequests.length, icon: <Send size={20} />, color: '#8e44ad' }] : []),
        { label: 'Confirmées', value: reservations.filter(r => r.status === 'confirmed').length, icon: <CheckCircle size={20} />, color: '#27ae60' },
    ];

    const tabs = [
        { id: 'reservations', label: 'Réservations', count: reservations.length },
        { id: 'tournaments', label: 'Mes Tournois', count: myTournaments.length },
        ...(user?.can_create_tournament ? [{ id: 'requests', label: 'Demandes créa.', count: myRequests.length }] : []),
    ];

    if (loading) {
        return (
            <div className="dash-loading">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Loader size={32} color="var(--green)" />
                </motion.div>
                <p>Chargement de votre espace...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <section className="dash-hero">
                <div className="container">
                    <motion.div
                        className="dash-hero-content"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="dash-greeting">
                            <div className="dash-avatar">{user?.username?.[0]?.toUpperCase() || 'J'}</div>
                            <div>
                                <p className="dash-welcome">Bienvenue,</p>
                                <h1 className="dash-name">
                                    {user?.username} 
                                    <span className="dash-role-chip">Joueur</span>
                                    {user?.subscription_plan_name && (
                                        <span className="dash-plan-chip">{user.subscription_plan_name}</span>
                                    )}
                                </h1>
                            </div>
                        </div>
                        <div className="dash-quick-actions">
                            <Link to="/pricing" className="quick-btn pricing-btn">
                                <CreditCard size={16} /> Abonnement
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <div className="container">
                <motion.div
                    className="dash-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            className="stat-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.07 }}
                        >
                            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}>
                                {s.icon}
                            </div>
                            <div className="stat-val">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <div className="dash-tabs">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={`dash-tab ${activeTab === t.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.id)}
                        >
                            {t.label}
                            <span className="tab-count">{t.count}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* RESERVATIONS TAB */}
                        {activeTab === 'reservations' && (
                            <div className="history-section">
                                {reservations.length === 0 ? (
                                    <EmptyState
                                        icon={<Calendar size={40} />}
                                        title="Aucune réservation"
                                        subtitle="Commencez par réserver un terrain"
                                        cta={{ label: 'Explorer les terrains', href: '/terrains' }}
                                    />
                                ) : (
                                    <div className="history-list">
                                        {reservations.map((r, i) => (
                                            <motion.div
                                                key={r.id}
                                                className="history-card"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06 }}
                                            >
                                                <div className="hcard-left">
                                                    <div className="hcard-icon terrain-icon">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div className="hcard-info">
                                                        <h4>{r.terrain_name || r.terrain}</h4>
                                                        <div className="hcard-meta">
                                                            <span><Calendar size={13} /> {r.date}</span>
                                                            <span><Clock size={13} /> {r.start_time} — {r.end_time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="hcard-right">
                                                    <div className="hcard-price">{r.total_price} TND</div>
                                                    <StatusBadge status={r.status} />
                                                    {r.status !== 'cancelled' && !isPast(r.date) && (
                                                        <button
                                                            className="btn-cancel-small"
                                                            onClick={() => handleCancel(r.id)}
                                                            disabled={cancellingId === r.id}
                                                        >
                                                            {cancellingId === r.id ? <Loader size={12} /> : 'Annuler'}
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TOURNAMENTS TAB */}
                        {activeTab === 'tournaments' && (
                            <div className="history-section">
                                {myTournaments.length === 0 ? (
                                    <EmptyState
                                        icon={<Trophy size={40} />}
                                        title="Pas encore de tournoi"
                                        subtitle="Inscrivez votre équipe à un tournoi"
                                        cta={{ label: 'Voir les tournois', href: '/tournaments' }}
                                    />
                                ) : (
                                    <div className="history-list">
                                        {myTournaments.map((t, i) => {
                                            const myTeam = t.teams?.find(team => team.captain === user?.user_id);
                                            return (
                                                <motion.div
                                                    key={t.id}
                                                    className="history-card"
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.06 }}
                                                >
                                                    <div className="hcard-left">
                                                        <div className="hcard-icon trophy-icon">
                                                            <Trophy size={18} />
                                                        </div>
                                                        <div className="hcard-info">
                                                            <h4>{t.name}</h4>
                                                            {t.description && <p className="hcard-desc">{t.description}</p>}
                                                            <div className="hcard-meta">
                                                                <span><Calendar size={13} /> {t.start_date} → {t.end_date}</span>
                                                                <span><Users size={13} /> {t.teams?.length}/{t.max_teams} équipes</span>
                                                                {myTeam && <span className="my-team-badge">🏅 {myTeam.name}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="hcard-right">
                                                        <div className="hcard-price">{t.entry_fee} TND</div>
                                                        <StatusBadge status={t.status} />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* REQUESTS TAB */}
                        {activeTab === 'requests' && (
                            <div className="history-section">
                                <div className="requests-header-row">
                                    <p className="requests-info">
                                        Consultez l'historique de vos demandes de création de tournoi.
                                    </p>
                                </div>
                                {myRequests.length === 0 ? (
                                    <EmptyState
                                        icon={<Send size={40} />}
                                        title="Aucune demande"
                                        subtitle="Vous pouvez demander la création d'un tournoi"
                                        cta={{ label: 'Faire une demande', href: '/request-tournament' }}
                                    />
                                ) : (
                                    <div className="history-list">
                                        {myRequests.map((r, i) => (
                                            <motion.div
                                                key={r.id}
                                                className="history-card request-card"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06 }}
                                            >
                                                <div className="hcard-left">
                                                    <div className="hcard-icon req-icon">
                                                        <Send size={18} />
                                                    </div>
                                                    <div className="hcard-info">
                                                        <h4>{r.name}</h4>
                                                        {r.description && <p className="hcard-desc">{r.description}</p>}
                                                        <div className="hcard-meta">
                                                            <span><MapPin size={13} /> {r.terrain_name}</span>
                                                            <span><Calendar size={13} /> {r.start_date} → {r.end_date}</span>
                                                            <span><Users size={13} /> Max {r.max_teams} équipes</span>
                                                        </div>
                                                        {r.admin_notes && (
                                                            <div className="admin-note">
                                                                <strong>Note admin :</strong> {r.admin_notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="hcard-right">
                                                    <div className="hcard-price">{r.entry_fee} TND</div>
                                                    <StatusBadge status={r.status} />
                                                    <span className="hcard-date">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const EmptyState = ({ icon, title, subtitle, cta }) => (
    <motion.div
        className="empty-history"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
    >
        <div className="empty-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
        {cta && (
            <Link to={cta.href} className="empty-cta">
                {cta.label} <ChevronRight size={16} />
            </Link>
        )}
    </motion.div>
);

export default Dashboard;