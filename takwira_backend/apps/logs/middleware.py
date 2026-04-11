import time
from apps.logs.models import ActivityLog


def _get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# Whitelist of business events to log.
# Each entry: (method, path_contains, success_only, label_fn)
# label_fn(user_info, status_code) -> str
BUSINESS_EVENTS = [
    # Auth
    ('POST',   'auth/login',                     False, lambda u, s: "Connexion réussie" if s < 400 else "Tentative de connexion échouée"),
    ('POST',   'auth/register',                  False, lambda u, s: "Création de compte" if s < 400 else "Échec de création de compte"),
    ('PATCH',  'auth/me',                        True,  lambda u, s: "Mise à jour du profil"),
    ('PUT',    'auth/me',                        True,  lambda u, s: "Mise à jour du profil"),

    # Reservations
    ('POST',   'reservations',                   True,  lambda u, s: "Nouvelle réservation effectuée"),
    ('DELETE', 'reservations',                   True,  lambda u, s: "Réservation annulée"),
    ('PATCH',  'reservations',                   True,  lambda u, s: "Modification d'une réservation"),
    ('PUT',    'reservations',                   True,  lambda u, s: "Modification d'une réservation"),

    # Tournaments
    ('POST',   'tournaments/tournament-requests', True, lambda u, s: "Nouvelle demande de création de tournoi"),
    ('PATCH',  'approve',                         True, lambda u, s: "Approbation d'une demande de tournoi"),
    ('PATCH',  'reject',                          True, lambda u, s: "Refus d'une demande de tournoi"),
    ('POST',   'tournaments/join-requests',       True, lambda u, s: "Demande d'inscription à un tournoi"),
    ('PATCH',  'join-requests',                   True, lambda u, s: "Traitement d'une inscription"),
    ('POST',   'tournaments',                     True, lambda u, s: "Création d'un tournoi (Admin)"),
    ('PUT',    'tournaments',                     True, lambda u, s: "Modification d'un tournoi"),
    ('PATCH',  'tournaments',                     True, lambda u, s: "Modification d'un tournoi"),
    ('DELETE', 'tournaments',                     True, lambda u, s: "Suppression d'un tournoi"),

    # Terrains
    ('POST',   'terrains',                       True,  lambda u, s: "Ajout d'un nouveau terrain"),
    ('PUT',    'terrains',                       True,  lambda u, s: "Mise à jour d'un terrain"),
    ('PATCH',  'terrains',                       True,  lambda u, s: "Mise à jour d'un terrain"),
    ('DELETE', 'terrains',                       True,  lambda u, s: "Suppression d'un terrain"),

    # Subscriptions
    ('POST',   'subscriptions',                  True,  lambda u, s: "Souscription à un abonnement"),
    ('PATCH',  'subscriptions',                  True,  lambda u, s: "Changement de forfait"),
    ('PUT',    'subscriptions',                  True,  lambda u, s: "Changement de forfait"),
]


def _match_event(method, path, status_code):
    """Return label_fn if the request matches a business event, else None."""
    path_lower = path.lower()
    for (m, pattern, success_only, label_fn) in BUSINESS_EVENTS:
        if method != m:
            continue
        if pattern not in path_lower:
            continue
        if success_only and status_code >= 400:
            continue
        return label_fn
    return None


def _get_level(status_code):
    if status_code < 300:
        return 'success'
    if status_code < 400:
        return 'info'
    if status_code < 500:
        return 'warning'
    return 'error'


class ActivityLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        # Pre-capture request body for auth endpoints (email/username extraction)
        auth_data = {}
        path_low = request.path.lower()
        is_auth = 'login' in path_low or 'register' in path_low or 'signup' in path_low
        
        if is_auth and request.method == 'POST':
            try:
                import json
                # We use request.body safely. If it fails, we move on.
                body = json.loads(request.body)
                auth_data['email'] = body.get('email') or body.get('identifier')
                auth_data['username'] = body.get('username') or body.get('pseudo')
            except Exception:
                pass

        start_time = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start_time) * 1000)

        label_fn = _match_event(request.method, request.path, response.status_code)
        if label_fn:
            user = getattr(request, 'user', None)
            user_email = auth_data.get('email', '')
            username = auth_data.get('username', '')
            user_obj = None

            if user and user.is_authenticated:
                user_email = user.email
                username = user.username
                user_obj = user

            # Try manual JWT authentication if still anonymous
            if not user_email:
                try:
                    from rest_framework_simplejwt.authentication import JWTAuthentication
                    auth = JWTAuthentication().authenticate(request)
                    if auth:
                        user_obj, _ = auth
                        user_email = user_obj.email
                        username = user_obj.username
                except Exception:
                    pass

            # Final fallbacks to "inconnu"
            final_name = username or user_email or 'inconnu'
            
            try:
                ActivityLog.objects.create(
                    user=user_obj,
                    user_email=user_email[:255] if user_email else '',
                    username=username[:255] if username else '',
                    method=request.method,
                    path=request.path,
                    status_code=response.status_code,
                    level=_get_level(response.status_code),
                    message=label_fn(final_name, response.status_code),
                    ip_address=_get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    duration_ms=duration_ms,
                )
            except Exception:
                pass

        return response

