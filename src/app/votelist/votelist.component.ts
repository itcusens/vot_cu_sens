import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { VoteComponent } from '../vote/vote.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

const candidates = {
  cenzor: [
    {name: 'CRISTESCU Ioan Alexandru', photo: '/assets/Alex Cristescu.png'},
    {name: 'GASPAR Ioana', photo: '/assets/Ioana Gaspar.jpg'},
    {name: 'ISPRAVNIC Alexandre-Victor', photo: '/assets/IspravnicVictor.jpg'},
    {name: 'MUNTEAN Tudor Flaviu', photo: '/assets/Muntean Tudor.jpg'}
  ],
  arbitraj: [
    { name: 'ADOMNOAE Theona-ioana', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'BUDO Daniel-Alin-Marius (dani)', photo: '/assets/Dani Budo.png' },
    { name: 'BUNGIANU Adrian', photo: '/assets/Bungianu Adrian.jpg' },
    { name: 'CAZACU Constantin Dan', photo: '/assets/Dan_Cazacu.jpg' },
    { name: 'CHIRCULESCU Eugen', photo: '/assets/EugenChirculescu.jpeg' },
    { name: 'CRISTIAN Alexandra', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'FATOL Sinziana Ioana', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'FÜLÖP Tihamér', photo: '/assets/Tihamer.jpg' },
    { name: 'GHIȚESCU Antoaneta', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'GOȘMAN Ioana Cristina', photo: '/assets/Ioana_Gosman.jpg' },
    { name: 'MATEI Teodor', photo: '/assets/Matei Teodor.jpg' },
    { name: 'MOLNAR POPA David Gabriel', photo: '/assets/Molnar David.jpg' },
    { name: 'MOVILA Catalin Pavel', photo: '/assets/Movila Catalin.jpg' },
    { name: 'MUNTEANU Vlad Matei', photo: '/assets/Munteanu Vlad.jpg' },
    { name: 'RADA Mihai Dumitru', photo: '/assets/Rada Mihai Dumitru.JPG' },
    { name: 'RIZEA Cristian', photo: '/assets/Cristian Rizea.jpg' },
    { name: 'STANCIU Andrada', photo: '/assets/Andrada Stanciu.jpg' },
    { name: 'SULIȚANU Ovidiu', photo: '/assets/SulitanuOvidiu.jpg' },
    { name: 'SWIDERSKA (PURENCIU) Andreea', photo: '/assets/Andreea Purenciu Nou.jpg' },
    { name: 'TIU Eleonora-iacinta', photo: '/assets/Eleonora Tiu.jpg' },
    { name: 'VICLEANU-IOAN Roxana', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' }
  ],
  cn: [
    { name: 'ANCUTA Tudor Dan', photo: '/assets/Tudor Dan Ancuta.jpg' },
    { name: 'BAN Gabriel', photo: '/assets/Gabriel Ban.jpg' },
    { name: 'BOLOLOI Cristian-Marian', photo: '/assets/Cristian Bololoi.png' },
    { name: 'CHIRILĂ Oana Alexandra', photo: '/assets/Oana Chirila_.jpg' },
    { name: 'CLENCIU Daniel Cristian', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'CZOBOR Francisc', photo: '/assets/Francisc Czobor.JPG' },
    { name: 'DOBRIN Alexandru', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'DOCIU Petruț', photo: '/assets/Petrut Dociu.jpg' },
    { name: 'GALBENU Mircea Mihai', photo: '/assets/Galbenu Mircea.jpg' },
    { name: 'GALBENU Ana Iulia', photo: '/assets/Ana Iulia Galbenu.jpg' },
    { name: 'IACOB-LE ROY Oana Alexandra', photo: '/assets/Oana Iacob.JPEG' },
    { name: 'ILIȘANU Larisa livia', photo: '/assets/Livia Ilisanu.webp' },
    { name: 'IUSCO Lenuta-Gabriela', photo: '/assets/Lena Iusco.jpg' },
    { name: 'MACSUT Andrei-Cosmin', photo: '/assets/Andrei Macsut.jpg' },
    { name: 'MARTON Attila', photo: '/assets/Attila Marton.jpeg' },
    { name: 'MILEA Teodor Daniel', photo: '/assets/Milea Teodor.JPG' },
    { name: 'MILOS Cosmin - Mihai', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'PAUTĂ Răzvan', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'PĂDURARU Roxana', photo: '/assets/Roxana Paduraru.jpg' },
    { name: 'PĂTRU Georgian Andrei', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'PREOTEASA-MAIER Cristian-Ștefan', photo: 'assets/Preoteasa.jpg' },
    { name: 'PRESADĂ Florina', photo: '/assets/Florina Presada.jpeg' },
    { name: 'ROMANESCU Claudia Ștefana', photo: '/assets/Claudia Romanescu.jpg' },
    { name: 'SIMIHĂLEANU Liviu Gabriel', photo: '/assets/Liviu Simihaleanu.JPG' },
    { name: 'STAN Alexandru Ionut', photo: '/assets/Alex Stan.jpg' },
    { name: 'STINGHE Radu Calin', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'STOENOIU Vasile Cosmin', photo: '/assets/Stoe.jpg' },
    { name: 'TOREANIK Magdalena', photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' },
    { name: 'ȚĂRANU Victoria', photo: '/assets/Victoria Taranu .jpg' },
    { name: 'VERZES Oana', photo: '/assets/Oana Verzes_.jpg' },
    { name: 'ZISU Andrei-Costin', photo: '/assets/zisu.jpg' }
  ],
}

@Component({
  selector: 'app-votelist',
  imports: [VoteComponent, CommonModule, MatButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './votelist.component.html',
  styleUrl: './votelist.component.scss'
})
export class VotelistComponent {
  currentVoteType: number = 0;
  showNavigation: boolean = true;

  voteTypes = [
    {
      name: 'Comisia Națională de Cenzori (funcție de control)',
      candidates: candidates.cenzor
    },
    {
      name: 'Comisia Națională de Arbitraj (funcție de arbitraj)',
      candidates: candidates.arbitraj
    },
    {
      name: 'Consiliu Național (funcție de conducere)',
      candidates: candidates.cn
    }
  ];

  ballotStates: (string | null)[][] = [
    Array(4).fill(null),
    Array(21).fill(null),
    Array(31).fill(null)
  ];

  nextVoteType() {
    this.currentVoteType = (this.currentVoteType + 1) % this.voteTypes.length;
  }

  prevVoteType() {
    this.currentVoteType = (this.currentVoteType - 1 + this.voteTypes.length) % this.voteTypes.length;
  }

  onBallotChange(newBallot: (string | null)[]) {
    this.ballotStates[this.currentVoteType] = newBallot;
  }

  get currentCandidates() {
    return this.voteTypes[this.currentVoteType].candidates;
  }

  get currentCandidatesNames() {
    return this.voteTypes[this.currentVoteType].candidates.map((item) => item.name);
  }

  get currentMaxRows() {
    return this.voteTypes[this.currentVoteType].candidates.length;
  }

  get currentBallot() {
    return this.ballotStates[this.currentVoteType];
  }

  get currentVoteName() {
    return this.voteTypes[this.currentVoteType].name;
  }
}
