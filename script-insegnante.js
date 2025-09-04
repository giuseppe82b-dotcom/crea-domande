document.addEventListener('DOMContentLoaded', () => {
    const scaricaBtn = document.getElementById('scaricaBtn');
    const aggiungiBtns = document.querySelectorAll('.aggiungi-domanda-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            const tabId = btn.dataset.tab;
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    const creaDomanda = (type, containerId) => {
        const container = document.getElementById(containerId);
        const domandaItem = document.createElement('div');
        domandaItem.classList.add('domanda-item');
        
        let htmlContent = '';
        if (type === 'aperta') {
            htmlContent = `
                <button class="rimuovi-domanda">&times;</button>
                <h3>Domanda Aperta</h3>
                <textarea rows="4" placeholder="Testo della domanda..." class="input-testo"></textarea>
                <div class="media-inputs">
                    <input type="text" placeholder="URL Immagine" class="input-img-url">
                </div>
            `;
        } else if (type === 'verofalso') {
            htmlContent = `
                <button class="rimuovi-domanda">&times;</button>
                <h3>Domanda Vero/Falso</h3>
                <input type="text" placeholder="Testo della domanda..." class="input-testo" required>
                <div class="media-inputs">
                    <input type="text" placeholder="URL Immagine" class="input-img-url">
                </div>
                <select>
                    <option value="Vero">Vero</option>
                    <option value="Falso">Falso</option>
                </select>
            `;
        } else if (type === 'multipla') {
            htmlContent = `
                <button class="rimuovi-domanda">&times;</button>
                <h3>Domanda: <input type="text" placeholder="Testo della domanda..." class="input-testo"></h3>
                <div class="media-inputs">
                    <input type="text" placeholder="URL Immagine" class="input-img-url">
                </div>
                <ul class="risposte-list"></ul>
                <button class="aggiungi-risposta-btn">Aggiungi Risposta</button>
            `;
        } else if (type === 'completare') {
            htmlContent = `
                <button class="rimuovi-domanda">&times;</button>
                <h3>Testo da Completare</h3>
                <p>Usa un asterisco (*) per indicare gli spazi vuoti.</p>
                <div class="media-inputs">
                    <input type="text" placeholder="URL Immagine" class="input-img-url">
                </div>
                <textarea rows="5" placeholder="Scrivi il testo da completare..." class="input-testo"></textarea>
                <p>Parole per i vuoti (facoltativo, separate da virgola):</p>
                <input type="text" placeholder="parola1, parola2, ...">
            `;
        }
        
        domandaItem.innerHTML = htmlContent;
        
        if (type === 'multipla') {
            const risposteList = domandaItem.querySelector('.risposte-list');
            const aggiungiRispostaBtn = domandaItem.querySelector('.aggiungi-risposta-btn');
            aggiungiRispostaBtn.addEventListener('click', () => {
                const rispostaItem = document.createElement('li');
                rispostaItem.classList.add('risposta-item');
                rispostaItem.innerHTML = `
                    <input type="checkbox">
                    <input type="text" placeholder="Testo risposta...">
                    <button class="rimuovi-risposta-btn">&times;</button>
                `;
                risposteList.appendChild(rispostaItem);
                rispostaItem.querySelector('.rimuovi-risposta-btn').addEventListener('click', () => rispostaItem.remove());
            });
        }
        
        domandaItem.querySelector('.rimuovi-domanda').addEventListener('click', () => domandaItem.remove());
        container.appendChild(domandaItem);
    };

    const generaContenutoFile = () => {
        let contenuto = '';
        const passwordInput = document.getElementById('passwordInput').value.trim();
        if (passwordInput) {
            const hashedPassword = btoa(passwordInput);
            contenuto += `#PASSWORD:${hashedPassword}\n\n`;
        }

        const apertaItems = document.querySelectorAll('#containerAperte .domanda-item');
        if (apertaItems.length > 0) {
            contenuto += '#APERTE\n';
            apertaItems.forEach(item => {
                const testo = item.querySelector('.input-testo').value.trim();
                const imgUrl = item.querySelector('.input-img-url').value.trim();
                contenuto += `${testo}|IMMAGINEURL:${imgUrl}\n`;
            });
            contenuto += '\n';
        }
        
        const vfItems = document.querySelectorAll('#containerVeroFalso .domanda-item');
        if (vfItems.length > 0) {
            contenuto += '#VEROFALSO\n';
            vfItems.forEach(item => {
                const testo = item.querySelector('.input-testo').value.trim();
                const imgUrl = item.querySelector('.input-img-url').value.trim();
                const risposta = item.querySelector('select').value;
                contenuto += `${testo}|IMMAGINEURL:${imgUrl}|${risposta}\n`;
            });
            contenuto += '\n';
        }

        const multiItems = document.querySelectorAll('#containerMultipla .domanda-item');
        if (multiItems.length > 0) {
            contenuto += '#MULTICHOICE\n';
            multiItems.forEach(item => {
                const testo = item.querySelector('.input-testo').value.trim();
                const imgUrl = item.querySelector('.input-img-url').value.trim();
                if (testo) {
                    contenuto += `${testo}|IMMAGINEURL:${imgUrl}\n`;
                    const risposte = item.querySelectorAll('.risposta-item');
                    risposte.forEach(rispostaItem => {
                        const testoRisposta = rispostaItem.querySelector('input[type="text"]').value.trim();
                        const isCorretta = rispostaItem.querySelector('input[type="checkbox"]').checked;
                        if (testoRisposta) {
                            contenuto += `${testoRisposta}|${isCorretta ? 'CORRETTA' : 'ERRATA'}\n`;
                        }
                    });
                    contenuto += '\n';
                }
            });
        }

        const completaItems = document.querySelectorAll('#containerCompletare .domanda-item');
        if (completaItems.length > 0) {
            contenuto += '#COMPLETA\n';
            completaItems.forEach(item => {
                const testo = item.querySelector('textarea').value.trim();
                const imgUrl = item.querySelector('.input-img-url').value.trim();
                const parole = item.querySelector('input[type="text"]:last-of-type').value.trim();
                if (testo) {
                    contenuto += `${testo}|IMMAGINEURL:${imgUrl}\n`;
                    if (parole) {
                        contenuto += `PAROLE_CHIAVE:${parole}\n`;
                    }
                    contenuto += '\n';
                }
            });
        }
        return contenuto;
    };

    aggiungiBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            if (type === 'aperta') creaDomanda('aperta', 'containerAperte');
            else if (type === 'verofalso') creaDomanda('verofalso', 'containerVeroFalso');
            else if (type === 'multipla') creaDomanda('multipla', 'containerMultipla');
            else if (type === 'completare') creaDomanda('completare', 'containerCompletare');
        });
    });

    scaricaBtn.addEventListener('click', () => {
        const contenuto = generaContenutoFile();
        if (!contenuto.trim()) {
            alert('Il file è vuoto. Inserisci almeno una domanda.');
            return;
        }
        const blob = new Blob([contenuto], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'domande.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});