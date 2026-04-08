from django.db.models import Q
import datetime

def check_terrain_availability(terrain, date, start_time, end_time, exclude_reservation_id=None):
    """
    Checks if a terrain is available for a given date and time range.
    A terrain is occupied if:
    1. There's a confirmed reservation that overlaps.
    2. There's an active tournament that includes this date.
    """
    from apps.reservations.models import Reservation
    from apps.tournaments.models import Tournament

    # 1. Check Reservations overlap
    # A reservation overlaps if (start1 < end2) AND (end1 > start2)
    overlapping_reservations = Reservation.objects.filter(
        terrain=terrain,
        date=date,
        status='confirmed'
    ).filter(
        Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
    )
    
    if exclude_reservation_id:
        overlapping_reservations = overlapping_reservations.exclude(id=exclude_reservation_id)
        
    if overlapping_reservations.exists():
        return False, "Ce créneau horaire est déjà réservé."

    # 2. Check Tournament overlap
    # We assume tournaments occupy the terrain for the whole day during matches.
    overlapping_tournaments = Tournament.objects.filter(
        terrain=terrain,
        status__in=['open', 'ongoing'],
        start_date__lte=date,
        end_date__gte=date
    )
    
    if overlapping_tournaments.exists():
        return False, "Le terrain est occupé par un tournoi à cette date."

    return True, ""

def check_tournament_availability(terrain, start_date, end_date, exclude_tournament_id=None):
    """
    Checks if a terrain is available for a tournament date range.
    """
    from apps.reservations.models import Reservation
    from apps.tournaments.models import Tournament

    # 1. Check other tournaments
    overlapping_tournaments = Tournament.objects.filter(
        terrain=terrain,
        status__in=['open', 'ongoing']
    ).filter(
        Q(start_date__lte=end_date) & Q(end_date__gte=start_date)
    )

    if exclude_tournament_id:
        overlapping_tournaments = overlapping_tournaments.exclude(id=exclude_tournament_id)

    if overlapping_tournaments.exists():
        return False, "Le terrain est déjà occupé par un autre tournoi sur cette période."

    # 2. Check confirmed reservations in this range
    overlapping_reservations = Reservation.objects.filter(
        terrain=terrain,
        date__range=(start_date, end_date),
        status='confirmed'
    )

    if overlapping_reservations.exists():
        return False, "Il existe déjà des réservations confirmées sur cette période."

    return True, ""
