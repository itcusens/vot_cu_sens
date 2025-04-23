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
  numWinners = 10;
  numVoters = 3;
  useRandomBallots = false;

  candidateNames: string[] = [];
  manualBallots: (string | null)[][] = [];

  simulationResults: any[] = [];
  winners: string[] = [];
  currentRound = 0;
  NULL_VALUE = 'Null';
  currentBallotIndex: number = 0;
  ballotJumpInput: any;

  showConfig: boolean = true;
  showSimulationResults: boolean = false;

  prevBallot() {
    if (this.currentBallotIndex > 0) {
      this.currentBallotIndex = this.currentBallotIndex - 1;
    }
  }

  toggleConfig() {
    this.showConfig = !this.showConfig;
  }

  nextBallot() {
    if (this.currentBallotIndex < this.numVoters - 1) {
      this.currentBallotIndex = this.currentBallotIndex + 1;
    }
  }

  jumpToBallot() {
    if (this.ballotJumpInput && this.ballotJumpInput >= 1 && this.ballotJumpInput <= this.numVoters) {
      this.currentBallotIndex = this.ballotJumpInput - 1;
      this.ballotJumpInput = null;
    } else {
      alert('Invalid ballot number!');
    }
  }

  ngOnInit() {
    this.resetCandidateNames();
  }

  resetCandidateNames() {
    this.candidateNames = Array(this.numCandidates).fill('').map((_, i) => `Candidat ${i + 1}`);
  }

  toggleSimulationResults() {
    this.showSimulationResults = !this.showSimulationResults;
  }

  onCandidateCountChange() {
    const diff = this.numCandidates - this.candidateNames.length;
    if (diff > 0) {
      this.candidateNames.push(...Array(diff).fill('').map((_, i) => `Candidat ${this.candidateNames.length + i + 1}`));
    } else if (diff < 0) {
      this.candidateNames.splice(diff);
    }
  }

  getScoreMatrixForRound(roundIndex: number): { candidate: string, scores: (number | null)[] }[] {
    const round = this.simulationResults[roundIndex];
    const ballots = round?.ballots || [];
    const candidateNames = Object.keys(round?.candidates || {});

    return candidateNames.map(candidate => {
      const scores = ballots.map((ballot: any) => {
        const filtered = ballot.filter((c:string) => candidateNames.includes(c));
        const n = filtered.length;
        const position = filtered.indexOf(candidate);
        if (position === -1) return null;
        return n - position;
      });
      return { candidate, scores };
    });
  }

  getBallotIndexesForRound(roundIndex: number): number[] {
    const ballots = this.simulationResults[roundIndex]?.ballots || [];
    return Array.from({ length: ballots.length }, (_, i) => i + 1);
  }


  onBallotChange(index: number, ballot: (string | null)[]) {
    this.manualBallots[index] = ballot;
  }

  resetAll() {
    this.numCandidates = 5;
    this.numWinners = 10;
    this.numVoters = 3;
    this.useRandomBallots = false;
    this.simulationResults = [];
    this.winners = [];
    this.manualBallots = [];
    this.resetCandidateNames();
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
    this.currentBallotIndex = 0;
    this.manualBallots = rawBallots;
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
    const round = this.simulationResults[roundIndex];
    const roundData = round?.candidates || {};
    return Object.entries(roundData)
      .map(([name, values]: any) => ({
        name,
        firsts: values.firsts,
        borda: values.borda
      }))
      .sort((a, b) => b.firsts - a.firsts || b.borda - a.borda);
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
    ballots: { ballot: string[] }[],
    candidates: string[],
    seats: number
  ): { elected: string[]; rounds: any[] } {
    const rounds: any[] = [];
    let remaining = [...candidates];
    let workingBallots = ballots.map(b => [...b.ballot]);

    function countFirstPreferences(ballots: string[][], remaining: string[]) {
      const counts: Record<string, number> = Object.fromEntries(
        remaining.map(candidate => [candidate, 0])
      );

      for (const ballot of ballots) {
        const top = ballot.find(candidate => remaining.includes(candidate));
        if (top) counts[top] += 1;
      }

      return counts;
    }

    function calculateBordaScores(ballots: string[][], remaining: string[]) {
      const scores: Record<string, number> = Object.fromEntries(
        remaining.map(candidate => [candidate, 0])
      );

      for (const ballot of ballots) {
        const filtered = ballot.filter(candidate => remaining.includes(candidate));
        const n = filtered.length;

        filtered.forEach((candidate, index) => {
          scores[candidate] += n - index - 1;
        });
      }

      return scores;
    }

    while (remaining.length > seats) {
      const firstPrefs = countFirstPreferences(workingBallots, remaining);
      const bordaScores = calculateBordaScores(workingBallots, remaining);

      const roundData: Record<string, { firsts: number; borda: number }> = {};
      for (const candidate of remaining) {
        roundData[candidate] = {
          firsts: firstPrefs[candidate],
          borda: bordaScores[candidate],
        };
      }
      rounds.push({
        candidates: roundData,
        ballots: workingBallots.map(b => [...b])
      });

      const minFirstVotes = Math.min(...remaining.map(c => firstPrefs[c]));
      const toEliminate = remaining.filter(c => firstPrefs[c] === minFirstVotes);

      let eliminatedCandidate: string;
      if (toEliminate.length === 1) {
        eliminatedCandidate = toEliminate[0];
      } else {
        const bordaSubset = toEliminate.map(c => ({ c, borda: bordaScores[c] }));
        const minBorda = Math.min(...bordaSubset.map(item => item.borda));
        eliminatedCandidate = bordaSubset.find(item => item.borda === minBorda)!.c;
      }

      remaining = remaining.filter(c => c !== eliminatedCandidate);
      workingBallots = workingBallots.map(ballot =>
        ballot.filter(candidate => candidate !== eliminatedCandidate)
      );
    }

    return { elected: remaining, rounds };
  }

}
