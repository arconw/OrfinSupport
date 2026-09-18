import { localeChain } from '../../src/core/locale';

interface StudioCopy {
  analysis: string;
  compare: string;
  review: string;
  product: string;
  cart: string;
  changed: string;
  catalog: string;
  unavailable: string;
}

const en: StudioCopy = {
  analysis:
    'Delivery rose from **48 to 66 tasks (+37.5%)** across equal three-week windows (Aug 10–30 and Aug 31–Sep 18). Brand grew **50% (24 → 36)**; Web grew **25% (24 → 30)**. Brand’s lead time fell 6 → 4 days and rework 6 → 3 tasks.\n\nThe review checklist introduced Aug 31 (**DL-041**) coincides with Brand’s improvement; this is an association, not proof of cause. Two documented client-feedback delays (**DL-052**) help explain Web’s slower lead time of 7 days. Last week: **24 of 26 planned tasks (92.3%)**. Source: Northstar delivery ledger v2026.09.18.',
  compare:
    '**Luma 27 — $349:** 27-inch 4K, 99% sRGB, 65 W USB-C, 22 × 19 cm stand, 5.2 kg. A sensible fit for web design, writing and a small desk.\n\n**Luma 32 Pro — $599:** 32-inch 4K, 98% DCI-P3, 90 W USB-C, 28 × 24 cm stand, 7.8 kg. The larger canvas and specified wide gamut suit editing and color-focused work if you have desk space.\n\nThe difference is **$250**. Both run at 60 Hz; neither claims HDR mastering accuracy. sRGB and DCI-P3 percentages measure different color spaces. A 140 W laptop still needs its charger, even with the Pro. Source: Northstar equipment catalog.',
  review:
    '**Maya Chen, 3/5, September 14:** “Beautiful color, but my laptop still needs its charger.”\n\nHer Luma 32 Pro supplies **90 W**, while her laptop needs **140 W under load**. She also says its **28 × 24 cm stand** takes too much space on her small desk. She likes the color; the rating reflects those two practical limitations, not a claim of poor image quality.',
  product:
    'Opened **{name} — {price}**. {details}\n\nSource: Northstar equipment catalog. No cart change unless you requested one.',
  cart: '**Your demo cart:** {items}\n\nTotal: **{total}**. Quantities and totals come from your current cart. No checkout or charges.',
  changed:
    'Updated your demo cart. {items}\n\nTotal: **{total}**. The quantity and total are visible in the workspace. No purchase was made.',
  catalog:
    'The collection includes {items}. Ask me to compare the displays, find the three-star review, or add an item to your demo cart.',
  unavailable:
    'Connected tools are turned off. Enable them in the Playground to read the report or change the demo cart.',
};

const copies: Record<string, StudioCopy> = {
  en,
  ru: {
    analysis:
      'За равные трёхнедельные периоды (10–30 августа и 31 августа–18 сентября) завершено **48 → 66 задач, рост 37,5%**. Brand: **24 → 36 (+50%)**, Web: **24 → 30 (+25%)**. У Brand срок выполнения сократился с 6 до 4 дней, задачи с доработкой — с 6 до 3.\n\nЧек-лист проверки появился 31 августа (**DL-041**). Он совпадает по времени с улучшением, но причинность не доказана. Две задержки обратной связи от клиента (**DL-052**) помогают объяснить более долгий срок Web — 7 дней. Последняя неделя: **24 из 26 задач, 92,3%**. Источник: Northstar delivery ledger v2026.09.18.',
    compare:
      '**Luma 27 — $349:** 27 дюймов, 4K, 99% sRGB, USB-C 65 Вт, подставка 22 × 19 см, 5,2 кг. Подходит для веб-дизайна, текста и небольшого стола.\n\n**Luma 32 Pro — $599:** 32 дюйма, 4K, 98% DCI-P3, USB-C 90 Вт, подставка 28 × 24 см, 7,8 кг. Больше пространства для монтажа и работы с цветом, если позволяет стол.\n\nРазница — **$250**. Оба работают на 60 Гц и не заявлены для HDR-мастеринга. Проценты sRGB и DCI-P3 относятся к разным цветовым пространствам. Ноутбуку на 140 Вт нужен отдельный зарядник даже с Pro. Источник: демонстрационный каталог Northstar.',
    review:
      '**Maya Chen, 3/5, 14 сентября:** «Beautiful color, but my laptop still needs its charger.»\n\nЕй нравится цвет, но монитор Luma 32 Pro выдаёт **90 Вт**, а ноутбуку требуется **140 Вт под нагрузкой**. Также подставка **28 × 24 см** занимает слишком много места на её маленьком столе. Оценка связана с этими двумя ограничениями, а не с плохим изображением.',
    product:
      'Открыл **{name} — {price}**. {details}\n\nИсточник: каталог Northstar. Без отдельной просьбы корзина не меняется.',
    cart: '**Ваша демо-корзина:** {items}\n\nИтого: **{total}**. Данные взяты из текущей корзины. Оформления заказа и списаний нет.',
    changed:
      'Обновил демо-корзину. {items}\n\nИтого: **{total}**. Количество и сумма видны в интерфейсе. Покупка не совершалась.',
    catalog:
      'В коллекции: {items}. Можно сравнить мониторы, найти отзыв на три звезды или добавить товар в демо-корзину.',
    unavailable:
      'Инструменты отключены. Включите их в Playground для анализа отчёта и изменения демо-корзины.',
  },
  fr: {
    analysis:
      'Sur deux périodes de trois semaines, les livraisons passent de **48 à 66 tâches (+37,5 %)**. Brand : **24 → 36 (+50 %)** ; Web : **24 → 30 (+25 %)**. Le délai de Brand baisse de 6 à 4 jours et les reprises de 6 à 3.\n\nLa checklist du 31 août (**DL-041**) coïncide avec cette amélioration, sans prouver une cause. Deux attentes de retour client (**DL-052**) éclairent le délai de Web, encore à 7 jours. Dernière semaine : **24 sur 26 tâches (92,3 %)**. Source : Northstar delivery ledger v2026.09.18.',
    compare:
      '**Luma 27 — 349 $** : 27 pouces 4K, 99 % sRGB, USB-C 65 W, pied 22 × 19 cm. Adapté au web et aux petits bureaux. **Luma 32 Pro — 599 $** : 32 pouces 4K, 98 % DCI-P3, 90 W, pied 28 × 24 cm. Plus de place pour le montage et le travail de couleur.\n\nÉcart : **250 $**. Les deux sont à 60 Hz, sans précision HDR garantie. sRGB et DCI-P3 sont différents. Un ordinateur de 140 W nécessite son chargeur.',
    review:
      '**Maya Chen, 3/5** : « Beautiful color, but my laptop still needs its charger. » Elle apprécie la couleur, mais son ordinateur demande **140 W**, contre **90 W** fournis. Le pied **28 × 24 cm** encombre aussi son petit bureau. Ce sont les deux raisons citées, pas un défaut de qualité d’image.',
    product:
      '**{name} — {price}** est ouvert. {details}\n\nSource : catalogue Northstar. Le panier ne change que sur demande.',
    cart: '**Votre panier de démonstration :** {items}\n\nTotal : **{total}**. Données actuelles, sans achat ni paiement.',
    changed:
      'Panier de démonstration mis à jour. {items}\n\nTotal : **{total}**. Le changement est visible. Aucun achat effectué.',
    catalog: 'La collection : {items}. Demandez une comparaison, un avis ou un ajout au panier.',
    unavailable:
      'Les outils sont désactivés. Activez-les dans le Playground pour consulter le rapport ou modifier le panier.',
  },
};

const translated: Record<string, [string, string, string, string, string, string, string, string]> =
  {
    es: [
      'Entregas: **48 → 66 tareas (+37,5 %)** en períodos iguales de tres semanas. Brand: **24 → 36 (+50 %)**; Web: **24 → 30 (+25 %)**. El plazo de Brand baja de 6 a 4 días, las revisiones de 6 a 3. La lista de control (**DL-041**) coincide con la mejora, pero no demuestra causalidad. Dos esperas del cliente (**DL-052**) ayudan a explicar los 7 días de Web. Última semana: **24/26 (92,3 %)**. Fuente: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27 pulgadas, 4K, sRGB 99 %, 65 W, base 22 × 19 cm: web y escritorios pequeños. **Luma 32 Pro: $599**, 32 pulgadas, 4K, DCI-P3 98 %, 90 W, base 28 × 24 cm: edición y color. Diferencia **$250**. Ambos 60 Hz, sin garantía de precisión HDR. sRGB y DCI-P3 no son comparables directamente; un portátil de 140 W necesita cargador.',
      '**Maya Chen, 3/5:** “Beautiful color, but my laptop still needs its charger.” Su portátil necesita **140 W**, frente a los **90 W** del monitor. La base **28 × 24 cm** ocupa demasiado espacio. Le gusta el color; esas dos limitaciones explican la nota.',
      'Abierto **{name} — {price}**. {details}',
      '**Tu carrito de demostración:** {items}\n\nTotal: **{total}**. Sin compra ni cobro.',
      'Carrito actualizado: {items}\n\nTotal: **{total}**. Cambio visible; no se realizó una compra.',
      'Colección: {items}. Puedes comparar, leer reseñas o añadir al carrito.',
      'Las herramientas están desactivadas. Actívalas en Playground.',
    ],
    de: [
      'Lieferung: **48 → 66 Aufgaben (+37,5 %)** in gleichen Dreiwochenzeiträumen. Brand: **24 → 36 (+50 %)**; Web: **24 → 30 (+25 %)**. Brand: Durchlaufzeit 6 → 4 Tage, Nacharbeit 6 → 3. Die Checkliste (**DL-041**) fällt mit der Verbesserung zusammen, beweist aber keine Ursache. Zwei Wartezeiten auf Kundenfeedback (**DL-052**) erklären einen Teil der 7 Tage bei Web. Letzte Woche: **24/26 (92,3 %)**. Quelle: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27 Zoll, 4K, 99 % sRGB, 65 W, Standfuß 22 × 19 cm: für Webdesign und kleine Tische. **Luma 32 Pro: $599**, 32 Zoll, 4K, 98 % DCI-P3, 90 W, 28 × 24 cm: für Schnitt und Farbarbeit. **$250 Unterschied**. Beide 60 Hz, keine zugesagte HDR-Mastering-Genauigkeit. Farbräume sind nicht direkt vergleichbar; 140-W-Laptops benötigen ein Ladegerät.',
      '**Maya Chen, 3/5:** „Beautiful color, but my laptop still needs its charger.“ Ihr Laptop benötigt **140 W**, der Bildschirm liefert **90 W**. Auch der **28 × 24 cm** große Standfuß ist zu groß für ihren Tisch. Sie lobt die Farben; diese zwei Einschränkungen begründen die Bewertung.',
      '**{name} — {price}** geöffnet. {details}',
      '**Dein Demo-Warenkorb:** {items}\n\nSumme: **{total}**. Kein Kauf, keine Abbuchung.',
      'Demo-Warenkorb aktualisiert: {items}\n\nSumme: **{total}**. Änderung sichtbar. Kein Kauf.',
      'Kollektion: {items}. Vergleich, Rezensionen und Demo-Warenkorb sind verfügbar.',
      'Werkzeuge sind deaktiviert. Aktiviere sie im Playground.',
    ],
    pt: [
      'Entregas: **48 → 66 tarefas (+37,5%)** em períodos iguais de três semanas. Brand: **24 → 36 (+50%)**; Web: **24 → 30 (+25%)**. Brand reduziu o prazo de 6 para 4 dias e retrabalho de 6 para 3. A lista de revisão (**DL-041**) coincide com a melhoria, sem provar causalidade. Duas esperas por clientes (**DL-052**) contextualizam os 7 dias de Web. Última semana: **24/26 (92,3%)**. Fonte: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27 polegadas, 4K, 99% sRGB, 65 W, base 22 × 19 cm: web e mesas pequenas. **Luma 32 Pro: $599**, 32 polegadas, 4K, 98% DCI-P3, 90 W, base 28 × 24 cm: edição e cor. Diferença **$250**. Ambos 60 Hz, sem promessa de precisão HDR. Espaços de cor não são diretamente comparáveis; um portátil de 140 W exige carregador.',
      '**Maya Chen, 3/5:** “Beautiful color, but my laptop still needs its charger.” O portátil precisa de **140 W**, contra **90 W** disponíveis. A base de **28 × 24 cm** ocupa demasiado espaço. Ela aprecia a cor; essas duas limitações justificam a nota.',
      'Aberto **{name} — {price}**. {details}',
      '**Carrinho de demonstração:** {items}\n\nTotal: **{total}**. Sem compras ou cobranças.',
      'Carrinho atualizado: {items}\n\nTotal: **{total}**. Alteração visível, sem compra.',
      'Coleção: {items}. Pode comparar, consultar avaliações ou adicionar ao carrinho.',
      'As ferramentas estão desativadas. Ative-as no Playground.',
    ],
    it: [
      'Consegne: **48 → 66 attività (+37,5%)** in periodi uguali di tre settimane. Brand: **24 → 36 (+50%)**; Web: **24 → 30 (+25%)**. Brand riduce i tempi da 6 a 4 giorni e le rilavorazioni da 6 a 3. La checklist (**DL-041**) coincide con il miglioramento, senza provarne la causa. Due attese del cliente (**DL-052**) spiegano parte dei 7 giorni di Web. Ultima settimana: **24/26 (92,3%)**. Fonte: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27 pollici, 4K, sRGB 99%, 65 W, base 22 × 19 cm: web e scrivanie piccole. **Luma 32 Pro: $599**, 32 pollici, 4K, DCI-P3 98%, 90 W, base 28 × 24 cm: montaggio e colore. Differenza **$250**. Entrambi 60 Hz, senza precisione HDR garantita. Gli spazi colore non sono direttamente confrontabili; un portatile da 140 W richiede il caricatore.',
      '**Maya Chen, 3/5:** “Beautiful color, but my laptop still needs its charger.” Il portatile richiede **140 W**, il monitor ne fornisce **90 W**. La base **28 × 24 cm** è troppo ingombrante. Apprezza i colori; il voto riguarda questi due limiti.',
      'Aperto **{name} — {price}**. {details}',
      '**Carrello dimostrativo:** {items}\n\nTotale: **{total}**. Nessun acquisto o addebito.',
      'Carrello aggiornato: {items}\n\nTotale: **{total}**. Modifica visibile, nessun acquisto.',
      'Collezione: {items}. Puoi confrontare, leggere recensioni o aggiungere al carrello.',
      'Gli strumenti sono disattivati. Attivali nel Playground.',
    ],
    nl: [
      'Leveringen: **48 → 66 taken (+37,5%)** in gelijke perioden van drie weken. Brand: **24 → 36 (+50%)**; Web: **24 → 30 (+25%)**. Brand: doorlooptijd 6 → 4 dagen, herstelwerk 6 → 3. De checklist (**DL-041**) valt samen met de verbetering, maar bewijst geen oorzaak. Twee wachttijden op klanten (**DL-052**) geven context bij Web, 7 dagen. Laatste week: **24/26 (92,3%)**. Bron: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27 inch, 4K, 99% sRGB, 65 W, voet 22 × 19 cm: webwerk en kleine bureaus. **Luma 32 Pro: $599**, 32 inch, 4K, 98% DCI-P3, 90 W, 28 × 24 cm: montage en kleurwerk. Verschil **$250**. Beide 60 Hz, geen HDR-masteringgarantie. Kleurruimten zijn niet direct vergelijkbaar; 140 W vraagt een eigen lader.',
      '**Maya Chen, 3/5:** “Beautiful color, but my laptop still needs its charger.” Haar laptop vraagt **140 W**, het scherm levert **90 W**. Ook de voet van **28 × 24 cm** is te groot voor haar bureau. Ze waardeert de kleuren; deze twee beperkingen verklaren het cijfer.',
      '**{name} — {price}** geopend. {details}',
      '**Je demowinkelwagen:** {items}\n\nTotaal: **{total}**. Geen aankoop of afschrijving.',
      'Winkelwagen bijgewerkt: {items}\n\nTotaal: **{total}**. Zichtbare wijziging, geen aankoop.',
      'Collectie: {items}. Vergelijk, lees beoordelingen of voeg iets toe.',
      'Hulpmiddelen zijn uitgeschakeld. Schakel ze in de Playground in.',
    ],
    pl: [
      'Realizacja: **48 → 66 zadań (+37,5%)** w równych okresach po trzy tygodnie. Brand: **24 → 36 (+50%)**; Web: **24 → 30 (+25%)**. Czas Brand spadł z 6 do 4 dni, poprawki z 6 do 3. Lista kontrolna (**DL-041**) zbiega się z poprawą, ale nie dowodzi przyczyny. Dwa oczekiwania na klienta (**DL-052**) wyjaśniają część 7 dni Web. Ostatni tydzień: **24/26 (92,3%)**. Źródło: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27 cali, 4K, 99% sRGB, 65 W, podstawa 22 × 19 cm: strony WWW i małe biurka. **Luma 32 Pro: $599**, 32 cale, 4K, 98% DCI-P3, 90 W, 28 × 24 cm: montaż i kolor. Różnica **$250**. Oba 60 Hz, bez gwarancji masteringu HDR. Przestrzenie barw nie są bezpośrednio porównywalne; laptop 140 W wymaga ładowarki.',
      '**Maya Chen, 3/5:** „Beautiful color, but my laptop still needs its charger.” Laptop wymaga **140 W**, monitor dostarcza **90 W**. Podstawa **28 × 24 cm** jest za duża na małe biurko. Kolory się podobają; ocenę tłumaczą te dwa ograniczenia.',
      'Otwarto **{name} — {price}**. {details}',
      '**Koszyk demonstracyjny:** {items}\n\nSuma: **{total}**. Bez zakupów i opłat.',
      'Zaktualizowano koszyk: {items}\n\nSuma: **{total}**. Zmiana widoczna, bez zakupu.',
      'Kolekcja: {items}. Możesz porównać produkty, przeczytać recenzje lub dodać do koszyka.',
      'Narzędzia są wyłączone. Włącz je w Playground.',
    ],
    uk: [
      'За рівні тритижневі періоди виконано **48 → 66 завдань (+37,5%)**. Brand: **24 → 36 (+50%)**, Web: **24 → 30 (+25%)**. Термін Brand скоротився з 6 до 4 днів, доопрацювання — з 6 до 3. Чекліст (**DL-041**) збігається з покращенням, але причинність не доведена. Дві затримки відповіді клієнта (**DL-052**) частково пояснюють 7 днів Web. Останній тиждень: **24/26 (92,3%)**. Джерело: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27 дюймів, 4K, 99% sRGB, 65 Вт, підставка 22 × 19 см: вебдизайн і невеликі столи. **Luma 32 Pro: $599**, 32 дюйми, 4K, 98% DCI-P3, 90 Вт, 28 × 24 см: монтаж і колір. Різниця **$250**. Обидва 60 Гц, без гарантії HDR-мастерингу. Колірні простори не можна порівнювати напряму; ноутбуку на 140 Вт потрібен зарядник.',
      '**Maya Chen, 3/5:** «Beautiful color, but my laptop still needs its charger.» Ноутбук потребує **140 Вт**, монітор дає **90 Вт**. Підставка **28 × 24 см** завелика для її столу. Колір подобається; оцінка пояснюється двома обмеженнями.',
      'Відкрито **{name} — {price}**. {details}',
      '**Демо-кошик:** {items}\n\nРазом: **{total}**. Без покупок і списань.',
      'Демо-кошик оновлено: {items}\n\nРазом: **{total}**. Зміни видно, покупки не було.',
      'Колекція: {items}. Можна порівняти, прочитати відгуки чи додати до кошика.',
      'Інструменти вимкнено. Увімкніть їх у Playground.',
    ],
    tr: [
      'Eşit üç haftalık dönemlerde teslimat **48 → 66 görev (+%37,5)**. Brand: **24 → 36 (+%50)**; Web: **24 → 30 (+%25)**. Brand süresi 6 → 4 gün, yeniden işleme 6 → 3. Kontrol listesi (**DL-041**) iyileşmeyle aynı dönemde, fakat nedensellik kanıtlanmış değil. İki müşteri beklemesi (**DL-052**) Web’in 7 gününü kısmen açıklıyor. Son hafta: **24/26 (%92,3)**. Kaynak: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27 inç, 4K, %99 sRGB, 65 W, 22 × 19 cm ayak: web ve küçük masalar. **Luma 32 Pro: $599**, 32 inç, 4K, %98 DCI-P3, 90 W, 28 × 24 cm: kurgu ve renk işleri. Fark **$250**. İkisi de 60 Hz; HDR mastering garantisi yok. Renk alanları doğrudan karşılaştırılamaz; 140 W dizüstü kendi şarj cihazını gerektirir.',
      '**Maya Chen, 3/5:** “Beautiful color, but my laptop still needs its charger.” Dizüstü **140 W** ister, ekran **90 W** sağlar. **28 × 24 cm** ayak küçük masada çok yer kaplar. Renkleri beğeniyor; puanı bu iki kısıt açıklıyor.',
      '**{name} — {price}** açıldı. {details}',
      '**Demo sepetiniz:** {items}\n\nToplam: **{total}**. Satın alma veya ödeme yok.',
      'Sepet güncellendi: {items}\n\nToplam: **{total}**. Değişiklik görünür, satın alma yapılmadı.',
      'Koleksiyon: {items}. Karşılaştırabilir, yorum okuyabilir veya sepete ekleyebilirsiniz.',
      'Araçlar kapalı. Playground içinden etkinleştirin.',
    ],
    ar: [
      'خلال فترتين متساويتين من ثلاثة أسابيع ارتفع التسليم **48 → 66 مهمة (+37.5%)**. Brand: **24 → 36 (+50%)**؛ Web: **24 → 30 (+25%)**. انخفض وقت Brand من 6 إلى 4 أيام وإعادة العمل من 6 إلى 3. تتزامن قائمة الفحص (**DL-041**) مع التحسن دون إثبات السببية. يفسر تأخران لرد العميل (**DL-052**) جزءًا من مدة Web البالغة 7 أيام. الأسبوع الأخير: **24/26 (92.3%)**. المصدر: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**، 27 بوصة، 4K، ‏99% sRGB، ‏65 واط، قاعدة 22 × 19 سم: للويب والمكاتب الصغيرة. **Luma 32 Pro: $599**، 32 بوصة، 4K، ‏98% DCI-P3، ‏90 واط، قاعدة 28 × 24 سم: للتحرير والألوان. الفرق **$250**. كلاهما 60 هرتز دون ضمان دقة HDR. فضاءا الألوان مختلفان؛ جهاز 140 واط يحتاج شاحنه.',
      '**Maya Chen، ‏3/5:** “Beautiful color, but my laptop still needs its charger.” يحتاج حاسوبها **140 واط** والشاشة توفر **90 واط**. تشغل القاعدة **28 × 24 سم** مساحة كبيرة على مكتبها. تعجبها الألوان؛ هذان القيدان يفسران التقييم.',
      'فُتح **{name} — {price}**. {details}',
      '**سلتك التجريبية:** {items}\n\nالإجمالي: **{total}**. لا شراء أو دفع.',
      'حُدثت السلة: {items}\n\nالإجمالي: **{total}**. التغيير ظاهر ولم يُجرَ شراء.',
      'المجموعة: {items}. يمكنك المقارنة أو قراءة المراجعات أو الإضافة للسلة.',
      'الأدوات معطلة. فعّلها من Playground.',
    ],
    hi: [
      'बराबर तीन-सप्ताह की अवधियों में **48 → 66 कार्य (+37.5%)** पूरे हुए। Brand: **24 → 36 (+50%)**; Web: **24 → 30 (+25%)**। Brand का समय 6 → 4 दिन और दोबारा काम 6 → 3 हुआ। समीक्षा सूची (**DL-041**) सुधार के साथ आई, लेकिन कारण साबित नहीं होता। ग्राहक प्रतिक्रिया में दो देरी (**DL-052**) Web के 7 दिनों को आंशिक रूप से समझाती हैं। अंतिम सप्ताह: **24/26 (92.3%)**। स्रोत: Northstar delivery ledger v2026.09.18।',
      '**Luma 27: $349**, 27 इंच, 4K, 99% sRGB, 65 W, आधार 22 × 19 सेमी: वेब और छोटी मेज़ के लिए। **Luma 32 Pro: $599**, 32 इंच, 4K, 98% DCI-P3, 90 W, आधार 28 × 24 सेमी: संपादन और रंग कार्य के लिए। अंतर **$250**। दोनों 60 Hz, HDR मास्टरिंग की गारंटी नहीं। रंग क्षेत्र सीधे तुलनीय नहीं हैं; 140 W लैपटॉप को चार्जर चाहिए।',
      '**Maya Chen, 3/5:** “Beautiful color, but my laptop still needs its charger.” लैपटॉप को **140 W** चाहिए, स्क्रीन **90 W** देती है। **28 × 24 सेमी** आधार छोटी मेज़ पर अधिक जगह लेता है। रंग पसंद हैं; इन्हीं दो सीमाओं से रेटिंग समझ आती है।',
      '**{name} — {price}** खोला है। {details}',
      '**आपकी डेमो कार्ट:** {items}\n\nकुल: **{total}**। कोई खरीद या भुगतान नहीं।',
      'कार्ट अपडेट हुई: {items}\n\nकुल: **{total}**। बदलाव दिख रहा है; कोई खरीद नहीं हुई।',
      'संग्रह: {items}। तुलना, समीक्षा या कार्ट में जोड़ने को कहें।',
      'टूल बंद हैं। Playground में चालू करें।',
    ],
    zh: [
      '在两个相等的三周周期中，完成任务从 **48 增至 66（+37.5%）**。Brand：**24 → 36（+50%）**；Web：**24 → 30（+25%）**。Brand 的交付周期从 6 天降至 4 天，返工任务从 6 降至 3。检查清单（**DL-041**）与改善同时出现，但不能证明因果关系。两次客户反馈等待（**DL-052**）部分解释了 Web 仍需 7 天。上周：**24/26（92.3%）**。来源：Northstar delivery ledger v2026.09.18。',
      '**Luma 27：$349**，27 英寸 4K、99% sRGB、65 W、底座 22 × 19 厘米，适合网页设计与小桌面。**Luma 32 Pro：$599**，32 英寸 4K、98% DCI-P3、90 W、底座 28 × 24 厘米，适合剪辑与色彩工作。差价 **$250**。两款均为 60 Hz，未承诺 HDR 母版精度。两个色彩空间覆盖率不能直接相比；140 W 笔记本仍需充电器。',
      '**Maya Chen，3/5：**“Beautiful color, but my laptop still needs its charger.” 她的笔记本需要 **140 W**，显示器只能提供 **90 W**。**28 × 24 厘米**的底座也占用太多桌面。她喜欢色彩，评分原因是这两项限制，并非画质差。',
      '已打开 **{name} — {price}**。{details}',
      '**您的演示购物车：**{items}\n\n合计：**{total}**。不会下单或扣款。',
      '已更新演示购物车：{items}\n\n合计：**{total}**。界面已更新，未进行购买。',
      '商品：{items}。可比较、查评价或加入演示购物车。',
      '工具已关闭。请在 Playground 中启用。',
    ],
    ja: [
      '同じ3週間の期間で、完了数は **48 → 66件（+37.5%）**。Brand：**24 → 36（+50%）**、Web：**24 → 30（+25%）**。Brand の所要日数は6→4日、手直しは6→3件です。チェックリスト（**DL-041**）は改善と同時期ですが、因果関係は証明されていません。顧客回答待ち2件（**DL-052**）は Web の7日という期間を一部説明します。先週は **24/26件（92.3%）**。出典：Northstar delivery ledger v2026.09.18。',
      '**Luma 27：$349**、27インチ4K、99% sRGB、65 W、台座22 × 19 cm。Web制作や小さい机向けです。**Luma 32 Pro：$599**、32インチ4K、98% DCI-P3、90 W、台座28 × 24 cm。編集や色を扱う作業向けです。差額は **$250**。どちらも60 Hzで、HDRマスタリング精度の保証はありません。色空間は直接比較できず、140 WのPCには別の充電器が必要です。',
      '**Maya Chen、3/5：**“Beautiful color, but my laptop still needs its charger.” PCは **140 W** が必要ですが、画面は **90 W** までです。**28 × 24 cm**の台座も小さい机には大きすぎます。色は評価しており、この2点が評点の理由です。',
      '**{name} — {price}** を開きました。{details}',
      '**デモカート：**{items}\n\n合計：**{total}**。購入や請求はありません。',
      'カートを更新しました：{items}\n\n合計：**{total}**。画面に反映されています。購入はしていません。',
      '商品：{items}。比較、レビュー、カートへの追加を試せます。',
      'ツールが無効です。Playgroundで有効にしてください。',
    ],
    ko: [
      '동일한 3주 기간의 완료 작업은 **48 → 66건(+37.5%)**입니다. Brand: **24 → 36(+50%)**, Web: **24 → 30(+25%)**. Brand 소요 시간은 6→4일, 재작업은 6→3건입니다. 체크리스트(**DL-041**) 도입과 개선이 동시에 나타났지만 인과관계는 입증되지 않았습니다. 고객 응답 대기 두 건(**DL-052**)은 Web의 7일 소요 시간을 일부 설명합니다. 지난주 **24/26건(92.3%)**. 출처: Northstar delivery ledger v2026.09.18.',
      '**Luma 27: $349**, 27인치 4K, 99% sRGB, 65 W, 받침대 22 × 19 cm: 웹 작업과 작은 책상에 적합합니다. **Luma 32 Pro: $599**, 32인치 4K, 98% DCI-P3, 90 W, 받침대 28 × 24 cm: 편집과 색상 작업에 적합합니다. 차이는 **$250**. 둘 다 60 Hz이며 HDR 마스터링 정확도는 보장하지 않습니다. 색 공간은 직접 비교할 수 없고 140 W 노트북에는 충전기가 필요합니다.',
      '**Maya Chen, 3/5:** “Beautiful color, but my laptop still needs its charger.” 노트북은 **140 W**가 필요하지만 화면은 **90 W**만 제공합니다. **28 × 24 cm** 받침대도 작은 책상에 너무 큽니다. 색상은 좋아하며 이 두 제한이 평점 이유입니다.',
      '**{name} — {price}**를 열었습니다. {details}',
      '**데모 장바구니:** {items}\n\n합계: **{total}**. 구매나 결제는 없습니다.',
      '장바구니를 업데이트했습니다: {items}\n\n합계: **{total}**. 화면에 반영되었으며 구매하지 않았습니다.',
      '상품: {items}. 비교, 리뷰 확인 또는 장바구니 추가를 요청하세요.',
      '도구가 꺼져 있습니다. Playground에서 활성화하세요.',
    ],
  };

for (const [locale, values] of Object.entries(translated))
  copies[locale] = Object.fromEntries(
    Object.keys(en).map((key, index) => [key, values[index]]),
  ) as unknown as StudioCopy;

export function studioCopy(locale: string): StudioCopy {
  return (
    localeChain(locale)
      .map((code) => copies[code])
      .filter(Boolean)
      .at(-1) ?? en
  );
}
