describe('Chat Screen', () => {
    beforeEach(() => {
        // Mock del login utente corrente


        // Carica la pagina
        cy.visit('chat/[id]');
    });

    it('should open the chat when a user is selected from the search results', () => {
        const searchTerm = 'fabio dlt'; // Inserisci un nome di esempio o una ricerca specifica

        // Inserisci il testo nel campo di ricerca
        cy.get('input[placeholder="Search users..."]').type(searchTerm);

        // Verifica che ci siano risultati di ricerca
        cy.get('.flex.items-center.space-x-3.p-3').should('have.length.greaterThan', 0);

        // Clicca sul primo risultato di ricerca
        cy.get('.flex.items-center.space-x-3.p-3').first().click();

        // Verifica che la chat venga aperta e che il nome del partner sia visibile
        cy.get('.text-xl.font-semibold').should('exist'); // Controlla che il nome del partner sia visibile nel header della chat
    });

    it('should load the chat and send a message', () => {


        // Seleziona il primo utente dalla lista di utenti
        cy.get('.flex.items-center.space-x-3.p-3')
            .first()  // Seleziona il primo utente
            .click();

        // Verifica che il campo del messaggio (placeholder "Type a message...") sia visibile
        cy.get('input[placeholder="Type a message..."]').should('be.visible');  // Campo di messaggio

        // Scrivi un messaggio all'interno del campo del messaggio
        const message = 'Hello, how are you?';
        cy.get('input[placeholder="Type a message..."]').type(message);  // Digita il messaggio

        // Simula l'invio del messaggio cliccando sul pulsante di invio
        cy.get('button[type="submit"]').click();  // Clicca sul pulsante di invio

        // Verifica che il messaggio venga aggiunto nella chat
        cy.get('.flex-1.overflow-y-auto.p-4.space-y-4')
            .should('contain', message);  // Verifica che il messaggio sia visibile nella lista dei messaggi

        // Verifica che il messaggio sia visibile nella UI come messaggio inviato
        cy.get('.bg-teal-500.text-white')  // Selettore per il messaggio inviato
            .should('contain', message);  // Verifica che il messaggio sia visibile
    });


    it('should display a list of users to chat with', () => {
        // Verifica che gli utenti siano caricati e visibili nella lista
        cy.get('.space-y-2').should('contain', 'Target');
        cy.get('.space-y-2').should('contain', 'fabio dlt');
    });

    it('should show the correct partner name in the chat header', () => {
        // Seleziona il primo utente dalla lista e cattura il suo nome
        cy.get('.flex.items-center.space-x-3.p-3')
            .first()  // Seleziona il primo utente
            .within(() => {
                cy.get('span').invoke('text').as('partnerName');  // Cattura il nome dell'utente selezionato
            })
            .click();

        // Verifica che il nome del partner nella testata della chat corrisponda al nome catturato
        cy.get('@partnerName').then((partnerName) => {
            cy.get('.text-xl.font-semibold').should('contain', partnerName);  // Verifica il nome del partner nella testata
        });
    });

});
