# Vot cu Sens — Documentație Tehnică

## 1. Ce este „Vot cu Sens"?

**Vot cu Sens** este o aplicație de vot preferențial (ranked-choice voting) construită în Angular 19, concepută pentru alegeri interne ale unei organizații. Aplicația implementează algoritmul **STV-Borda** (Single Transferable Vote cu scor Borda) pentru determinarea câștigătorilor.

Fluxul complet acoperit de aplicație este:

1. **Completarea buletinelor de vot** — fiecare votant ordonează candidații pe un buletin digital, de la cel mai preferat la cel mai puțin preferat.
2. **Printarea buletinului** — buletinul completat poate fi printat pe hârtie, incluzând un **cod QR** care codifică integral ordinea votului.
3. **Scanarea buletinelor** — un operator scanează codurile QR de pe buletinele printate cu camera dispozitivului, digitalizând automat fiecare vot.
4. **Exportul rezultatelor** — buletinele scanate sunt exportate ca fișier CSV.
5. **Simularea și numărarea** — fișierul CSV (sau buletine introduse manual) este încărcat în pagina de simulare, care rulează algoritmul STV-Borda și afișează rezultatele rundă cu rundă.

Aplicația este concepută în momentul de față pentru 3 tipuri de vot simultane (Cenzori, Arbitraj, Consiliu Național), dar structura este complet parametrizabilă.


## 2. Structura proiectului

```
vot_cu_sens/
├── src/
│   ├── app/
│   │   ├── app.component.ts          — componenta rădăcină (doar router-outlet)
│   │   ├── app.routes.ts             — definirea rutelor
│   │   ├── app.config.ts             — configurare Angular (routing, hydration)
│   │   ├── vote/                     — componenta reutilizabilă de buletin de vot
│   │   │   ├── vote.component.ts
│   │   │   ├── vote.component.html
│   │   │   └── vote.component.scss
│   │   ├── votelist/                 — pagina principală cu cele 3 tipuri de vot
│   │   │   ├── votelist.component.ts
│   │   │   ├── votelist.component.html
│   │   │   └── votelist.component.scss
│   │   ├── simulate/                 — pagina de simulare STV-Borda
│   │   │   ├── simulate.component.ts
│   │   │   ├── simulate.component.html
│   │   │   └── simulate.component.scss
│   │   └── qr-scanner/              — pagina de scanare QR + export CSV
│   │       ├── qr-scanner.component.ts
│   │       ├── qr-scanner.component.html
│   │       └── qr-scanner.component.scss
│   ├── assets/                       — fotografiile candidaților
│   ├── theme.scss                    — tema Angular Material (culori, tipografie)
│   ├── styles.scss                   — stiluri globale
│   ├── index.html                    — punctul de intrare HTML
│   ├── main.ts                       — bootstrap Angular (browser)
│   └── main.server.ts               — bootstrap Angular (SSR)
├── main.js                           — entry point Electron (desktop wrapper)
├── Dockerfile                        — build multi-stage (Node → Nginx)
├── resources/nginx.conf              — configurare Nginx pentru SPA
├── angular.json / project.json       — configurare Angular + Nx
├── package.json                      — dependențe și scripturi
└── tsconfig*.json                    — configurare TypeScript
```


## 3. Pagini și rute

| Rută         | Componentă            | Descriere |
|--------------|-----------------------|-----------|
| `/`          | redirect → `/list`    | Pagina implicită |
| `/list`      | `VotelistComponent`   | Interfața principală de vot cu navigare între cele 3 tipuri de vot |
| `/vote`      | `VoteComponent`       | Componenta de buletin (nu e folosită direct ca pagină, ci prin `/list`) |
| `/simulate`  | `SimulateComponent`   | Simulatorul STV-Borda — configurare candidați, buletine manuale/random/CSV, rulare algoritm |
| `/scan`      | `QrScannerComponent`  | Scanare QR din camera dispozitivului, salvare rezultate, export CSV |


## 4. Componente în detaliu

### 4.1. VoteComponent (componenta centrală)

Aceasta este componenta reutilizabilă care afișează un buletin de vot interactiv. Primește date prin `@Input()` și emite modificări prin `@Output()`.

**Inputuri:**

| Input           | Tip                  | Default        | Descriere |
|-----------------|----------------------|----------------|-----------|
| `candidates`    | `Candidate[]`        | placeholder    | Lista candidaților (nume + URL fotografie) |
| `allNames`      | `string[]`           | 31 nume fictive | Lista numelor disponibile pentru selectare |
| `maxRows`       | `number`             | 30             | Numărul de rânduri din buletin (= nr. candidați) |
| `ballot`        | `(string \| null)[]` | `[]`           | Starea curentă a buletinului (pentru persistare între navigări) |
| `showPreview`   | `boolean`            | `true`         | Afișează panoul de previzualizare + QR + print |
| `showRandomize` | `boolean`            | `true`         | Afișează butonul „Random" |
| `showRandomFill`| `boolean`            | `false`        | Afișează butonul „Random fill rest" |
| `voteType`      | `string`             | `''`           | Titlul tipului de vot (afișat la printare) |

**Output:** `ballotChange` — emite array-ul actualizat al buletinului la fiecare modificare.

**Funcționalități cheie:**
- Selecție cu căutare (search) în dropdown-ul Material
- Un candidat poate fi ales o singură dată (eliminare din dropdown-urile celorlalte rânduri)
- Buton „Anulat" — marchează toate pozițiile ca ANULAT
- Buton „Reset" — golește buletinul
- Generare QR code din JSON-ul buletinului
- Printare buletin cu QR code inclus

### 4.2. VotelistComponent (pagina principală)

Gestionează navigarea între cele 3 tipuri de vot și menține starea fiecărui buletin separat.

**Tipuri de vot configurate:**
1. **Comisia Națională de Cenzori** — 4 candidați
2. **Comisia Națională de Arbitraj** — 21 candidați
3. **Consiliu Național** — 31 candidați

### 4.3. SimulateComponent (simulatorul)

Pagină completă de simulare a algoritmului STV-Borda.

**Funcționalități:**
- Configurare număr candidați, număr câștigători (locuri), număr votanți
- Editare nume candidați
- Buletine manuale (navigare buletin cu buletin) sau aleatorii
- Import buletine din fișier CSV
- Rulare algoritm STV-Borda cu afișare rundă cu rundă
- Matrice de scoruri (candidat × buletin) pentru fiecare rundă
- Clasament cu scor Borda și voturi de primă opțiune

**Algoritmul STV-Borda implementat:**
- Calculează scorul Borda pentru fiecare candidat rămas (n - poziție - 1)
- Calculează voturile de primă preferință
- Elimină candidatul cu cel mai mic scor Borda
- La egalitate, consultă scorul Borda din runda precedentă; dacă egalitatea persistă, departajează prin voturile de primă preferință
- Se repetă până când rămân exact `seats` candidați

### 4.4. QrScannerComponent (scanerul)

Utilizează biblioteca `html5-qrcode` pentru a accesa camera și a scana coduri QR.

**Flux:**
1. Pornește camera automat la încărcarea paginii
2. La detectarea unui QR → oprește camera, afișează rezultatul parsat
3. Utilizatorul poate salva sau rescana
4. Rezultatele salvate se acumulează local (în memorie)
5. Export CSV cu structura: candidat × buletine, cu poziția fiecărui candidat


## 5. Elemente customizabile

### 5.1. Candidați și tipuri de vot

**Fișier:** `src/app/votelist/votelist.component.ts`

Obiectul `candidates` (linia 6) conține listele de candidați pe categorii. Fiecare candidat are `name` și `photo` (URL sau cale relativă din `src/assets/`).

Array-ul `voteTypes` (linia 82) definește tipurile de vot disponibile:

```typescript
voteTypes = [
  {
    name: 'Comisia Națională de Cenzori',  // Titlu afișat
    candidates: candidates.cenzor          // Lista de candidați
  },
  // ...alte tipuri
];
```

`ballotStates` (linia 97) trebuie sincronizat — un array de `null` pentru fiecare tip, cu lungimea = nr. candidați.

### 5.2. Tema vizuală (culori)

**Fișier:** `src/theme.scss`

```scss
@include mat.theme((
  color: (
    primary: mat.$violet-palette,    // Culoarea principală Material
    tertiary: mat.$orange-palette,   // Culoarea terțiară
    theme-type: dark,                // Temă dark
  ),
  typography: Open Sans,
  density: 0
));
```

### 5.3. Schema de culori a componentelor

Culorile verzi sunt hardcodate în SCSS-urile componentelor:

| Culoare     | Utilizare |
|-------------|-----------|
| `#1e2c1d`   | Background principal |
| `#2c3e2b`   | Background panouri/carduri |
| `#2b3e2a`   | Background celule tabel |
| `#1f2d1f`   | Background header tabel |
| `#8bc34a`   | Accent verde (titluri, borduri, evidențieri) |
| `#576b54`   | Borduri subtile |
| `#344d34`   | Background elemente secundare |

Pentru schimbarea schemei de culori, trebuie modificate fișierele:
- `src/app/vote/vote.component.scss`
- `src/app/votelist/votelist.component.scss`
- `src/app/simulate/simulate.component.scss`
- `src/app/qr-scanner/qr-scanner.component.scss`

### 5.4. Font

**Fișier:** `src/styles.scss` — fontul `Open Sans` încărcat de la Google Fonts.

### 5.5. QR Code

**Fișier:** `src/app/vote/vote.component.html` (linia 89)

```html
<qrcode [qrdata]="qrcode" [width]="400" [errorCorrectionLevel]="'M'"></qrcode>
```

Parametri ajustabili: `width` (dimensiune) și `errorCorrectionLevel` (`L`, `M`, `Q`, `H`).

### 5.6. Fereastra Electron

**Fișier:** `main.js`

```javascript
const win = new BrowserWindow({
  width: 1000,    // lățime fereastră
  height: 800,    // înălțime fereastră
});
```

### 5.7. Textele din interfață

Interfața este în limba română. Textele sunt hardcodate direct în template-urile HTML ale fiecărei componente. Texte cheie: „Previzualizare buletin de vot", „Alege candidat", „Resetează", „Anulat", „Printează", „Simulare vot cu SENS", etc.


## 6. Cum se rulează aplicația

### 6.1. Cerințe preliminare

- **Node.js** ≥ 20 (recomandat)
- **npm** (inclus cu Node.js)
- **Angular CLI** (`npm install -g @angular/cli`) — opțional, Nx este folosit ca task runner

### 6.2. Instalare dependențe

```bash
npm install
```

### 6.3. Mod dezvoltare (browser)

```bash
npm start
# sau
npx nx serve
```

Aplicația va fi disponibilă la `http://localhost:4200/`. Se reîncarcă automat la modificarea fișierelor.

### 6.4. Build producție

```bash
npm run build
# sau
npx nx build
```

Artefactele se generează în `dist/vot_cu_sens/`. Buildul de producție include optimizări și hashing.

### 6.5. Rulare ca aplicație desktop (Electron)

```bash
# 1. Build Angular mai întâi
npm run build

# 2. Pornește Electron
npm run electron
```

Electron încarcă `dist/vot_cu_sens/browser/index.html` într-o fereastră nativă.

### 6.6. Rulare cu Docker

```bash
# Build imagine
docker build -t vot-cu-sens .

# Rulare container
docker run -p 8080:80 vot-cu-sens
```

Aplicația va fi accesibilă la `http://localhost:8080/`. Dockerfile-ul folosește un build multi-stage: Node.js pentru compilare, apoi Nginx Alpine pentru servire.

### 6.7. Build aplicație desktop distribuilă (Electron Builder)

Configurarea din `package.json` (`"build"` key) permite crearea de instalatoare pentru Windows (NSIS), macOS (DMG) și Linux (AppImage):

```bash
npx electron-builder --win    # Windows
npx electron-builder --mac    # macOS
npx electron-builder --linux  # Linux
```

Instalatoarele se generează în directorul `release/`.

### 6.8. Rulare teste

```bash
npm test
# sau
npx nx test
```

Folosește Karma + Jasmine ca framework de testare.


## 7. Dependențe cheie

| Pachet              | Versiune | Rol |
|---------------------|----------|-----|
| `@angular/core`     | ^19.0.0  | Framework principal |
| `@angular/material` | ^19.2.9  | Componente UI (select, button, form field, checkbox) |
| `angularx-qrcode`   | ^19.0.0  | Generare QR code în Angular |
| `html5-qrcode`      | ^2.3.8   | Scanare QR code din camera dispozitivului |
| `@zxing/browser`    | ^0.1.5   | Decodare barcode/QR (dependență internă) |
| `electron`          | ^35.2.1  | Wrapper desktop nativ |
| `electron-builder`  | ^26.0.12 | Creare instalatoare desktop |
| `nx`                | 20.8.0   | Task runner și monorepo tooling |
| `express`           | ^4.18.2  | Server SSR (Angular Universal) |


## 8. Observații și limitări actuale

1. **Candidații sunt hardcodați** — listele de candidați și fotografiile sunt definite direct în codul sursă (`votelist.component.ts`), nu într-un fișier de configurare extern sau bază de date.

2. **Fără persistență** — buletinele de vot completate există doar în memorie. La reîncărcarea paginii, toate datele se pierd. Scanerul QR acumulează rezultate în memorie, dar acestea trebuie exportate ca CSV înainte de a închide pagina.

3. **Fără autentificare** — nu există mecanism de autentificare sau autorizare. Oricine accesează URL-ul poate vota sau simula.

4. **Schema de culori hardcodată** — culorile verzi sunt duplicate în multiple fișiere SCSS. O refactorizare cu variabile SCSS globale ar simplifica personalizarea.

5. **SSR configurat dar nefolosit activ** — există `main.server.ts` și `app.config.server.ts`, dar fluxul principal (Dockerfile, Electron) folosește doar buildul client-side.

6. **Formatul CSV** — scanerul exportă CSV cu candidații pe rânduri și buletinele pe coloane, cu valori = poziția în clasament. Simulatorul importă același format.
