import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { QRCodeComponent } from 'angularx-qrcode';

type Candidate = {
  name: string,
  photo: string
}

@Component({
  selector: 'app-vote',
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    QRCodeComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './vote.component.html',
  styleUrl: './vote.component.scss'
})
export class VoteComponent {
  @Input() showPreview: boolean = true;
  @Input() maxRows: number = 30;
  @Input() showRandomize = true;
  @Input() showRandomFill = false;
  @Input() ballot: (string | null)[] = [];
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
  NULL_VALUE = 'ANULAT';

  candidateSearchText: string = '';
  candidates:Candidate[] = [{name: 'Vasile Raul', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}];
  qrcode: string = '';

  getFilteredCandidates() {
    return this.candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(this.candidateSearchText.toLowerCase())
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ballot'] && changes['ballot'].currentValue) {
      this.selectedNames = [...this.ballot];
      console.log(this.ballot)
      this.filterTexts = Array(this.maxRows).fill('');
      this.updateAvailableNames();
    }

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

  fillTheRest() {
    for (let i = 0; i < this.maxRows; i++) {
      if (!this.selectedNames[i]) {
        const used = this.selectedNames
          .filter((val, idx) => idx !== i && val !== this.NULL_VALUE);
        const available = this.allNames.filter(name => !used.includes(name));

        if (available.length > 0) {
          const randomName = available[Math.floor(Math.random() * available.length)];
          this.selectedNames[i] = randomName;
        }
      }
    }

    this.updateAvailableNames();
    this.ballotChange.emit(this.selectedNames);
  }

  getBallotPreview() {
    const ballot = this.selectedNames.map((name, index) => ({
      number: this.maxRows - index,
      name: name === this.NULL_VALUE ? 'ANULAT' : name,
    }));
    this.qrcode = JSON.stringify(ballot, null, 2);
    return ballot;
  }

  print() {
    const printContents = document.querySelector('.preview-print')?.innerHTML;
    const previewElement = document.querySelector('.preview-container');
    const qrCanvas = previewElement?.querySelector('qrcode canvas') as HTMLCanvasElement;

    if (printContents) {
      const printWindow = window.open('', '', 'width=800,height=600');
      const qrDataURL = qrCanvas ? qrCanvas.toDataURL('image/png') : '';

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <title>Buletin vot</title>
            <head>
              <style>
                @page {
                  margin: 0;
                }

                body {
                  margin: 2cm;
                }
                body {
                  font-family: 'Arial', sans-serif;
                  background-color: white;
                  color: black;
                  margin: 0;
                  padding: 20px;
                }
                h3 {
                  color: black;
                  text-align: center;
                  margin-bottom: 5px;
                  font-size: 1.2rem;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 0.8rem;
                }
                th, td {
                  border: 1px solid #333;
                  padding: 0px;
                  text-align: center;
                }
                th {
                  background-color: #e0e0e0;
                  color: black;
                }
                .qr-container {
                  margin-top: 15px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
                .qr-container img {
                  width: 450px;
                  height: 450px;
                }
              </style>
            </head>
            <body>
              ${printContents}
              <div class="qr-container">
                ${qrDataURL ? `<img src="${qrDataURL}" alt="QR Code" />` : ''}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      console.error('Preview container not found.');
    }
  }
}
