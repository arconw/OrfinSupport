import type { DemoCopy } from './types';

export const tr = {
  sections: {
    welcome: {
      title: 'Çalışma alanınıza genel bakış',
      description:
        'Northstar projeleri, insanları ve görevleri bir araya getirir. Bu, OrfinSupport özelliklerini gösteren kurgusal bir çalışma alanıdır.',
    },
    projects: {
      title: 'Aktif projeler',
      description:
        'İlerlemeyi ve teslim tarihlerini takip edin. Brand refresh %72, Website experience %48 tamamlandı. Ayrıntılar için proje kartını açın.',
    },
    capacity: {
      title: 'Takımın ritmi',
      description:
        'Grafik günlük tamamlanan görevleri gösterir ve yoğun günleri fark etmenize yardımcı olur.',
    },
    activity: {
      title: 'Neler oluyor',
      description:
        'Proje aşamalarını, yeni dosyaları ve takım güncellemelerini tek bir yerde görün.',
    },
    tasks: {
      title: 'Sonraki adımlarınız',
      description:
        'Tamamlanan görevleri işaretleyin veya genel durumu görmek için projelerinizi açın.',
    },
    'project-board': {
      title: 'Tüm projeler',
      description:
        'Projeleri duruma göre filtreleyin, yenilerini oluşturun ve ayrıntılarını inceleyin.',
    },
    knowledge: {
      title: 'Takım bilgileri',
      description:
        'Başlangıç kılavuzunu, teslim sürecini ve Studio planını bulun. Orfin yanıtlarında bu yazıları kullanabilir.',
    },
    settings: {
      title: 'Asistan tercihleri',
      description:
        'Tema ve dil seçin, özellikleri açın ve nelerin hatırlanacağına karar verin. Değişiklikler Orfin’e hemen uygulanır.',
    },
  },
  plan: 'Örnek Studio planı kişi başına aylık $24 karşılığında sınırsız proje, misafirler ve 100 GB sunar. Takımda 12 kişi vardır. Veriler kurgusaldır; ücret alınmaz.',
  capacity:
    'Örnek takımda 12 kişi ve 48 kullanılabilir gün vardır. 36 gün planlanmıştır: %75 doluluk. 12 gün hâlâ boştur.',
  privacy:
    'Orfin varsayılan olarak yalnızca işaretli bölümleri okur. Tam sayfa bağlamı isteğe bağlıdır. Giriş alanları ve data-orfin-private bölgeleri hariç tutulur. Geçmişi tercihlerden temizleyebilirsiniz.',
  followup: 'Başka bir soru sorun veya projeyi keşfetmeye devam edin.',
  planTitle: 'Studio planınız',
} satisfies DemoCopy;
