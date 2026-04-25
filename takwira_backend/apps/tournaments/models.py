import uuid
import random
from django.db import models
from django.conf import settings
from apps.terrains.models import Terrain

class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    captain = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='captain_of')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Tournament(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open for Registration'),
        ('ongoing', 'Ongoing'),
        ('finished', 'Finished'),
    )
    
    TYPE_CHOICES = (
        ('knockout', 'Knockout (Bracket)'),
        ('league', 'League (Standings)'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organized_tournaments')
    terrain = models.ForeignKey(Terrain, on_delete=models.CASCADE, related_name='tournaments')
    start_date = models.DateField()
    end_date = models.DateField()
    max_teams = models.IntegerField(default=8)
    entry_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    tournament_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='knockout')
    teams = models.ManyToManyField(Team, blank=True, related_name='tournaments')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    @property
    def auto_status(self):
        from django.utils import timezone
        now = timezone.now()
        today = now.date()
        
        # Check if final match exists and is finished
        final_finished = self.matches.filter(phase='final', status='finished').exists()
        
        if final_finished:
            return 'finished'
            
        if today < self.start_date:
            return 'open'
        elif self.start_date <= today <= self.end_date:
            return 'ongoing'
        else:
            return 'finished'

    @property
    def is_archived(self):
        """A tournament is only moved to archive 5 days after completion."""
        from django.utils import timezone
        from datetime import timedelta
        
        if self.status != 'finished':
            return False
            
        # If we have a completed_at date, use it. Otherwise use end_date.
        ref_date = self.completed_at or timezone.make_aware(timezone.datetime.combine(self.end_date, timezone.datetime.max.time()))
        
        if timezone.now() > ref_date + timedelta(days=5):
            return True
        return False

    def save(self, *args, **kwargs):
        from django.utils import timezone
        # Update the status field automatically before saving
        old_status = self.status
        self.status = self.auto_status
        
        # If status just changed to finished, set completed_at
        if self.status == 'finished' and old_status != 'finished' and not self.completed_at:
            self.completed_at = timezone.now()
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def generate_group_stage(self):
        """Generates matches for the group stage."""
        if self.matches.exists():
            return False # Already started
            
        teams = list(self.teams.all())
        random.shuffle(teams)
        
        # Decide number of groups (e.g., groups of 4)
        group_size = 4
        num_groups = len(teams) // group_size
        if num_groups == 0: num_groups = 1
        
        import string
        group_names = [f"Groupe {string.ascii_uppercase[i]}" for i in range(num_groups)]
        
        matches_created = 0
        for i, g_name in enumerate(group_names):
            # Split teams into groups
            g_teams = teams[i*group_size : (i+1)*group_size]
            if i == num_groups - 1: # Last group takes the rest
                g_teams = teams[i*group_size:]
                
            # Round robin for this group
            for idx1 in range(len(g_teams)):
                for idx2 in range(idx1 + 1, len(g_teams)):
                    Match.objects.create(
                        tournament=self,
                        team1=g_teams[idx1],
                        team2=g_teams[idx2],
                        phase='group',
                        group_name=g_name,
                        round_name=g_name,
                        status='scheduled',
                        order=matches_created
                    )
                    matches_created += 1
        return True

    def advance_tournament(self):
        """Checks if the current phase is finished and generates the next one."""
        from django.db.models import Count
        
        all_matches = self.matches.all()
        if not all_matches.exists():
            return "No matches started."

        # Find the latest phase
        phases_order = ['group', 'round_of_16', 'quarter', 'semi', 'final']
        current_phase = 'group'
        for p in phases_order:
            if all_matches.filter(phase=p).exists():
                current_phase = p
        
        # Check if current phase is finished
        phase_matches = all_matches.filter(phase=current_phase)
        if phase_matches.filter(status__in=['scheduled', 'ongoing']).exists():
            return f"Phase {current_phase} is not finished yet."

        # LOGIC TO IDENTIFY WINNERS
        winners = []
        if current_phase == 'group':
            # Get top 2 from each group
            group_names = phase_matches.values_list('group_name', flat=True).distinct()
            for g_name in group_names:
                g_standings = self.get_group_standings_internal(g_name)
                # Take top 2
                winners.extend([s['team_id'] for s in g_standings[:2]])
            
            # Determine next phase based on number of winners
            num_winners = len(winners)
            if num_winners <= 2: next_phase = 'final'
            elif num_winners <= 4: next_phase = 'semi'
            elif num_winners <= 8: next_phase = 'quarter'
            else: next_phase = 'round_of_16'
        else:
            # For knockout phases, winners are team1 or team2 based on score
            for m in phase_matches.order_by('order'):
                if not m.team1 or not m.team2: continue # Safety
                if m.score1 > m.score2:
                    winners.append(m.team1.id)
                else:
                    winners.append(m.team2.id)

            next_phase_idx = phases_order.index(current_phase) + 1
            if next_phase_idx >= len(phases_order):
                self.status = 'finished'
                self.save()
                return "Tournament finished."
            next_phase = phases_order[next_phase_idx]
        
        # If next phase already has matches, don't re-generate
        if all_matches.filter(phase=next_phase).exists():
            return f"Phase {next_phase} already generated."

        # GENERATE NEXT PHASE MATCHES
        from apps.tournaments.models import Team # Re-import just in case
        for i in range(0, len(winners), 2):
            if i + 1 < len(winners):
                Match.objects.create(
                    tournament=self,
                    team1_id=winners[i],
                    team2_id=winners[i+1],
                    phase=next_phase,
                    round_name=next_phase.replace('_', ' ').title(),
                    status='scheduled',
                    order=i // 2
                )
            else:
                # Odd number of winners? Give a bye or just one team match
                Match.objects.create(
                    tournament=self,
                    team1_id=winners[i],
                    team2=None,
                    phase=next_phase,
                    round_name=next_phase.replace('_', ' ').title(),
                    status='finished',
                    score1=1, score2=0,
                    order=i // 2
                )

        return f"Advanced to {next_phase}."

    def get_group_standings_internal(self, group_name):
        """Helper to calculate standings for a group."""
        matches = self.matches.filter(phase='group', group_name=group_name, status='finished')
        standings = {}
        
        # Get teams in this group from the matches
        group_teams = set()
        all_group_matches = self.matches.filter(phase='group', group_name=group_name)
        for m in all_group_matches:
            if m.team1: group_teams.add(m.team1)
            if m.team2: group_teams.add(m.team2)

        for team in group_teams:
            standings[team.id] = {'team_id': team.id, 'name': team.name, 'points': 0, 'gf': 0, 'ga': 0, 'gd': 0}

        for m in matches:
            standings[m.team1.id]['gf'] += m.score1
            standings[m.team1.id]['ga'] += m.score2
            standings[m.team2.id]['gf'] += m.score2
            standings[m.team2.id]['ga'] += m.score1
            if m.score1 > m.score2: standings[m.team1.id]['points'] += 3
            elif m.score1 < m.score2: standings[m.team2.id]['points'] += 3
            else:
                standings[m.team1.id]['points'] += 1
                standings[m.team2.id]['points'] += 1

        for tid in standings:
            standings[tid]['gd'] = standings[tid]['gf'] - standings[tid]['ga']

        return sorted(standings.values(), key=lambda x: (x['points'], x['gd'], x['gf']), reverse=True)

class Match(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('finished', 'Finished'),
    )

    PHASE_CHOICES = (
        ('group', 'Phase de Poules'),
        ('round_of_16', 'Huitièmes de finale'),
        ('quarter', 'Quarts de finale'),
        ('semi', 'Demi-finales'),
        ('third_place', 'Match pour la 3ème place'),
        ('final', 'Finale'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    team1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_team1', null=True, blank=True)
    team2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches_as_team2', null=True, blank=True)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    phase = models.CharField(max_length=20, choices=PHASE_CHOICES, default='group')
    group_name = models.CharField(max_length=50, blank=True, default='') # e.g., 'Groupe A', 'Groupe B'
    round_name = models.CharField(max_length=100, default='Round 1') # e.g., 'Final', 'Semi-final'
    match_date = models.DateTimeField(null=True, blank=True)
    order = models.IntegerField(default=0) # For ordering matches in a bracket

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        t1 = self.team1.name if self.team1 else "TBD"
        t2 = self.team2.name if self.team2 else "TBD"
        return f"{t1} vs {t2} ({self.tournament.name})"

class TournamentRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tournament_requests')
    terrain = models.ForeignKey(Terrain, on_delete=models.CASCADE, related_name='tournament_requests')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    max_teams = models.IntegerField(default=8)
    entry_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.status})"

class JoinRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='join_requests')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='join_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} -> {self.tournament.name} ({self.status})"
