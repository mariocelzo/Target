export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const searchQuery = searchParams.get('query');

        if (!searchQuery) {
            return new Response(JSON.stringify({ error: 'Nessuna query fornita' }), { status: 400 });
        }

        const normalizedQuery = searchQuery.toLowerCase(); // Normalizza la query

        const q = query(
            collection(db, 'items'),
            where('name', '>=', normalizedQuery),
            where('name', '<=', normalizedQuery + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);

        const results = [];
        querySnapshot.forEach((doc) => {
            // Normalizza il nome dei documenti durante l'estrazione
            const itemName = doc.data().name.toLowerCase();
            if (itemName.includes(normalizedQuery)) {
                results.push({ id: doc.id, ...doc.data() });
            }
        });

        return new Response(JSON.stringify({ results }), { status: 200 });
    } catch (error) {
        console.error('Errore API:', error);
        return new Response(JSON.stringify({ error: 'Errore server' }), { status: 500 });
    }
}