# 🎨 Rita Djur!

En interaktiv teckningsguide på svenska för barn (ca 8–12 år) – tänkt som ett enkelt alternativ till appar som Simply Draw. Välj ett djur, titta på en video, följ stegen och rita själv direkt på sidan.

## Funktioner

- **16 djur** (katt, hund, kanin, fågel, fisk, gris, anka, uggla, björn, räv, apa, tiger, ko, lejon, häst, elefant) – varje djurkort visar tydligt **hur den färdiga bilden blir**.
- **Realistiska bilder i enhetlig stil** – varje djur har en AI-genererad, realistisk pennteckning i sidvy på vit bakgrund (`assets/<id>.jpg`), som visas på djurkorten, i "Så här blir resultatet!", i quizet och som spårningsbild på ritytan. Steg-för-steg-vyn använder dessutom schematiska SVG-steg (grundform → skuggning → detaljer → slutfinish).
- **🎬 Video-flik** – inbäddad **kort** YouTube-video (oftast 1–2 min, via `youtube-nocookie` utan spårning) bredvid en stor ruta **"✨ Så här blir resultatet!"** med slutbilden. Länkar för att öppna videon på YouTube och för att söka fler videor.
- **👣 Steg för steg** – fyra faser anpassade för nivå ~10 år med **fokus på skuggning**: **Grundform → Skuggning → Detaljer → Slutfinish**. Varje steg har ett **relevant namn per djur** (t.ex. "Grundform: kropp, ben, öron och svans"). I steg-vyn finns dessutom en videospelare som **automatiskt hoppar till rätt del av videon när man byter steg** (YouTube IFrame API, steg 1 = början, steg 2 = ⅓ in, osv.). Progressionsindikator, SVG som byggs upp stegvis och tips per djur ingår.
- **🖍️ Rita själv** – egen rityta med färgpalett, penselstorlek, suddgummi, möjlighet att visa målbilden svagt (spåra), rensa, spara till **Min ritgalleri** (localStorage) och ladda ner som PNG.
- **🧠 Quiz** – "Gissa djuret!" med 8 slumpade frågor; rätt svar ger stjärnor.
- **⭐ Stjärnor** – samla stjärnor när du klarar ett djur eller svarar rätt i quizet (sparas i webbläsarens localStorage).
- **Sök** – filtrera djuren direkt.

## Kör lokalt

Öppna bara `index.html` i en webbläsare – ingen server eller build behövs:

```bash
git clone https://github.com/ruskkatt-netizen/rita.git
cd rita
# öppna index.html (dubbelklicka eller: python3 -m http.server)
```

## Publicera gratis med GitHub Pages

1. Gå till repots **Settings → Pages**.
2. Under **Source** välj **Deploy from a branch** → gren `main` → mapp `/ (root)` → **Save**.
3. Efter någon minut är sajten live på `https://ruskkatt-netizen.github.io/rita/`.

## Filstruktur

| Fil | Beskrivning |
| --- | --- |
| `index.html` | Sidans struktur (hem, djursida, quiz) |
| `styles.css` | Utseende – lekfull barnprofil, responsivt |
| `data.js` | Alla djur: namn, emoji, svårighet, YouTube-video-id, sökfras, tips, stegNamn[4], 4 steg (SVG) + stegtexter |
| `app.js` | All logik: routing via hash, rutnät, videospelare, videodel per steg (YT IFrame API), steg-för-steg, rityta (canvas), galleri, quiz, stjärnor |
| `assets/<id>.jpg` | 16 AI-genererade realistiska referensbilder (en per djur) |

## Lägga till ett nytt djur

Lägg till ett objekt i `DJUR` i `data.js`:

```js
{
  id: "groda",
  namn: "Groda",
  emoji: "🐸",
  nivå: 1,                       // 1–3 stjärnor
  video: "YOUTUBE_VIDEO_ID",     // 11 tecken från youtube.com/watch?v=...
  sök: "hur man ritar en groda steg för steg barn",
  tips: "Tips: ...",
  stegText: ["Grundform …", "Skuggning …", "Detaljer …", "Slutfinish …"],
  steg: ["<svg-fragment 1>", "<svg-fragment 2>", "<svg-fragment 3>", "<svg-fragment 4>"]
}
```

Varje `steg`-fragment är SVG-innehåll i en `viewBox="0 0 200 200"`. Stegen visas i ordning 1→4 och den färdiga bilden är alla fyra tillsammans.

## Videolänkar

Videorna är valda för att vara **korta** (1–2 min, flera #shorts) **och redan indelade i steg** ("step by step"-tutorials där varje steg visas på skärmen; vissa har även kapitel). I steg-vyn hoppar spelaren till rätt del av videon per steg. Vill du byta ut en video ändrar du bara `video`-id:t i `data.js`. ”Fler videor”-länken går till en YouTube-sökning på svenska.
