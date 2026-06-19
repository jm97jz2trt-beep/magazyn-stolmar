const storageKey = 'storageMarMaterials';
const defaultMaterials = [
    { id: 1, nazwa: 'ABS - Czarny', kod: 'H3050', ilosc: 45, typ: 'ABS' },
    { id: 2, nazwa: 'ABS - Biały', kod: 'H3051', ilosc: 8, typ: 'ABS' },
    { id: 3, nazwa: 'Płyta melaminowa', kod: 'P2040', ilosc: 15, typ: 'Płyty' },
    { id: 4, nazwa: 'Płyta laminowana', kod: 'P2041', ilosc: 3, typ: 'Płyty' }
];

class Magazine {
    constructor() {
        this.materials = this.loadFromStorage();
        this.initEvents();
        this.render();
    }

    loadFromStorage() {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : defaultMaterials;
    }

    saveToStorage() {
        localStorage.setItem(storageKey, JSON.stringify(this.materials));
    }

    initEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        searchInput?.addEventListener('input', () => this.render());

        // Form
        const form = document.getElementById('addForm');
        form?.addEventListener('submit', (e) => this.addMaterial(e));

        // Admin Panel
        document.getElementById('adminBtn').addEventListener('click', () => {
            document.getElementById('adminPanel').classList.remove('hidden');
        });

        document.getElementById('closeAdminBtn').addEventListener('click', () => {
            document.getElementById('adminPanel').classList.add('hidden');
        });

        document.getElementById('exportBtn').addEventListener('click', () => this.exportJSON());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearData());

        // Material cards
        this.attachCardEvents();
    }

    attachCardEvents() {
        document.querySelectorAll('.material-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                this.editMaterial(id);
            });
        });
    }

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }

    addMaterial(e) {
        e.preventDefault();
        const nazwa = document.getElementById('nazwa').value.trim();
        const kod = document.getElementById('kod').value.trim();
        const ilosc = parseInt(document.getElementById('ilosc').value);
        const typ = document.getElementById('typ').value;

        if (!nazwa || !kod || !typ || isNaN(ilosc)) return;

        const newMaterial = {
            id: Date.now(),
            nazwa,
            kod,
            ilosc,
            typ
        };

        this.materials.push(newMaterial);
        this.saveToStorage();
        e.target.reset();
        this.switchView('listaView');
        this.render();
    }

    editMaterial(id) {
        const material = this.materials.find(m => m.id === id);
        if (!material) return;

        const newIlosc = prompt(`Zmień ilość dla "${material.nazwa}":`, material.ilosc);
        if (newIlosc !== null && !isNaN(newIlosc)) {
            material.ilosc = parseInt(newIlosc);
            this.saveToStorage();
            this.render();
        }
    }

    getStatus(ilosc) {
        if (ilosc > 20) return { icon: '✅', label: 'Dobry', color: 'green' };
        if (ilosc >= 10) return { icon: '⚠️', label: 'Niski', color: 'orange' };
        return { icon: '🔴', label: 'Krytyczny', color: 'red' };
    }

    render() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const filtered = this.materials.filter(m =>
            m.nazwa.toLowerCase().includes(searchTerm) ||
            m.kod.toLowerCase().includes(searchTerm)
        );

        const html = filtered.map(material => {
            const status = this.getStatus(material.ilosc);
            return `
                <div class="material-card" data-id="${material.id}">
                    <div class="material-header">
                        <div>
                            <div class="material-name">${material.nazwa}</div>
                            <div class="material-kod">${material.kod}</div>
                        </div>
                        <div class="material-status">${status.icon}</div>
                    </div>
                    <div class="material-details">
                        <div class="material-detail">
                            <div class="detail-label">Ilość</div>
                            <div class="detail-value">${material.ilosc} szt</div>
                        </div>
                        <div class="material-detail">
                            <div class="detail-label">Typ</div>
                            <div class="detail-value">${material.typ}</div>
                        </div>
                        <div class="material-detail">
                            <div class="detail-label">Status</div>
                            <div class="detail-value">${status.label}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('materialsList').innerHTML = html || '<p style="text-align: center; color: #9CA3AF;">Brak materiałów</p>';
        this.attachCardEvents();
    }

    exportJSON() {
        const dataStr = JSON.stringify(this.materials, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stolmar-magazyn-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('✅ JSON wyeksportowany!');
    }

    clearData() {
        if (confirm('⚠️ Czy na pewno chcesz usunąć WSZYSTKIE dane?')) {
            localStorage.removeItem(storageKey);
            this.materials = defaultMaterials;
            this.saveToStorage();
            this.render();
            alert('✅ Dane wyczyszczone!');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new Magazine());
