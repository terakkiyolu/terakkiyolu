// --- 1. Örnek Kontenjan Verileri (Hayali) ---
const allQuotas = [
    { id: 1, city: "Ankara", institution: "Şehir Hastanesi", quota: 50, lastPuan: 85.123, lastRank: 1500 },
    { id: 2, city: "İstanbul", institution: "Eğitim ve Araştırma Hastanesi", quota: 35, lastPuan: 82.500, lastRank: 3200 },
    { id: 3, city: "İzmir", institution: "Devlet Hastanesi", quota: 20, lastPuan: 80.950, lastRank: 4500 },
    { id: 4, city: "Diyarbakır", institution: "Kadın Doğum Hastanesi", quota: 15, lastPuan: 78.450, lastRank: 6800 },
    { id: 5, city: "Trabzon", institution: "Üniversite Hastanesi", quota: 10, lastPuan: 83.700, lastRank: 2500 },
    { id: 6, city: "Adana", institution: "Çocuk Hastalıkları Hastanesi", quota: 40, lastPuan: 81.300, lastRank: 4200 },
    { id: 7, city: "Erzurum", institution: "Devlet Hastanesi", quota: 25, lastPuan: 79.500, lastRank: 5800 },
    { id: 8, city: "Antalya", institution: "Şehir Hastanesi", quota: 60, lastPuan: 86.000, lastRank: 1000 },
];

let userPreferences = [];
const MAX_PREFERENCES = 30;

// DOM Elementleri
const quotaTableBody = document.querySelector('#quotaTable tbody');
const preferenceList = document.getElementById('preferenceList');
const preferenceCountSpan = document.getElementById('preferenceCount');
const simulationResultsDiv = document.getElementById('simulationResults');

// --- 2. Kontenjanları Tabloya Yükleme Fonksiyonu ---
function loadQuotas() {
    quotaTableBody.innerHTML = ''; // Tabloyu temizle
    allQuotas.forEach(quota => {
        const row = quotaTableBody.insertRow();
        row.innerHTML = `
            <td>${quota.city} - ${quota.institution}</td>
            <td>${quota.quota}</td>
            <td>${quota.lastPuan.toFixed(3)}</td>
            <td>${quota.lastRank}</td>
            <td>
                <button class="addButton" data-id="${quota.id}" onclick="addToPreferences(${quota.id})">Listeye Ekle</button>
            </td>
        `;
    });
}

// --- 3. Tercih Listesine Ekleme Fonksiyonu ---
function addToPreferences(id) {
    const quota = allQuotas.find(q => q.id === id);
    
    // 30 Tercih Limit Kontrolü
    if (userPreferences.length >= MAX_PREFERENCES) {
        alert(`Tercih listeniz maksimum ${MAX_PREFERENCES} adete ulaştı. Yeni tercih ekleyemezsiniz.`);
        return;
    }

    // Aynı tercihin zaten listede olup olmadığını kontrol et
    if (userPreferences.some(pref => pref.id === id)) {
        alert("Bu kontenjan zaten tercih listenizde var.");
        return;
    }

    userPreferences.push(quota);
    updatePreferenceList();
}

// --- 4. Tercih Listesinden Çıkarma Fonksiyonu ---
function removeFromPreferences(id) {
    userPreferences = userPreferences.filter(pref => pref.id !== id);
    updatePreferenceList();
}

// --- 5. Tercih Listesini Güncelleme Fonksiyonu ---
function updatePreferenceList() {
    preferenceList.innerHTML = '';
    
    userPreferences.forEach((quota, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${quota.city} - ${quota.institution} (${quota.lastPuan.toFixed(3)} Puan ile kapatmıştı)</span>
            <button class="removeButton" onclick="removeFromPreferences(${quota.id})">Çıkar</button>
        `;
        preferenceList.appendChild(listItem);
    });

    // Sayacı Güncelle
    preferenceCountSpan.textContent = `Seçilen Tercih Sayısı: ${userPreferences.length} / ${MAX_PREFERENCES}`;
}

// --- 6. Simülasyonu Çalıştırma Fonksiyonu (Temel Atama Mantığı) ---
function runSimulation() {
    if (userPreferences.length === 0) {
        alert("Lütfen önce tercih listenize kontenjan ekleyin.");
        return;
    }

    const userPuan = parseFloat(document.getElementById('userPuan').value);
    const userSiralama = parseInt(document.getElementById('userSiralama').value);

    if (isNaN(userPuan) || isNaN(userSiralama) || userPuan <= 0 || userSiralama <= 0) {
        simulationResultsDiv.innerHTML = '<p class="danger">Lütfen geçerli KPSS P3 Puanınızı ve Genel Sıralamanızı girin.</p>';
        return;
    }

    let resultHTML = '<h3>Aday Bilgisi:</h3>';
    resultHTML += `<p>Puanınız: <strong>${userPuan.toFixed(3)}</strong>, Sıralamanız: <strong>${userSiralama}</strong></p>`;
    resultHTML += '<h3>Tercih Analizi ve Tahmini Sonuçlar:</h3>';
    
    let isAssigned = false;
    let assignedQuota = null;

    // TERCIH SIRASINA GÖRE TEK TEK KONTROL
    userPreferences.forEach((quota, index) => {
        const isBetterPuan = userPuan >= quota.lastPuan;
        const isBetterRank = userSiralama <= quota.lastRank;
        
        // Basit Simülasyon Mantığı: Puan ve Sıralama Olasılığını Karşılaştır
        let prediction = '';
        let className = 'warning';

        // Daha Garanti Senaryo: Puan ve Sıralama, geçen senenin tabanından daha iyi
        if (isBetterPuan && isBetterRank) {
            prediction = 'YÜKSEK OLASILIKLA ATANIR (Puan ve Sıralama Geçen Yılı Geçiyor)';
            className = 'success';
            if (!isAssigned) { // İlk atandığı tercihi bul
                isAssigned = true;
                assignedQuota = { ...quota, index: index + 1 };
            }
        } 
        // Orta Senaryo: Puan iyi ama sıralama yakın/biraz kötü
        else if (userPuan >= quota.lastPuan && userSiralama > quota.lastRank) {
            prediction = 'ORTA OLASILIK (Puan Yeterli, Sıralama Çok Yakın/Biraz Düşük. Kontenjan artışına bağlı.)';
            className = 'warning';
        } 
        // Düşük Senaryo: Puan veya sıralama geçmiş tabanın altında
        else {
            prediction = 'DÜŞÜK OLASILIK / RİSKLİ TERCİH (Puan/Sıralama Geçmiş Tabandan Düşük)';
            className = 'danger';
        }

        resultHTML += `
            <p><strong>${index + 1}. Tercih (${quota.city} - ${quota.institution}):</strong> 
            <span class="${className}">${prediction}</span>
            <br><em>(Geçen Yıl: Puan ${quota.lastPuan.toFixed(3)}, Sıralama ${quota.lastRank})</em></p>
        `;
    });

    // Genel Sonuç
    if (isAssigned) {
        resultHTML += `
            <h3 class="success">TAHMİNİ SONUÇ: ATANDINIZ!</h3>
            <p><strong>İlk yerleştiğiniz düşünülen tercih:</strong> ${assignedQuota.index}. Tercih (${assignedQuota.city} - ${assignedQuota.institution})</p>
        `;
    } else {
        resultHTML += `
            <h3 class="danger">TAHMİNİ SONUÇ: ATANAMADINIZ</h3>
            <p>Sıralamanız seçtiğiniz hiçbir kontenjanın geçen yılki taban puanına/sıralamasına yeterli olmadı.</p>
        `;
    }

    simulationResultsDiv.innerHTML = resultHTML;
}

// Sayfa yüklendiğinde kontenjanları tabloya ekle
window.onload = loadQuotas;
