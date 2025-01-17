describe('Product Detail Page', () => {
    beforeEach(() => {

        cy.visit('/products/748j1dnN8B3ejiZ3hUuW');  // Visita la pagina del prodotto con ID 1
    });




    it('Dovrebbe inviare un\'offerta valida', () => {
        // Verifica che l'utente abbia effettuato l'accesso e inserisce un'offerta
        cy.get('button').contains('Offerta').click();

        cy.get('input[placeholder="Importo offerta"]').type('90');
        cy.get('button').contains('Invia offerta').click();

        // Verifica che venga inviato un messaggio di successo
        cy.get('.text-lg').should('contain', 'Offerta inviata con successo!');

        // Verifica che l'offerta appaia nella lista delle offerte
        cy.get('.text-xl.text-gray-600').should('contain', 'La tua offerta: € 90');
    });

    it('Non dovrebbe permettere di inviare un\'offerta superiore al prezzo del prodotto', () => {
        // Tenta di fare un'offerta più alta del prezzo
        cy.get('button').contains('Offerta').click();

        cy.get('input[placeholder="Importo offerta"]').type('1000');
        cy.get('button').contains('Invia offerta').click();

        // Verifica che venga mostrato un messaggio di errore
        cy.get('.fixed .bg-white p') // Assicurati che il pop-up contenga il messaggio di errore
            .should('contain', 'L\'offerta non può superare il prezzo di vendita del prodotto.');
    });

    it('Dovrebbe permettere di contattare il venditore tramite il ChatPopup', () => {
        // Simula il clic sul bottone "Contatta"
        cy.get('button').contains('Contatta').click();

        // Verifica che il popup di chat appaia
        cy.get('input[placeholder="Scrivi un messaggio..."]').type("ciao");
        cy.get('button[type="submit"]').click();  // Clicca sul pulsante di invio
    });



    it('Dovrebbe permettere di ritirare un\'offerta esistente', () => {
        // L'utente ha già fatto un'offerta
        cy.get('button').contains('Offerta').click();
        cy.get('input[placeholder="Importo offerta"]').type('90');
        cy.get('button').contains('Invia offerta').click();

        // Ritira l'offerta
        cy.get('button').contains('Ritira offerta').click();

        // Verifica che venga mostrato un messaggio di successo
        cy.get('.text-lg').should('contain', 'Offerta ritirata con successo!');
    });




});
