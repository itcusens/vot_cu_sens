import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { VoteComponent } from '../vote/vote.component';

@Component({
  selector: 'app-simulate',
  standalone: true,
  templateUrl: './simulate.component.html',
  styleUrls: ['./simulate.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    VoteComponent,
  ]
})
export class SimulateComponent {
  numCandidates = 5;
  numWinners = 2;
  numVoters = 3;
  useRandomBallots = false;

  candidateNames: string[] = [];
  manualBallots: (string | null)[][] = [];

  simulationResults: any[] = [];
  winners: string[] = [];
  currentRound = 0;
  NULL_VALUE = 'Null';

  ngOnInit() {
    this.resetCandidateNames();
  }

  resetCandidateNames() {
    this.candidateNames = Array(this.numCandidates).fill('').map((_, i) => `Candidate ${i + 1}`);
  }

  onCandidateCountChange() {
    const diff = this.numCandidates - this.candidateNames.length;
    if (diff > 0) {
      this.candidateNames.push(...Array(diff).fill('').map((_, i) => `Candidate ${this.candidateNames.length + i + 1}`));
    } else if (diff < 0) {
      this.candidateNames.splice(diff);
    }
  }

  onBallotChange(index: number, ballot: (string | null)[]) {
    this.manualBallots[index] = ballot;
  }

  resetAll() {
    this.numCandidates = 5;
    this.numWinners = 2;
    this.numVoters = 3;
    this.useRandomBallots = false;
    this.simulationResults = [];
    this.winners = [];
    this.resetCandidateNames();
    this.manualBallots = [];
  }

  trackByIndex(index: number): number {
    return index;
  }

  onCandidateNameChange(index: number, value: string) {
    this.candidateNames[index] = value;
    this.candidateNames = [...this.candidateNames];
  }

  get voterArray(): number[] {
    return Array.from({ length: this.numVoters }, (_, i) => i);
  }

  goToPrevRound() {
    this.currentRound = Math.max(0, this.currentRound - 1);
  }

  goToNextRound() {
    this.currentRound = Math.min(this.simulationResults.length - 1, this.currentRound + 1);
  }

  simulate() {
    const candidates = [...this.candidateNames];
    const votes: any[] = [];

    if (this.useRandomBallots) {
      for (let i = 0; i < this.numVoters; i++) {
        const dummy = [...candidates];
        const vote: any = {};
        while (dummy.length) {
          const candidate = dummy.splice(Math.floor(Math.random() * dummy.length), 1)[0];
          vote[candidate] = dummy.length;
        }
        votes.push(vote);
      }
    } else {
      this.manualBallots.forEach(ballot => {
        const vote: Record<string, number> = {};
        let rank = ballot.length - 1;
        for (const candidate of ballot) {
          if (candidate && candidate !== this.NULL_VALUE) {
            vote[candidate] = rank--;
          }
        }
        votes.push(vote);
      });
    }

    const { roundScores, eliminated } = this.countVotes(votes, candidates, this.numWinners);
    this.simulationResults = roundScores;
    this.currentRound = 0;
    this.winners = candidates.filter(c => !eliminated.includes(c));
  }

  countVotes(votes: any[], candidates: string[], noSeats: number): { roundScores: any[], eliminated: string[] } {
    const roundScores: any[] = [];
    const worstCandidates: string[] = [];

    for (let round = 0; round < candidates.length - noSeats; round++) {
      const remaining = candidates.filter(c => !worstCandidates.includes(c));
      const roundScore: Record<string, [number, number]> = {};

      for (const candidate of remaining) {
        let totalScore = 0;
        let noFirsts = 0;

        for (const vote of votes) {
          totalScore += vote[candidate] ?? 0;

          const sorted = Object.entries(vote)
            .filter(([c]) => !worstCandidates.includes(c))
            .sort((a: any, b: any) => b[1] - a[1]);

          if (sorted.length && sorted[0][0] === candidate) {
            noFirsts++;
          }
        }

        roundScore[candidate] = [totalScore, noFirsts];
      }

      roundScores.push(roundScore);

      const [worstCandidate] = Object.entries(roundScore).reduce(
        (min: any, [name, [score]]) =>
          score < min[1] || (score === min[1] && name < min[0])
            ? [name, score]
            : min,
        [null, Infinity] as [string | null, number]
      );

      if (worstCandidate) {
        worstCandidates.push(worstCandidate);
      }

      if (candidates.length - worstCandidates.length <= noSeats) break;
    }

    return { roundScores, eliminated: worstCandidates };
  }
}
