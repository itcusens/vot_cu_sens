# Setup cabină de vot — Tabletă Android (PWA)

Acest ghid descrie cum se instalează aplicația VotCuSens pe o tabletă Android ca PWA (Progressive Web App), fără a necesita acces permanent la internet.

---

## Ce ai nevoie

- **Tabletă Android** (minim 4 GB RAM, Android 10+, ecran 10")
- **Imprimantă termică 80mm** cu Bluetooth (recomandată) sau USB-OTG
- **Laptop** (temporar, doar pentru build și transferul inițial)
- Ambele dispozitive pe aceeași **rețea WiFi locală** (temporar, doar la instalare)

---

## Pasul 1 — Pregătirea build-ului (pe laptop)

```bash
# 1. Instalează dependențele (dacă nu ai făcut-o deja)
npm install

# 2. Descarcă fontul Material Icons pentru funcționare offline
npm run setup:fonts

# 3. Construiește aplicația în mod producție
npm run build:pwa
```

Build-ul se generează în `dist/vot_cu_sens/browser/`.

---

## Pasul 2 — Servirea temporară a aplicației (pe laptop)

Ai nevoie să servești build-ul timp de câteva minute, doar pentru ca tableta să poată instala PWA-ul. După instalare, aplicația funcționează complet offline.

```bash
# Varianta cu npx (nu necesită instalare globală)
npx serve dist/vot_cu_sens/browser -l 8080

# SAU cu Python
python3 -m http.server 8080 -d dist/vot_cu_sens/browser
```

> **Notă**: Reține IP-ul laptopului pe rețeaua locală (de ex. `192.168.1.100`).
> Pe Linux/Mac: `ip addr` sau `ifconfig`
> Pe Windows: `ipconfig`

---

## Pasul 3 — Instalarea PWA pe tabletă

1. **Conectează tableta** la aceeași rețea WiFi ca laptopul

2. **Deschide Chrome** pe tabletă și navighează la:
   ```
   http://<IP-LAPTOP>:8080
   ```
   De exemplu: `http://192.168.1.100:8080`

3. **Așteaptă** ca pagina să se încarce complet (toate resursele vor fi cache-uite de Service Worker)

4. **Instalează ca PWA**: Chrome va afișa un banner sau meniu cu opțiunea „Adaugă pe ecranul principal" / „Add to Home screen" / „Install app". Dacă nu apare automat:
   - Apasă pe cele 3 puncte (⋮) din dreapta sus
   - Selectează „Adaugă pe ecranul principal" sau „Instalare aplicație"

5. **Gata!** Aplicația apare acum ca icon pe home screen, rulează full-screen fără bară de navigare

---

## Pasul 4 — Dezactivarea internetului

După ce PWA-ul e instalat, dezactivează accesul la internet pe tabletă:

1. **Setări** → **Rețea și internet** → **WiFi** → dezactivat
2. **Setări** → **Rețea și internet** → **Date mobile** → dezactivat
3. Opțional: activează **Modul avion** (dar lasă Bluetooth pornit dacă folosești imprimantă Bluetooth)

Aplicația funcționează complet offline din cache.

---

## Pasul 5 — Conectarea imprimantei

### Imprimantă Bluetooth (recomandat)

1. Pornește imprimanta termică
2. Pe tabletă: **Setări** → **Bluetooth** → activat
3. Pereche imprimanta (PIN implicit: de obicei `0000` sau `1234`)
4. Imprimanta va fi disponibilă automat în dialogul de print al Chrome

### Imprimantă USB-OTG

1. Conectează imprimanta prin cablu USB + adaptor OTG la tabletă
2. Android ar trebui să o recunoască ca imprimantă de sistem
3. Dacă nu, instalează aplicația producătorului de pe Play Store **înainte** de a dezactiva internetul

### Testare print

1. Deschide aplicația VotCuSens
2. Completează un buletin de test
3. Apasă butonul de printare
4. Verifică:
   - Buletinul se printează complet
   - Codul QR este lizibil și scanabil
   - Textul e citeț

---

## Pasul 6 — Blocarea tabletei în mod kiosk (opțional)

Pentru a preveni ieșirea din aplicație de către votanți:

### Varianta gratuită — Screen Pinning (Android nativ)

1. **Setări** → **Securitate** → **Fixare ecran** (Screen Pinning) → activat
2. Deschide aplicația VotCuSens
3. Din „Aplicații recente" (butonul pătrat), apasă pe iconița aplicației → „Fixează" / „Pin"
4. Tableta va fi blocată pe acea aplicație; pentru dezactivare: ține apăsat Back + Home

### Varianta avansată — Device Owner / Kiosk lockdown

Pentru un lockdown complet (fără bara de notificări, fără butoane de navigare), se poate folosi:
- **Samsung Knox** (pe tablete Samsung)
- **Android Management API** (pentru fleet management)
- **ADB**: `adb shell dpm set-device-owner com.android.chrome/.ChromeDeviceAdminReceiver`

---

## Actualizarea aplicației

Dacă se schimbă candidații sau configurația votului:

1. Editează codul conform `TUTORIAL_PREGATIRE_VOT.md`
2. Rebuild: `npm run build:pwa`
3. Servește temporar de pe laptop (Pasul 2)
4. Pe tabletă, reconectează WiFi-ul, deschide aplicația → Service Worker-ul va detecta noua versiune și va actualiza cache-ul
5. Repornește aplicația
6. Dezactivează WiFi-ul din nou

---

## Troubleshooting

| Problemă | Soluție |
|----------|---------|
| Aplicația nu se instalează ca PWA | Verifică că servești prin HTTP (nu `file://`). Chrome necesită un server. |
| Icoanele Material nu apar | Rulează `npm run setup:fonts` și rebuild |
| QR-ul nu se scanează | Mărește dimensiunea QR în `vote.component.ts` (parametrul `qrWidth`) |
| Imprimanta Bluetooth nu printează | Verifică perecherea. Unele imprimante necesită aplicația producătorului |
| Aplicația se blochează | Șterge cache-ul Chrome: Setări → Apps → Chrome → Storage → Clear cache, apoi reinstalează |
