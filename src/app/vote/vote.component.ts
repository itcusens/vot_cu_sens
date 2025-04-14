import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vote',
  imports: [
    CommonModule,
    MatTableModule,
    MatSelectModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './vote.component.html',
  styleUrl: './vote.component.scss'
})
export class VoteComponent {
  @Input() showPreview: boolean = true;
  @Input() maxRows: number = 30;
  @Input() showRandomize = false;
  @Input() allNames: string[] = [
    "John Doe", "Jane Smith", "James Johnson", "Mary Brown", "Robert White",
    "Michael Green", "Patricia Adams", "David Thompson", "Linda Harris", "William Clark",
    "Elizabeth Lewis", "Joseph Walker", "Barbara Hall", "Thomas Allen", "Sarah Young",
    "Charles King", "Jessica Scott", "Daniel Green", "Nancy Nelson", "Paul Carter",
    "Laura Mitchell", "Mark Perez", "Betty Garcia", "Steven King", "Dorothy Martin",
    "Andrew Lee", "Betty Rodriguez", "Christopher Davis", "Sandra Thomas", "Paul Hill",
    "Rebecca Walker"
  ];
  @Output() ballotChange = new EventEmitter<(string | null)[]>();
  NULL_VALUE = 'Null';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['maxRows'] && !changes['maxRows'].firstChange) {
      this.initTable();
    }

    if (changes['allNames'] && !changes['allNames'].firstChange) {
      this.updateAvailableNames();
    }
  }

  tableData: { value: number; index: number }[] = [];
  selectedNames: (string | null)[] = [];
  availableNamesPerRow: string[][] = [];
  filterTexts: string[] = [];

  ngOnInit() {
    this.initTable();
  }

  initTable() {
    this.tableData = Array.from({ length: this.maxRows }, (_, i) => ({
      value: this.maxRows - i - 1,
      index: i
    }));

    this.selectedNames = Array(this.maxRows).fill(null);
    this.filterTexts = Array(this.maxRows).fill('');
    this.availableNamesPerRow = Array(this.maxRows).fill(null).map(() => []);
    this.updateAvailableNames();
  }

  randomizeBallot() {
    const candidates = [...this.allNames];
    const randomized: (string | null)[] = [];

    while (randomized.length < this.maxRows && candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      const selected = candidates.splice(idx, 1)[0];
      randomized.push(selected);
    }

    this.selectedNames = randomized;
    this.filterTexts = Array(this.maxRows).fill('');
    this.updateAvailableNames();
    this.ballotChange.emit(this.selectedNames);
  }

  updateAvailableNames() {
    for (let i = 0; i <= this.maxRows; i++) {
      const used = this.selectedNames
        .filter((val, idx) => idx !== i && val !== this.NULL_VALUE);
      this.availableNamesPerRow[i] = this.allNames.filter(name => !used.includes(name));
    }
  }

  onNameSelect(index: number, name: string | null) {
    this.selectedNames[index] = name;
    this.updateAvailableNames();
    this.ballotChange.emit(this.selectedNames);
  }

  getFilteredNames(index: number): string[] {
    const filter = this.filterTexts[index].toLowerCase();
    return this.availableNamesPerRow[index]
      .filter(name => name.toLowerCase().includes(filter))
      .concat(this.selectedNames[index] === this.NULL_VALUE ? [this.NULL_VALUE] : []);
  }

  trackByIndex(index: number, item: any) {
    return index;
  }

  resetTable() {
    this.initTable();
    this.ballotChange.emit(this.selectedNames);
  }

  voteNullForAll() {
    this.selectedNames = Array(this.maxRows).fill(this.NULL_VALUE);
    this.filterTexts = Array(this.maxRows).fill('');
    this.updateAvailableNames();
    this.ballotChange.emit(this.selectedNames);
  }

  getBallotPreview() {
    return this.selectedNames.map((name, index) => ({
      number: this.maxRows - index,
      name: name === this.NULL_VALUE ? 'Null Vote' : name,
    }));
  }
}
