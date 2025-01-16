describe('Home Page - Test Espansi', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('verifica che l\'header contenga logo e titolo', () => {
        // Controlla la presenza del logo e del titolo nell'header
        cy.get('header').within(() => {
            cy.contains('Target Marketplace').should('be.visible');
            cy.get('img[alt="Logo"]').should('be.visible');
        });
    });

    it('gestisce la ricerca', () => {
        // Controlla la visibilità della barra di ricerca e simula una ricerca
        cy.get('input[placeholder="Cerca articoli..."]')
            .should('be.visible')
            .type('Test');

        // Simula il click sul pulsante di ricerca utilizzando un selettore specifico
        cy.get('button.fixed.bottom-4.right-4.p-4.rounded-full.shadow-lg.transition-all.bg-black.text-white')
            .click();

        // Verifica che si mostrino risultati o messaggio di nessun risultato
        cy.contains('Nessun risultato trovato').should('be.visible');
        // Nota: se ci sono risultati, potresti dover adattare questa parte in base al contenuto dinamico.
    });

    it('apre e chiude il menu a tendina delle categorie al passaggio del mouse', () => {
        // Trova il contenitore del dropdown basato sulla classe 'relative group'
        cy.get('div.relative.group').as('dropdownContainer');

        // Inizialmente, le opzioni del menu non devono essere visibili
        cy.contains('Elettronica').should('not.be.visible');
        cy.contains('Moda').should('not.be.visible');
        cy.contains('Arredamento').should('not.be.visible');
        cy.contains('Auto e Moto').should('not.be.visible');

        // Simula l'hover sul contenitore del menu
        cy.get('@dropdownContainer').trigger('mouseover');

        // Dopo l'hover, verifica che gli elementi esistano nel DOM
        cy.contains('Elettronica').should('exist');
        cy.contains('Moda').should('exist');
        cy.contains('Arredamento').should('exist');
        cy.contains('Auto e Moto').should('exist');

        // Simula l'uscita del mouse dall'area del menu
        cy.get('@dropdownContainer').trigger('mouseout');

        // Dopo l'uscita, le opzioni dovrebbero tornare non visibili
        cy.contains('Elettronica').should('not.be.visible');
        cy.contains('Moda').should('not.be.visible');
        cy.contains('Arredamento').should('not.be.visible');
        cy.contains('Auto e Moto').should('not.be.visible');
    });

    it('visualizza le categorie in evidenza', () => {
        // Controlla la sezione "Categorie in Evidenza"
        cy.contains('Categorie in Evidenza').should('be.visible');
        cy.contains('Elettronica').should('be.visible');
        cy.contains('Moda').should('be.visible');
        cy.contains('Arredamento').should('be.visible');
        cy.contains('Auto e Moto').should('be.visible');
    });
    it('toglie e mostra il tema notturno', () => {
        // Salva la classe corrente dell'elemento <html> per confronto, gestendo undefined
        cy.get('html')
            .invoke('attr', 'class')
            .then((initialClass) => {
                // Se initialClass è undefined, lo convertiamo in stringa vuota
                initialClass = initialClass || '';

                // Seleziona il pulsante del tema usando le classi fisse e simula un click
                cy.get('button.fixed.bottom-4.right-4')
                    .click();

                // Verifica che la classe dell'elemento <html> cambi rispetto allo stato iniziale
                cy.get('html').invoke('attr', 'class').should((newClass) => {
                    // Convertiamo undefined in stringa vuota anche per newClass
                    newClass = newClass || '';
                    expect(newClass).not.to.equal(initialClass);
                });

                // Clicca nuovamente per tornare allo stato iniziale
                cy.get('button.fixed.bottom-4.right-4')
                    .click();

                // Verifica che la classe dell'elemento <html> torni ad essere quella iniziale
                cy.get('html')
                    .invoke('attr', 'class')
                    .should((finalClass) => {
                        finalClass = finalClass || '';
                        expect(finalClass).to.equal(initialClass);
                    });
            });
    });

    it('apre e chiude il modal dei dettagli prodotto se presente', () => {
        // Se esistono prodotti, apri il primo ProductCard e verifica il modal
        cy.get('section').contains('I tuoi articoli in vendita').then(($section) => {
            const productCardSelector = '[class*="ProductCard"]';
            if ($section.find(productCardSelector).length > 0) {
                cy.get(productCardSelector).first().click();
                // Verifica che il modal appaia
                cy.get('[class*="fixed.inset-0"]').should('be.visible');
                // Chiudi il modal
                cy.get('[class*="fixed.inset-0"] button')
                    .contains('✕')
                    .click();
                // Assicurati che il modal non esista più
                cy.get('[class*="fixed.inset-0"]').should('not.exist');
            } else {
                // Se non ci sono prodotti, verifica un messaggio appropriato
                cy.contains('Non hai ancora pubblicato articoli').should('be.visible');
            }
        });
    });

    // Nuovi test per la navigazione nell'header
    // Nuovi test per la navigazione nell'header
    describe('Header Navigation', () => {
        beforeEach(() => {
            cy.visit('/');
        });

        it('dovrebbe navigare alla pagina Vendi quando si clicca su "Vendi"', () => {
            // Clicca sul link o bottone "Vendi"
            cy.contains('Vendi').click();

            // Verifica che l'URL contenga il percorso atteso, ad esempio '/sell'
            cy.url().should('include', '/sell');

            // Se conosci un elemento specifico della pagina "Vendi", puoi verificarlo qui
            // Ad esempio:
            // cy.contains('Testo specifico della pagina Vendi').should('be.visible');
        });

        it('dovrebbe navigare alla pagina Login quando si clicca su "Login"', () => {
            // Clicca sul link o bottone "Login"
            cy.contains('Login').click();

            // Verifica che l'URL contenga il percorso atteso, ad esempio '/login'
            cy.url().should('include', '/login');

            // Se conosci un elemento specifico della pagina "Login", puoi verificarlo qui
            // Ad esempio:
            // cy.get('input[placeholder="Email"]').should('be.visible');
        });

        // Aggiungi altri test di navigazione per altri link dell'header se necessario
    });
});



