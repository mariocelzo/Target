/// <reference types="cypress" />

describe('UserActiveAdsPage - Test di Unità (handleDelete)', () => {
    beforeEach(() => {
        // Preparazione comune, se serve.
        // Potresti, ad esempio, eseguire il login come utente venditore
        // se la pagina richiede l'autenticazione per mostrare gli annunci.

        // cy.visit('/login');
        // cy.get('[data-test=email]').type('venditore@example.com');
        // cy.get('[data-test=password]').type('password123');
        // cy.get('[data-test=login-btn]').click();
    });

    it('Dovrebbe eliminare correttamente un annuncio (adId valido)', () => {
        // Esempio di "unit test semplificato" in Cypress:
        // 1) Intercetta la chiamata di rete verso Firestore/REST
        //    (oppure se fai component test, mocka la funzione handleDelete).

        cy.intercept('DELETE', '**/products/d3Ny4lxap0ZRXYgGCuC6uo2iUIt2', {
            statusCode: 200,
            body: {}
        }).as('deleteAd');

        // 2) Visita la pagina "user-active-ads"
        cy.visit('/user-active-ads');

        // 3) Assicurati che esista un annuncio "ad123" (mock o fixture)
        //    In e2e vero, potresti creare l’annuncio prima o usare un seed.
        //    Qui, ipotizziamo che la pagina mostri un bottone "Elimina" accanto all’annuncio con id=ad123.

        // 4) Clicca "Elimina" sull’annuncio (ad123)
        //    Potresti dover cercare un bottone con testo "Elimina" relativo a quell’annuncio.
        cy.contains('Annunci Attivi').should('be.visible');
        cy.contains('Uno smartphone usato in ottime condizioni')
            .parent() // Salta al contenitore del titolo
            .parent() // Salta al contenitore principale (card dell'annuncio)
            .find('button.bg-red-500') // Cerca il bottone "Elimina" all'interno della card
            .click();


        // 7) (Opzionale) Verifica la presenza di un alert di successo o un messaggio
        //    Puoi mockare window.alert con Cypress se vuoi:
        // cy.on('window:alert', (txt) => {
        //    expect(txt).to.contains('Annuncio eliminato con successo');
        // });
    });

    // Altri test “unitari” (category partition) su handleDelete:
    // - adId inesistente, adId nullo, problemi di permessi, ecc.
});

describe('UserActiveAdsPage - Test di Sistema (Accettare un’offerta)', () => {

    it('Dovrebbe permettere di accettare un’offerta e spostare l’annuncio tra i venduti', () => {
        // 3) Visita la pagina "Annunci Attivi"
        cy.visit('/user-active-ads');

        // 4) Assicuriamoci che l'annuncio "XYZ" sia presente e abbia almeno 1 offerta
        cy.contains('XYZ').should('be.visible');

        // 5) Clicchiamo su "Mostra offerte" dell'annuncio "XYZ"
        //    (a seconda della struttura del tuo codice, troverai un bottone o link)
        cy.get('[data-test="show-offers-XYZ"]').click();

        // 6) Troviamo l'offerta off123 da 100€
        cy.contains('100 €').should('be.visible');

        // 7) Clicchiamo su "Accetta"
        cy.contains('100 €')
            .parent()
            .within(() => {
                cy.contains('Accetta').click();
            });

        // 8) Controlliamo che l'annuncio sia spostato:
        //    - Non è più tra "Annunci Attivi"
        cy.contains('XYZ').should('not.exist');

        //    - Ora compare tra "Annunci Venduti"
        cy.contains('Annunci Venduti').scrollIntoView();
        cy.contains('XYZ').should('be.visible');

        // 9) Verifichiamo che appaiano i dettagli d’ordine
        cy.contains('Dettagli Ordine').should('be.visible');
        // Se ci sono info sul buyer, controllale
        cy.contains('Mario Rossi').should('be.visible');
    });

    // Altri test “di sistema”:
    // - Nessuna offerta presente
    // - Offerta già accettata
    // - Connessione assente
    // - ecc.
});
