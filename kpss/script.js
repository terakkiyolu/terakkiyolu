// --- 1. Örnek Kontenjan Verileri (Hayali) ---
const allQuotas = [
    // lastPuan ve lastRank artık sadece referans amaçlıdır, simülasyon kontenjanları tüketerek çalışır.
    { id: 1, city: "Ankara", institution: "Şehir Hastanesi", capacity: 50, remaining: 50, lastPuan: 85.123 },
    { id: 2, city: "İstanbul", institution: "Eğitim ve Araştırma Hastanesi", capacity: 35, remaining: 35, lastPuan: 82.500 },
    { id: 3, city: "İzmir", institution: "Devlet Hastanesi", capacity: 20, remaining: 20, lastPuan: 80.950 },
    { id: 4, city: "Diyarbakır", institution: "Kadın Doğum Hastanesi", capacity: 15, remaining: 15, lastPuan: 78.450 },
    { id: 5, city: "Trabzon", institution: "Üniversite Hastanesi", capacity: 10, remaining: 10, lastPuan: 83.700 },
    { id: 6, city: "Adana", institution: "Çocuk Hastalıkları Hastanesi", capacity: 40, remaining: 40, lastPuan: 81.300 },
    { id: 7, city: "Erzurum", institution: "Devlet Hastanesi", capacity: 25, remaining: 25, lastPuan: 79.500 },
    { id: 8, city: "Antalya", institution: "Şehir Hastanesi", capacity: 60, remaining: 60, lastPuan: 86.000 },
];

let userPreferences = [];
const MAX_PREFERENCES = 30;

// DOM Elementleri
const quotaTableBody = document.querySelector('#quotaTable tbody');
const preferenceList = document.getElementById('preferenceList');
const preferenceCountSpan = document.getElementById('preferenceCount');
const simulationResultsDiv = document.getElementById('simulationResults');

// --- 2. Yardımcı Fonksiyon: Belirli sayıda Sanal Rakip Üretir ---
function generateCompetitors(count, minPuan, maxPuan) {
    const competitors = [];
    for (let i = 0; i < count; i++) {
        // Puan: Verilen aralıkta rastgele (Simülasyonu zorlamak için genelde yüksek puan aralığı seçilir)
        const score = (Math.random() * (maxPuan - minPuan) + minPuan).toFixed(3);
        
        // Tercih Listesi: Rastgele 10-30 tercih oluştur
        const randomQuotaIds = allQuotas.map(q => q.id).sort(() => 0.5 - Math.random());
        const preferenceListIds = randomQuotaIds.slice(0, Math.floor(Math.random() * 20) + 10); // 10-30 arası tercih

        competitors.push({
            id: `comp_${i}`,
            puan: parseFloat(score),
            preferences: preferenceListIds,
            isUser: false,
            assignedQuotaId: null
        });
    }
    return competitors;
}


// --- 3. Merkezi Yerleştirme Simülasyonu Fonksiyonu (Yeni Çekirdek) ---
function runSimulation() {
    if (userPreferences.length === 0) {
        alert("Lütfen önce tercih listenize kontenjan ekleyin.");
        return;
    }
    
    // Kullanıcı Verisi
    const userPuan = parseFloat(document.getElementById('userPuan').value);
    const userSiralama = parseInt(document.getElementById('userSiralama').value);
    const userPreferencesIds = userPreferences.map(p => p.id); // Tercih listesini ID'ye çevir

    if (isNaN(userPuan) || userPuan <= 0) {
        simulationResultsDiv.innerHTML = '<p class="danger">Lütfen geçerli KPSS P3 Puanınızı girin.</p>';
        return;
    }
    
    // Simülasyon Ön Hazırlık
    
    // A. Kontenjanları Sıfırla (Çünkü her simülasyonda yeniden başlar)
    const currentQuotas = allQuotas.map(q => ({ ...q, remaining: q.capacity, assignedPuan: null, assignedRank: null }));
    const quotaMap = new Map(currentQuotas.map(q => [q.id, q]));
    
    // B. Sanal Rakip Havuzu Oluşturma (Örn: 5000 Rakip)
    // Sizin sıralamanıza (userSiralama) göre rakip puanlarını ayarlayabiliriz.
    // Şimdilik basitçe 75-95 arası puan alan 5000 rakip oluşturalım.
    const SIM_CROWD_SIZE = 5000;
    const competitors = generateCompetitors(SIM_CROWD_SIZE, 75.000, 95.000);
    
    // C. Tüm Adayları Birleştir
    const allApplicants = [
        ...competitors,
        {
            id: 'current_user',
            puan: userPuan,
            preferences: userPreferencesIds,
            isUser: true,
            assignedQuotaId: null
        }
    ];

    // D. Puan Sırasına Göre Sırala (Yüksek Puanlı Önce Gelir)
    allApplicants.sort((a, b) => b.puan - a.puan);

    // E. MERKEZİ YERLEŞTİRME ALGORİTMASI
    allApplicants.forEach((applicant, rankIndex) => {
        // Adayın gerçek sıralamasını (simülasyon içindeki sıralamasını) set et
        applicant.simulatedRank = rankIndex + 1;
        
        for (const prefId of applicant.preferences) {
            const quota = quotaMap.get(prefId);
            
            if (quota && quota.remaining > 0) {
                // Yerleştirme Yapıldı!
                applicant.assignedQuotaId = prefId;
                quota.remaining--;
                quota.assignedPuan = applicant.puan; // Bu kadronun taban puanı belirleniyor
                
                // Eğer atanmışsa, listedeki diğer tercihlerini kontrol etmeye gerek yok
                break; 
            }
        }
    });

    // F. SİMÜLASYON SONUÇLARINI KULLANICI İÇİN GÖSTER
    const currentUser = allApplicants.find(a => a.isUser);
    let resultHTML = '<h3>Simülasyon Başlangıç Verileri:</h3>';
    resultHTML += `<p>Sanal Rakip Sayısı: ${SIM_CROWD_SIZE}, Simülasyondaki Toplam Sıralamanız: <strong>${currentUser.simulatedRank}</strong></p>`;
    
    resultHTML += '<h3>Yerleştirme Sonuçları:</h3>';

    if (currentUser.assignedQuotaId) {
        const assignedQuota = quotaMap.get(currentUser.assignedQuotaId);
        const preferenceIndex = userPreferencesIds.indexOf(currentUser.assignedQuotaId) + 1;
        
        resultHTML += `<h3 class="success">TAHMİNİ SONUÇ: ATANDINIZ! 🎉</h3>`;
        resultHTML += `
            <p><strong>Yerleştiğiniz Tercih:</strong> ${preferenceIndex}. Tercih</p>
            <p><strong>Kurum:</strong> ${assignedQuota.city} - ${assignedQuota.institution}</p>
        `;
    } else {
        resultHTML += `<h3 class="danger">TAHMİNİ SONUÇ: ATANAMADINIZ 😢</h3>`;
        resultHTML += `<p>Puanınız (${currentUser.puan.toFixed(3)}), tercih listenizdeki hiçbir kadronun kontenjanına yetmedi. Ya da sizden yüksek puanlı adaylar kontenjanları doldurdu.</p>`;
    }
    
    // Kontenjanların Kapanış Puanlarını Göster
    resultHTML += '<h3>Kontenjanların Kapanış Puanları (Taban Puanlar):</h3>';
    resultHTML += '<ul>';
    currentQuotas.filter(q => q.remaining < q.capacity).sort((a,b) => b.assignedPuan - a.assignedPuan).forEach(q => {
        resultHTML += `<li>${q.city} - ${q.institution}: ${q.assignedPuan ? q.assignedPuan.toFixed(3) + ' Puan ile kapattı.' : 'Açık kaldı.'} (Doluluk: ${q.capacity - q.remaining} / ${q.capacity})</li>`;
    });
    resultHTML += '</ul>';


    simulationResultsDiv.innerHTML = resultHTML;
}

// --- Diğer Yardımcı Fonksiyonlar (Aynı Kalır) ---
function loadQuotas() {
    quotaTableBody.innerHTML = '';
    allQuotas.forEach(quota => {
        const row = quotaTableBody.insertRow();
        row.innerHTML = `
            <td>${quota.city} - ${quota.institution}</td>
            <td>${quota.capacity}</td>
            <td>${quota.lastPuan.toFixed(3)}</td>
            <td>N/A (Simülasyonla belirlenir)</td>
            <td>
                <button class="addButton" data-id="${quota.id}" onclick="addToPreferences(${quota.id})">Listeye Ekle</button>
            </td>
        `;
    });
}

function addToPreferences(id) {
    const quota = allQuotas.find(q => q.id === id);
    if (userPreferences.length >= MAX_PREFERENCES) {
        alert(`Tercih listeniz maksimum ${MAX_PREFERENCES} adete ulaştı.`);
        return;
    }
    if (userPreferences.some(pref => pref.id === id)) {
        alert("Bu kontenjan zaten tercih listenizde var.");
        return;
    }

    userPreferences.push(quota);
    updatePreferenceList();
}

function removeFromPreferences(id) {
    userPreferences = userPreferences.filter(pref => pref.id !== id);
    updatePreferenceList();
}

function updatePreferenceList() {
    preferenceList.innerHTML = '';
    userPreferences.forEach((quota, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${quota.city} - ${quota.institution}</span>
            <button class="removeButton" onclick="removeFromPreferences(${quota.id})">Çıkar</button>
        `;
        preferenceList.appendChild(listItem);
    });
    preferenceCountSpan.textContent = `Seçilen Tercih Sayısı: ${userPreferences.length} / ${MAX_PREFERENCES}`;
}

// Sayfa yüklendiğinde kontenjanları tabloya ekle
window.onload = loadQuotas;
