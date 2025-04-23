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
    this.candidateNames = Array(this.numCandidates).fill('').map((_, i) => `Candidat ${i + 1}`);
  }

  onCandidateCountChange() {
    const diff = this.numCandidates - this.candidateNames.length;
    if (diff > 0) {
      this.candidateNames.push(...Array(diff).fill('').map((_, i) => `Candidat ${this.candidateNames.length + i + 1}`));
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

  onCsvUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;
      this.loadCsvData(text);
    };

    reader.readAsText(file);
  }

  loadCsvData(csvText: string) {
    const lines = csvText.trim().split('\n');
    const rows = lines.map(line => line.split(',').map(cell => cell.trim()));
    const ballotHeaders = rows[0].slice(1);
    const candidateRows = rows.slice(1);

    const candidateNames = candidateRows.map(row => row[0]);
    const rawBallots: (string | null)[][] = Array(ballotHeaders.length).fill(null).map(() => []);

    for (let ballotIndex = 0; ballotIndex < ballotHeaders.length; ballotIndex++) {
      const ballot: { candidate: string, rank: number }[] = [];

      for (let rowIndex = 0; rowIndex < candidateRows.length; rowIndex++) {
        const candidate = candidateRows[rowIndex][0];
        const rankStr = candidateRows[rowIndex][ballotIndex + 1];
        const rank = parseFloat(rankStr);

        if (!isNaN(rank)) {
          ballot.push({ candidate, rank });
        }
      }

      ballot.sort((a, b) => a.rank - b.rank);
      rawBallots[ballotIndex] = ballot.map(b => b.candidate);
    }

    this.numCandidates = candidateNames.length;
    this.numVoters = rawBallots.length;
    this.candidateNames = candidateNames;
    this.manualBallots = rawBallots;

    console.log('CSV loaded successfully:',
      this.candidateNames,
    );
    console.log('CSV loaded successfully:',
      this.manualBallots[0]
    );
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

  getSortedCandidatesForRound(roundIndex: number): { name: string, firsts: number, borda: number }[] {
    const roundData = this.simulationResults[roundIndex];
    return Object.entries(roundData)
      .map(([name, values]: any) => ({
        name,
        firsts: values.firsts,
        borda: values.borda
      }))
      .sort((a, b) => b.firsts - a.firsts || b.borda - a.borda);
  }

  getRoundExplanation(roundIndex: number): string {
    const round = this.simulationResults[roundIndex];
    const candidateNames = Object.keys(round);
    const top = candidateNames.reduce((a, b) => round[a].firsts >= round[b].firsts ? a : b);

    const electedThisRound = this.getElectedThisRound(roundIndex);
    const eliminatedThisRound = this.getEliminatedThisRound(roundIndex);

    let explanation = `In this round, ${top} had the most 1st-choice votes. `;

    if (electedThisRound.length) {
      explanation += `${electedThisRound.join(", ")} ${
        electedThisRound.length === 1 ? 'was' : 'were'
      } elected. `;
    }

    if (eliminatedThisRound.length) {
      explanation += `${eliminatedThisRound.join(", ")} ${
        eliminatedThisRound.length === 1 ? 'was' : 'were'
      } eliminated due to having the lowest Borda score.`;
    }

    return explanation;
  }

  getElectedThisRound(roundIndex: number): string[] {
    if (roundIndex === 0) return this.simulationResults[roundIndex].elected || [];
    const prev = this.simulationResults[roundIndex - 1]?.elected || [];
    const curr = this.simulationResults[roundIndex]?.elected || [];
    return curr.filter((c:string) => !prev.includes(c));
  }

  getEliminatedThisRound(roundIndex: number): string[] {
    if (roundIndex === 0) return this.simulationResults[roundIndex].eliminated || [];
    const prev = this.simulationResults[roundIndex - 1]?.eliminated || [];
    const curr = this.simulationResults[roundIndex]?.eliminated || [];
    return curr.filter((c:string) => !prev.includes(c));
  }


  simulate() {
    const candidates = [...this.candidateNames];
    const ballots: { ballot: string[], weight: number }[] = [];

    if (this.useRandomBallots) {
      for (let i = 0; i < this.numVoters; i++) {
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        ballots.push({ ballot: shuffled, weight: 1 });
      }
    } else {
      for (const ballot of this.manualBallots) {
        const clean = ballot.filter(c => c && c !== this.NULL_VALUE) as string[];
        if (clean.length > 0) {
          ballots.push({ ballot: clean, weight: 1 });
        }
      }
    }

    const { elected, rounds } = this.runStvBorda(ballots, candidates, this.numWinners);
    this.winners = elected;
    this.simulationResults = rounds;
    this.currentRound = 0;
  }

  runStvBorda(
    ballots: { ballot: string[], weight: number }[],
    candidates: string[],
    seats: number
  ): { elected: string[], rounds: any[] } {
    const totalVotes = ballots.reduce((sum, b) => sum + b.weight, 0);
    const quota = Math.floor(totalVotes / (seats + 1)) + 1;
    let elected: string[] = [];
    let remaining = [...candidates];
    const rounds: any[] = [];

    function countFirstPreferences(ballots: any[], remaining: string[]) {
      const counts: Record<string, number> = Object.fromEntries(remaining.map(candidate => [candidate, 0]));
      for (const { ballot, weight } of ballots) {
        const top = ballot.find((candidate:string) => remaining.includes(candidate));
        if (top) counts[top] += weight;
      }
      return counts;
    }

    function calculateBordaScores(ballots: any[], remaining: string[]): Record<string, number> {
      const scores: Record<string, number> = Object.fromEntries(remaining.map(candidate => [candidate, 0]));

      for (const { ballot, weight } of ballots) {
        const filtered = ballot.filter((candidate: string) => remaining.includes(candidate));
        const n = filtered.length;

        filtered.forEach((candidate:number, index:number): void => {
          scores[candidate] += weight * (n - index - 1);
        });
      }

      return scores;
    }

    function redistribute(ballots: any[], fromCandidate: string, surplus: number, remaining: string[]): any[] {
      const donorBallots = ballots.filter(ballot => ballot.ballot[0] === fromCandidate);
      const bordaSums: Record<string, number> = {};

      for (const { ballot, weight } of donorBallots) {
        const filtered:[] = ballot.filter((candidate: string) => candidate !== fromCandidate && remaining.includes(candidate));
        const n:number = filtered.length;

        filtered.forEach((candidate: string, index: number): void => {
          bordaSums[candidate] = (bordaSums[candidate] || 0) + (n - index - 1) * weight;
        });
      }

      const totalScore = Object.values(bordaSums).reduce((a, b) => a + b, 0);
      const newBallots: any[] = [];

      for (const { ballot, weight } of donorBallots) {
        const filtered = ballot.filter((candidate:string) => candidate !== fromCandidate && remaining.includes(candidate));
        for (const candidate of filtered) {
          const portion = totalScore === 0 ? 1 / filtered.length : (bordaSums[candidate] || 0) / totalScore;
          const newWeight = weight * (surplus / donorBallots.reduce((sum, b) => sum + b.weight, 0)) * portion;
          newBallots.push({ ballot: filtered, weight: newWeight });
        }
      }

      return newBallots;
    }

    let weightedBallots = [...ballots];

    while (elected.length < seats && remaining.length > 0) {
      if (remaining.length <= seats - elected.length) {
        elected = elected.concat(remaining);
        break;
      }
      const roundData: Record<string, { firsts: number, borda: number }> = {};
      const firstPrefs = countFirstPreferences(weightedBallots, remaining);
      const bordaScores = calculateBordaScores(weightedBallots, remaining);

      for (const candidate of remaining) {
        roundData[candidate] = {
          firsts: firstPrefs[candidate],
          borda: bordaScores[candidate],
        };
      }

      rounds.push(roundData);

      const newlyElected: string[] = [];

      for (const candidate of remaining) {
        if (firstPrefs[candidate] >= quota) {
          newlyElected.push(candidate);
          elected.push(candidate);
        }
      }

      if (newlyElected.length > 0) {
        for (const c of newlyElected) {
          const surplus = firstPrefs[c] - quota;
          const surplusBallots = redistribute(weightedBallots, c, surplus, remaining);
          weightedBallots = weightedBallots.filter(b => b.ballot[0] !== c).concat(surplusBallots);
          remaining = remaining.filter(r => r !== c);
        }
      } else {
        const minBorda = Math.min(...remaining.map(c => bordaScores[c]));
        const toEliminate = remaining.find(c => bordaScores[c] === minBorda)!;
        weightedBallots = weightedBallots.map(b => ({
          ballot: b.ballot.filter(c => c !== toEliminate),
          weight: b.weight,
        }));
        remaining = remaining.filter(c => c !== toEliminate);
      }
    }

    return { elected, rounds };
  }

}
