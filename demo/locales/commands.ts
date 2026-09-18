const copy: Record<string, [string, string, string, string]> = {
  en: [
    'Compare products',
    'Analyze delivery',
    'Compare Luma 27 and Luma 32 Pro for a small desk. Show me the comparison and explain the price difference.',
    'Analyze the current delivery report. Compare the segments and explain what the data supports.',
  ],
  es: [
    'Comparar productos',
    'Analizar entregas',
    'Compara Luma 27 y Luma 32 Pro para un escritorio pequeño. Muéstrame la comparación y explica la diferencia de precio.',
    'Analiza el informe actual de entregas. Compara los segmentos y explica qué conclusiones respaldan los datos.',
  ],
  fr: [
    'Comparer les produits',
    'Analyser les livraisons',
    'Compare Luma 27 et Luma 32 Pro pour un petit bureau. Montre la comparaison et explique la différence de prix.',
    'Analyse le rapport de livraison actuel. Compare les segments et explique ce que les données permettent de conclure.',
  ],
  de: [
    'Produkte vergleichen',
    'Lieferungen analysieren',
    'Vergleiche Luma 27 und Luma 32 Pro für einen kleinen Schreibtisch. Zeige den Vergleich und erkläre den Preisunterschied.',
    'Analysiere den aktuellen Lieferbericht. Vergleiche die Segmente und erkläre, welche Aussagen die Daten stützen.',
  ],
  pt: [
    'Comparar produtos',
    'Analisar entregas',
    'Compare Luma 27 e Luma 32 Pro para uma mesa pequena. Mostre a comparação e explique a diferença de preço.',
    'Analise o relatório atual de entregas. Compare os segmentos e explique o que os dados sustentam.',
  ],
  it: [
    'Confronta prodotti',
    'Analizza le consegne',
    'Confronta Luma 27 e Luma 32 Pro per una scrivania piccola. Mostra il confronto e spiega la differenza di prezzo.',
    'Analizza il rapporto attuale delle consegne. Confronta i segmenti e spiega quali conclusioni sono sostenute dai dati.',
  ],
  nl: [
    'Producten vergelijken',
    'Leveringen analyseren',
    'Vergelijk Luma 27 en Luma 32 Pro voor een klein bureau. Toon de vergelijking en leg het prijsverschil uit.',
    'Analyseer het huidige leveringsrapport. Vergelijk de segmenten en leg uit welke conclusies de gegevens ondersteunen.',
  ],
  pl: [
    'Porównaj produkty',
    'Przeanalizuj realizację',
    'Porównaj Luma 27 i Luma 32 Pro do małego biurka. Pokaż porównanie i wyjaśnij różnicę w cenie.',
    'Przeanalizuj bieżący raport realizacji. Porównaj segmenty i wyjaśnij, jakie wnioski potwierdzają dane.',
  ],
  uk: [
    'Порівняти товари',
    'Проаналізувати виконання',
    'Порівняй Luma 27 і Luma 32 Pro для невеликого столу. Покажи порівняння та поясни різницю в ціні.',
    'Проаналізуй поточний звіт про виконання завдань. Порівняй сегменти та поясни, які висновки підтверджують дані.',
  ],
  ru: [
    'Сравнить товары',
    'Проанализировать результаты',
    'Сравни Luma 27 и Luma 32 Pro для небольшого стола. Покажи сравнение и объясни разницу в цене.',
    'Проанализируй текущий отчёт о выполнении задач. Сравни сегменты и объясни, какие выводы подтверждают данные.',
  ],
  tr: [
    'Ürünleri karşılaştır',
    'Teslimatları analiz et',
    'Küçük bir masa için Luma 27 ve Luma 32 Pro ürünlerini karşılaştır. Karşılaştırmayı göster ve fiyat farkını açıkla.',
    'Güncel teslimat raporunu analiz et. Segmentleri karşılaştır ve verilerin hangi sonuçları desteklediğini açıkla.',
  ],
  ar: [
    'مقارنة المنتجات',
    'تحليل التسليم',
    'قارن Luma 27 وLuma 32 Pro لمكتب صغير. اعرض المقارنة واشرح فرق السعر.',
    'قدّم تحليلًا لتقرير التسليم الحالي. قارن الشرائح واشرح الاستنتاجات التي تدعمها البيانات.',
  ],
  hi: [
    'उत्पादों की तुलना करें',
    'डिलीवरी का विश्लेषण करें',
    'छोटी मेज़ के लिए Luma 27 और Luma 32 Pro की तुलना करें। तुलना दिखाएँ और कीमत का अंतर समझाएँ।',
    'वर्तमान डिलीवरी रिपोर्ट का विश्लेषण करें। खंडों की तुलना करें और बताएँ कि डेटा किन निष्कर्षों का समर्थन करता है।',
  ],
  zh: [
    '比较产品',
    '分析交付结果',
    '比较适合小桌面的 Luma 27 和 Luma 32 Pro。展示比较结果并解释价格差异。',
    '分析当前的交付报告。比较各个团队，并解释数据支持哪些结论。',
  ],
  ja: [
    '製品を比較',
    '納品実績を分析',
    '小さい机向けに Luma 27 と Luma 32 Pro を比較してください。比較結果を表示し、価格差を説明してください。',
    '現在の納品実績レポートを分析してください。部門を比較し、データから言えることを説明してください。',
  ],
  ko: [
    '제품 비교',
    '완료 실적 분석',
    '작은 책상에 사용할 Luma 27과 Luma 32 Pro를 비교해 주세요. 비교 결과를 보여 주고 가격 차이를 설명해 주세요.',
    '현재 완료 실적 보고서를 분석해 주세요. 부문을 비교하고 데이터가 뒷받침하는 결론을 설명해 주세요.',
  ],
};

export const commandTranslations = (index: 0 | 1) =>
  Object.fromEntries(
    Object.entries(copy).map(([locale, values]) => [
      locale,
      { label: values[index], prompt: values[index + 2]! },
    ]),
  );
