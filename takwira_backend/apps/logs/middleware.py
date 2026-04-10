import time
from apps.logs.models import ActivityLog


def _get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# Whitelist of business events to log.
# Each entry: (method, path_contains, success_only, label_fn)
# label_fn(user_email) -> str
BUSINESS_EVENTS = [
    # Auth
    ('POST',   'auth/login',                     True,  lambda u: f"Connexion de {u}"),
    ('POST',   'auth/register',                  True,  lambda u: f"Nouveau compte créé : {u}"),
    ('PATCH',  'auth/me',                        True,  lambda u: f"Profil modifié par {u}"),
    ('PUT',    'auth/me',                        True,  lambda u: f"Profil modifié par {u}"),

    # Reservations
    ('POST',   'reservations',                   True,  lambda u: f"Nouvelle réservation par {u}"),
    ('DELETE', 'reservations',                   True,  lambda u: f"Réservation supprimée par {u}"),
    ('PATCH',  'reservations',                   True,  lambda u: f"Réservation modifiée par {u}"),
    ('PUT',    'reservations',                   True,  lambda u: f"Réservation modifiée par {u}"),

    # Tournaments
    ('POST',   'tournaments/tournament-requests', True, lambda u: f"Demande de tournoi soumise par {u}"),
    ('PATCH',  'approve',                         True, lambda u: f"Demande de tournoi approuvée par {u}"),
    ('PATCH',  'reject',                          True, lambda u: f"Demande de tournoi refusée par {u}"),
    ('POST',   'tournaments/join-requests',       True, lambda u: f"Inscription à un tournoi par {u}"),
    ('PATCH',  'join-requests',                   True, lambda u: f"Inscription au tournoi traitée par {u}"),
    ('POST',   'tournaments',                     True, lambda u: f"Tournoi créé par {u}"),
    ('PUT',    'tournaments',                     True, lambda u: f"Tournoi modifié par {u}"),
    ('PATCH',  'tournaments',                     True, lambda u: f"Tournoi modifié par {u}"),
    ('DELETE', 'tournaments',                     True, lambda u: f"Tournoi supprimé par {u}"),

    # Terrains
    ('POST',   'terrains',                       True,  lambda u: f"Terrain ajouté par {u}"),
    ('PUT',    'terrains',                       True,  lambda u: f"Terrain modifié par {u}"),
    ('PATCH',  'terrains',                       True,  lambda u: f"Terrain modifié par {u}"),
    ('DELETE', 'terrains',                       True,  lambda u: f"Terrain supprimé par {u}"),

    # Subscriptions
    ('POST',   'subscriptions',                  True,  lambda u: f"Abonnement souscrit par {u}"),
    ('PATCH',  'subscriptions',                  True,  lambda u: f"Abonnement modifié par {u}"),
    ('PUT',    'subscriptions',                  True,  lambda u: f"Abonnement modifié par {u}"),
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
    """
    Logs only meaningful business events (login, reservations, tournaments, etc.)
    Ignores all raw GET requests and generic noise.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip non-API paths immediately
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        start_time = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start_time) * 1000)

        label_fn = _match_event(request.method, request.path, response.status_code)
        if label_fn:
            user = getattr(request, 'user', None)
            user_email = ''
            user_obj = None

            if user and user.is_authenticated:
                user_email = user.email
                user_obj = user

            # For login, extract email from response body if user not yet set
            if not user_email and 'login' in request.path.lower():
                try:
                    import json
                    body = json.loads(response.content)
                    user_email = body.get('user', {}).get('email', 'inconnu')
                except Exception:
                    user_email = 'inconnu'

            if not user_email:
                user_email = 'inconnu'

            try:
                ActivityLog.objects.create(
                    user=user_obj,
                    user_email=user_email,
                    method=request.method,
                    path=request.path,
                    status_code=response.status_code,
                    level=_get_level(response.status_code),
                    message=label_fn(user_email),
                    ip_address=_get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    duration_ms=duration_ms,
                )
            except Exception:
                pass  # Never break the request because of logging

        return response

