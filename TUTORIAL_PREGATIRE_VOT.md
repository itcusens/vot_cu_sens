# Tutorial: Pregătirea unui nou proces de vot

Acest ghid descrie pașii necesari pentru a configura aplicația VotCuSens pentru un nou proces de vot: actualizarea candidaților, ajustarea configurărilor și calcularea rezultatului final.

---

## Pasul 1 — Actualizarea candidaților

Candidații sunt definiți în fișierul `src/app/votelist/votelist.component.ts`, în obiectul `candidates` (linia 6). Obiectul conține câte un array pentru fiecare tip de vot.

### 1.1 Structura unui candidat

Fiecare candidat are două câmpuri:

```typescript
{ name: 'NUME Prenume', photo: 'assets/NumePrenume.jpg' }
```

- **`name`** — numele complet al candidatului (afișat pe buletin și folosit în algoritmul de calcul)
- **`photo`** — calea către fotografia candidatului; poate fi un fișier local din `src/assets/` sau un URL extern

### 1.2 Editarea listelor de candidați

Deschide `src/app/votelist/votelist.component.ts` și editează obiectul `candidates`. De exemplu, pentru a înlocui candidații pentru comisia de cenzori:

```typescript
const candidates = {
  cenzor: [
    { name: 'POPESCU Maria',    photo: 'assets/Maria Popescu.jpg' },
    { name: 'IONESCU Andrei',   photo: 'assets/Andrei Ionescu.png' },
    // ... adaugă restul candidaților
  ],
  arbitraj: [
    // ... candidații pentru comisia de arbitraj
  ],
  cn: [
    // ... candidații pentru consiliul național
  ],
};
```

### 1.3 Adăugarea fotografiilor

Copiază fotografiile candidaților noi în directorul `src/assets/`. Șterge fotografiile candidaților vechi care nu mai sunt necesare, pentru a nu încărca build-ul inutil.

Dacă un candidat nu are fotografie, folosește un placeholder extern:

```typescript
photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
```

### 1.4 Adăugarea sau eliminarea unui tip de vot

Dacă structura votului se schimbă (de exemplu, se adaugă un al patrulea tip de vot sau se elimină unul), trebuie actualizate două lucruri în aceeași componentă:

**Array-ul `voteTypes`** (linia 82) — adaugă sau elimină intrarea corespunzătoare:

```typescript
voteTypes = [
  {
    name: 'Numele noului tip de vot',
    candidates: candidates.cheiaNouă
  },
  // ... restul
];
```

**Array-ul `ballotStates`** (linia 97) — trebuie să existe un element pentru fiecare tip de vot, cu lungimea egală cu numărul de candidați:

```typescript
ballotStates: (string | null)[][] = [
  Array(NUMAR_CANDIDATI_TIP_1).fill(null),
  Array(NUMAR_CANDIDATI_TIP_2).fill(null),
  // ... câte un Array pentru fiecare tip de vot
];
```

---

## Pasul 2 — Configurări specifice votului

### 2.1 Numele tipurilor de vot

Numele afișat pentru fiecare tip de vot se setează în câmpul `name` din array-ul `voteTypes` (fișierul `src/app/votelist/votelist.component.ts`, linia 82):

```typescript
{
  name: 'Comisia Națională de Cenzori (funcție de control)',
  candidates: candidates.cenzor
}
```

Modifică string-ul `name` pentru a reflecta denumirea corectă a noii alegeri.

### 2.2 Parametrii codului QR

În `src/app/vote/vote.component.html` (linia 89), codul QR este configurat astfel:

```html
<qrcode [qrdata]="qrcode" [width]="400" [errorCorrectionLevel]="'M'"></qrcode>
```

- **`width`** — lățimea în pixeli a codului QR (mărește dacă ai mulți candidați și QR-ul devine prea dens)
- **`errorCorrectionLevel`** — nivelul de corecție a erorilor: `'L'` (7%), `'M'` (15%), `'Q'` (25%), `'H'` (30%); un nivel mai mare face QR-ul mai robust la deteriorare dar și mai dens

### 2.3 Textul „ANULAT"

Valoarea pentru votul nul este definită ca constantă `NULL_VALUE` în două locuri:

- `src/app/vote/vote.component.ts` (linia 43): `NULL_VALUE = 'ANULAT';`
- `src/app/simulate/simulate.component.ts` (linia 37): `NULL_VALUE = 'Null';`

Asigură-te că aceste valori sunt consistente dacă le modifici.

### 2.4 Configurarea scannerului QR

Parametrii camerei de scanare se găsesc în `src/app/qr-scanner/qr-scanner.component.ts` (linia 31):

```typescript
const config = {
  fps: 1,                          // cadre pe secundă procesate
  qrbox: (viewfinderWidth, viewfinderHeight) => {
    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
    return { width: minEdge * 0.95, height: minEdge * 0.95 };
  },
  videoConstraints: {
    width: { ideal: 1520 },        // rezoluția dorită a camerei
    height: { ideal: 1080 }
  }
};
```

Ajustează `fps` dacă scanarea este prea lentă sau prea intensivă pentru hardware-ul disponibil.

---

## Pasul 3 — Fluxul de lucru în ziua votului

### 3.1 Pornirea aplicației

```bash
# Modul dezvoltare (cu hot-reload)
npm start
# sau
npx nx serve

# Build de producție
npm run build

# Docker
docker build -t votcusens .
docker run -p 80:80 votcusens
```

Aplicația va fi accesibilă la `http://localhost:4200` (dev) sau `http://localhost` (Docker).

### 3.2 Completarea buletinelor de vot

1. Navighează la ruta `/list` (pagina principală)
2. Selectează tipul de vot curent folosind butoanele de navigare
3. Pentru fiecare votant, ordonează candidații de la cel mai preferat la cel mai puțin preferat
4. Previzualizează buletinul în panoul din dreapta
5. Apasă **„Printează"** — buletinul se tipărește cu un cod QR care conține clasamentul complet

### 3.3 Scanarea buletinelor tipărite

1. Navighează la ruta `/scan`
2. Permite accesul la cameră
3. Scanează codul QR de pe fiecare buletin tipărit
4. După fiecare scanare, apasă **„Salvează"** pentru a stoca rezultatul
5. Repetă pentru toate buletinele
6. La final, apasă **„Descarcă CSV"** — se generează fișierul `rezultate_voturi.csv`

Formatul CSV generat:

```
Buletinul de vot, 1, 2, 3, ...
POPESCU Maria,     1, 3, , 2, ...
IONESCU Andrei,    2, 1, 4, , ...
```

Rândurile = candidați, coloanele = buletine de vot, valorile = poziția în clasament.

---

## Pasul 4 — Calcularea rezultatului (Simulare STV-Borda)

### 4.1 Încărcarea datelor

1. Navighează la ruta `/simulate`
2. Apasă pe input-ul de fișier și încarcă fișierul CSV generat la pasul anterior
3. Sistemul va parsa automat candidații și buletinele din CSV

### 4.2 Configurarea simulării

După încărcarea CSV-ului, verifică și ajustează:

- **Numărul de câștigători (`numWinners`)** — câte locuri sunt disponibile pentru tipul de vot curent; acest câmp trebuie setat manual înainte de a rula simularea

### 4.3 Rularea simulării

Apasă butonul **„Simulate"**. Algoritmul STV-Borda va executa următorii pași:

1. **Calculează scorurile Borda** pentru toți candidații rămași: fiecare buletin acordă `n - poziție - 1` puncte (unde `n` = numărul de candidați rămași)
2. **Numără primele preferințe** (câte buletine au pe fiecare candidat ca prima opțiune)
3. **Elimină candidatul cu cel mai mic scor Borda**:
   - Dacă există egalitate, se compară scorurile din runda anterioară
   - Dacă egalitatea persistă, se compară numărul de prime preferințe
4. **Repetă** până când numărul de candidați rămași este egal cu numărul de locuri disponibile
5. Candidații rămași sunt **câștigătorii**

### 4.4 Interpretarea rezultatelor

După simulare, interfața afișează:

- **Lista câștigătorilor** — candidații aleși
- **Detalii pe runde** — pentru fiecare rundă poți vedea scorul Borda și primele preferințe ale fiecărui candidat, precum și cine a fost eliminat
- Navighează între runde cu butoanele de anterior/următor

### 4.5 Opțiuni alternative de simulare

Dacă nu ai un CSV (de exemplu, pentru testare):

- **Buletine manuale**: setează numărul de candidați și votanți, completează manual clasamentele
- **Buletine aleatorii**: bifează opțiunea „Random Ballots" și apasă „Simulate" pentru a genera buletine aleatorii

---

## Checklist rapid

| Pas | Ce trebuie făcut | Fișier |
|-----|-----------------|--------|
| 1 | Actualizează listele de candidați | `src/app/votelist/votelist.component.ts` |
| 2 | Adaugă fotografiile noi | `src/assets/` |
| 3 | Actualizează `voteTypes` și `ballotStates` | `src/app/votelist/votelist.component.ts` |
| 4 | Ajustează denumirile tipurilor de vot | `src/app/votelist/votelist.component.ts` |
| 5 | Verifică parametrii QR (dacă e nevoie) | `src/app/vote/vote.component.html` |
| 6 | Setează `numWinners` la simulare | Pagina `/simulate` din interfață |
| 7 | Build și deploy | `npm run build` / Docker |
| 8 | Completează buletinele, tipărește, scanează | Paginile `/list` și `/scan` |
| 9 | Încarcă CSV-ul și rulează simularea | Pagina `/simulate` |
