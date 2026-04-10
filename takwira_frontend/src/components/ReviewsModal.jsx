import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import './ReviewsModal.css';

const StarRating = ({ rating, size = 18, interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`star-icon ${star <= (interactive ? (hovered || rating) : rating) ? 'filled' : ''}`}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
      ))}
    </div>
  );
};

const ReviewsModal = ({ terrain, isOpen, onClose }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average_rating: 0, reviews_count: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userHasReview, setUserHasReview] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, summaryRes] = await Promise.all([
        api.get(`reviews/?terrain=${terrain.id}`),
        api.get(`reviews/summary/?terrain=${terrain.id}`)
      ]);
      setReviews(reviewsRes.data);
      setSummary(summaryRes.data);

      // Check if current user already submitted a review
      if (user) {
        const existing = reviewsRes.data.find(r => r.user === user.id);
        setUserHasReview(!!existing);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && terrain) {
      fetchData();
    }
  }, [isOpen, terrain]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newRating === 0) {
      toast.error('Veuillez sélectionner une note.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('reviews/', {
        terrain: terrain.id,
        rating: newRating,
        comment: newComment
      });
      toast.success('Avis ajouté avec succès !');
      setNewRating(0);
      setNewComment('');
      fetchData();
    } catch (err) {
      if (err.response?.status === 400) {
        const detail = err.response.data;
        if (detail?.non_field_errors || detail?.terrain) {
          toast.error('Vous avez déjà donné votre avis sur ce terrain.');
        } else {
          toast.error('Erreur de validation.');
        }
      } else {
        toast.error("Erreur lors de l'envoi de l'avis.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Supprimer votre avis ?')) return;
    try {
      await api.delete(`reviews/${reviewId}/`);
      toast.success('Avis supprimé.');
      fetchData();
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `il y a ${days}j`;
    const months = Math.floor(days / 30);
    return `il y a ${months} mois`;
  };

  if (!isOpen) return null;

  const maxDistCount = Math.max(...Object.values(summary.distribution || {}), 1);

  return (
    <AnimatePresence>
      <motion.div
        className="reviews-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="reviews-modal"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="reviews-header">
            <div className="reviews-title-row">
              <h2>Avis — {terrain.name}</h2>
              <button className="reviews-close" onClick={onClose}><X size={22} /></button>
            </div>
          </div>

          {loading ? (
            <div className="reviews-loading">Chargement des avis...</div>
          ) : (
            <>
              {/* Summary Section */}
              <div className="reviews-summary">
                <div className="summary-big-score">
                  <span className="big-number">{summary.average_rating || '—'}</span>
                  <div className="big-stars-wrap">
                    <StarRating rating={Math.round(summary.average_rating)} size={22} />
                    <span className="total-reviews">{summary.reviews_count} avis</span>
                  </div>
                </div>
                <div className="summary-distribution">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = summary.distribution?.[String(star)] || 0;
                    const pct = summary.reviews_count > 0 ? (count / summary.reviews_count) * 100 : 0;
                    return (
                      <div key={star} className="dist-row">
                        <span className="dist-star">{star}★</span>
                        <div className="dist-bar-bg">
                          <motion.div
                            className="dist-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                          />
                        </div>
                        <span className="dist-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <div className="no-reviews">
                    <Star size={40} className="no-reviews-icon" />
                    <p>Aucun avis pour le moment.</p>
                    <span>Soyez le premier à donner votre avis !</span>
                  </div>
                ) : (
                  reviews.map((review, i) => (
                    <motion.div
                      key={review.id}
                      className="review-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="review-top">
                        <div className="review-author">
                          <div className="review-avatar">
                            <User size={18} />
                          </div>
                          <div className="review-author-info">
                            <span className="review-name">{review.user_name}</span>
                            <span className="review-date">{getTimeAgo(review.created_at)}</span>
                          </div>
                        </div>
                        <div className="review-rating-badge">
                          <StarRating rating={review.rating} size={14} />
                        </div>
                      </div>
                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                      {user && review.user === user.id && (
                        <button
                          className="review-delete-btn"
                          onClick={() => handleDelete(review.id)}
                        >
                          Supprimer
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              {user && user.role === 'player' && !userHasReview && (
                <form className="review-form" onSubmit={handleSubmit}>
                  <div className="form-divider" />
                  <h3>Donnez votre avis</h3>
                  <div className="form-rating-select">
                    <span>Votre note :</span>
                    <StarRating rating={newRating} size={28} interactive onRate={setNewRating} />
                    {newRating > 0 && <span className="rating-label">
                      {['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'][newRating]}
                    </span>}
                  </div>
                  <textarea
                    className="review-textarea"
                    placeholder="Partagez votre expérience sur ce terrain..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <div className="form-bottom-row">
                    <span className="char-count">{newComment.length}/500</span>
                    <button
                      type="submit"
                      className="review-submit-btn"
                      disabled={submitting || newRating === 0}
                    >
                      <Send size={16} />
                      {submitting ? 'Envoi...' : 'Publier'}
                    </button>
                  </div>
                </form>
              )}

              {user && userHasReview && (
                <div className="already-reviewed">
                  ✓ Vous avez déjà donné votre avis sur ce terrain.
                </div>
              )}

              {!user && (
                <div className="login-to-review">
                  Connectez-vous pour laisser un avis.
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewsModal;
